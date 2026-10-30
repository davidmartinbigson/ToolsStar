"use client";

import { useCallback, useRef, useState } from "react";
import Dropzone from "@/components/Dropzone";
import { Icon } from "@/components/icons";
import { formatBytes, downloadBlob, stripExt, friendlyError, loadScript } from "@/lib/utils";

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
    .map((l) => {
      // Symbol fonts encode bullets as private-use codepoints (U+F0B7 etc.)
      // which Word shows as "?" — recognise them and emit real bullets.
      let text = pdfJoinParts(l.parts);
      let bullet = false;
      const bm = text.match(/^([\uE000-\uF8FF\u2022\u2023\u2043\u2219\u25AA\u25B8\u25CF\u25CB\u25A0\u25A1\uF0A7\uF0B7•●○◦▪‣·])\s*/u);
      if (bm) { bullet = true; text = text.slice(bm[0].length); }
      text = text.replace(/[\uE000-\uF8FF]/g, "").trim();
      return {
        text, size: l.size, bold: l.bold, italic: l.italic, y: l.y, bullet,
        left: l.left ?? 0, right: l.right ?? 0, fonts: l.fonts, family: l.family,
        parts: l.parts,
      };
    })
    .filter((l) => l.text.trim());
}

/* Horizontal rules (heading underlines) are vector drawings, not text, so they
   never appear in getTextContent. They arrive either as thin rectangles or as
   batched constructPath segments; both are decoded here into rule records a
   heading can claim as its bottom border. Pure — pinned by tests.          */
function pdfFindRules(namedOps, pageWidth) {
  const pw = pageWidth || 612;
  const rules = [];
  let color = null;
  const push = (x, y, w, h) => { if (w >= pw * 0.25 && h <= 4) rules.push({ x, y, w, h: Math.max(h, 0.6), color }); };
  for (const { op, args } of namedOps || []) {
    if (op === "setStrokeRGBColor" || op === "setFillRGBColor") {
      const [r, g, b] = args || [];
      if ([r, g, b].every((v) => typeof v === "number")) color = [r, g, b].map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, "0")).join("");
      continue;
    }
    if (op === "rectangle" && args?.length >= 4) { push(args[0], args[1], args[2], Math.abs(args[3])); continue; }
    if (op === "constructPath" && args?.length >= 3) {
      const [codes, xs, ys] = args;
      const ymin = Math.min(...ys), ymax = Math.max(...ys);
      const xmin = Math.min(...xs), xmax = Math.max(...xs);
      if (ymax - ymin <= 4) { push(xmin, ymin, xmax - xmin, ymax - ymin); continue; }
      for (let i = 1; i < codes.length; i += 1) {
        if (codes[i] === codes[0]) continue;
        if (Math.abs(ys[i] - ys[i - 1]) < 0.5 && Math.abs(xs[i] - xs[i - 1]) >= pw * 0.25) push(Math.min(xs[i], xs[i - 1]), ys[i], Math.abs(xs[i] - xs[i - 1]), 0.8);
      }
    }
  }
  return rules;
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
        para = { page: pi + 1, kind: "p", text: trimmed, size: line.size, bold: emph, italic: line.italic, color: line.color, align: pdfAlignment(line, pw), family: line.family, y: line.y, bullet: line.bullet };
        paraFilled = line.right >= pw * 0.82;
      }
    }
    flush();
  });
  return { bodySize, blocks };
}

/* ── Document analysis layer (pure — pinned by tests) ───────────────────
   The converter first classifies every page (text / scanned / complex),
   fixes reading order for multi-column layouts, lifts repeating edge lines
   into headers/footers, rebuilds tables from shared column gaps, and maps
   link annotations and placed images onto the block stream.              */
function pdfParseRange(str, max) {
  const out = new Set();
  for (const part of String(str || "").split(",")) {
    const m = part.trim().match(/^(\d+)(?:\s*-\s*(\d+))?$/);
    if (!m) continue;
    const a = Math.max(1, Math.min(max, +m[1]));
    const b = m[2] ? Math.max(1, Math.min(max, +m[2])) : a;
    for (let i = Math.min(a, b); i <= Math.max(a, b); i += 1) out.add(i);
  }
  if (!out.size) for (let i = 1; i <= max; i += 1) out.add(i);
  return [...out].sort((x, y) => x - y);
}

function pdfColumnBoundary(lines, pageWidth) {
  const pw = pageWidth || 612;
  const sorted = (lines || []).map((l) => l.left).sort((a, b) => a - b);
  if (sorted.length < 6) return null;
  let best = null;
  for (let i = 1; i < sorted.length; i += 1) {
    const gap = sorted[i] - sorted[i - 1];
    if (gap >= pw * 0.08 && i >= sorted.length * 0.25 && sorted.length - i >= sorted.length * 0.25) {
      if (!best || gap > best.gap) best = { gap, cut: (sorted[i] + sorted[i - 1]) / 2 };
    }
  }
  return best ? best.cut : null;
}

function pdfColumnOrder(lines, pageWidth) {
  const cut = pdfColumnBoundary(lines, pageWidth);
  if (cut == null) return lines;
  const byY = (a, b) => b.y - a.y;
  return [...lines.filter((l) => l.left < cut).sort(byY), ...lines.filter((l) => l.left >= cut).sort(byY)];
}

function pdfClassifyPage(lines, imageCount, pageWidth) {
  const words = (lines || []).reduce((n, l) => n + l.text.split(/\s+/).filter(Boolean).length, 0);
  if (words < 5 && (imageCount || 0) > 0) return "scanned";
  if ((lines || []).length >= 6 && pdfColumnBoundary(lines, pageWidth) != null) return "complex";
  return "text";
}

function pdfHeaderFooter(pages, pageHeights) {
  const counts = new Map();
  (pages || []).forEach((lines, pi) => {
    const ph = (pageHeights || [])[pi] || 792;
    for (const l of lines || []) {
      const t = l.text.trim();
      if (!t) continue;
      const zone = l.y > ph * 0.9 ? "h" : l.y < ph * 0.1 ? "f" : null;
      if (zone) counts.set(`${zone}|${t}`, (counts.get(`${zone}|${t}`) || 0) + 1);
    }
  });
  const need = Math.max(2, Math.ceil((pages || []).length * 0.6));
  const header = [], footer = [];
  for (const [key, n] of counts) if (n >= need) (key[0] === "h" ? header : footer).push(key.slice(2));
  return { header: [...new Set(header)], footer: [...new Set(footer)] };
}

function pdfStripHeaderFooter(lines, hf, pageHeight) {
  const ph = pageHeight || 792;
  const hs = new Set(hf?.header || []);
  const fs = new Set(hf?.footer || []);
  return (lines || []).filter((l) => {
    const t = l.text.trim();
    if (l.y > ph * 0.9 && hs.has(t)) return false;
    if (l.y < ph * 0.1 && fs.has(t)) return false;
    return true;
  });
}

function pdfCells(parts, bounds) {
  const cells = Array(bounds.length + 1).fill("");
  for (const part of [...parts].sort((a, b) => a.x - b.x)) {
    if (!String(part.text || "").trim()) continue;
    let ci = bounds.length;
    for (let i = 0; i < bounds.length; i += 1) if (part.x < bounds[i]) { ci = i; break; }
    cells[ci] = cells[ci] ? `${cells[ci]} ${part.text.trim()}` : part.text.trim();
  }
  return cells;
}

function pdfTableSegments(lines, opts = {}) {
  const gap = opts.minGap ?? 28;
  const minRows = opts.minRows ?? 2;
  const cutsOf = (l) => {
    const ps = (l.parts || []).filter((q) => String(q.text || "").trim());
    const cuts = [];
    for (let i = 1; i < ps.length; i += 1) {
      const space = ps[i].x - (ps[i - 1].x + (ps[i - 1].w || 0));
      if (space >= gap) cuts.push((ps[i].x + ps[i - 1].x + (ps[i - 1].w || 0)) / 2);
    }
    return { ps, cuts };
  };
  const same = (a, b) => a.length === b.length && a.every((v, i) => Math.abs(v - b[i]) <= 18);
  const out = [];
  let runLines = [];
  let bounds = null;
  const flushRun = () => {
    if (runLines.length >= minRows) out.push({ type: "table", rows: runLines.map((l) => pdfCells(l.parts || [], bounds)) });
    else if (runLines.length) out.push({ type: "lines", lines: runLines });
    runLines = [];
    bounds = null;
  };
  for (const line of lines || []) {
    const { cuts } = cutsOf(line);
    if (cuts.length >= 1 && (!bounds || same(cuts, bounds))) {
      if (!bounds) bounds = cuts;
      runLines.push(line);
    } else {
      flushRun();
      if (cuts.length >= 1) {
        bounds = cuts;
        runLines = [line];
      } else {
        bounds = null;
        out.push({ type: "lines", lines: [line] });
      }
    }
  }
  flushRun();
  // merge neighbouring line segments
  const merged = [];
  for (const seg of out) {
    if (seg.type === "lines" && merged.length && merged[merged.length - 1].type === "lines") merged[merged.length - 1].lines.push(...seg.lines);
    else merged.push(seg);
  }
  return merged;
}

function pdfMatchLink(blocks, annots) {
  for (const b of blocks || []) {
    if (b.kind === "p" || b.kind === "h1" || b.kind === "h2") {
      const hit = (annots || []).find((a) => a.url && b.left <= a.x1 && b.right >= a.x0 && b.y >= a.y0 - 6 && b.y <= a.y1 + 6);
      if (hit) b.link = hit.url;
    }
  }
  return blocks;
}

function pdfImageItems(namedOps) {
  const items = [];
  let tr = null;
  for (const { op, args } of namedOps || []) {
    if (op === "transform" && args?.length >= 6) { tr = args; continue; }
    if (op === "paintImageXObject" && tr) {
      items.push({ name: args?.[0], x: tr[4], y: tr[5], w: Math.abs(tr[0]), h: Math.abs(tr[3]) });
      tr = null;
    }
  }
  return items.filter((it) => it.name && it.w >= 24 && it.h >= 24);
}

export function PdfToWord() {
  const [item, setItem] = useState(null);
  const [range, setRange] = useState("");
  const [detect, setDetect] = useState(true);
  const [keepStyle, setKeepStyle] = useState(true);
  const [keepImages, setKeepImages] = useState(true);
  const [keepTables, setKeepTables] = useState(true);
  const [ocrScanned, setOcrScanned] = useState(true);
  const [reflow, setReflow] = useState(true);
  const [pageBreaks, setPageBreaks] = useState(true);
  const [headRule, setHeadRule] = useState("auto");
  const [stage, setStage] = useState("idle");
  const [progress, setProgress] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const pdfRef = useRef(null);

  const add = useCallback(async (files) => {
    const file = files?.[0];
    if (!file) return;
    setError(""); setResult(null); setAnalysis(null); setProgress(null); setStage("idle");
    if (file.size > 40 * 1024 * 1024) { setError("That PDF is over the 40 MB on-device limit — split it first with our Split PDF tool, then convert the parts."); return; }
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

  const reset = () => { setItem(null); setResult(null); setAnalysis(null); setProgress(null); setError(""); setStage("idle"); setRange(""); pdfRef.current = null; };

  const analyze = async () => {
    if (!item || !pdfRef.current) return;
    setStage("analyzing"); setError(""); setAnalysis(null); setResult(null); setProgress(1);
    try {
      const wanted = pdfParseRange(range, item.pages);
      const lib = await pdfjs();
      const OPN = {};
      for (const k in lib.OPS) OPN[lib.OPS[k]] = k;
      const pages = [];
      for (let i = 0; i < wanted.length; i += 1) {
        const page = await pdfRef.current.getPage(wanted[i]);
        const vp = page.getViewport({ scale: 1 });
        const content = await page.getTextContent();
        const lines = pdfStyledLines(content.items || [], content.styles || {});
        let named = [];
        try {
          const ol = await page.getOperatorList();
          named = ol.fnArray.map((f, j) => ({ op: OPN[f], args: ol.argsArray[j] }));
        } catch { named = []; }
        const imageItems = pdfImageItems(named);
        let links = [];
        try {
          links = (await page.getAnnotations()).filter((a) => a.subtype === "Link" && a.url && a.rect).map((a) => ({ url: a.url, x0: a.rect[0], y0: a.rect[1], x1: a.rect[2], y1: a.rect[3] }));
        } catch { links = []; }
        pages.push({ num: wanted[i], page, lines, width: vp.width, height: vp.height, rules: pdfFindRules(named, vp.width), imageItems, links, kind: pdfClassifyPage(lines, imageItems.length, vp.width) });
        setProgress(Math.round(((i + 1) / wanted.length) * 100));
      }
      const hf = pdfHeaderFooter(pages.map((p) => p.lines), pages.map((p) => p.height));
      for (const p of pages) p.lines = pdfStripHeaderFooter(p.lines, hf, p.height);
      setAnalysis({ pages, hf });
      setStage("ready"); setProgress(null);
    } catch (e) {
      setError(friendlyError(e, "Analysis failed — the PDF may be corrupted."));
      setStage("idle"); setProgress(null);
    }
  };

  const convert = async () => {
    if (!analysis) return;
    setStage("converting"); setError(""); setResult(null); setProgress(1);
    const warnings = [];
    try {
      const { pages, hf } = analysis;
      const emphasis = detect ? pdfEmphasisFonts(pages.flatMap((p) => p.lines)) : null;
      const scanned = pages.filter((p) => p.kind === "scanned");
      let worker = null;
      if (scanned.length && ocrScanned) {
        setStage("ocr");
        await loadScript("https://cdn.jsdelivr.net/npm/tesseract.js@5.0.5/dist/tesseract.min.js");
        worker = await window.Tesseract.createWorker("eng", 1, { logger: (m) => { if (m.status === "recognizing text") setProgress(Math.round(m.progress * 25)); } });
      } else if (scanned.length) {
        warnings.push(`${scanned.length} scanned page${scanned.length === 1 ? "" : "s"} skipped — switch on “OCR scanned pages” to read them.`);
      }
      const all = [];
      let tablesFound = 0, imagesFound = 0, linksFound = 0;
      for (let pi = 0; pi < pages.length; pi += 1) {
        const p = pages[pi];
        let lines = p.lines;
        if (p.kind === "scanned" && worker) {
          const scale = 2;
          const rvp = p.page.getViewport({ scale });
          const canvas = document.createElement("canvas");
          canvas.width = Math.ceil(rvp.width); canvas.height = Math.ceil(rvp.height);
          await p.page.render({ canvasContext: canvas.getContext("2d"), viewport: rvp }).promise;
          const { data } = await worker.recognize(canvas);
          const conf = Math.round(data.confidence || 0);
          if (conf < 60) warnings.push(`Page ${p.num}: OCR confidence ${conf}% — proofread this page in Word.`);
          lines = (data.lines || []).map((ln) => {
            const h = ((ln.bbox?.y1 || 0) - (ln.bbox?.y0 || 0)) / scale || 11;
            return {
              text: String(ln.text || "").trim(), size: h, y: p.height - ((ln.bbox?.y0 || 0) + h / 2),
              left: (ln.bbox?.x0 || 0) / scale, right: (ln.bbox?.x1 || 0) / scale,
              bold: false, italic: false, bullet: false, fonts: [], family: "sans-serif", parts: [],
            };
          }).filter((l) => l.text);
        }
        lines = pdfColumnOrder(lines, p.width);
        if (keepStyle && pages.length <= 20 && lines.length) {
          const scale = 1.5;
          const rvp = p.page.getViewport({ scale });
          const canvas = document.createElement("canvas");
          canvas.width = Math.ceil(rvp.width); canvas.height = Math.ceil(rvp.height);
          try {
            await p.page.render({ canvasContext: canvas.getContext("2d"), viewport: rvp }).promise;
            const ctx = canvas.getContext("2d", { willReadFrequently: true });
            for (const line of lines) {
              const x0 = Math.max(0, Math.floor(line.left * scale));
              const y0 = Math.max(0, Math.floor((p.height - line.y - line.size * 0.2) * scale));
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
          } catch { /* colour sampling is best-effort */ }
        }
        const pageBlocks = [];
        const segs = keepTables ? pdfTableSegments(lines) : [{ type: "lines", lines }];
        for (const seg of segs) {
          if (seg.type === "table") { tablesFound += 1; pageBlocks.push({ kind: "table", rows: seg.rows, page: pi + 1, pageNum: p.num, y: seg.lines?.[0]?.y }); continue; }
          const st = pdfDocumentStructure([seg.lines], { reflow, headings: detect, emphasis, pageWidths: [p.width] });
          for (const b of st.blocks) pageBlocks.push({ ...b, page: pi + 1, pageNum: p.num });
        }
        if (keepImages) {
          for (const im of p.imageItems.slice(0, 25)) {
            try {
              const img = await new Promise((res, rej) => { const t = setTimeout(() => rej(new Error("image timeout")), 5000); p.page.objs.get(im.name, (v) => { clearTimeout(t); res(v); }); });
              const c2 = document.createElement("canvas");
              let blob = null;
              if (img?.data && img.width) {
                c2.width = img.width; c2.height = img.height;
                c2.getContext("2d").putImageData(new ImageData(new Uint8ClampedArray(img.data), img.width, img.height), 0, 0);
                blob = await new Promise((r) => c2.toBlob(r, "image/png"));
              } else if (typeof ImageBitmap !== "undefined" && img instanceof ImageBitmap) {
                c2.width = img.width; c2.height = img.height;
                c2.getContext("2d").drawImage(img, 0, 0);
                blob = await new Promise((r) => c2.toBlob(r, "image/png"));
              }
              if (!blob || blob.size < 200) continue;
              const pxw = Math.max(40, Math.min(im.w, p.width - 96));
              const block = { kind: "image", page: pi + 1, pageNum: p.num, y: im.y, data: new Uint8Array(await blob.arrayBuffer()), w: pxw, h: (pxw * im.h) / im.w };
              let at = pageBlocks.length;
              for (let k = 0; k < pageBlocks.length; k += 1) if (pageBlocks[k].y != null && pageBlocks[k].y < im.y) { at = k; break; }
              pageBlocks.splice(at, 0, block);
              imagesFound += 1;
            } catch { /* skip unreadable image */ }
          }
        }
        if (keepStyle && headRule !== "off") {
          for (const b of pageBlocks) {
            if (b.kind === "p") continue;
            const hit = (p.rules || []).find((r) => r.y <= b.y && r.y >= b.y - b.size * 1.8 && r.x <= b.left + 40);
            if (hit || headRule === "always") { b.underline = true; b.ruleColor = hit?.color; b.ruleSize = hit?.h; }
          }
        }
        pdfMatchLink(pageBlocks, p.links);
        linksFound += pageBlocks.filter((b) => b.link).length;
        all.push(...pageBlocks);
        setProgress(25 + Math.round(((pi + 1) / pages.length) * 55));
      }
      if (worker) await worker.terminate();

      const docx = await import("docx");
      const ALIGN = { left: docx.AlignmentType.LEFT, center: docx.AlignmentType.CENTER, right: docx.AlignmentType.RIGHT };
      const children = [];
      let lastPage = 0;
      for (let bi = 0; bi < all.length; bi += 1) {
        const b = all[bi];
        const next = all[bi + 1];
        if (pageBreaks && lastPage && b.pageNum !== lastPage) children.push(new docx.Paragraph({ children: [new docx.PageBreak()] }));
        lastPage = b.pageNum;
        if (b.kind === "table") {
          children.push(new docx.Table({
            width: { size: 100, type: docx.WidthType.PERCENTAGE },
            rows: b.rows.map((r) => new docx.TableRow({ children: r.map((c) => new docx.TableCell({ children: [new docx.Paragraph({ children: [new docx.TextRun({ text: c, size: 20 })] })] })) })),
          }));
          children.push(new docx.Paragraph({ children: [] }));
          continue;
        }
        if (b.kind === "image") {
          children.push(new docx.Paragraph({ spacing: { after: 120 }, children: [new docx.ImageRun({ type: "png", data: b.data, transformation: { width: Math.round((b.w * 96) / 72), height: Math.round((b.h * 96) / 72) } })] }));
          continue;
        }
        const gap = next && next.pageNum === b.pageNum && next.y != null && b.y != null ? b.y - next.y - b.size : 0;
        const after = 100 + Math.max(0, Math.min(30, gap)) * 12;
        const runOpts = { text: b.text, bold: b.kind === "p" ? b.bold : true, italics: b.italic };
        if (keepStyle) {
          runOpts.size = Math.max(8, Math.round(b.size * 2));
          runOpts.font = pdfFontFamily(b.family);
          if (b.color) runOpts.color = b.color;
        }
        const paraOpts = { spacing: { after: Math.round(after) }, alignment: ALIGN[b.align] || docx.AlignmentType.LEFT, children: [] };
        if (b.bullet) paraOpts.bullet = { level: 0 };
        if (b.underline) paraOpts.border = { bottom: { color: b.ruleColor || b.color || "000000", space: 2, style: docx.BorderStyle.SINGLE, size: Math.max(4, Math.min(24, Math.round((b.ruleSize || 0.8) * 8))) } };
        if (b.kind === "h1") paraOpts.heading = docx.HeadingLevel.HEADING_1;
        else if (b.kind === "h2") paraOpts.heading = docx.HeadingLevel.HEADING_2;
        paraOpts.children = b.link
          ? [new docx.ExternalHyperlink({ link: b.link, children: [new docx.TextRun({ ...runOpts, style: "Hyperlink" })] })]
          : [new docx.TextRun(runOpts)];
        children.push(new docx.Paragraph(paraOpts));
      }
      const first = pages[0];
      const section = {
        properties: {
          size: { width: Math.round(first.width * 20), height: Math.round(first.height * 20) },
          margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 },
        },
        children,
      };
      if (hf.header.length) section.headers = { default: new docx.Header({ children: hf.header.map((t) => new docx.Paragraph({ children: [new docx.TextRun({ text: t, size: 18, color: "666666" })] })) }) };
      if (hf.footer.length) section.footers = { default: new docx.Footer({ children: hf.footer.map((t) => new docx.Paragraph({ children: [new docx.TextRun({ text: t, size: 18, color: "666666" })] })) }) };
      const blob = await docx.Packer.toBlob(new docx.Document({ sections: [section] }));
      if (tablesFound) warnings.push(`${tablesFound} table${tablesFound === 1 ? "" : "s"} rebuilt as editable Word tables — cell grids are approximated from column gaps.`);
      if (imagesFound) warnings.push(`${imagesFound} image${imagesFound === 1 ? "" : "s"} embedded at ${keepStyle ? "their" : "flow"} position${imagesFound === 1 ? "" : "s"}.`);
      if (linksFound) warnings.push(`${linksFound} hyperlink${linksFound === 1 ? "" : "s"} preserved as clickable links.`);
      if (hf.header.length || hf.footer.length) warnings.push("Repeating edge lines moved into the Word header/footer.");
      setProgress(100);
      setResult({
        blob,
        stats: {
          pages: pages.length,
          headings: all.filter((b) => b.kind === "h1" || b.kind === "h2").length,
          paragraphs: all.filter((b) => b.kind === "p").length,
          tables: tablesFound,
          images: imagesFound,
          links: linksFound,
          words: all.reduce((n, b) => n + (b.text ? b.text.split(/\s+/).filter(Boolean).length : 0), 0),
          size: blob.size,
        },
        preview: all.filter((b) => b.kind !== "image").slice(0, 60),
        warnings,
      });
      setStage("done");
    } catch (e) {
      setError(friendlyError(e, "Conversion failed. The PDF may use an unusual internal format."));
      setStage("ready"); setProgress(null);
    }
  };

  const busyAny = stage === "analyzing" || stage === "converting" || stage === "ocr";
  const step = result ? 3 : analysis ? 2 : item ? 1 : 0;
  const steps = ["Upload", "Analyze", "Convert", "Download"];

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {steps.map((label, i) => (
          <span key={label} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold ${i === step ? "bg-sky-400 text-[#03212b]" : i < step ? "bg-sky-400/15 text-sky-300" : "bg-white/[0.04] text-slate-500"}`}>
            <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[9px] ${i === step ? "bg-[#03212b]/20" : i < step ? "bg-sky-400/20" : "bg-white/[0.06]"}`}>{i + 1}</span>
            {label}
          </span>
        ))}
        <span className="ml-auto text-[11px] font-semibold text-slate-500">100% on-device · max 40 MB</span>
      </div>
      {!item && (
        <Dropzone accept="application/pdf,.pdf" onFiles={add} title="Drop a PDF — get an editable Word .docx" hint="Reports, CVs, statements, scans — up to 40 MB, never uploaded" icon="file" />
      )}
      <Alert msg={error} />
      {item && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-center gap-3">
                <Icon name="file" size={26} className="text-sky-300" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-white">{item.file.name}</p>
                  <p className="text-xs text-slate-400">{formatBytes(item.file.size)} · {item.pages} page{item.pages === 1 ? "" : "s"}</p>
                </div>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold text-white">Pages to convert</label>
                  <input value={range} onChange={(e) => setRange(e.target.value)} placeholder={`all (e.g. 1-3, 7)`} disabled={busyAny} className={inputCls} />
                </div>
                <div>
                  <label className="text-sm font-semibold text-white">Heading underlines</label>
                  <select value={headRule} onChange={(e) => setHeadRule(e.target.value)} disabled={busyAny || !keepStyle} className={selectCls}>
                    <option value="auto">Auto — from the PDF's rules</option>
                    <option value="always">Always underline headings</option>
                    <option value="off">No underlines</option>
                  </select>
                </div>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {[
                  ["Detect headings & bold", detect, setDetect],
                  ["Keep colours, sizes & fonts", keepStyle, setKeepStyle],
                  ["OCR scanned pages", ocrScanned, setOcrScanned],
                  ["Rebuild tables", keepTables, setKeepTables],
                  ["Embed images", keepImages, setKeepImages],
                  ["Reflow wrapped lines", reflow, setReflow],
                  ["Page break per PDF page", pageBreaks, setPageBreaks],
                ].map(([label, val, set]) => (
                  <label key={label} className="flex items-center gap-2 text-[13px] font-semibold text-slate-200">
                    <input type="checkbox" checked={val} onChange={(e) => set(e.target.checked)} disabled={busyAny} className="h-4 w-4" />
                    {label}
                  </label>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-2.5">
                {!analysis && <button onClick={analyze} disabled={busyAny} className={btnGreen}><Icon name="search" size={16} /> {stage === "analyzing" ? "Analyzing…" : "Analyze document"}</button>}
                {analysis && !result && <button onClick={convert} disabled={busyAny} className={btnGreen}><Icon name="download" size={16} /> {stage === "converting" || stage === "ocr" ? "Converting…" : "Convert to Word"}</button>}
                {analysis && result && <button onClick={() => { setResult(null); setStage("ready"); }} disabled={busyAny} className={btnGreen}><Icon name="refresh" size={16} /> Re-convert</button>}
                <button onClick={reset} disabled={busyAny} className={btnGhost}><Icon name="trash" size={15} /> New file</button>
              </div>
              {(busyAny) && progress != null && (
                <div className="mt-4" role="status">
                  <div className="h-2.5 overflow-hidden rounded-full bg-white/[0.08]"><div className="h-full rounded-full bg-sky-400 transition-all" style={{ width: `${progress}%` }} /></div>
                  <p className="mt-2 text-xs text-slate-400">{stage === "analyzing" ? "Reading pages, columns, tables, images…" : stage === "ocr" ? "OCR on scanned pages…" : "Rebuilding the document…"}</p>
                </div>
              )}
            </div>
            {analysis && (
              <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Document analysis</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {analysis.pages.map((p) => (
                    <span key={p.num} className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${p.kind === "scanned" ? "bg-amber-400/15 text-amber-300" : p.kind === "complex" ? "bg-fuchsia-400/15 text-fuchsia-300" : "bg-emerald-400/15 text-emerald-300"}`}>
                      P{p.num} · {p.kind}
                    </span>
                  ))}
                </div>
                <p className="mt-2 text-xs leading-relaxed text-slate-500">
                  {analysis.pages.filter((p) => p.kind === "scanned").length} scanned · {analysis.pages.filter((p) => p.kind === "complex").length} multi-column ·{" "}
                  {analysis.pages.reduce((n, p) => n + p.imageItems.length, 0)} images · {analysis.pages.reduce((n, p) => n + p.links.length, 0)} links ·{" "}
                  header/footer {analysis.hf.header.length || analysis.hf.footer.length ? "detected" : "none"}
                </p>
              </div>
            )}
          </div>
          <div>
            {result ? (
              <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/[0.06] p-5">
                <p className="text-sm font-extrabold text-emerald-200">Your Word document is ready</p>
                <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-slate-300 sm:grid-cols-4">
                  <span>{result.stats.pages} pages</span>
                  <span>{result.stats.headings} headings</span>
                  <span>{result.stats.paragraphs} paras</span>
                  <span>{result.stats.words} words</span>
                  <span>{result.stats.tables} tables</span>
                  <span>{result.stats.images} images</span>
                  <span>{result.stats.links} links</span>
                  <span>{formatBytes(result.stats.size)}</span>
                </div>
                <button onClick={() => downloadBlob(result.blob, `${stripExt(item.file.name)}.docx`)} className={`${btnGreen} mt-4`}>
                  <Icon name="download" size={16} /> Download .docx
                </button>
                {result.warnings.length > 0 && (
                  <ul className="mt-3 space-y-1 text-[11px] leading-relaxed text-amber-200/90">
                    {result.warnings.map((w) => <li key={w}>• {w}</li>)}
                  </ul>
                )}
                <div className="mt-4 max-h-72 overflow-y-auto rounded-xl border border-white/10 bg-white p-4">
                  {result.preview.map((b, i) => b.kind === "table" ? (
                    <table key={i} className="mb-2 w-full border-collapse text-[10px] text-slate-700">
                      <tbody>{b.rows.map((r, ri) => <tr key={ri}>{r.map((c, ci) => <td key={ci} className="border border-slate-300 px-1.5 py-0.5">{c}</td>)}</tr>)}</tbody>
                    </table>
                  ) : (
                    <p key={i} style={{ fontSize: `${Math.min(22, Math.max(9, b.size || 11))}px`, color: b.color ? `#${b.color}` : "#1f2937", fontWeight: b.bold || b.kind !== "p" ? 700 : 400, fontStyle: b.italic ? "italic" : "normal", textAlign: b.align === "center" ? "center" : b.align === "right" ? "right" : "left", borderBottom: b.underline ? "1px solid #94a3b8" : "none", marginBottom: 4 }}>
                      {b.bullet ? "• " : ""}{b.text}
                    </p>
                  ))}
                </div>
                <p className="mt-2 text-[11px] text-slate-500">Structure preview (first 60 blocks). Opens in Word, Google Docs and LibreOffice — proofread names, numbers and tables.</p>
              </div>
            ) : (
              <div className="flex h-full min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 p-6 text-center">
                <Icon name="file" size={30} className="text-slate-600" />
                <p className="mt-3 text-sm text-slate-500">{analysis ? "Settings look good — hit Convert to Word and the preview plus download appear here." : "Add a PDF and analyze it: pages are classified (text / scanned / multi-column), tables, images, links and headers are detected before anything is converted."}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
