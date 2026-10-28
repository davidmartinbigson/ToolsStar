"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Dropzone from "@/components/Dropzone";
import { Icon } from "@/components/icons";
import { downloadBlob, formatBytes, stripExt } from "@/lib/utils";

/* ═══════════════════════════════════════════════════════════════════════════
   SIGN PDF — draw, type or upload a signature, drag it onto a live preview of
   the page, then stamp it into the PDF with pdf-lib. The signature is embedded
   as an image, so the document's real text and quality stay untouched.
   Page rotation (/Rotate 90/180/270) is mapped properly so a signature always
   appears upright, even on sideways scans.
   ═══════════════════════════════════════════════════════════════════════════ */

let _pdfLib = null;
async function pdfLib() {
  if (_pdfLib) return _pdfLib;
  _pdfLib = await import(/* webpackIgnore: true */ "https://esm.sh/pdf-lib@1.17.1");
  return _pdfLib;
}

let _pdfjs = null;
async function pdfjs() {
  if (_pdfjs) return _pdfjs;
  const lib = await import(/* webpackIgnore: true */ "https://esm.sh/pdfjs-dist@4.8.69");
  lib.GlobalWorkerOptions.workerSrc = "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.8.69/build/pdf.worker.min.mjs";
  _pdfjs = lib;
  return lib;
}

const btnPrimary = "inline-flex items-center gap-2 rounded-2xl bg-amber-400 px-6 py-3 font-extrabold text-[#241a00] shadow-xl shadow-amber-500/20 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60";
const btnGreen = "inline-flex items-center gap-2 rounded-2xl bg-emerald-400 px-6 py-3 font-extrabold text-[#032114] shadow-xl shadow-emerald-500/20 transition hover:bg-emerald-300 disabled:opacity-60";
const btnGhost = "inline-flex items-center gap-1.5 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-slate-300 transition hover:border-rose-400/40 hover:text-rose-300";
const btnSmall = "inline-flex items-center gap-1.5 rounded-xl border border-white/12 bg-white/[0.04] px-3 py-2 text-xs font-bold text-slate-200 transition hover:border-amber-400/50 disabled:opacity-50";
const inputCls = "mt-2 w-full rounded-xl border border-white/10 bg-[#12152e] px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-amber-400/60 disabled:opacity-50";
const selectCls = "mt-2 w-full rounded-xl border border-white/10 bg-[#12152e] px-3 py-2.5 text-sm text-white outline-none focus:border-amber-400/60 disabled:opacity-50";
const labelCls = "text-sm font-semibold text-white";
const choiceBase = "rounded-2xl border px-4 py-3 text-left transition";
const choiceOn = "border-amber-400 bg-amber-400/10 text-white";
const choiceOff = "border-white/10 bg-white/[0.02] text-slate-300 hover:border-white/25";

function Alert({ msg }) {
  return msg ? (
    <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm leading-relaxed text-rose-200" role="alert">
      <Icon name="x" size={17} className="mt-0.5 shrink-0" /> {msg}
    </div>
  ) : null;
}

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

function friendlyError(error, fallback = "Could not process this PDF.") {
  const message = String(error?.message || error || "");
  if (/encrypt|password/i.test(message)) return "This PDF is password-protected. Remove its password first, then sign it.";
  if (/failed to download|library/i.test(message)) return "The PDF library could not be downloaded. Check your connection or ad-blocker, then try again.";
  return message && message.length < 180 ? message : fallback;
}

/** "2,4-6" → [1,3,4,5] (zero-based page indices), clamped to `count`. */
function parsePageList(text, count) {
  const pages = new Set();
  String(text || "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .forEach((part) => {
      const range = part.match(/^(\d+)\s*[-–]\s*(\d+)$/);
      if (range) {
        const from = clamp(Number(range[1]), 1, count);
        const to = clamp(Number(range[2]), 1, count);
        for (let n = Math.min(from, to); n <= Math.max(from, to); n++) pages.add(n - 1);
      } else if (/^\d+$/.test(part)) {
        pages.add(clamp(Number(part), 1, count) - 1);
      }
    });
  return [...pages].sort((a, b) => a - b);
}

/* ── signature canvas helpers ───────────────────────────────────────────── */
const DRAW_W = 960;
const DRAW_H = 320;

function hexToRgb01(hex, rgb) {
  const clean = String(hex || "#111827").replace("#", "");
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean.padEnd(6, "0").slice(0, 6);
  const int = Number.parseInt(full, 16);
  return rgb(((int >> 16) & 255) / 255, ((int >> 8) & 255) / 255, (int & 255) / 255);
}

function redrawStrokes(canvas, strokes, color, fallbackText) {
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (!strokes.length && fallbackText) {
    ctx.fillStyle = "rgba(148,163,184,0.55)";
    ctx.font = "600 30px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(fallbackText, canvas.width / 2, canvas.height / 2);
    return;
  }
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  strokes.forEach((stroke) => {
    if (!stroke.points.length) return;
    ctx.strokeStyle = stroke.color || color;
    ctx.lineWidth = stroke.width;
    ctx.beginPath();
    const pts = stroke.points;
    ctx.moveTo(pts[0].x, pts[0].y);
    if (pts.length < 3) {
      // a tap: draw a dot
      ctx.lineTo(pts[pts.length - 1].x + 0.1, pts[pts.length - 1].y + 0.1);
    } else {
      for (let i = 1; i < pts.length - 1; i++) {
        const midX = (pts[i].x + pts[i + 1].x) / 2;
        const midY = (pts[i].y + pts[i + 1].y) / 2;
        ctx.quadraticCurveTo(pts[i].x, pts[i].y, midX, midY);
      }
      ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
    }
    ctx.stroke();
  });
}

/** Trim transparent (or white) margins so the signature sits exactly where placed. */
function trimCanvas(source, { dropWhite = false, recolour = null, threshold = 240 } = {}) {
  const ctx = source.getContext("2d", { willReadFrequently: true });
  const { width, height } = source;
  if (!width || !height) return null;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const ink = recolour ? { r: Number.parseInt(recolour.slice(1, 3), 16), g: Number.parseInt(recolour.slice(3, 5), 16), b: Number.parseInt(recolour.slice(5, 7), 16) } : null;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const darkness = 1 - (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    if (dropWhite && r >= threshold && g >= threshold && b >= threshold) {
      data[i + 3] = 0;
    } else if (ink) {
      const alpha = dropWhite ? clamp(darkness * 1.9, 0, 1) : clamp((data[i + 3] / 255) * (0.35 + darkness), 0, 1);
      data[i] = ink.r;
      data[i + 1] = ink.g;
      data[i + 2] = ink.b;
      data[i + 3] = Math.round(alpha * 255);
    }
  }
  ctx.putImageData(imageData, 0, 0);

  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] > 10) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0 || maxY < 0) return null;

  const pad = 8;
  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  maxX = Math.min(width - 1, maxX + pad);
  maxY = Math.min(height - 1, maxY + pad);

  const out = document.createElement("canvas");
  out.width = maxX - minX + 1;
  out.height = maxY - minY + 1;
  out.getContext("2d").drawImage(source, minX, minY, out.width, out.height, 0, 0, out.width, out.height);
  return out;
}

const TYPE_FONTS = [
  ["script", "Classic script", 'italic 700 120px "Brush Script MT", "Segoe Script", "Apple Chancery", cursive'],
  ["hand", "Casual hand", '700 108px "Segoe Print", "Comic Sans MS", "Bradley Hand", cursive'],
  ["formal", "Formal serif", 'italic 700 110px Georgia, "Times New Roman", serif'],
  ["marker", "Bold marker", '900 100px "Arial Black", Arial, sans-serif'],
];

/* ── page-geometry mapping (handles /Rotate on scanned pages) ────────────── */
function pageGeometry(page) {
  const { width: W, height: H } = page.getSize();
  const R = ((page.getRotation().angle % 360) + 360) % 360;
  const rotated = R === 90 || R === 270;
  return { W, H, R, VW: rotated ? H : W, VH: rotated ? W : H };
}

/** Visual (top-left origin) point → PDF user-space point + text/image rotation. */
function visualToUser(vx, vy, { W, H, R }) {
  if (R === 90) return { x: vy, y: vx, rotate: 90 };
  if (R === 180) return { x: W - vx, y: H - vy, rotate: 180 };
  if (R === 270) return { x: W - vy, y: H - vx, rotate: -90 };
  return { x: vx, y: H - vy, rotate: 0 };
}

export default function SignPdf() {
  const [item, setItem] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);

  /* preview */
  const [pageNo, setPageNo] = useState(1);
  const [pageImg, setPageImg] = useState("");
  const [rendering, setRendering] = useState(false);
  const [pageMeta, setPageMeta] = useState({ vw: 595, vh: 842 });
  const wrapRef = useRef(null);
  const pdfjsDoc = useRef(null);

  /* signature */
  const [mode, setMode] = useState("draw");
  const drawRef = useRef(null);
  const [strokes, setStrokes] = useState([]);
  const liveStroke = useRef(null);
  const [penWidth, setPenWidth] = useState(4);
  const [inkColor, setInkColor] = useState("#111827");
  const [typed, setTyped] = useState("");
  const [fontId, setFontId] = useState("script");
  const [uploadImg, setUploadImg] = useState(null);
  const [dropWhite, setDropWhite] = useState(true);
  const [sig, setSig] = useState(null);

  /* placement */
  const [pos, setPos] = useState({ x: 0.62, y: 0.82 });
  const [sizeFrac, setSizeFrac] = useState(0.24);
  const [opacity, setOpacity] = useState(100);
  const [applyTo, setApplyTo] = useState("current");
  const [pageList, setPageList] = useState("");
  const [printedName, setPrintedName] = useState("");
  const [showDate, setShowDate] = useState(false);
  const [dragging, setDragging] = useState(false);

  const sigAspect = sig && sig.w > 0 ? sig.h / sig.w : 0.35;

  /* ── load the PDF (pdf-lib for editing, pdf.js for the preview) ── */
  const add = useCallback(async (files) => {
    setError("");
    setResult(null);
    setSig(null);
    const file = files[0];
    if (!file) return;
    setBusy(true);
    try {
      const { PDFDocument } = await pdfLib();
      const bytes = new Uint8Array(await file.arrayBuffer());
      const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const lib = await pdfjs();
      // pdf.js can transfer (detach) the buffer, so hand it a copy.
      pdfjsDoc.current = await lib.getDocument({ data: new Uint8Array(bytes) }).promise;
      setItem({ file, bytes, pages: doc.getPageCount() });
      setPageNo(1);
    } catch (e) {
      setError(friendlyError(e, "Could not read this PDF. It may be corrupted or password-protected."));
    } finally {
      setBusy(false);
    }
  }, []);

  /* ── render the current page into the preview ── */
  useEffect(() => {
    let cancelled = false;
    async function render() {
      if (!item || !pdfjsDoc.current) return;
      setRendering(true);
      try {
        const page = await pdfjsDoc.current.getPage(pageNo);
        const base = page.getViewport({ scale: 1 });
        const targetWidth = Math.min(920, (wrapRef.current?.clientWidth || 760));
        const scale = clamp(targetWidth / base.width, 0.5, 2.6);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        await page.render({ canvasContext: ctx, viewport }).promise;
        if (cancelled) return;
        setPageImg(canvas.toDataURL("image/png"));
        setPageMeta({ vw: viewport.width / scale, vh: viewport.height / scale });
      } catch {
        if (!cancelled) setError("Could not draw a preview of this page — you can still sign it.");
      } finally {
        if (!cancelled) setRendering(false);
      }
    }
    render();
    return () => { cancelled = true; };
  }, [item, pageNo]);

  /* ── build the trimmed signature PNG whenever its inputs change ── */
  useEffect(() => {
    let cancelled = false;
    const build = async () => {
      const canvas = document.createElement("canvas");
      canvas.width = DRAW_W;
      canvas.height = DRAW_H;
      const ctx = canvas.getContext("2d");

      if (mode === "draw") {
        redrawStrokes(canvas, strokes, inkColor, strokes.length ? "" : "");
        if (!strokes.length) { setSig(null); return; }
      } else if (mode === "type") {
        const font = TYPE_FONTS.find((f) => f[0] === fontId)?.[2] || TYPE_FONTS[0][2];
        const text = typed.trim();
        if (!text) { setSig(null); return; }
        ctx.font = font;
        let size = Number.parseInt(font.match(/(\d+)px/)?.[1] || "100", 10);
        let width = ctx.measureText(text).width;
        while (width > DRAW_W - 60 && size > 18) {
          size -= 4;
          ctx.font = font.replace(/(\d+)px/, `${size}px`);
          width = ctx.measureText(text).width;
        }
        ctx.fillStyle = inkColor;
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        ctx.fillText(text, DRAW_W / 2, DRAW_H / 2);
      } else {
        if (!uploadImg) { setSig(null); return; }
        const iw = uploadImg.naturalWidth || uploadImg.width;
        const ih = uploadImg.naturalHeight || uploadImg.height;
        const scale = Math.min((DRAW_W - 40) / iw, (DRAW_H - 40) / ih, 1.6);
        const w = Math.max(1, Math.round(iw * scale));
        const h = Math.max(1, Math.round(ih * scale));
        ctx.drawImage(uploadImg, (DRAW_W - w) / 2, (DRAW_H - h) / 2, w, h);
      }

      const trimmed = trimCanvas(canvas, {
        dropWhite: mode === "upload" ? dropWhite : false,
        recolour: mode === "upload" && dropWhite ? inkColor : null,
      });
      if (cancelled) return;
      if (!trimmed) { setSig(null); return; }
      setSig({ dataUrl: trimmed.toDataURL("image/png"), w: trimmed.width, h: trimmed.height });
    };
    build();
    return () => { cancelled = true; };
  }, [mode, strokes, inkColor, typed, fontId, uploadImg, dropWhite]);

  /* ── drawing on the pad ── */
  const padPoint = (event) => {
    const canvas = drawRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * canvas.width,
      y: ((event.clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const onPadDown = (event) => {
    if (mode !== "draw") return;
    event.preventDefault();
    drawRef.current?.setPointerCapture?.(event.pointerId);
    liveStroke.current = { points: [padPoint(event)], width: penWidth, color: inkColor };
    redrawStrokes(drawRef.current, [...strokes, liveStroke.current], inkColor, "");
  };

  const onPadMove = (event) => {
    if (!liveStroke.current) return;
    event.preventDefault();
    liveStroke.current.points.push(padPoint(event));
    redrawStrokes(drawRef.current, [...strokes, liveStroke.current], inkColor, "");
  };

  const onPadUp = () => {
    if (!liveStroke.current) return;
    const finished = liveStroke.current;
    liveStroke.current = null;
    setStrokes((prev) => [...prev, finished]);
  };

  /* ── signature placement by dragging over the page preview ── */
  const heightFrac = sizeFrac * sigAspect * (pageMeta.vw / pageMeta.vh);

  const moveToPointer = useCallback((event) => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const rect = wrap.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    if (!Number.isFinite(px) || !Number.isFinite(py)) return;
    setPos({
      x: clamp(px - sizeFrac / 2, 0, Math.max(0, 1 - sizeFrac)),
      y: clamp(py - heightFrac / 2, 0, Math.max(0, 1 - heightFrac)),
    });
  }, [sizeFrac, heightFrac]);

  const onPreviewDown = (event) => {
    event.preventDefault();
    wrapRef.current?.setPointerCapture?.(event.pointerId);
    setDragging(true);
    moveToPointer(event);
  };
  const onPreviewMove = (event) => { if (dragging) moveToPointer(event); };
  const onPreviewUp = () => setDragging(false);

  /* keep the signature inside the page when its size changes */
  useEffect(() => {
    setPos((p) => ({
      x: clamp(p.x, 0, Math.max(0, 1 - sizeFrac)),
      y: clamp(p.y, 0, Math.max(0, 1 - heightFrac)),
    }));
  }, [sizeFrac, heightFrac]);

  const targetIndices = useMemo(() => {
    if (!item) return [];
    if (applyTo === "all") return item.pages ? Array.from({ length: item.pages }, (_, i) => i) : [];
    if (applyTo === "list") return parsePageList(pageList, item.pages);
    return [pageNo - 1];
  }, [applyTo, item, pageList, pageNo]);

  const uploadSignature = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      const url = URL.createObjectURL(file);
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error("image"));
        img.src = url;
      });
      setUploadImg(img);
      setMode("upload");
    } catch {
      setError("That image could not be opened. Please use a PNG or JPG photo/scan of your signature.");
    }
  };

  const reset = () => {
    setItem(null);
    setResult(null);
    setError("");
    setPageImg("");
    setPageNo(1);
    pdfjsDoc.current = null;
  };

  /* ── stamp the signature into the PDF ── */
  const apply = async () => {
    if (!item) return;
    if (!sig) {
      setError(mode === "draw" ? "Draw your signature on the pad first." : mode === "type" ? "Type the name to sign with first." : "Upload a photo or scan of your signature first.");
      return;
    }
    if (applyTo === "list" && targetIndices.length === 0) {
      setError("Enter the pages to sign, for example: 1,3-5");
      return;
    }
    setBusy(true);
    setError("");
    setResult(null);
    try {
      const { PDFDocument, StandardFonts, degrees, rgb } = await pdfLib();
      const doc = await PDFDocument.load(item.bytes, { ignoreEncryption: true });
      const png = await doc.embedPng(sig.dataUrl);
      const font = await doc.embedFont(StandardFonts.Helvetica);
      const pages = doc.getPages();
      const name = printedName.trim();
      const dateText = showDate ? new Date().toLocaleDateString("en-GB") : "";
      const caption = [name, dateText].filter(Boolean).join("   ·   ");
      let stamped = 0;

      for (const index of targetIndices) {
        const page = pages[index];
        if (!page) continue;
        const geo = pageGeometry(page);
        const vw = sizeFrac * geo.VW;
        const vh = vw * sigAspect;
        const vx = pos.x * geo.VW;
        const vy = pos.y * geo.VH;

        const anchor = geo.R === 180 ? { x: vx, y: vy } : { x: vx, y: vy + vh };
        const at = visualToUser(anchor.x, anchor.y, geo);
        page.drawImage(png, {
          x: at.x,
          y: at.y,
          width: vw,
          height: vh,
          opacity: clamp(opacity / 100, 0.05, 1),
          rotate: degrees(at.rotate),
        });

        if (caption) {
          const size = Math.max(7, Math.min(11, vw * 0.09));
          const baseline = visualToUser(vx, vy + vh + size + 3, geo);
          const maxWidth = geo.VW * 0.7;
          let textWidth = font.widthOfTextAtSize(caption, size);
          const drawSize = textWidth > maxWidth ? Math.max(6, size * (maxWidth / textWidth)) : size;
          page.drawText(caption, {
            x: baseline.x,
            y: baseline.y,
            size: drawSize,
            font,
            color: rgb(0.15, 0.17, 0.22),
            opacity: 0.9,
            rotate: degrees(baseline.rotate),
          });
        }
        stamped += 1;
      }

      if (!stamped) throw new Error("No pages matched — check the page numbers.");
      const saved = await doc.save({ useObjectStreams: true });
      const blob = new Blob([saved], { type: "application/pdf" });
      setResult({ blob, name: `${stripExt(item.file.name)}-signed.pdf`, pages: stamped });
    } catch (e) {
      setError(friendlyError(e, "Could not add the signature to this PDF."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      {!item && (
        <Dropzone
          accept="application/pdf,.pdf"
          onFiles={add}
          title="Drop the PDF you need to sign"
          hint="Forms, applications, contracts — signed privately on your device"
          icon="pdf"
        />
      )}
      <Alert msg={error} />
      {busy && !item && <p className="mt-4 text-sm text-amber-300" role="status">Opening your PDF…</p>}

      {item && (
        <>
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.02] px-4 py-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-red-400/15 text-red-300"><Icon name="pdf" size={23} /></span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-semibold text-white" title={item.file.name}>{item.file.name}</span>
              <span className="text-xs text-slate-500">{item.pages} page{item.pages === 1 ? "" : "s"} · {formatBytes(item.file.size)}</span>
            </span>
            <button type="button" onClick={reset} className={btnGhost}><Icon name="trash" size={15} /> Different PDF</button>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px] lg:items-start">
            {/* ── page preview with draggable signature ── */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setPageNo((n) => Math.max(1, n - 1))} disabled={pageNo <= 1 || rendering} className={btnSmall} aria-label="Previous page">
                    <Icon name="chevron" size={14} className="rotate-90" />
                  </button>
                  <span className="text-sm text-slate-300">
                    Page{" "}
                    <input
                      type="number" min="1" max={item.pages} value={pageNo}
                      onChange={(e) => setPageNo(clamp(Number(e.target.value) || 1, 1, item.pages))}
                      aria-label="Page number"
                      className="w-16 rounded-lg border border-white/10 bg-[#12152e] px-2 py-1.5 text-center text-sm text-white outline-none focus:border-amber-400/60"
                    />{" "}
                    of {item.pages}
                  </span>
                  <button type="button" onClick={() => setPageNo((n) => Math.min(item.pages, n + 1))} disabled={pageNo >= item.pages || rendering} className={btnSmall} aria-label="Next page">
                    <Icon name="chevron" size={14} className="-rotate-90" />
                  </button>
                </div>
                <p className="text-xs text-slate-500">{rendering ? "Drawing page…" : "Tap or drag anywhere on the page to move your signature"}</p>
              </div>

              <div
                ref={wrapRef}
                onPointerDown={onPreviewDown}
                onPointerMove={onPreviewMove}
                onPointerUp={onPreviewUp}
                onPointerCancel={onPreviewUp}
                className="relative mt-3 select-none overflow-hidden rounded-2xl border border-white/[0.08] bg-white shadow-2xl"
                style={{ touchAction: "none", cursor: dragging ? "grabbing" : "crosshair" }}
              >
                {pageImg ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={pageImg} alt={`Preview of page ${pageNo}`} className="block h-auto w-full" draggable="false" />
                ) : (
                  <div className="grid h-[420px] place-items-center text-sm text-slate-400">
                    {rendering ? "Rendering page preview…" : "No preview available for this page"}
                  </div>
                )}

                {sig && (
                  <div
                    className="absolute"
                    style={{ left: `${pos.x * 100}%`, top: `${pos.y * 100}%`, width: `${sizeFrac * 100}%` }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={sig.dataUrl} alt="Your signature" className="block h-auto w-full" draggable="false" style={{ opacity: clamp(opacity / 100, 0.05, 1) }} />
                  </div>
                )}
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label htmlFor="sign-size" className={labelCls}>
                  Signature size <span className="font-bold text-amber-300">{Math.round(sizeFrac * 100)}% of page width</span>
                  <input id="sign-size" type="range" min="6" max="70" value={Math.round(sizeFrac * 100)} onChange={(e) => setSizeFrac(Number(e.target.value) / 100)} className="mt-3.5 w-full" />
                </label>
                <label htmlFor="sign-opacity" className={labelCls}>
                  Ink opacity <span className="font-bold text-amber-300">{opacity}%</span>
                  <input id="sign-opacity" type="range" min="20" max="100" value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} className="mt-3.5 w-full" />
                </label>
              </div>
            </div>

            {/* ── controls ── */}
            <div className="space-y-5">
              <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-4">
                <p className={labelCls}>1. Make your signature</p>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {[["draw", "Draw", "pen"], ["type", "Type", "type"], ["upload", "Upload", "upload"]].map(([value, title, icon]) => (
                    <button key={value} type="button" onClick={() => setMode(value)} aria-pressed={mode === value} className={`${choiceBase} px-2 py-2.5 text-center ${mode === value ? choiceOn : choiceOff}`}>
                      <Icon name={icon} size={17} className="mx-auto" />
                      <span className="mt-1 block text-xs font-bold">{title}</span>
                    </button>
                  ))}
                </div>

                {mode === "draw" && (
                  <div className="mt-4">
                    <canvas
                      ref={drawRef}
                      width={DRAW_W}
                      height={DRAW_H}
                      onPointerDown={onPadDown}
                      onPointerMove={onPadMove}
                      onPointerUp={onPadUp}
                      onPointerLeave={onPadUp}
                      className="h-[150px] w-full cursor-crosshair touch-none rounded-2xl border border-white/12 bg-white"
                      aria-label="Signature drawing pad"
                    />
                    <div className="mt-2.5 flex flex-wrap items-center gap-2">
                      <button type="button" onClick={() => setStrokes((s) => s.slice(0, -1))} disabled={!strokes.length} className={btnSmall}><Icon name="refresh" size={13} /> Undo</button>
                      <button type="button" onClick={() => setStrokes([])} disabled={!strokes.length} className={btnSmall}><Icon name="trash" size={13} /> Clear</button>
                      <label className="ml-auto flex items-center gap-2 text-xs font-semibold text-slate-300">
                        Thickness
                        <input type="range" min="1.5" max="10" step="0.5" value={penWidth} onChange={(e) => setPenWidth(Number(e.target.value))} className="w-20" aria-label="Pen thickness" />
                      </label>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">Works with a finger, stylus or mouse. Zoom your browser out for a wider pad.</p>
                  </div>
                )}

                {mode === "type" && (
                  <div className="mt-4">
                    <label htmlFor="sign-typed" className={labelCls}>Name to sign with
                      <input id="sign-typed" value={typed} onChange={(e) => setTyped(e.target.value)} maxLength={40} placeholder="Your full name" className={inputCls} />
                    </label>
                    <label htmlFor="sign-font" className={`${labelCls} mt-3 block`}>Style
                      <select id="sign-font" value={fontId} onChange={(e) => setFontId(e.target.value)} className={selectCls}>
                        {TYPE_FONTS.map(([id, title]) => <option key={id} value={id}>{title}</option>)}
                      </select>
                    </label>
                    <p className="mt-2 text-xs text-slate-500">A typed signature is a neat mark of approval — some official documents require a handwritten one.</p>
                  </div>
                )}

                {mode === "upload" && (
                  <div className="mt-4">
                    <label className={`${btnSmall} w-full justify-center`} htmlFor="sign-upload">
                      <Icon name="upload" size={14} /> {uploadImg ? "Choose a different image" : "Upload signature photo / scan"}
                    </label>
                    <input id="sign-upload" type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={uploadSignature} />
                    <label className="mt-3 flex items-start gap-2 text-xs text-slate-300">
                      <input type="checkbox" checked={dropWhite} onChange={(e) => setDropWhite(e.target.checked)} className="mt-0.5" />
                      Remove the white paper background and use the ink colour below (recommended for photos of signatures)
                    </label>
                  </div>
                )}

                <div className="mt-4 flex items-center gap-3">
                  <label htmlFor="sign-color" className="text-xs font-semibold text-slate-300">Ink colour</label>
                  <input id="sign-color" type="color" value={inkColor} onChange={(e) => setInkColor(e.target.value)} className="h-9 w-12 cursor-pointer rounded-lg border border-white/10 bg-transparent p-0.5" />
                  <div className="flex gap-1.5">
                    {["#111827", "#1e3a8a", "#0f172a"].map((c) => (
                      <button key={c} type="button" onClick={() => setInkColor(c)} aria-label={`Use colour ${c}`} className="h-7 w-7 rounded-full border border-white/20" style={{ background: c }} />
                    ))}
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-[#ffffff] p-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Preview</span>
                  {sig ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={sig.dataUrl} alt="Signature preview" className="ml-auto h-12 max-w-[150px] object-contain" />
                  ) : (
                    <span className="ml-auto text-xs text-slate-400">Nothing yet</span>
                  )}
                </div>
              </div>

              <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-4">
                <p className={labelCls}>2. Where to sign</p>
                <div className="mt-3 space-y-2">
                  {[
                    ["current", `This page only (page ${pageNo})`, "Sign one spot, then move to the next page if needed"],
                    ["all", `All ${item.pages} pages`, "Same position on every page — initials-style signing"],
                    ["list", "Selected pages", "Type pages such as 1,3-5"],
                  ].map(([value, title, hint]) => (
                    <button key={value} type="button" onClick={() => setApplyTo(value)} aria-pressed={applyTo === value} className={`${choiceBase} w-full ${applyTo === value ? choiceOn : choiceOff}`}>
                      <span className="block text-sm font-bold">{title}</span>
                      <span className="text-xs text-slate-500">{hint}</span>
                    </button>
                  ))}
                </div>
                {applyTo === "list" && (
                  <label htmlFor="sign-pages" className={`${labelCls} mt-3 block`}>Pages
                    <input id="sign-pages" value={pageList} onChange={(e) => setPageList(e.target.value)} placeholder="1,3-5" className={inputCls} />
                  </label>
                )}
                <div className="mt-3 grid gap-3">
                  <div className="flex flex-wrap gap-2">
                    {["bottom-right", "bottom-left", "bottom-center", "top-right"].map((spot) => (
                      <button
                        key={spot}
                        type="button"
                        onClick={() => {
                          const spots = {
                            "bottom-right": { x: 1 - sizeFrac - 0.08, y: 1 - heightFrac - 0.1 },
                            "bottom-left": { x: 0.08, y: 1 - heightFrac - 0.1 },
                            "bottom-center": { x: (1 - sizeFrac) / 2, y: 1 - heightFrac - 0.1 },
                            "top-right": { x: 1 - sizeFrac - 0.08, y: 0.07 },
                          };
                          setPos(spots[spot]);
                        }}
                        className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-bold text-slate-300 transition hover:border-amber-400/50"
                      >
                        {spot.replace("-", " ")}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-4">
                <p className={labelCls}>3. Optional details under the signature</p>
                <label htmlFor="sign-name" className={`${labelCls} mt-3 block`}>Printed name
                  <input id="sign-name" value={printedName} onChange={(e) => setPrintedName(e.target.value)} maxLength={50} placeholder="e.g. Ahmed Khan" className={inputCls} />
                </label>
                <label className="mt-3 flex items-center gap-2 text-xs text-slate-300">
                  <input type="checkbox" checked={showDate} onChange={(e) => setShowDate(e.target.checked)} />
                  Add today's date ({new Date().toLocaleDateString("en-GB")})
                </label>
              </div>

              <button type="button" onClick={apply} disabled={busy || !sig || targetIndices.length === 0} className={`${btnPrimary} w-full justify-center`}>
                <Icon name="pen" size={18} /> {busy ? "Signing…" : `Sign ${targetIndices.length} page${targetIndices.length === 1 ? "" : "s"}`}
              </button>
              {!sig && <p className="text-center text-xs text-slate-500">Create your signature first — the button unlocks as soon as it exists.</p>}
            </div>
          </div>

          {result && (
            <div className="mt-6 flex flex-wrap items-center gap-4 rounded-2xl border border-emerald-400/25 bg-emerald-400/[0.06] p-4" role="status">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-emerald-400/15 text-emerald-300"><Icon name="check" size={22} /></span>
              <p className="min-w-[190px] flex-1 text-sm text-white">
                <strong>Signature added to {result.pages} page{result.pages === 1 ? "" : "s"}</strong>
                <span className="block text-slate-400">{result.name} · {formatBytes(result.blob.size)} — the original file was not changed</span>
              </p>
              <button type="button" onClick={() => downloadBlob(result.blob, result.name)} className={btnGreen}><Icon name="download" size={17} /> Download signed PDF</button>
            </div>
          )}

          <p className="mt-6 rounded-2xl border border-white/[0.08] bg-white/[0.02] px-4 py-3 text-xs leading-relaxed text-slate-400">
            <strong className="text-slate-200">This is an electronic signature, not a digital certificate.</strong> It places your signature image into the PDF exactly where you put it — perfect for forms, school applications, rent agreements and office approvals. Some government and banking systems require a certified digital signature (a cryptographic certificate from an authorised provider); this tool cannot create that, and no tool in a browser honestly can.
          </p>
        </>
      )}
    </div>
  );
}
