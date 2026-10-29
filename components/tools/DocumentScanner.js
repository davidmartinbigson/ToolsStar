"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Dropzone from "@/components/Dropzone";
import { Icon } from "@/components/icons";
import { formatBytes, downloadBlob, downloadZip, stripExt, loadImage, loadScript, friendlyError } from "@/lib/utils";

const btnP = "inline-flex items-center gap-2 rounded-2xl bg-amber-400 px-6 py-3 font-extrabold text-[#241a00] shadow-xl shadow-amber-500/20 transition hover:bg-amber-300 disabled:opacity-60 disabled:cursor-not-allowed";
const btnG = "inline-flex items-center gap-2 rounded-2xl bg-emerald-400 px-5 py-3 font-extrabold text-[#032114] shadow-xl shadow-emerald-500/20 transition hover:bg-emerald-300 disabled:opacity-60";
const btnGhost = "inline-flex items-center gap-1.5 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-slate-300 hover:border-amber-400/40 hover:text-white disabled:opacity-50";
const sel = "mt-2 w-full rounded-xl border border-white/10 bg-[#12152e] px-3 py-2.5 text-sm text-white outline-none focus:border-amber-400/60";
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

const PAGE_SIZES = [
  { id: "auto", label: "Auto — match the photographed page", ratio: null },
  { id: "a4", label: "A4 (210 × 297 mm) — standard documents", ratio: 210 / 297, mm: [210, 297] },
  { id: "letter", label: "US Letter (216 × 279 mm)", ratio: 216 / 279, mm: [216, 279] },
  { id: "a5", label: "A5 (148 × 210 mm) — booklets / notes", ratio: 148 / 210, mm: [148, 210] },
  { id: "legal", label: "Legal (216 × 356 mm)", ratio: 216 / 356, mm: [216, 356] },
  { id: "id", label: "ID / Bank Card (86 × 54 mm)", ratio: 54 / 86, landscapeRatio: 86 / 54, mm: [86, 54] },
];

function orderPoints(pts) {
  const tl = pts.reduce((a, p) => (p.x + p.y < a.x + a.y ? p : a));
  const br = pts.reduce((a, p) => (p.x + p.y > a.x + a.y ? p : a));
  const tr = pts.reduce((a, p) => (p.x - p.y > a.x - a.y ? p : a));
  const bl = pts.reduce((a, p) => (p.x - p.y < a.x - a.y ? p : a));
  return [tl, tr, br, bl];
}
function polygonArea(pts) {
  let a = 0;
  for (let i = 0; i < pts.length; i++) { const p = pts[i], q = pts[(i + 1) % pts.length]; a += p.x * q.y - q.x * p.y; }
  return Math.abs(a / 2);
}
function solveLinear(A, b) {
  const n = b.length;
  const M = A.map((row, i) => [...row, b[i]]);
  for (let col = 0, row = 0; col < n && row < n; col++, row++) {
    let sel = row;
    for (let i = row; i < n; i++) if (Math.abs(M[i][col]) > Math.abs(M[sel][col])) sel = i;
    if (Math.abs(M[sel][col]) < 1e-12) continue;
    [M[sel], M[row]] = [M[row], M[sel]];
    const piv = M[row][col];
    for (let j = col; j <= n; j++) M[row][j] /= piv;
    for (let i = 0; i < n; i++) {
      if (i !== row && M[i][col] !== 0) {
        const f = M[i][col];
        for (let j = col; j <= n; j++) M[i][j] -= f * M[row][j];
      }
    }
  }
  return M.map((r) => r[n]);
}
function homographyDstToSrc(dst, src) {
  const A = [], b = [];
  for (let i = 0; i < 4; i++) {
    const { x, y } = dst[i], { x: u, y: v } = src[i];
    A.push([x, y, 1, 0, 0, 0, -x * u, -y * u]); b.push(u);
    A.push([0, 0, 0, x, y, 1, -x * v, -y * v]); b.push(v);
  }
  const [a, bb, c, d, e, f, g, h] = solveLinear(A, b);
  return (x, y) => { const den = g * x + h * y + 1; return [(a * x + bb * y + c) / den, (d * x + e * y + f) / den]; };
}

async function warpImage(img, cornersOrig, outW, outH, onProgress) {
  const natW = img.naturalWidth || img.width, natH = img.naturalHeight || img.height;
  const sf = Math.min(1, 2600 / Math.max(natW, natH));
  const sw = Math.round(natW * sf), sh = Math.round(natH * sf);
  const srcCanvas = document.createElement("canvas"); srcCanvas.width = sw; srcCanvas.height = sh;
  const sctx = srcCanvas.getContext("2d", { willReadFrequently: true });
  sctx.imageSmoothingEnabled = true; sctx.imageSmoothingQuality = "high";
  sctx.drawImage(img, 0, 0, sw, sh);
  const srcData = sctx.getImageData(0, 0, sw, sh);
  const sd = srcData.data;
  const srcPts = cornersOrig.map((p) => ({ x: p.x * sf, y: p.y * sf }));
  const map = homographyDstToSrc([{ x: 0, y: 0 }, { x: outW, y: 0 }, { x: outW, y: outH }, { x: 0, y: outH }], srcPts);
  const outCanvas = document.createElement("canvas"); outCanvas.width = outW; outCanvas.height = outH;
  const octx = outCanvas.getContext("2d");
  const out = octx.createImageData(outW, outH);
  const od = out.data;
  const chunk = 90;
  for (let y0 = 0; y0 < outH; y0 += chunk) {
    const yEnd = Math.min(outH, y0 + chunk);
    for (let y = y0; y < yEnd; y++) {
      for (let x = 0; x < outW; x++) {
        const [sx, sy] = map(x, y);
        const oi = (y * outW + x) * 4;
        if (sx < 0 || sy < 0 || sx >= sw - 1 || sy >= sh - 1) { od[oi] = od[oi + 1] = od[oi + 2] = 255; od[oi + 3] = 255; continue; }
        const x0 = sx | 0, y0i = sy | 0, fx = sx - x0, fy = sy - y0i;
        const i00 = (y0i * sw + x0) * 4, i10 = i00 + 4, i01 = i00 + sw * 4, i11 = i01 + 4;
        for (let c = 0; c < 3; c++) {
          const top = sd[i00 + c] * (1 - fx) + sd[i10 + c] * fx;
          const bot = sd[i01 + c] * (1 - fx) + sd[i11 + c] * fx;
          od[oi + c] = top * (1 - fy) + bot * fy;
        }
        od[oi + 3] = 255;
      }
    }
    onProgress?.(Math.round((yEnd / outH) * 100));
    if (yEnd < outH) await new Promise((r) => setTimeout(r, 0));
  }
  octx.putImageData(out, 0, 0);
  return outCanvas;
}

function applyScanFilter(source, { mode, sensitivity, brightness, contrast }) {
  const w = source.width, h = source.height;
  const out = document.createElement("canvas"); out.width = w; out.height = h;
  const ctx = out.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(source, 0, 0);
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  const cF = 1 + contrast / 100;
  const finish = (v) => clamp(Math.round((v - 128) * cF + 128 + brightness * 1.6), 0, 255);

  if (mode !== "original") {
    const n = w * h;
    const gray = new Float32Array(n);
    for (let i = 0; i < n; i++) gray[i] = 0.299 * d[i * 4] + 0.587 * d[i * 4 + 1] + 0.114 * d[i * 4 + 2];
    const iw = w + 1;
    const integral = new Float64Array(iw * (h + 1));
    for (let y = 0; y < h; y++) {
      let rs = 0;
      const row = y * w, irow = (y + 1) * iw, prow = y * iw;
      for (let x = 0; x < w; x++) { rs += gray[row + x]; integral[irow + x + 1] = integral[prow + x + 1] + rs; }
    }
    const R = clamp(Math.round(Math.min(w, h) / 13), 20, 120);
    const offset = 34 - sensitivity * 0.38;
    for (let y = 0; y < h; y++) {
      const y1 = Math.max(0, y - R), y2 = Math.min(h, y + R + 1);
      for (let x = 0; x < w; x++) {
        const x1 = Math.max(0, x - R), x2 = Math.min(w, x + R + 1);
        const count = (x2 - x1) * (y2 - y1);
        const sum = integral[y2 * iw + x2] - integral[y1 * iw + x2] - integral[y2 * iw + x1] + integral[y1 * iw + x1];
        const mean = sum / count;
        const idx = y * w + x, o = idx * 4, g = gray[idx];
        if (mode === "bw") {
          const v = g + brightness < mean - offset ? 0 : 255;
          d[o] = d[o + 1] = d[o + 2] = v;
        } else if (mode === "clean") {
          let v = (g / (mean + 1)) * 248;
          v = clamp((v - 26) * (255 / 208), 0, 255);
          v = finish(v);
          d[o] = d[o + 1] = d[o + 2] = v;
        } else if (mode === "magic") {
          const f = 246 / (mean + 1);
          let r = d[o] * f, gg = d[o + 1] * f, bb = d[o + 2] * f;
          const lum = 0.299 * r + 0.587 * gg + 0.114 * bb, sat = 1.14;
          d[o] = finish(lum + (r - lum) * sat); d[o + 1] = finish(lum + (gg - lum) * sat); d[o + 2] = finish(lum + (bb - lum) * sat);
        }
      }
    }
  } else {
    for (let i = 0; i < d.length; i += 4) { d[i] = finish(d[i]); d[i + 1] = finish(d[i + 1]); d[i + 2] = finish(d[i + 2]); }
  }
  ctx.putImageData(img, 0, 0);
  return out;
}

let cvLoader = null;
function loadOpenCv() {
  if (cvLoader) return cvLoader;
  cvLoader = (async () => {
    await loadScript("https://docs.opencv.org/4.8.0/opencv.js");
    const started = Date.now();
    while (Date.now() - started < 45000) {
      const cv = window.cv;
      // OpenCV's Emscripten module exposes a custom .then() that is NOT a
      // real Promise — awaiting it, or returning it from an async function,
      // makes the Promise machinery try to "adopt" the module forever in an
      // endless microtask loop that freezes the page. Poll until the API is
      // installed, and hand the module back wrapped in a plain object so it
      // is never treated as a thenable.
      if (cv?.Mat && cv?.findContours && cv?.approxPolyDP) return { cv };
      await new Promise((r) => setTimeout(r, 150));
    }
    throw new Error("OpenCV took too long to start");
  })().catch((e) => { cvLoader = null; throw e; });
  return cvLoader;
}

async function detectWithOpenCv(img) {
  const { cv } = await loadOpenCv();
  const natW = img.naturalWidth || img.width, natH = img.naturalHeight || img.height;
  const scale = Math.min(1, 850 / Math.max(natW, natH));
  const w = Math.round(natW * scale), h = Math.round(natH * scale);
  const canvas = document.createElement("canvas"); canvas.width = w; canvas.height = h;
  canvas.getContext("2d").drawImage(img, 0, 0, w, h);
  const mats = [];
  const keep = (m) => { mats.push(m); return m; };
  try {
    const src = keep(cv.imread(canvas));
    const gray = keep(new cv.Mat()); cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);
    const blur = keep(new cv.Mat()); cv.GaussianBlur(gray, blur, new cv.Size(5, 5), 0);
    const edges = keep(new cv.Mat()); cv.Canny(blur, edges, 50, 150);
    const kernel = keep(cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(5, 5)));
    cv.morphologyEx(edges, edges, cv.MORPH_CLOSE, kernel);
    const contours = keep(new cv.MatVector());
    const hier = keep(new cv.Mat());
    cv.findContours(edges, contours, hier, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);
    const ranked = [];
    for (let i = 0; i < contours.size(); i++) { const c = contours.get(i); ranked.push({ c, area: cv.contourArea(c) }); }
    ranked.sort((a, b) => b.area - a.area);
    const imgArea = w * h;
    let found = null;
    outer: for (const epsF of [0.02, 0.03, 0.015, 0.04]) {
      for (const { c, area } of ranked.slice(0, 10)) {
        if (area < imgArea * 0.12) continue;
        const approx = new cv.Mat();
        cv.approxPolyDP(c, approx, epsF * cv.arcLength(c, true), true);
        if (approx.rows === 4) {
          const pts = [];
          for (let i = 0; i < 4; i++) pts.push({ x: approx.data32S[i * 2] / scale, y: approx.data32S[i * 2 + 1] / scale });
          found = { points: orderPoints(pts), areaRatio: area / imgArea };
          approx.delete();
          break outer;
        }
        approx.delete();
      }
    }
    if (!found && ranked.length && ranked[0].area > imgArea * 0.2) {
      const rr = cv.minAreaRect(ranked[0].c);
      const bp = new cv.Mat(); cv.boxPoints(rr, bp);
      const pts = [];
      for (let i = 0; i < 4; i++) pts.push({ x: bp.data32F[i * 2] / scale, y: bp.data32F[i * 2 + 1] / scale });
      bp.delete();
      found = { points: orderPoints(pts), areaRatio: ranked[0].area / imgArea, approx: true };
    }
    ranked.forEach(({ c }) => { try { c.delete(); } catch {} });
    return found;
  } finally {
    mats.forEach((m) => { try { m.delete?.(); } catch {} });
  }
}

const blobToData = (blob) => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(blob); });

export default function DocumentScanner() {
  const [item, setItem] = useState(null);
  const [corners, setCorners] = useState(null);
  const [detectMsg, setDetectMsg] = useState("");
  const [disp, setDisp] = useState({ w: 640, h: 480 });
  const [sizeId, setSizeId] = useState("auto");
  const [mode, setMode] = useState("bw");
  const [sensitivity, setSensitivity] = useState(55);
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(10);
  const [busy, setBusy] = useState("");
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [pages, setPages] = useState([]);
  const [zipping, setZipping] = useState(false);
  const [pdfBusy, setPdfBusy] = useState(false);
  const wrapRef = useRef(null);
  const dragRef = useRef(null);
  const warpedRef = useRef(null);
  const seqRef = useRef(0);

  const defaultCorners = useCallback((it, inset = 0.06) => {
    const ix = it.width * inset, iy = it.height * inset;
    return [{ x: ix, y: iy }, { x: it.width - ix, y: iy }, { x: it.width - ix, y: it.height - iy }, { x: ix, y: it.height - iy }];
  }, []);

  const runDetect = useCallback(async (it) => {
    const seq = ++seqRef.current;
    setBusy("detect");
    setDetectMsg("AI is finding the page corners (OpenCV loads once, ~10 MB)…");
    try {
      const found = await detectWithOpenCv(it.img);
      if (seqRef.current !== seq) return;
      if (found?.points) {
        setCorners(found.points);
        warpedRef.current = null; setResult(null);
        setDetectMsg(found.approx ? "Edges estimated — drag the amber corners to line them up perfectly." : `Page found automatically (${Math.round(found.areaRatio * 100)}% of photo). Drag any corner to fine-tune.`);
      } else {
        setDetectMsg("Auto-detect wasn't confident on this photo. No worries — just drag the 4 amber corners onto the page edges.");
      }
    } catch {
      if (seqRef.current === seq) setDetectMsg("Auto-detect couldn't run (engine blocked or slow network) — drag the 4 corners manually, it takes 10 seconds.");
    } finally { if (seqRef.current === seq) setBusy(""); }
  }, []);

  const add = useCallback(async (files) => {
    const f = files[0]; if (!f) return;
    setError(""); setResult(null); warpedRef.current = null;
    try {
      const it = { file: f, ...(await loadImage(f)) };
      setItem(it);
      setCorners(defaultCorners(it));
      runDetect(it);
    } catch (e) { setError(friendlyError(e, "Could not read that image. Try a different photo.")); }
  }, [defaultCorners, runDetect]);

  useEffect(() => {
    const update = () => {
      if (!wrapRef.current || !item) return;
      let w = wrapRef.current.clientWidth || 640, h = (w * item.height) / item.width;
      if (h > 560) { h = 560; w = (h * item.width) / item.height; }
      setDisp({ w: Math.round(w), h: Math.round(h) });
    };
    update(); window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [item]);

  const sample = async () => {
    const desk = document.createElement("canvas"); desk.width = 1200; desk.height = 900;
    const x = desk.getContext("2d");
    const g = x.createLinearGradient(0, 0, 1200, 900); g.addColorStop(0, "#7c5a36"); g.addColorStop(1, "#4b3220");
    x.fillStyle = g; x.fillRect(0, 0, 1200, 900);
    x.strokeStyle = "rgba(0,0,0,.18)"; for (let i = 0; i < 14; i++) { x.beginPath(); x.moveTo(0, i * 70 + 20); x.lineTo(1200, i * 70); x.stroke(); }
    const paper = document.createElement("canvas"); paper.width = 620; paper.height = 820;
    const p = paper.getContext("2d"); p.fillStyle = "#fbfbf7"; p.fillRect(0, 0, 620, 820);
    p.fillStyle = "#172033"; p.font = "bold 36px Georgia"; p.fillText("TOOLS STARS SCHOOL", 58, 82);
    p.font = "22px Georgia"; p.fillText("Fee Receipt — October 2026", 58, 126);
    p.strokeStyle = "#94a3b8"; p.beginPath(); p.moveTo(50, 150); p.lineTo(570, 150); p.stroke();
    p.font = "21px Arial";
    ["Student: Ali", "Class: 8-B", "Monthly Fee ........ Rs. 6,500", "Transport ........... Rs. 1,200", "Total Paid ........... Rs. 7,700", "", "Received with thanks.", "Sign: __________"].forEach((l, i) => p.fillText(l, 58, 215 + i * 52));
    p.strokeStyle = "#b45309"; p.lineWidth = 4; p.strokeRect(220, 640, 300, 110); p.fillStyle = "#b45309"; p.font = "bold 34px Arial"; p.fillText("PAID", 320, 708);
    x.save(); x.translate(600, 455); x.rotate(-0.11);
    x.fillStyle = "rgba(0,0,0,.4)"; x.fillRect(-paper.width / 2 + 16, -paper.height / 2 + 20, paper.width, paper.height);
    x.drawImage(paper, -paper.width / 2, -paper.height / 2); x.restore();
    const blob = await new Promise((r) => desk.toBlob(r, "image/jpeg", 0.92));
    add([new File([blob], "sample-receipt-photo.jpg", { type: "image/jpeg" })]);
  };

  const dscale = item ? disp.w / item.width : 1;
  const onHandle = (e, idx, phase) => {
    e.preventDefault();
    if (phase === "down") { dragRef.current = idx; e.currentTarget.setPointerCapture?.(e.pointerId); }
    if (phase === "up") dragRef.current = null;
  };
  const onStageMove = (e) => {
    if (dragRef.current == null || !item) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = clamp(((e.clientX - rect.left) / rect.width) * item.width, 0, item.width);
    const ny = clamp(((e.clientY - rect.top) / rect.height) * item.height, 0, item.height);
    // Keep each handle's identity while dragging (re-ordering mid-drag would
    // make the handle jump to a different corner). Points are normalised
    // into TL/TR/BR/BL order when the scan runs.
    setCorners((cs) => cs.map((c, i) => (i === dragRef.current ? { x: nx, y: ny } : c)));
    warpedRef.current = null;
  };

  const outputDims = useCallback((pts = corners) => {
    const spec = PAGE_SIZES.find((s) => s.id === sizeId);
    const [tl, tr, br, bl] = pts;
    const wEdge = (dist(tl, tr) + dist(bl, br)) / 2;
    const hEdge = (dist(tl, bl) + dist(tr, br)) / 2;
    const landscape = wEdge > hEdge;
    if (!spec.ratio) {
      const f = Math.min(1, 2200 / Math.max(wEdge, hEdge));
      return { w: Math.max(240, Math.round(wEdge * f)), h: Math.max(240, Math.round(hEdge * f)), mm: null };
    }
    let r = spec.ratio;
    if (landscape) r = spec.landscapeRatio || 1 / spec.ratio;
    const longSide = 2100;
    let mm = spec.mm;
    if (spec.id === "id") mm = landscape ? [86, 54] : [54, 86];
    else if (landscape) mm = [spec.mm[1], spec.mm[0]];
    return landscape ? { w: longSide, h: Math.round(longSide / r), mm } : { w: Math.round(longSide * r), h: longSide, mm };
  }, [corners, sizeId]);

  const makeResult = async (filteredCanvas, mm = null) => {
    const blob = await new Promise((r) => filteredCanvas.toBlob(r, "image/jpeg", 0.92));
    if (!blob) throw new Error("Could not create the scanned image.");
    setResult({ blob, url: URL.createObjectURL(blob), w: filteredCanvas.width, h: filteredCanvas.height, pageMm: mm, name: `${stripExt(item.file.name)}-scanned.jpg` });
  };

  const scan = async () => {
    if (!item || !corners) return;
    const orderedCorners = orderPoints(corners);
    if (polygonArea(orderedCorners) < item.width * item.height * 0.03) { setError("That selection is tiny — spread the corners across the whole page."); return; }
    setCorners(orderedCorners);
    setBusy("scan"); setError(""); setProgress(1);
    try {
      const dims = outputDims(orderedCorners);
      if (!warpedRef.current) {
        warpedRef.current = await warpImage(item.img, orderedCorners, dims.w, dims.h, (p) => setProgress(Math.round(p * 0.65)));
      }
      setProgress(72);
      await new Promise((r) => setTimeout(r, 20));
      const filtered = applyScanFilter(warpedRef.current, { mode, sensitivity, brightness, contrast });
      setProgress(95);
      await makeResult(filtered, dims.mm);
      setProgress(100);
    } catch (e) { console.error(e); setError("Scanning ran out of memory on this device. Try a smaller photo or desktop browser."); }
    finally { setBusy(""); setTimeout(() => setProgress(null), 800); }
  };

  const addPageAndNext = () => {
    if (!result) return;
    setPages((p) => [...p, result]);
    setResult(null); setItem(null); setCorners(null); warpedRef.current = null; setDetectMsg("");
  };

  const exportPdf = async (entries) => {
    if (!entries.length) return;
    setPdfBusy(true);
    try {
      const { jsPDF } = await import("jspdf");
      let pdf = null;
      for (const en of entries) {
        const data = await blobToData(en.blob);
        // Preset sizes keep their true physical dimensions (real A4 prints
        // as real A4); Auto pages scale their captured proportions to A4.
        let wMm, hMm;
        if (en.pageMm) [wMm, hMm] = en.pageMm;
        else if (en.w > en.h) { wMm = 297; hMm = Math.round(wMm * (en.h / en.w)); }
        else { wMm = 210; hMm = Math.round(wMm * (en.h / en.w)); }
        const landscape = wMm > hMm;
        if (!pdf) pdf = new jsPDF({ orientation: landscape ? "landscape" : "portrait", unit: "mm", format: [wMm, hMm] });
        else pdf.addPage([wMm, hMm], landscape ? "landscape" : "portrait");
        pdf.addImage(data, "JPEG", 0, 0, wMm, hMm);
      }
      pdf.save(entries.length > 1 ? "toolsstars-scanned-document.pdf" : `${stripExt(entries[0].name)}.pdf`);
    } finally { setPdfBusy(false); }
  };

  const allEntries = result ? [...pages, result] : pages;
  const step = !item ? 1 : !result ? 2 : 3;

  return (
    <div>
      {/* steps */}
      <ol className="mb-6 flex flex-wrap gap-2" aria-label="Progress">
        {[["1", "Photo"], ["2", "Corners"], ["3", "Scan & PDF"]].map(([n, l], i) => (
          <li key={n} className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-bold ${step === i + 1 ? "border-amber-400 bg-amber-400/15 text-amber-200" : step > i + 1 ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300" : "border-white/10 bg-white/[0.03] text-slate-400"}`}>
            <span className="grid h-5 w-5 place-items-center rounded-full bg-white/10 text-[10px]">{step > i + 1 ? "✓" : n}</span>{l}{i === 0 && pages.length > 0 ? ` (page ${pages.length + 1})` : ""}
          </li>
        ))}
      </ol>

      {!item && (
        <>
          <Dropzone accept="image/*" onFiles={add} title="Drop a photo of your document" hint="Receipts, notes, forms, book pages — straightened & whitened automatically" icon="image" />
          <div className="mt-4 flex flex-wrap justify-center gap-2.5">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-amber-400/50 bg-amber-400/12 px-4 py-2.5 text-sm font-bold text-amber-200 hover:bg-amber-400/20">
              <Icon name="video" size={16} /> Take a photo now (phone camera)
              <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => { if (e.target.files?.[0]) add([e.target.files[0]]); e.target.value = ""; }} />
            </label>
            <button onClick={sample} className="inline-flex items-center gap-2 rounded-xl border border-cyan-400/40 bg-cyan-400/10 px-4 py-2.5 text-sm font-bold text-cyan-200 hover:bg-cyan-400/20"><Icon name="sparkles" size={15} /> Try the sample receipt photo</button>
          </div>
        </>
      )}
      {error && <div className="mt-4 rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-200" role="alert">{error}</div>}

      {item && corners && (
        <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <div ref={wrapRef}>
            <div className="relative mx-auto select-none touch-none overflow-hidden rounded-2xl border border-white/12 bg-black/40" style={{ width: disp.w, height: disp.h }}
              onPointerMove={onStageMove} onPointerUp={() => (dragRef.current = null)}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.url} alt="Document photo — drag corners onto the page" draggable={false} className="absolute inset-0 h-full w-full" />
              <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
                <polygon points={corners.map((c) => `${c.x * dscale},${c.y * dscale}`).join(" ")} fill="rgba(255,197,49,.14)" stroke="#ffc531" strokeWidth="2.5" />
                {corners.map((c, i) => { const n = corners[(i + 1) % 4]; return <line key={i} x1={c.x * dscale} y1={c.y * dscale} x2={n.x * dscale} y2={n.y * dscale} stroke="#ffc531" strokeWidth="2" strokeDasharray="6 5" className="flow-dash" />; })}
              </svg>
              {corners.map((c, i) => (
                <button key={i} aria-label={`Corner ${i + 1}`} className="absolute z-10 grid h-9 w-9 -translate-x-1/2 -translate-y-1/2 cursor-move touch-none place-items-center rounded-full border-[3px] border-[#241a00] bg-amber-400 text-xs font-black text-[#241a00] shadow-xl"
                  style={{ left: c.x * dscale, top: c.y * dscale }}
                  onPointerDown={(e) => onHandle(e, i, "down")} onPointerUp={(e) => onHandle(e, i, "up")}>{i + 1}</button>
              ))}
            </div>
            <p className="mt-2.5 text-center text-xs leading-relaxed text-slate-400" role="status">{detectMsg || "Drag the 4 amber corners exactly onto the page corners."}</p>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              <button onClick={() => runDetect(item)} disabled={busy === "detect"} className={btnGhost}><Icon name="sparkles" size={15} /> {busy === "detect" ? "Detecting…" : "Auto-detect again"}</button>
              <button onClick={() => { setCorners([{ x: 0, y: 0 }, { x: item.width, y: 0 }, { x: item.width, y: item.height }, { x: 0, y: item.height }]); warpedRef.current = null; }} className={btnGhost}>Full photo</button>
              <button onClick={() => { setCorners(defaultCorners(item)); warpedRef.current = null; }} className={btnGhost}>Reset corners</button>
              <button onClick={() => { setItem(null); setCorners(null); setResult(null); warpedRef.current = null; }} className={btnGhost}><Icon name="trash" size={15} /> New photo</button>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-white">Page size</label>
            <select value={sizeId} onChange={(e) => { setSizeId(e.target.value); warpedRef.current = null; }} className={sel}>
              {PAGE_SIZES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>

            <h2 className="mt-5 text-sm font-bold uppercase tracking-wider text-slate-300">Scan look</h2>
            <div className="mt-2.5 grid grid-cols-2 gap-2">
              {[["bw", "Photocopy B&W ★", "Crisp black on white — classic scan"], ["clean", "Clean White", "Grayscale, shadows removed"], ["magic", "Magic Colour", "White-balanced colour scan"], ["original", "Original", "Straighten only, no cleanup"]].map(([v, t, d]) => (
                <button key={v} onClick={() => setMode(v)} className={`rounded-xl border px-3 py-2.5 text-left ${mode === v ? "border-amber-400 bg-amber-400/10" : "border-white/10 bg-white/[0.02]"}`}>
                  <span className="block text-sm font-bold text-white">{t}</span><span className="block text-[11px] text-slate-400">{d}</span>
                </button>
              ))}
            </div>

            <div className="mt-5 space-y-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
              {mode === "bw" && (
                <div><label className="flex justify-between text-sm font-semibold text-white">Ink darkness <span className="font-bold text-amber-300">{sensitivity}%</span></label>
                  <input type="range" min="10" max="95" value={sensitivity} onChange={(e) => setSensitivity(+e.target.value)} className="mt-2 w-full" />
                  <p className="mt-1 text-[11px] text-slate-500">Text missing? Increase. Dirty background showing? Decrease.</p></div>
              )}
              <div><label className="flex justify-between text-sm font-semibold text-white">Brightness <span className="font-bold text-amber-300">{brightness > 0 ? "+" : ""}{brightness}</span></label>
                <input type="range" min="-30" max="30" value={brightness} onChange={(e) => setBrightness(+e.target.value)} className="mt-2 w-full" /></div>
              <div><label className="flex justify-between text-sm font-semibold text-white">Contrast <span className="font-bold text-amber-300">{contrast}%</span></label>
                <input type="range" min="-20" max="80" value={contrast} onChange={(e) => setContrast(+e.target.value)} className="mt-2 w-full" /></div>
            </div>

            <button onClick={scan} disabled={busy === "scan"} className={`${btnP} mt-5 w-full justify-center sm:w-auto`}>
              <Icon name="sparkles" size={18} /> {busy === "scan" ? "Scanning…" : result ? "Re-scan with these settings" : "Scan document"}
            </button>
            {progress != null && <div className="mt-4"><div className="h-3 overflow-hidden rounded-full bg-white/[0.08]"><div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all" style={{ width: `${progress}%` }} /></div><p className="mt-1.5 text-xs text-slate-400">Flattening perspective & cleaning the page… {progress}%</p></div>}
          </div>
        </div>
      )}

      {result && (
        <div className="mt-8 rounded-3xl border border-emerald-400/25 bg-emerald-400/[0.04] p-5">
          <h2 className="flex flex-wrap items-center gap-2 text-lg font-extrabold text-white">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-emerald-400 text-[#032114]"><Icon name="check" size={16} strokeWidth={2.5} /></span>
            Scanned page ready {pages.length > 0 ? `(page ${pages.length + 1})` : ""}
            <span className="text-sm font-semibold text-slate-400">{result.w}×{result.h}px · {formatBytes(result.blob.size)}</span>
          </h2>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={result.url} alt="Scanned document result" className="mx-auto mt-4 max-h-[560px] w-auto max-w-full rounded-xl border border-white/15 bg-white shadow-2xl" />
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <button onClick={() => exportPdf(allEntries)} disabled={pdfBusy} className={btnG}><Icon name="pdf" size={17} /> {pdfBusy ? "Making PDF…" : allEntries.length > 1 ? `Download PDF (${allEntries.length} pages)` : "Download PDF"}</button>
            <button onClick={() => downloadBlob(result.blob, result.name)} className="inline-flex items-center gap-2 rounded-2xl bg-white/[0.06] border border-white/12 px-5 py-3 font-bold text-white hover:border-amber-400/50"><Icon name="download" size={16} /> Download JPG</button>
            <button onClick={addPageAndNext} className="inline-flex items-center gap-2 rounded-2xl bg-amber-400 px-5 py-3 font-extrabold text-[#241a00] hover:bg-amber-300"><Icon name="layers" size={16} /> Add page & scan another</button>
          </div>
        </div>
      )}

      {pages.length > 0 && (
        <div className="mt-8 rounded-3xl border border-white/[0.09] bg-white/[0.02] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-extrabold text-white">Your scanned pages ({allEntries.length})</h2>
            <div className="flex gap-2">
              <button onClick={() => exportPdf(allEntries)} disabled={pdfBusy} className={btnG}><Icon name="pdf" size={15} /> {pdfBusy ? "…" : "PDF (all pages)"}</button>
              <button disabled={zipping} onClick={async () => { setZipping(true); await downloadZip(allEntries.map((e2, i) => ({ blob: e2.blob, name: `scan-page-${i + 1}.jpg` })), "toolsstars-scanned-pages.zip"); setZipping(false); }} className="inline-flex items-center gap-2 rounded-2xl bg-white/[0.06] border border-white/12 px-4 py-2.5 text-sm font-bold text-white"><Icon name="download" size={15} /> ZIP</button>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            {pages.map((p, i) => (
              <span key={i} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.url} alt={`Scanned page ${i + 1}`} className="h-28 w-auto rounded-lg border border-white/15 bg-white object-contain" />
                <span className="absolute left-1.5 top-1.5 grid h-5 w-5 place-items-center rounded-full bg-black/70 text-[10px] font-bold text-amber-300">{i + 1}</span>
                <button aria-label={`Delete page ${i + 1}`} onClick={() => setPages((ps) => ps.filter((_, j) => j !== i))} className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-rose-500 text-white shadow"><Icon name="x" size={12} /></button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
