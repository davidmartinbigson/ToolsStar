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

/* ═══════════════════════════ PDF TO WORD ═══════════════════════════
   Pure structure builders (no DOM — pinned by tests). pdf.js hands us
   every text fragment with its position, font size and font name; from
   that we rebuild what a Word document actually needs: lines (fragments
   on the same baseline), style flags (bold/italic from the font), a
   body-text size (the median), headings (lines clearly larger than the
   body that are short and unpunctuated), and paragraphs (consecutive
   body lines reflowed together). The component then feeds these blocks
   to the `docx` library to emit a real .docx.                        */
function pdfJoinParts(parts) {
  let line = "";
  for (const part of [...parts].sort((a, b) => a.x - b.x)) {
    const value = String(part.text || "");
    if (!value) continue;
    if (!line) line = value.trimStart();
    else if (/\s$/.test(line) || /^\s/.test(value) || /^[,.;:!?)%\]}]/.test(value) || /[([{]$/.test(line)) line += value;
    else line += ` ${value}`;
  }
  return line.trim();
}

function pdfStyledLines(items, styles) {
  const lines = [];
  for (const item of items || []) {
    const str = String(item?.str ?? "");
    if (!str.length) continue;
    const x = Number(item.transform?.[4] || 0);
    const y = Number(item.transform?.[5] || 0);
    const size = Math.abs(Number(item.transform?.[3] || item.height || 10)) || 10;
    const font = String(item.fontName || "");
    const st = (styles || {})[font] || {};
    const bold = /bold|black|heavy/i.test(font) || Number(st.fontWeight) >= 600;
    const italic = /italic|oblique/i.test(font) || st.fontStyle === "italic";
    let line = lines.find((c) => Math.abs(c.y - y) <= Math.max(2, size * 0.45));
    if (!line) {
      line = { y, size, bold, italic, parts: [], fonts: [], family: "" };
      lines.push(line);
    }
    const w = Number(item.width || 0);
    line.parts.push({ x, text: str, w });
    line.left = line.left === undefined ? x : Math.min(line.left, x);
    line.right = Math.max(line.right || 0, x + w);
    if (!line.fonts.includes(font)) line.fonts.push(font);
    const fam = String(st.fontFamily || "");
    if (fam && !line.family) line.family = fam;
    line.size = Math.max(line.size, size);
    line.bold = line.bold || bold;
    line.italic = line.italic || italic;
  }
  return lines
    .sort((a, b) => b.y - a.y)
    .map((l) => ({
      text: pdfJoinParts(l.parts), size: l.size, bold: l.bold, italic: l.italic, y: l.y,
      left: l.left ?? 0, right: l.right ?? 0, fonts: l.fonts, family: l.family,
    }))
    .filter((l) => l.text.trim());
}

/* Visual-fidelity helpers (pure — pinned by tests). Real PDFs hide emphasis:
   the font table often carries no weight at all, and the bold face shows up
   only as a separate font name used on a minority of lines (names, section
   heads, job titles). So a font that appears on few lines is an emphasis
   font, and short lines set in it are bold. Alignment comes from where the
   line sits on the page, and generic font families map to Word equivalents. */
function pdfEmphasisFonts(lines) {
  const perFont = new Map();
  for (const l of lines || []) for (const f of l.fonts || []) perFont.set(f, (perFont.get(f) || 0) + 1);
  const total = (lines || []).length || 1;
  const out = new Set();
  for (const [f, n] of perFont) if (n <= Math.max(2, total * 0.25)) out.add(f);
  return out;
}

function pdfAlignment(line, pageWidth) {
  const pw = pageWidth || 612;
  const center = (line.left + line.right) / 2;
  // A margin-filling line centres itself by accident — only short lines may
  // be read as deliberately centred.
  if (line.right - line.left < pw * 0.7 && Math.abs(center - pw / 2) <= pw * 0.05) return "center";
  if (line.right >= pw * 0.9 && line.left > pw * 0.5) return "right";
  return "left";
}

function pdfFontFamily(family) {
  const f = String(family || "").toLowerCase();
  if (/mono|courier/.test(f)) return "Consolas";
  if (/serif/.test(f) && !/sans/.test(f)) return "Times New Roman";
  return "Calibri";
}

function pdfDocumentStructure(pages, opts = {}) {
  const { reflow = true, headings = true, emphasis = null, pageWidths = null } = opts;
  const all = (pages || []).flat();
  const sizes = all.map((l) => Math.round(l.size * 10) / 10).sort((a, b) => a - b);
  const bodySize = sizes.length ? sizes[Math.floor(sizes.length / 2)] : 11;
  const blocks = [];
  (pages || []).forEach((lines, pi) => {
    const pw = (pageWidths || [])[pi] || 612;
    let para = null;
    let paraFilled = false;
    const flush = () => { if (para) { blocks.push(para); para = null; paraFilled = false; } };
    for (const line of lines) {
      const ratio = bodySize ? line.size / bodySize : 1;
      const trimmed = line.text.trim();
      const emph = line.bold || ((line.fonts || []).some((f) => emphasis?.has(f)) && trimmed.length <= 80);
      const isHeading = headings && ratio >= 1.18 && trimmed.length <= 90 && !/[.;,]$/.test(trimmed);
      if (isHeading) {
        flush();
        blocks.push({ page: pi + 1, kind: ratio >= 1.45 ? "h1" : "h2", text: trimmed, bold: true, italic: line.italic, size: line.size, color: line.color, align: pdfAlignment(line, pw), family: line.family, y: line.y });
      } else if (reflow && para && para.page === pi + 1 && paraFilled && Math.abs(line.size - para.size) <= bodySize * 0.12) {
        // Only a line whose predecessor ran out to the margin was wrapped by
        // the typesetter; short lines (bullets, titles, dates) stay their own.
        para.text += ` ${trimmed}`;
        para.bold = para.bold || emph;
        para.italic = para.italic || line.italic;
        paraFilled = line.right >= pw * 0.82;
      } else {
        flush();
        para = { page: pi + 1, kind: "p", text: trimmed, size: line.size, bold: emph, italic: line.italic, color: line.color, align: pdfAlignment(line, pw), family: line.family, y: line.y };
        paraFilled = line.right >= pw * 0.82;
      }
    }
    flush();
  });
  return { bodySize, blocks };
}

export function PdfToWord() {
  const [item, setItem] = useState(null);
  const [detect, setDetect] = useState(true);
  const [keepStyle, setKeepStyle] = useState(true);
  const [pageBreaks, setPageBreaks] = useState(true);
  const [reflow, setReflow] = useState(true);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const pdfRef = useRef(null);

  const add = useCallback(async (files) => {
    const file = files?.[0];
    if (!file) return;
    setError(""); setResult(null); setProgress(null);
    try {
      const lib = await pdfjs();
      const data = new Uint8Array(await file.arrayBuffer());
      pdfRef.current = await lib.getDocument({ data }).promise;
      setItem({ file, pages: pdfRef.current.numPages });
    } catch (e) {
      setItem(null); pdfRef.current = null;
      setError(friendlyError(e, "Could not open that PDF. If it is password-protected, unlock it first."));
    }
  }, []);

  const reset = () => { setItem(null); setResult(null); setProgress(null); setError(""); pdfRef.current = null; };

  const run = async () => {
    if (!item || !pdfRef.current) return;
    setBusy(true); setError(""); setResult(null); setProgress(1);
    try {
      const pageLines = [];
      const pageWidths = [];
      const pageHeights = [];
      const pageObjs = [];
      for (let pageNumber = 1; pageNumber <= item.pages; pageNumber += 1) {
        const page = await pdfRef.current.getPage(pageNumber);
        const vp = page.getViewport({ scale: 1 });
        pageWidths.push(vp.width);
        pageHeights.push(vp.height);
        pageObjs.push(page);
        const content = await page.getTextContent();
        pageLines.push(pdfStyledLines(content.items || [], content.styles || {}));
        setProgress(Math.round((pageNumber / item.pages) * 40));
        if (pageNumber % 4 === 0) await new Promise((r) => setTimeout(r, 0));
      }
      // Real PDFs hide emphasis: bold often shows up only as a minority font
      // name with no weight in the font table, so learn those fonts first.
      const emphasis = detect ? pdfEmphasisFonts(pageLines.flat()) : null;
      // Visual fidelity: sample each line's ink colour from a rendered page
      // (capped at 20 pages so huge documents stay fast).
      if (keepStyle && item.pages <= 20) {
        for (let pi = 0; pi < pageObjs.length; pi += 1) {
          const lines = pageLines[pi];
          if (!lines.length) continue;
          const scale = 1.5;
          const rvp = pageObjs[pi].getViewport({ scale });
          const canvas = document.createElement("canvas");
          canvas.width = Math.ceil(rvp.width);
          canvas.height = Math.ceil(rvp.height);
          try {
            await pageObjs[pi].render({ canvasContext: canvas.getContext("2d"), viewport: rvp }).promise;
          } catch { continue; }
          const ctx = canvas.getContext("2d", { willReadFrequently: true });
          for (const line of lines) {
            const x0 = Math.max(0, Math.floor(line.left * scale));
            const y0 = Math.max(0, Math.floor((pageHeights[pi] - line.y - line.size * 0.2) * scale));
            const w = Math.min(canvas.width - x0, Math.max(2, Math.ceil((line.right - line.left) * scale)));
            const h = Math.min(canvas.height - y0, Math.max(2, Math.ceil(line.size * 1.3 * scale)));
            if (w <= 0 || h <= 0) continue;
            let px;
            try { px = ctx.getImageData(x0, y0, w, h).data; } catch { continue; }
            let r = 0, g = 0, b = 0, n = 0;
            for (let i = 0; i < px.length; i += 4) {
              const lum = 0.2126 * px[i] + 0.7152 * px[i + 1] + 0.0722 * px[i + 2];
              if (lum < 200) { r += px[i]; g += px[i + 1]; b += px[i + 2]; n += 1; }
            }
            if (n > 4) {
              const hex = [r / n, g / n, b / n].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");
              if (hex !== "000000") line.color = hex;
            }
          }
          setProgress(40 + Math.round(((pi + 1) / pageObjs.length) * 20));
        }
      }
      const structure = pdfDocumentStructure(pageLines, { reflow, headings: detect, emphasis, pageWidths });
      const words = structure.blocks.reduce((n, b) => n + b.text.split(/\s+/).filter(Boolean).length, 0);
      if (!words) throw new Error("No selectable text found — this PDF is probably scanned images. Convert pages with PDF to JPG, then run them through Image to Text (OCR).");

      const docx = await import("docx");
      const ALIGN = { left: docx.AlignmentType.LEFT, center: docx.AlignmentType.CENTER, right: docx.AlignmentType.RIGHT };
      const children = [];
      let lastPage = 0;
      for (let bi = 0; bi < structure.blocks.length; bi += 1) {
        const b = structure.blocks[bi];
        const next = structure.blocks[bi + 1];
        if (pageBreaks && lastPage && b.page !== lastPage) children.push(new docx.Paragraph({ children: [new docx.PageBreak()] }));
        lastPage = b.page;
        // Vertical rhythm: the gap to the next line becomes paragraph spacing,
        // so section breaks breathe in Word the way they breathe in the PDF.
        const gap = next && next.page === b.page ? b.y - next.y - b.size : 0;
        const after = 100 + Math.max(0, Math.min(30, gap)) * 12;
        const runOpts = { text: b.text, bold: b.kind === "p" ? b.bold : true, italics: b.italic };
        if (keepStyle) {
          runOpts.size = Math.max(8, Math.round(b.size * 2)); // half-points = exact PDF size
          runOpts.font = pdfFontFamily(b.family);
          if (b.color) runOpts.color = b.color;
        }
        const paraOpts = {
          spacing: { after: Math.round(after) },
          alignment: ALIGN[b.align] || docx.AlignmentType.LEFT,
          children: [new docx.TextRun(runOpts)],
        };
        if (b.kind === "h1") paraOpts.heading = docx.HeadingLevel.HEADING_1;
        else if (b.kind === "h2") paraOpts.heading = docx.HeadingLevel.HEADING_2;
        children.push(new docx.Paragraph(paraOpts));
      }
      const blob = await docx.Packer.toBlob(new docx.Document({ sections: [{ children }] }));
      setProgress(100);
      setResult({
        blob,
        url: URL.createObjectURL(blob),
        stats: {
          pages: item.pages,
          paragraphs: structure.blocks.filter((b) => b.kind === "p").length,
          headings: structure.blocks.filter((b) => b.kind !== "p").length,
          words,
          size: blob.size,
        },
      });
    } catch (e) {
      setError(friendlyError(e, "Conversion failed. The PDF may use an unusual internal format."));
      setProgress(null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      {!item && (
        <Dropzone accept="application/pdf,.pdf" onFiles={add} title="Drop a PDF — get an editable Word .docx" hint="Reports, assignments, contracts, letters — any digital PDF" icon="file" />
      )}
      <Alert msg={error} />
      {item && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-center gap-3">
                <Icon name="file" size={26} className="text-amber-300" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-white">{item.file.name}</p>
                  <p className="text-xs text-slate-400">{formatBytes(item.file.size)} · {item.pages} page{item.pages === 1 ? "" : "s"}</p>
                </div>
              </div>
              <div className="mt-4 space-y-2.5">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                  <input type="checkbox" checked={detect} onChange={(e) => setDetect(e.target.checked)} disabled={busy} className="h-4 w-4" />
                  Detect headings & bold (recommended)
                </label>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                  <input type="checkbox" checked={keepStyle} onChange={(e) => setKeepStyle(e.target.checked)} disabled={busy} className="h-4 w-4" />
                  Keep PDF colours, exact sizes & fonts
                </label>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                  <input type="checkbox" checked={reflow} onChange={(e) => setReflow(e.target.checked)} disabled={busy} className="h-4 w-4" />
                  Reflow wrapped lines into paragraphs
                </label>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                  <input type="checkbox" checked={pageBreaks} onChange={(e) => setPageBreaks(e.target.checked)} disabled={busy} className="h-4 w-4" />
                  Page break between PDF pages
                </label>
              </div>
              <div className="mt-4 flex flex-wrap gap-2.5">
                <button onClick={run} disabled={busy} className={btnGreen}><Icon name="download" size={16} /> {busy ? "Converting…" : "Convert to Word"}</button>
                <button onClick={reset} disabled={busy} className={btnGhost}><Icon name="trash" size={15} /> New file</button>
              </div>
              {busy && progress != null && (
                <div className="mt-4" role="status">
                  <div className="h-2.5 overflow-hidden rounded-full bg-white/[0.08]"><div className="h-full rounded-full bg-emerald-400 transition-all" style={{ width: `${progress}%` }} /></div>
                  <p className="mt-2 text-xs text-slate-400">{progress < 60 ? `Reading page structure… ${progress}%` : "Building the Word document…"}</p>
                </div>
              )}
              <p className="mt-3 text-xs leading-relaxed text-slate-500">
                Everything runs in your browser: the PDF never leaves this device. Headings become real Word
                heading styles while keeping their PDF size and colour, bold faces are recognised even when the
                PDF hides them behind font names, centred and right-aligned lines keep their alignment, and the
                vertical rhythm of the page becomes paragraph spacing — so the Word file looks like the PDF.
                Scanned (photo-only) PDFs carry no text to convert — use OCR for those.
              </p>
            </div>
          </div>
          <div>
            {result ? (
              <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/[0.06] p-5">
                <p className="text-sm font-extrabold text-emerald-200">Your Word document is ready</p>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-300 sm:grid-cols-4">
                  <span>{result.stats.pages} pages</span>
                  <span>{result.stats.headings} headings</span>
                  <span>{result.stats.paragraphs} paragraphs</span>
                  <span>{result.stats.words} words</span>
                </div>
                <button onClick={() => downloadBlob(result.blob, `${stripExt(item.file.name)}.docx`)} className={`${btnGreen} mt-4`}>
                  <Icon name="download" size={16} /> Download .docx ({formatBytes(result.stats.size)})
                </button>
                <p className="mt-3 text-xs text-slate-400">Opens in Microsoft Word, Google Docs and LibreOffice. Proofread names, numbers and tables before sharing.</p>
              </div>
            ) : (
              <div className="flex h-full min-h-[180px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 p-6 text-center">
                <Icon name="file" size={30} className="text-slate-600" />
                <p className="mt-3 text-sm text-slate-500">Structure preview counts (pages, headings, paragraphs, words) will appear here after conversion.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
