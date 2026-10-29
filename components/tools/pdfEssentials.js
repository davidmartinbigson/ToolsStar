"use client";

import { useCallback, useRef, useState } from "react";
import Dropzone from "@/components/Dropzone";
import { Icon } from "@/components/icons";
import { formatBytes, downloadBlob, stripExt, friendlyError } from "@/lib/utils";

/* ── Lazy PDF engines: loaded only when one of these tools is used ── */
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
const inputCls = "mt-2 w-full rounded-xl border border-white/10 bg-[#12152e] px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-amber-400/60 disabled:opacity-50";
const selectCls = "mt-2 w-full rounded-xl border border-white/10 bg-[#12152e] px-3 py-2.5 text-sm text-white outline-none focus:border-amber-400/60 disabled:opacity-50";
const choiceBase = "rounded-2xl border px-4 py-3 text-left transition";
const choiceOn = "border-amber-400 bg-amber-400/10 text-white";
const choiceOff = "border-white/10 bg-white/[0.02] text-slate-300 hover:border-white/25";

function Alert({ msg }) {
  if (!msg) return null;
  return (
    <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm leading-relaxed text-rose-200" role="alert">
      <Icon name="x" size={17} className="mt-0.5 shrink-0" /> {msg}
    </div>
  );
}

function FileCard({ item, onReset }) {
  if (!item) return null;
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.02] px-4 py-3">
      <span className="grid h-11 w-11 place-items-center rounded-xl bg-red-400/15 text-red-300"><Icon name="pdf" size={23} /></span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-semibold text-white" title={item.file.name}>{item.file.name}</span>
        <span className="text-xs text-slate-500">{item.pages} page{item.pages === 1 ? "" : "s"} · {formatBytes(item.file.size)}</span>
      </span>
      <button type="button" onClick={onReset} className={btnGhost}><Icon name="trash" size={15} /> Different PDF</button>
    </div>
  );
}

function ResultBox({ title, detail, onDownload, buttonLabel = "Download PDF" }) {
  return (
    <div className="mt-6 flex flex-wrap items-center gap-4 rounded-2xl border border-emerald-400/25 bg-emerald-400/[0.06] p-4" role="status">
      <span className="grid h-11 w-11 place-items-center rounded-full bg-emerald-400/15 text-emerald-300"><Icon name="check" size={22} /></span>
      <p className="min-w-[180px] flex-1 text-sm text-white"><strong>{title}</strong>{detail ? <span className="block text-slate-400">{detail}</span> : null}</p>
      <button type="button" onClick={onDownload} className={btnGreen}><Icon name="download" size={17} /> {buttonLabel}</button>
    </div>
  );
}

async function readPdf(file) {
  const { PDFDocument } = await pdfLib();
  const bytes = new Uint8Array(await file.arrayBuffer());
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  return { file, bytes, pages: doc.getPageCount() };
}

function parsePages(selection, total) {
  const selected = new Set();
  const parts = String(selection || "").split(",").map((part) => part.trim()).filter(Boolean);
  if (!parts.length) throw new Error("Type at least one page number, for example 1, 3 or 2-5.");
  for (const part of parts) {
    const range = part.match(/^(\d+)\s*-\s*(\d+)$/);
    if (range) {
      const start = Number(range[1]);
      const end = Number(range[2]);
      if (start < 1 || end > total || start > end) throw new Error(`"${part}" is not a valid range for a ${total}-page PDF.`);
      for (let page = start; page <= end; page += 1) selected.add(page);
    } else if (/^\d+$/.test(part)) {
      const page = Number(part);
      if (page < 1 || page > total) throw new Error(`Page ${page} does not exist. This PDF has ${total} page${total === 1 ? "" : "s"}.`);
      selected.add(page);
    } else {
      throw new Error(`I do not understand "${part}". Use pages like 1, 3, 5-8.`);
    }
  }
  return [...selected].sort((a, b) => a - b);
}

function useSinglePdf() {
  const [item, setItem] = useState(null);
  const [error, setError] = useState("");
  const add = useCallback(async (files) => {
    const file = files?.[0];
    if (!file) return;
    setError("");
    try {
      setItem(await readPdf(file));
    } catch (error) {
      setItem(null);
      setError(friendlyError(error));
    }
  }, []);
  return { item, setItem, error, setError, add };
}

/* ═══════════════════════════ ROTATE PDF ═══════════════════════════ */
export function RotatePdf() {
  const { item, setItem, error, setError, add } = useSinglePdf();
  const [angle, setAngle] = useState(90);
  const [scope, setScope] = useState("all");
  const [pagesText, setPagesText] = useState("1");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);

  const reset = () => { setItem(null); setResult(null); setError(""); };

  const run = async () => {
    if (!item) return;
    setBusy(true); setError(""); setResult(null);
    try {
      const selected = scope === "all" ? item.pages : parsePages(pagesText, item.pages).length;
      const { PDFDocument, degrees } = await pdfLib();
      const doc = await PDFDocument.load(item.bytes, { ignoreEncryption: true });
      const targets = scope === "all" ? doc.getPages() : parsePages(pagesText, item.pages).map((page) => doc.getPage(page - 1));
      targets.forEach((page) => {
        const current = page.getRotation().angle || 0;
        page.setRotation(degrees((current + angle + 360) % 360));
      });
      const bytes = await doc.save({ useObjectStreams: true });
      const blob = new Blob([bytes], { type: "application/pdf" });
      setResult({ blob, selected, name: `${stripExt(item.file.name)}-rotated.pdf` });
    } catch (error) {
      setError(friendlyError(error, "Rotation failed. Please check the page numbers and try again."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      {!item && <Dropzone accept="application/pdf,.pdf" onFiles={add} title="Drop a PDF to rotate" hint="Fix sideways scans and upside-down pages" icon="refresh" />}
      <Alert msg={error} />
      {item && (
        <>
          <FileCard item={item} onReset={reset} />
          <div className="mt-6 grid gap-6 lg:grid-cols-[240px_1fr] lg:items-start">
            <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-5 text-center">
              <div className="mx-auto grid h-40 w-32 place-items-center rounded-lg bg-white text-slate-700 shadow-xl transition-transform duration-300" style={{ transform: `rotate(${angle}deg)` }} aria-hidden="true">
                <div>
                  <div className="mx-auto h-2 w-16 rounded bg-slate-300" />
                  <div className="mx-auto mt-2 h-2 w-20 rounded bg-slate-200" />
                  <div className="mx-auto mt-2 h-2 w-14 rounded bg-slate-200" />
                  <p className="mt-4 text-[10px] font-extrabold tracking-[0.2em]">PAGE TOP</p>
                </div>
              </div>
              <p className="mt-4 text-xs text-slate-500">Preview shows the direction your pages will turn.</p>
            </div>

            <div>
              <p className="text-sm font-semibold text-white">1. Choose a direction</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {[[90, "↻", "Right 90°", "Turn clockwise"], [-90, "↺", "Left 90°", "Turn anti-clockwise"], [180, "⇅", "180°", "Turn upside down"]].map(([value, symbol, label, hint]) => (
                  <button key={value} type="button" onClick={() => setAngle(value)} className={`${choiceBase} ${angle === value ? choiceOn : choiceOff}`} aria-pressed={angle === value}>
                    <span className="block text-2xl font-black text-amber-300" aria-hidden="true">{symbol}</span>
                    <span className="mt-1 block font-bold">{label}</span>
                    <span className="block text-xs text-slate-500">{hint}</span>
                  </button>
                ))}
              </div>

              <p className="mt-6 text-sm font-semibold text-white">2. Which pages?</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <button type="button" onClick={() => setScope("all")} className={`${choiceBase} ${scope === "all" ? choiceOn : choiceOff}`} aria-pressed={scope === "all"}>
                  <span className="block font-bold">All {item.pages} pages</span><span className="text-xs text-slate-500">Best for a fully sideways scan</span>
                </button>
                <button type="button" onClick={() => setScope("custom")} className={`${choiceBase} ${scope === "custom" ? choiceOn : choiceOff}`} aria-pressed={scope === "custom"}>
                  <span className="block font-bold">Only selected pages</span><span className="text-xs text-slate-500">Fix one or a few pages</span>
                </button>
              </div>
              {scope === "custom" && (
                <div>
                  <label htmlFor="rotate-pages" className="mt-4 block text-sm font-semibold text-white">Page numbers</label>
                  <input id="rotate-pages" value={pagesText} onChange={(e) => setPagesText(e.target.value)} placeholder="Example: 1, 3, 5-8" className={inputCls} />
                  <p className="mt-1.5 text-xs text-slate-500">Use commas and ranges. Example: <strong className="text-slate-300">2, 4-6</strong>.</p>
                </div>
              )}
              <button type="button" onClick={run} disabled={busy} className={`${btnPrimary} mt-6`}>
                <Icon name="refresh" size={18} /> {busy ? "Rotating…" : "Rotate PDF"}
              </button>
            </div>
          </div>
          {result && <ResultBox title="Rotated PDF ready" detail={`${result.selected} page${result.selected === 1 ? "" : "s"} rotated · ${formatBytes(result.blob.size)}`} onDownload={() => downloadBlob(result.blob, result.name)} />}
        </>
      )}
    </div>
  );
}

/* ═════════════════════ ADD PAGE NUMBERS TO PDF ═════════════════════ */
function pageNumberLabel(style, current, total) {
  if (style === "page") return `Page ${current}`;
  if (style === "fraction") return `${current} / ${total}`;
  if (style === "pageOf") return `Page ${current} of ${total}`;
  if (style === "dash") return `- ${current} -`;
  return String(current);
}

export function AddPageNumbersPdf() {
  const { item, setItem, error, setError, add } = useSinglePdf();
  const [style, setStyle] = useState("pageOf");
  const [position, setPosition] = useState("bottom-center");
  const [fontSize, setFontSize] = useState(11);
  const [startAt, setStartAt] = useState(1);
  const [skipFirst, setSkipFirst] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);

  const reset = () => { setItem(null); setResult(null); setError(""); };
  const visibleTotal = item ? Math.max(1, item.pages - (skipFirst ? 1 : 0)) : 1;
  const example = pageNumberLabel(style, Math.max(1, Number(startAt) || 1), (Math.max(1, Number(startAt) || 1) + visibleTotal - 1));

  const run = async () => {
    if (!item) return;
    const start = Number(startAt);
    if (!Number.isInteger(start) || start < 0 || start > 100000) { setError("Starting number must be a whole number from 0 to 100,000."); return; }
    setBusy(true); setError(""); setResult(null);
    try {
      const { PDFDocument, StandardFonts, rgb } = await pdfLib();
      const doc = await PDFDocument.load(item.bytes, { ignoreEncryption: true });
      const font = await doc.embedFont(StandardFonts.Helvetica);
      const pages = doc.getPages();
      const firstNumberedIndex = skipFirst ? 1 : 0;
      const numberedTotal = pages.length - firstNumberedIndex;
      if (numberedTotal < 1) throw new Error("This one-page PDF would have no numbered pages if the first page is skipped.");
      pages.forEach((page, index) => {
        if (index < firstNumberedIndex) return;
        const shownNumber = start + index - firstNumberedIndex;
        const text = pageNumberLabel(style, shownNumber, start + numberedTotal - 1);
        const { width, height } = page.getSize();
        const textWidth = font.widthOfTextAtSize(text, fontSize);
        const margin = 30;
        let x = (width - textWidth) / 2;
        let y = 24;
        if (position.includes("left")) x = margin;
        if (position.includes("right")) x = width - margin - textWidth;
        if (position.startsWith("top")) y = height - margin;
        page.drawText(text, { x, y, size: fontSize, font, color: rgb(0.28, 0.3, 0.36) });
      });
      const blob = new Blob([await doc.save({ useObjectStreams: true })], { type: "application/pdf" });
      setResult({ blob, count: numberedTotal, name: `${stripExt(item.file.name)}-numbered.pdf` });
    } catch (error) {
      setError(friendlyError(error, "Could not add page numbers to this PDF."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      {!item && <Dropzone accept="application/pdf,.pdf" onFiles={add} title="Drop a PDF to number its pages" hint="Clean page numbers for reports, assignments and books" icon="type" />}
      <Alert msg={error} />
      {item && (
        <>
          <FileCard item={item} onReset={reset} />
          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_280px] lg:items-start">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="pn-style" className="text-sm font-semibold text-white">Number style</label>
                <select id="pn-style" value={style} onChange={(e) => setStyle(e.target.value)} className={selectCls}>
                  <option value="pageOf">Page 1 of 10 ★</option>
                  <option value="plain">1</option>
                  <option value="page">Page 1</option>
                  <option value="fraction">1 / 10</option>
                  <option value="dash">- 1 -</option>
                </select>
              </div>
              <div>
                <label htmlFor="pn-position" className="text-sm font-semibold text-white">Position</label>
                <select id="pn-position" value={position} onChange={(e) => setPosition(e.target.value)} className={selectCls}>
                  <option value="bottom-center">Bottom centre ★</option>
                  <option value="bottom-right">Bottom right</option>
                  <option value="bottom-left">Bottom left</option>
                  <option value="top-center">Top centre</option>
                  <option value="top-right">Top right</option>
                  <option value="top-left">Top left</option>
                </select>
              </div>
              <div>
                <label htmlFor="pn-start" className="text-sm font-semibold text-white">Start numbering at</label>
                <input id="pn-start" type="number" min="0" max="100000" value={startAt} onChange={(e) => setStartAt(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label htmlFor="pn-size" className="flex justify-between text-sm font-semibold text-white">Text size <span className="text-amber-300">{fontSize} pt</span></label>
                <input id="pn-size" type="range" min="8" max="18" step="1" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="mt-4 w-full" />
              </div>
              <label className="flex items-start gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.02] px-4 py-3 text-sm text-slate-300 sm:col-span-2">
                <input type="checkbox" checked={skipFirst} onChange={(e) => setSkipFirst(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0" />
                <span><strong className="text-white">Do not number the first page</strong><span className="block text-xs text-slate-500">Useful for a title or cover page. The next page starts with your chosen number.</span></span>
              </label>
            </div>

            <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Simple preview</p>
              <div className="relative mx-auto mt-3 h-56 w-44 rounded-md bg-white shadow-xl" aria-hidden="true">
                <div className="absolute left-5 right-5 top-8 space-y-2"><div className="h-2 rounded bg-slate-200" /><div className="h-2 rounded bg-slate-200" /><div className="h-2 w-2/3 rounded bg-slate-200" /></div>
                <span className={`absolute px-4 text-[11px] font-semibold text-slate-600 ${position.startsWith("top") ? "top-2" : "bottom-2"} ${position.includes("left") ? "left-0" : position.includes("right") ? "right-0" : "left-1/2 -translate-x-1/2"}`}>{example}</span>
              </div>
            </div>
          </div>
          <button type="button" onClick={run} disabled={busy} className={`${btnPrimary} mt-6`}><Icon name="type" size={18} /> {busy ? "Adding numbers…" : "Add page numbers"}</button>
          {result && <ResultBox title="Numbered PDF ready" detail={`${result.count} page${result.count === 1 ? "" : "s"} numbered · ${formatBytes(result.blob.size)}`} onDownload={() => downloadBlob(result.blob, result.name)} />}
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════ WATERMARK PDF ═══════════════════════════ */
function hexToPdfColor(hex, rgb) {
  const clean = String(hex || "#64748b").replace("#", "");
  const value = Number.parseInt(clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean, 16);
  return rgb(((value >> 16) & 255) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255);
}

function drawCenteredWatermark(page, text, font, requestedSize, color, opacity, degrees) {
  const { width, height } = page.getSize();
  let size = requestedSize;
  let textWidth = font.widthOfTextAtSize(text, size);
  const maxWidth = width * 0.82;
  if (textWidth > maxWidth) {
    size = Math.max(10, size * (maxWidth / textWidth));
    textWidth = font.widthOfTextAtSize(text, size);
  }
  const angle = -30;
  const rad = (angle * Math.PI) / 180;
  const corners = [
    [0, 0],
    [textWidth * Math.cos(rad), textWidth * Math.sin(rad)],
    [textWidth * Math.cos(rad) - size * Math.sin(rad), textWidth * Math.sin(rad) + size * Math.cos(rad)],
    [-size * Math.sin(rad), size * Math.cos(rad)],
  ];
  const xs = corners.map(([x]) => x), ys = corners.map(([, y]) => y);
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
  const x = (width - (maxX - minX)) / 2 - minX;
  const y = (height - (maxY - minY)) / 2 - minY;
  page.drawText(text, { x, y, size, font, color, opacity, rotate: degrees(angle) });
}

export function WatermarkPdf() {
  const { item, setItem, error, setError, add } = useSinglePdf();
  const [text, setText] = useState("CONFIDENTIAL");
  const [layout, setLayout] = useState("diagonal");
  const [scope, setScope] = useState("all");
  const [opacity, setOpacity] = useState(18);
  const [size, setSize] = useState(48);
  const [color, setColor] = useState("#64748b");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);

  const reset = () => { setItem(null); setResult(null); setError(""); };

  const run = async () => {
    if (!item) return;
    const watermarkText = text.trim();
    if (!watermarkText) { setError("Type the watermark words first, for example CONFIDENTIAL or DRAFT."); return; }
    if (watermarkText.length > 60) { setError("Please keep the watermark to 60 characters or fewer so it stays readable."); return; }
    setBusy(true); setError(""); setResult(null);
    try {
      const { PDFDocument, StandardFonts, rgb, degrees } = await pdfLib();
      const doc = await PDFDocument.load(item.bytes, { ignoreEncryption: true });
      const font = await doc.embedFont(StandardFonts.HelveticaBold);
      const pdfColor = hexToPdfColor(color, rgb);
      const alpha = Math.min(0.6, Math.max(0.03, opacity / 100));
      const pages = scope === "first" ? doc.getPages().slice(0, 1) : doc.getPages();

      pages.forEach((page) => {
        const { width, height } = page.getSize();
        if (layout === "diagonal") {
          drawCenteredWatermark(page, watermarkText, font, size, pdfColor, alpha, degrees);
        } else if (layout === "footer") {
          let footerSize = Math.min(16, size);
          let textWidth = font.widthOfTextAtSize(watermarkText, footerSize);
          if (textWidth > width - 56) {
            footerSize = Math.max(7, footerSize * ((width - 56) / textWidth));
            textWidth = font.widthOfTextAtSize(watermarkText, footerSize);
          }
          page.drawText(watermarkText, { x: (width - textWidth) / 2, y: 22, size: footerSize, font, color: pdfColor, opacity: Math.max(alpha, 0.35) });
        } else {
          let tileSize = Math.max(15, Math.min(30, size * 0.55));
          let textWidth = font.widthOfTextAtSize(watermarkText, tileSize);
          if (textWidth > width * 0.62) {
            tileSize = Math.max(9, tileSize * ((width * 0.62) / textWidth));
            textWidth = font.widthOfTextAtSize(watermarkText, tileSize);
          }
          const stepX = textWidth + 54;
          const stepY = tileSize * 3.1;
          for (let y = 14; y < height + stepY; y += stepY) {
            for (let x = -20; x < width + stepX; x += stepX) {
              page.drawText(watermarkText, { x, y, size: tileSize, font, color: pdfColor, opacity: alpha, rotate: degrees(-24) });
            }
          }
        }
      });

      const blob = new Blob([await doc.save({ useObjectStreams: true })], { type: "application/pdf" });
      setResult({ blob, count: pages.length, name: `${stripExt(item.file.name)}-watermarked.pdf` });
    } catch (error) {
      setError(friendlyError(error, "Could not add the watermark to this PDF."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      {!item && <Dropzone accept="application/pdf,.pdf" onFiles={add} title="Drop a PDF to watermark" hint="Add CONFIDENTIAL, DRAFT, your name or a company name" icon="shield" />}
      <Alert msg={error} />
      {item && (
        <>
          <FileCard item={item} onReset={reset} />
          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_300px] lg:items-start">
            <div>
              <label htmlFor="wm-text" className="text-sm font-semibold text-white">Watermark text</label>
              <input id="wm-text" value={text} onChange={(e) => setText(e.target.value)} maxLength={60} placeholder="CONFIDENTIAL" className={inputCls} />
              <div className="mt-2 flex flex-wrap gap-2">
                {["CONFIDENTIAL", "DRAFT", "COPY", "SAMPLE"].map((preset) => (
                  <button key={preset} type="button" onClick={() => setText(preset)} className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-bold text-slate-300 hover:border-amber-400/50">{preset}</button>
                ))}
              </div>

              <p className="mt-6 text-sm font-semibold text-white">Layout</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {[["diagonal", "One diagonal", "Large across the centre"], ["tiled", "Repeated", "All over the page"], ["footer", "Bottom text", "Small and neat"]].map(([value, label, hint]) => (
                  <button key={value} type="button" onClick={() => setLayout(value)} className={`${choiceBase} ${layout === value ? choiceOn : choiceOff}`} aria-pressed={layout === value}>
                    <span className="block font-bold">{label}</span><span className="text-xs text-slate-500">{hint}</span>
                  </button>
                ))}
              </div>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="wm-opacity" className="flex justify-between text-sm font-semibold text-white">Visibility <span className="text-amber-300">{opacity}%</span></label>
                  <input id="wm-opacity" type="range" min="5" max="50" value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} className="mt-4 w-full" />
                  <p className="mt-1 text-xs text-slate-500">15–25% is usually best: visible, but the document stays easy to read.</p>
                </div>
                <div>
                  <label htmlFor="wm-size" className="flex justify-between text-sm font-semibold text-white">Text size <span className="text-amber-300">{size} pt</span></label>
                  <input id="wm-size" type="range" min="22" max="76" value={size} onChange={(e) => setSize(Number(e.target.value))} className="mt-4 w-full" />
                </div>
                <div>
                  <label htmlFor="wm-scope" className="text-sm font-semibold text-white">Pages</label>
                  <select id="wm-scope" value={scope} onChange={(e) => setScope(e.target.value)} className={selectCls}>
                    <option value="all">All pages ★</option>
                    <option value="first">First page only</option>
                  </select>
                </div>
                <div>
                  <span className="text-sm font-semibold text-white">Colour</span>
                  <div className="mt-2.5 flex items-center gap-2">
                    {[["#64748b", "Grey"], ["#dc2626", "Red"], ["#2563eb", "Blue"], ["#059669", "Green"], ["#111827", "Black"]].map(([value, label]) => (
                      <button key={value} type="button" onClick={() => setColor(value)} aria-label={label} title={label} className={`h-9 w-9 rounded-full border-2 ${color === value ? "border-amber-300 scale-110" : "border-white/20"}`} style={{ background: value }} />
                    ))}
                    <input type="color" value={color} onChange={(e) => setColor(e.target.value)} aria-label="Custom colour" className="h-9 w-11 cursor-pointer rounded-lg border border-white/15 bg-transparent" />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Example page</p>
              <div className="relative mx-auto mt-3 h-64 w-52 overflow-hidden rounded-md bg-white shadow-xl" aria-hidden="true">
                <div className="absolute left-5 right-5 top-7 space-y-2">{Array.from({ length: 9 }).map((_, i) => <div key={i} className="h-2 rounded bg-slate-200" style={{ width: `${88 - (i % 3) * 13}%` }} />)}</div>
                {layout === "footer" ? (
                  <span className="absolute bottom-3 left-1/2 max-w-[92%] -translate-x-1/2 truncate text-[11px] font-extrabold" style={{ color, opacity: Math.max(0.35, opacity / 100) }}>{text || "WATERMARK"}</span>
                ) : layout === "tiled" ? (
                  <div className="absolute inset-[-30px] grid rotate-[-24deg] grid-cols-2 content-around text-center text-[12px] font-black" style={{ color, opacity: opacity / 100 }}>
                    {Array.from({ length: 12 }).map((_, i) => <span key={i} className="truncate px-1">{text || "WATERMARK"}</span>)}
                  </div>
                ) : (
                  <span className="absolute left-1/2 top-1/2 max-w-[95%] -translate-x-1/2 -translate-y-1/2 rotate-[-30deg] truncate font-black" style={{ color, opacity: opacity / 100, fontSize: `${Math.max(15, size * 0.48)}px` }}>{text || "WATERMARK"}</span>
                )}
              </div>
              <p className="mt-3 text-xs leading-relaxed text-slate-500">The watermark is drawn into a new copy. Your original PDF is never changed.</p>
            </div>
          </div>
          <button type="button" onClick={run} disabled={busy} className={`${btnPrimary} mt-6`}><Icon name="shield" size={18} /> {busy ? "Adding watermark…" : "Add watermark"}</button>
          {result && <ResultBox title="Watermarked PDF ready" detail={`${result.count} page${result.count === 1 ? "" : "s"} watermarked · ${formatBytes(result.blob.size)}`} onDownload={() => downloadBlob(result.blob, result.name)} />}
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════ PDF TO TEXT ═══════════════════════════ */
function joinLineParts(parts) {
  let line = "";
  const sorted = [...parts].sort((a, b) => a.x - b.x);
  for (const part of sorted) {
    const value = String(part.text || "");
    if (!value) continue;
    if (!line) line = value.trimStart();
    else if (/\s$/.test(line) || /^\s/.test(value) || /^[,.;:!?)%\]}]/.test(value) || /[([{]$/.test(line)) line += value;
    else line += ` ${value}`;
  }
  return line.trim();
}

function extractPageText(items) {
  const lines = [];
  const usable = items.filter((item) => typeof item.str === "string" && item.str.length);
  for (const item of usable) {
    const x = Number(item.transform?.[4] || 0);
    const y = Number(item.transform?.[5] || 0);
    const height = Math.abs(Number(item.transform?.[3] || item.height || 10)) || 10;
    let line = lines.find((candidate) => Math.abs(candidate.y - y) <= Math.max(2, height * 0.45));
    if (!line) {
      line = { y, parts: [] };
      lines.push(line);
    }
    line.parts.push({ x, text: item.str });
    if (item.hasEOL) line.endsLine = true;
  }
  return lines
    .sort((a, b) => b.y - a.y)
    .map((line) => joinLineParts(line.parts))
    .filter(Boolean)
    .join("\n");
}

export function PdfToText() {
  const [item, setItem] = useState(null);
  const [includeHeadings, setIncludeHeadings] = useState(true);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(null);
  const [output, setOutput] = useState("");
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const pdfRef = useRef(null);

  const add = useCallback(async (files) => {
    const file = files?.[0];
    if (!file) return;
    setError(""); setOutput(""); setStats(null); setProgress(null);
    try {
      const lib = await pdfjs();
      const data = new Uint8Array(await file.arrayBuffer());
      pdfRef.current = await lib.getDocument({ data }).promise;
      setItem({ file, pages: pdfRef.current.numPages });
    } catch (error) {
      setItem(null);
      pdfRef.current = null;
      setError(friendlyError(error));
    }
  }, []);

  const reset = () => {
    setItem(null); setOutput(""); setStats(null); setProgress(null); setError(""); pdfRef.current = null;
  };

  const run = async () => {
    if (!item || !pdfRef.current) return;
    setBusy(true); setError(""); setOutput(""); setStats(null); setProgress(1); setCopied(false);
    try {
      const pagesOut = [];
      let foundPages = 0;
      for (let pageNumber = 1; pageNumber <= item.pages; pageNumber += 1) {
        const page = await pdfRef.current.getPage(pageNumber);
        const content = await page.getTextContent();
        const text = extractPageText(content.items || []);
        if (text.trim()) foundPages += 1;
        pagesOut.push(includeHeadings ? `--- Page ${pageNumber} ---\n${text}`.trimEnd() : text);
        setProgress(Math.round((pageNumber / item.pages) * 100));
        if (pageNumber % 4 === 0) await new Promise((resolve) => setTimeout(resolve, 0));
      }
      const finalText = pagesOut.join("\n\n").trim();
      const words = finalText ? finalText.trim().split(/\s+/).filter(Boolean).length : 0;
      setOutput(finalText);
      setStats({ pages: item.pages, foundPages, words, chars: finalText.length });
    } catch (error) {
      setError(friendlyError(error, "Text extraction failed. The PDF may use an unusual internal format."));
      setProgress(null);
    } finally {
      setBusy(false);
    }
  };

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("Copy was blocked by the browser. Select the text in the box and copy it manually.");
    }
  };

  return (
    <div>
      {!item && <Dropzone accept="application/pdf,.pdf" onFiles={add} title="Drop a PDF to extract its text" hint="Best for digital PDFs with selectable text" icon="file" />}
      <Alert msg={error} />
      {item && (
        <>
          <FileCard item={item} onReset={reset} />
          <div className="mt-5 flex flex-wrap items-center gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] px-4 py-3">
            <label className="flex items-center gap-2.5 text-sm text-slate-300">
              <input type="checkbox" checked={includeHeadings} onChange={(e) => setIncludeHeadings(e.target.checked)} className="h-4 w-4" />
              Add “Page 1”, “Page 2” headings
            </label>
            <button type="button" onClick={run} disabled={busy} className={`${btnPrimary} ml-auto`}><Icon name="type" size={18} /> {busy ? "Extracting…" : "Extract text"}</button>
          </div>

          {progress != null && (
            <div className="mt-5" role="status" aria-live="polite">
              <div className="h-3 overflow-hidden rounded-full bg-white/[0.08]"><div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-amber-400 transition-all" style={{ width: `${progress}%` }} /></div>
              <p className="mt-2 text-xs text-slate-400">{busy ? `Reading page text… ${progress}%` : "Extraction complete."}</p>
            </div>
          )}

          {stats && (
            <div className="mt-6">
              {stats.foundPages === 0 ? (
                <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-4 text-sm leading-relaxed text-amber-100" role="status">
                  <strong>No selectable text was found.</strong> This is probably a scanned or photo-only PDF. Convert its pages to images with PDF to JPG, then use our <a href="/tools/image-to-text" className="font-bold text-amber-300 underline underline-offset-2">Image to Text (OCR)</a> tool.
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-300">
                    <span className="rounded-full bg-white/[0.05] px-3 py-1.5">{stats.pages} pages checked</span>
                    <span className="rounded-full bg-white/[0.05] px-3 py-1.5">Text on {stats.foundPages} page{stats.foundPages === 1 ? "" : "s"}</span>
                    <span className="rounded-full bg-white/[0.05] px-3 py-1.5">{stats.words.toLocaleString()} words</span>
                    <span className="rounded-full bg-white/[0.05] px-3 py-1.5">{stats.chars.toLocaleString()} characters</span>
                  </div>
                  <label htmlFor="pdf-text-output" className="mt-5 block text-sm font-semibold text-white">Extracted text <span className="font-normal text-slate-500">(you can edit it before saving)</span></label>
                  <textarea id="pdf-text-output" value={output} onChange={(e) => setOutput(e.target.value)} rows={16} spellCheck="false" className="mt-2 w-full rounded-2xl border border-white/10 bg-[#080a19] px-4 py-3 font-mono text-[13px] leading-relaxed text-slate-100 outline-none focus:border-cyan-400/60" />
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button type="button" onClick={copyText} className={btnGreen}><Icon name="copy" size={16} /> {copied ? "Copied!" : "Copy text"}</button>
                    <button type="button" onClick={() => downloadBlob(new Blob(["\ufeff", output], { type: "text/plain;charset=utf-8" }), `${stripExt(item.file.name)}.txt`)} className={btnPrimary}><Icon name="download" size={16} /> Download .txt</button>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">Columns, tables and unusual layouts may need small manual cleanup after extraction.</p>
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
