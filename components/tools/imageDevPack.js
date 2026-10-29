"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Dropzone from "@/components/Dropzone";
import { Icon } from "@/components/icons";
import {
  downloadBlob,
  downloadZip,
  fitWithin,
  formatBytes,
  friendlyError,
  loadImage,
  loadScript,
  renderToBlob,
  savedPct,
  stripExt,
  uid,
} from "@/lib/utils";

const btnPrimary = "inline-flex items-center gap-2 rounded-2xl bg-amber-400 px-6 py-3 font-extrabold text-[#241a00] shadow-xl shadow-amber-500/20 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60";
const btnGreen = "inline-flex items-center gap-2 rounded-2xl bg-emerald-400 px-6 py-3 font-extrabold text-[#032114] shadow-xl shadow-emerald-500/20 transition hover:bg-emerald-300 disabled:opacity-60";
const btnGhost = "inline-flex items-center gap-1.5 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-slate-300 transition hover:border-rose-400/40 hover:text-rose-300";
const btnSmall = "inline-flex items-center gap-1.5 rounded-xl border border-white/12 bg-white/[0.04] px-3 py-2 text-xs font-bold text-slate-200 transition hover:border-amber-400/50 disabled:opacity-50";
const inputCls = "mt-2 w-full rounded-xl border border-white/10 bg-[#12152e] px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-amber-400/60 disabled:opacity-50";
const selectCls = "mt-2 w-full rounded-xl border border-white/10 bg-[#12152e] px-3 py-2.5 text-sm text-white outline-none focus:border-amber-400/60 disabled:opacity-50";
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

const canvasBlob = (canvas, type = "image/png", quality = 0.92) => new Promise((resolve, reject) => {
  canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("This browser could not export the image.")), type, quality);
});

function FileFacts({ children }) {
  return <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-300">{children}</div>;
}
function Fact({ children }) {
  return <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">{children}</span>;
}

/* ═════════════════ SVG TO PNG / JPG ═════════════════ */
function parseSvgDimension(value) {
  if (!value || String(value).includes("%")) return 0;
  const parsed = Number.parseFloat(String(value).trim());
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function sanitizeSvg(svgText) {
  const doc = new DOMParser().parseFromString(svgText, "image/svg+xml");
  const root = doc.documentElement;
  if (!root || root.tagName.toLowerCase() !== "svg" || doc.querySelector("parsererror")) {
    throw new Error("This file does not look like a valid SVG. Please choose a .svg vector file.");
  }
  doc.querySelectorAll("script, foreignObject").forEach((node) => node.remove());
  doc.querySelectorAll("*").forEach((node) => {
    [...node.attributes].forEach((attr) => {
      const name = attr.name.toLowerCase();
      const value = attr.value.trim().toLowerCase();
      if (name.startsWith("on") || ((name === "href" || name.endsWith(":href")) && value.startsWith("javascript:"))) {
        node.removeAttribute(attr.name);
      }
    });
  });

  let width = parseSvgDimension(root.getAttribute("width"));
  let height = parseSvgDimension(root.getAttribute("height"));
  const viewBox = String(root.getAttribute("viewBox") || "").trim().split(/[\s,]+/).map(Number).filter(Number.isFinite);
  if (viewBox.length === 4 && viewBox[2] > 0 && viewBox[3] > 0) {
    if (!width && !height) { width = viewBox[2]; height = viewBox[3]; }
    else if (width && !height) height = width * (viewBox[3] / viewBox[2]);
    else if (!width && height) width = height * (viewBox[2] / viewBox[3]);
  }
  if (width && height) {
    root.setAttribute("width", String(Math.round(width)));
    root.setAttribute("height", String(Math.round(height)));
  }
  return { text: new XMLSerializer().serializeToString(doc), width, height };
}

export function SvgToPng() {
  const [item, setItem] = useState(null);
  const [format, setFormat] = useState("image/png");
  const [backgroundMode, setBackgroundMode] = useState("transparent");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [outputWidth, setOutputWidth] = useState(1024);
  const [quality, setQuality] = useState(92);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const outputHeight = item ? Math.max(1, Math.round((Number(outputWidth) || item.width) * (item.height / item.width))) : 0;

  const reset = () => {
    if (item?.url) URL.revokeObjectURL(item.url);
    if (result?.url) URL.revokeObjectURL(result.url);
    setItem(null); setResult(null); setError("");
  };

  const add = useCallback(async (files) => {
    const file = files?.[0];
    if (!file) return;
    setError(""); setResult(null);
    try {
      if (!/svg/i.test(file.type) && !/\.svg$/i.test(file.name)) throw new Error("Please choose an SVG file.");
      const clean = sanitizeSvg(await file.text());
      const loaded = await loadImage(new Blob([clean.text], { type: "image/svg+xml;charset=utf-8" }));
      const width = Math.max(1, Math.round(clean.width || loaded.width || 800));
      const height = Math.max(1, Math.round(clean.height || loaded.height || 600));
      setItem({ file, ...loaded, width, height });
      setOutputWidth(Math.min(2048, Math.max(width, 1024)));
    } catch (error) {
      setItem(null);
      setError(friendlyError(error, "Could not read this SVG."));
    }
  }, []);

  const run = async () => {
    if (!item) return;
    const width = Math.round(Number(outputWidth));
    if (!Number.isFinite(width) || width < 16 || width > 8000 || outputHeight > 8000) {
      setError("Choose an output width between 16 and 8,000 pixels.");
      return;
    }
    setBusy(true); setError(""); setResult(null);
    try {
      const background = format === "image/jpeg"
        ? (backgroundMode === "custom" ? backgroundColor : "#ffffff")
        : backgroundMode === "transparent" ? null : backgroundMode === "custom" ? backgroundColor : "#ffffff";
      const blob = await renderToBlob(item.img, { width, height: outputHeight, type: format, quality: quality / 100, background, fit: "stretch" });
      const ext = format === "image/jpeg" ? "jpg" : format === "image/webp" ? "webp" : "png";
      setResult({ blob, url: URL.createObjectURL(blob), width, height: outputHeight, name: `${stripExt(item.file.name)}.${ext}` });
    } catch {
      setError("Conversion failed. The SVG may use external images/fonts that a browser cannot load inside an SVG, or the output is too large for this device.");
    } finally { setBusy(false); }
  };

  return (
    <div>
      {!item && <Dropzone accept=".svg,image/svg+xml" onFiles={add} title="Drop an SVG to convert" hint="Turn logos and vector icons into crisp PNG, JPG or WebP files" icon="convert" />}
      <Alert msg={error} />
      {item && (
        <div className="grid gap-6 lg:grid-cols-[1fr_380px] lg:items-start">
          <div>
            <div className="checker grid min-h-[320px] place-items-center overflow-hidden rounded-3xl border border-white/10 p-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={result?.url || item.url} alt={result ? "Converted result" : "SVG preview"} className="max-h-[460px] w-auto max-w-full object-contain" />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <FileFacts>
                <Fact>{item.file.name}</Fact><Fact>SVG viewBox size {item.width}×{item.height}</Fact><Fact>{formatBytes(item.file.size)}</Fact>
                {result && <Fact>Result {result.width}×{result.height} · {formatBytes(result.blob.size)}</Fact>}
              </FileFacts>
              <button type="button" onClick={reset} className={`${btnGhost} ml-auto`}><Icon name="trash" size={15} /> Different SVG</button>
            </div>
          </div>

          <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-5">
            <label htmlFor="svg-format" className="text-sm font-semibold text-white">Output format</label>
            <select id="svg-format" value={format} onChange={(e) => { setFormat(e.target.value); setResult(null); }} className={selectCls}>
              <option value="image/png">PNG — transparent & lossless ★</option>
              <option value="image/jpeg">JPG — universal, background filled</option>
              <option value="image/webp">WebP — modern & compact</option>
            </select>

            <p className="mt-5 text-sm font-semibold text-white">Output width</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {[1, 2, 3, 4].map((scale) => <button key={scale} type="button" onClick={() => { setOutputWidth(Math.min(8000, item.width * scale)); setResult(null); }} className={btnSmall}>{scale}x · {item.width * scale}px</button>)}
              {[512, 1024, 2048].map((width) => <button key={width} type="button" onClick={() => { setOutputWidth(width); setResult(null); }} className={btnSmall}>{width}px</button>)}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div><label htmlFor="svg-width" className="text-sm font-semibold text-white">Width (px)</label><input id="svg-width" type="number" min="16" max="8000" value={outputWidth} onChange={(e) => { setOutputWidth(e.target.value); setResult(null); }} className={inputCls} /></div>
              <div><span className="text-sm font-semibold text-white">Height (auto)</span><p className="mt-2 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm text-slate-300">{outputHeight}px</p></div>
            </div>

            <label htmlFor="svg-bg" className="mt-5 block text-sm font-semibold text-white">Background</label>
            <select id="svg-bg" value={backgroundMode} onChange={(e) => { setBackgroundMode(e.target.value); setResult(null); }} className={selectCls}>
              <option value="transparent">Transparent {format === "image/jpeg" ? "(JPG will use white)" : "★"}</option>
              <option value="white">White</option><option value="custom">Custom colour</option>
            </select>
            {backgroundMode === "custom" && <input type="color" value={backgroundColor} onChange={(e) => { setBackgroundColor(e.target.value); setResult(null); }} aria-label="Custom background colour" className="mt-3 h-11 w-full cursor-pointer rounded-xl border border-white/15 bg-transparent" />}

            <label htmlFor="svg-quality" className="mt-5 flex justify-between text-sm font-semibold text-white">JPG/WebP quality <span className="text-amber-300">{quality}%</span></label>
            <input id="svg-quality" type="range" min="40" max="100" value={quality} disabled={format === "image/png"} onChange={(e) => setQuality(Number(e.target.value))} className="mt-3 w-full disabled:opacity-40" />

            <button type="button" onClick={run} disabled={busy} className={`${btnPrimary} mt-6 w-full justify-center`}><Icon name="convert" size={18} /> {busy ? "Converting…" : `Convert SVG to ${format === "image/jpeg" ? "JPG" : format === "image/webp" ? "WebP" : "PNG"}`}</button>
            {result && <button type="button" onClick={() => downloadBlob(result.blob, result.name)} className={`${btnGreen} mt-3 w-full justify-center`}><Icon name="download" size={17} /> Download {result.name.split(".").pop().toUpperCase()} ({formatBytes(result.blob.size)})</button>}
          </div>
        </div>
      )}
    </div>
  );
}

/* ═════════════════ FAVICON GENERATOR ═════════════════ */
function traceShape(ctx, size, shape) {
  ctx.beginPath();
  if (shape === "circle") ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
  else if (shape === "rounded" && typeof ctx.roundRect === "function") ctx.roundRect(0, 0, size, size, size * 0.18);
  else ctx.rect(0, 0, size, size);
}

function drawFavicon(canvas, options) {
  if (!canvas) return;
  const size = canvas.width;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, size, size);
  const { mode, item, fit, bgMode, bgColor, padding, shape, text, textColor } = options;
  if (bgMode !== "transparent") {
    traceShape(ctx, size, shape);
    ctx.fillStyle = bgColor;
    ctx.fill();
  }
  traceShape(ctx, size, shape);
  ctx.save();
  ctx.clip();
  const pad = (Number(padding) / 100) * size;
  const box = Math.max(20, size - pad * 2);
  if (mode === "image" && item?.img) {
    const iw = item.width, ih = item.height;
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = "high";
    if (fit === "cover") {
      const scale = Math.max(box / iw, box / ih);
      const sw = box / scale, sh = box / scale;
      ctx.drawImage(item.img, (iw - sw) / 2, (ih - sh) / 2, sw, sh, pad, pad, box, box);
    } else {
      const scale = Math.min(box / iw, box / ih);
      const dw = iw * scale, dh = ih * scale;
      ctx.drawImage(item.img, (size - dw) / 2, (size - dh) / 2, dw, dh);
    }
  } else if (mode === "text") {
    const value = String(text || "").trim() || "★";
    let fontSize = box * (value.length <= 1 ? 0.68 : 0.5);
    ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillStyle = textColor;
    do {
      ctx.font = `900 ${fontSize}px Arial, Helvetica, sans-serif`;
      if (ctx.measureText(value).width <= box * 0.88) break;
      fontSize *= 0.92;
    } while (fontSize > 12);
    ctx.fillText(value, size / 2, size / 2 + fontSize * 0.035);
  }
  ctx.restore();
}

async function resizeCanvasPng(source, size) {
  const canvas = document.createElement("canvas");
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = "high";
  ctx.drawImage(source, 0, 0, size, size);
  return canvasBlob(canvas, "image/png");
}

async function buildIco(pngBySize) {
  const sizes = [16, 32, 48, 64, 128, 256];
  const buffers = [];
  for (const size of sizes) buffers.push({ size, bytes: new Uint8Array(await pngBySize[size].arrayBuffer()) });
  const header = new ArrayBuffer(6 + buffers.length * 16);
  const view = new DataView(header);
  view.setUint16(0, 0, true); view.setUint16(2, 1, true); view.setUint16(4, buffers.length, true);
  let offset = header.byteLength;
  buffers.forEach((entry, i) => {
    const p = 6 + i * 16;
    view.setUint8(p, entry.size >= 256 ? 0 : entry.size);
    view.setUint8(p + 1, entry.size >= 256 ? 0 : entry.size);
    view.setUint8(p + 2, 0); view.setUint8(p + 3, 0);
    view.setUint16(p + 4, 1, true); view.setUint16(p + 6, 32, true);
    view.setUint32(p + 8, entry.bytes.length, true); view.setUint32(p + 12, offset, true);
    offset += entry.bytes.length;
  });
  return new Blob([header, ...buffers.map((entry) => entry.bytes)], { type: "image/x-icon" });
}

const FAVICON_HTML = `<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">`;

export function FaviconGenerator() {
  const [mode, setMode] = useState("image");
  const [item, setItem] = useState(null);
  const [fit, setFit] = useState("contain");
  const [bgMode, setBgMode] = useState("color");
  const [bgColor, setBgColor] = useState("#f59e0b");
  const [textColor, setTextColor] = useState("#111827");
  const [padding, setPadding] = useState(8);
  const [shape, setShape] = useState("rounded");
  const [text, setText] = useState("T");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const canvasRef = useRef(null);
  const tinyRefs = useRef({});
  const ready = mode === "text" ? Boolean(String(text).trim()) : Boolean(item);

  const add = useCallback(async (files) => {
    const file = files?.[0];
    if (!file) return;
    setError(""); setResult(null);
    try { setItem({ file, ...(await loadImage(file)) }); }
    catch { setError("Could not read that image. A square PNG, JPG, WebP or SVG logo works best."); }
  }, []);

  useEffect(() => {
    drawFavicon(canvasRef.current, { mode, item, fit, bgMode, bgColor, padding, shape, text, textColor });
    if (canvasRef.current) {
      Object.values(tinyRefs.current).forEach((node) => {
        if (!node) return;
        const ctx = node.getContext("2d");
        ctx.clearRect(0, 0, node.width, node.height);
        ctx.drawImage(canvasRef.current, 0, 0);
      });
    }
  }, [mode, item, fit, bgMode, bgColor, padding, shape, text, textColor]);

  const generate = async () => {
    if (!ready || !canvasRef.current) { setError(mode === "image" ? "Upload a logo or image first." : "Type a letter or symbol first."); return; }
    setBusy(true); setError(""); setResult(null);
    try {
      drawFavicon(canvasRef.current, { mode, item, fit, bgMode, bgColor, padding, shape, text, textColor });
      const sizes = [16, 32, 48, 64, 128, 180, 192, 256, 512];
      const pngBySize = {};
      for (const size of sizes) pngBySize[size] = await resizeCanvasPng(canvasRef.current, size);
      const ico = await buildIco(pngBySize);
      const manifest = {
        name: "My Website", short_name: "Website",
        icons: [
          { src: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
        ],
        theme_color: bgMode === "transparent" ? "#ffffff" : bgColor,
        background_color: bgMode === "transparent" ? "#ffffff" : bgColor,
        display: "standalone",
      };
      const entries = [
        { name: "favicon.ico", blob: ico },
        { name: "favicon-16x16.png", blob: pngBySize[16] },
        { name: "favicon-32x32.png", blob: pngBySize[32] },
        { name: "favicon-48x48.png", blob: pngBySize[48] },
        { name: "favicon-64x64.png", blob: pngBySize[64] },
        { name: "favicon-128x128.png", blob: pngBySize[128] },
        { name: "apple-touch-icon.png", blob: pngBySize[180] },
        { name: "android-chrome-192x192.png", blob: pngBySize[192] },
        { name: "android-chrome-512x512.png", blob: pngBySize[512] },
        { name: "site.webmanifest", blob: new Blob([JSON.stringify(manifest, null, 2)], { type: "application/manifest+json" }) },
        { name: "favicon-html.txt", blob: new Blob([FAVICON_HTML], { type: "text/plain" }) },
      ];
      const previews = [16, 32, 48, 180, 192, 512].map((size) => ({ size, url: URL.createObjectURL(pngBySize[size]), blob: pngBySize[size] }));
      setResult({ entries, ico, previews });
    } catch (error) {
      console.error(error);
      setError("Favicon generation failed in this browser. Try a smaller source image.");
    } finally { setBusy(false); }
  };

  const copyHtml = async () => {
    try { await navigator.clipboard.writeText(FAVICON_HTML); setCopied(true); setTimeout(() => setCopied(false), 1800); }
    catch { setError("Copy was blocked. The same HTML is included as favicon-html.txt in the ZIP."); }
  };

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2">
        <button type="button" onClick={() => { setMode("image"); setResult(null); }} className={`${choiceBase} ${mode === "image" ? choiceOn : choiceOff}`} aria-pressed={mode === "image"}><span className="block font-bold">From a logo / image ★</span><span className="text-xs text-slate-500">Best if you already have branding</span></button>
        <button type="button" onClick={() => { setMode("text"); setResult(null); }} className={`${choiceBase} ${mode === "text" ? choiceOn : choiceOff}`} aria-pressed={mode === "text"}><span className="block font-bold">From a letter / emoji</span><span className="text-xs text-slate-500">Quick, clean monogram favicon</span></button>
      </div>
      <Alert msg={error} />

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_390px] lg:items-start">
        <div>
          {mode === "image" && !item && <Dropzone accept="image/*,.svg" onFiles={add} title="Drop your logo or square image" hint="A simple bold mark stays readable at 16×16" icon="star" />}
          {mode === "image" && item && (
            <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.02] px-4 py-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.url} alt="Favicon source" className="checker h-14 w-14 rounded-xl object-contain" />
              <span className="min-w-0 flex-1"><span className="block truncate font-semibold text-white">{item.file.name}</span><span className="text-xs text-slate-500">{item.width}×{item.height} · {formatBytes(item.file.size)}</span></span>
              <button type="button" onClick={() => { setItem(null); setResult(null); }} className={btnGhost}><Icon name="trash" size={15} /> Replace</button>
            </div>
          )}
          {mode === "text" && (
            <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-5">
              <label htmlFor="favicon-text" className="text-sm font-semibold text-white">Letter, initials or emoji</label>
              <input id="favicon-text" value={text} maxLength={3} onChange={(e) => { setText(e.target.value); setResult(null); }} className={`${inputCls} text-center text-3xl font-black`} />
              <p className="mt-2 text-xs text-slate-500">One bold character is easiest to recognize in a browser tab.</p>
            </div>
          )}

          <div className="mt-5 rounded-3xl border border-white/[0.08] bg-white/[0.02] p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">512×512 master preview</p>
            <div className="checker mx-auto mt-3 w-fit rounded-2xl p-3">
              <canvas ref={canvasRef} width={512} height={512} className="block h-56 w-56" aria-label="Favicon preview" />
            </div>
            <div className="mt-4 flex flex-wrap items-end justify-center gap-5 text-center text-[11px] text-slate-500">
              {[48, 32, 16].map((size) => (
                <span key={size}><canvas width={512} height={512} style={{ width: size, height: size, imageRendering: "auto" }} ref={(node) => { tinyRefs.current[size] = node; }} />{size}px</span>
              ))}
            </div>
            <p className="mt-2 text-center text-xs text-slate-500">Check 16px carefully — tiny details disappear in real browser tabs.</p>
          </div>
        </div>

        <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-5">
          {mode === "image" && (
            <div>
              <label htmlFor="favicon-fit" className="text-sm font-semibold text-white">Image fit</label>
              <select id="favicon-fit" value={fit} onChange={(e) => { setFit(e.target.value); setResult(null); }} className={selectCls}>
                <option value="contain">Show whole logo ★ (no stretch)</option>
                <option value="cover">Fill square (may crop edges)</option>
              </select>
            </div>
          )}
          <label htmlFor="favicon-shape" className="mt-5 block text-sm font-semibold text-white">Shape</label>
          <select id="favicon-shape" value={shape} onChange={(e) => { setShape(e.target.value); setResult(null); }} className={selectCls}>
            <option value="rounded">Rounded square ★</option><option value="square">Square</option><option value="circle">Circle</option>
          </select>
          <label htmlFor="favicon-padding" className="mt-5 flex justify-between text-sm font-semibold text-white">Padding <span className="text-amber-300">{padding}%</span></label>
          <input id="favicon-padding" type="range" min="0" max="30" value={padding} onChange={(e) => { setPadding(Number(e.target.value)); setResult(null); }} className="mt-3 w-full" />
          <label htmlFor="favicon-bg-mode" className="mt-5 block text-sm font-semibold text-white">Background</label>
          <select id="favicon-bg-mode" value={bgMode} onChange={(e) => { setBgMode(e.target.value); setResult(null); }} className={selectCls}>
            <option value="color">Colour</option><option value="transparent">Transparent</option>
          </select>
          {bgMode === "color" && (
            <div className="mt-3 flex items-center gap-3"><input type="color" value={bgColor} onChange={(e) => { setBgColor(e.target.value); setResult(null); }} aria-label="Background colour" className="h-11 w-16 cursor-pointer rounded-xl border border-white/15 bg-transparent" /><span className="text-sm text-slate-300">{bgColor.toUpperCase()}</span></div>
          )}
          {mode === "text" && (
            <div className="mt-5"><span className="text-sm font-semibold text-white">Text colour</span><div className="mt-2 flex items-center gap-3"><input type="color" value={textColor} onChange={(e) => { setTextColor(e.target.value); setResult(null); }} aria-label="Text colour" className="h-11 w-16 cursor-pointer rounded-xl border border-white/15 bg-transparent" /><span className="text-sm text-slate-300">{textColor.toUpperCase()}</span></div></div>
          )}
          <button type="button" onClick={generate} disabled={busy || !ready} className={`${btnPrimary} mt-6 w-full justify-center`}><Icon name="star" size={18} /> {busy ? "Generating…" : "Generate favicon package"}</button>
          {!ready && <p className="mt-2 text-xs text-slate-500">Add an image first to enable generation.</p>}
        </div>
      </div>

      {result && (
        <div className="mt-7 rounded-3xl border border-emerald-400/25 bg-emerald-400/[0.05] p-5" role="status">
          <h2 className="font-extrabold text-white">Favicon package ready</h2>
          <p className="mt-1 text-sm text-slate-400">Includes favicon.ico, PNG sizes, Apple/Android icons, a web manifest and ready-to-paste HTML.</p>
          <div className="mt-4 flex flex-wrap items-end gap-5">
            {result.previews.map((preview) => (
              <div key={preview.size} className="text-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview.url} alt={`${preview.size} pixel favicon`} width={Math.min(64, Math.max(16, preview.size))} height={Math.min(64, Math.max(16, preview.size))} className="checker mx-auto rounded" style={{ width: Math.min(64, Math.max(16, preview.size)), height: Math.min(64, Math.max(16, preview.size)) }} />
                <p className="mt-1 text-[11px] text-slate-500">{preview.size}×{preview.size}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button type="button" onClick={() => downloadZip(result.entries, "favicon-package.zip")} className={btnGreen}><Icon name="download" size={17} /> Download full ZIP package</button>
            <button type="button" onClick={() => downloadBlob(result.ico, "favicon.ico")} className={btnPrimary}><Icon name="download" size={17} /> Download favicon.ico only</button>
            <button type="button" onClick={copyHtml} className={btnGhost}><Icon name="copy" size={16} /> {copied ? "HTML copied!" : "Copy HTML"}</button>
          </div>
          <pre className="mt-4 overflow-x-auto rounded-2xl bg-black/30 p-4 text-xs leading-relaxed text-slate-200"><code>{FAVICON_HTML}</code></pre>
        </div>
      )}
    </div>
  );
}

/* ═════════════════ ADD WATERMARK TO IMAGE ═════════════════ */
const POSITIONS = [
  ["top-left", "Top left"], ["top-center", "Top centre"], ["top-right", "Top right"],
  ["middle-left", "Middle left"], ["center", "Centre"], ["middle-right", "Middle right"],
  ["bottom-left", "Bottom left"], ["bottom-center", "Bottom centre"], ["bottom-right", "Bottom right ★"],
];

function positionCenter(width, height, boxW, boxH, position, paddingPercent) {
  const pad = (Math.min(width, height) * Number(paddingPercent)) / 100;
  let x = width / 2;
  let y = height / 2;
  if (position.includes("left")) x = pad + boxW / 2;
  if (position.includes("right")) x = width - pad - boxW / 2;
  if (position.startsWith("top")) y = pad + boxH / 2;
  if (position.startsWith("bottom")) y = height - pad - boxH / 2;
  return { x, y };
}

function drawImageWatermark(canvas, item, settings, logo, flattenWhite = false) {
  if (!canvas || !item?.img) return;
  canvas.width = item.width; canvas.height = item.height;
  const ctx = canvas.getContext("2d");
  if (flattenWhite) { ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, canvas.width, canvas.height); }
  ctx.drawImage(item.img, 0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.globalAlpha = Math.max(0.03, Math.min(1, Number(settings.opacity) / 100));
  const rotation = (Number(settings.rotation) * Math.PI) / 180;

  if (settings.type === "text") {
    const label = String(settings.text || "").trim();
    if (!label) { ctx.restore(); return; }
    const fontSize = Math.max(10, (Math.min(canvas.width, canvas.height) * Number(settings.size)) / 100);
    ctx.font = `800 ${fontSize}px Arial, Helvetica, sans-serif`;
    ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillStyle = settings.color;
    if (settings.shadow) { ctx.shadowColor = "rgba(0,0,0,0.45)"; ctx.shadowBlur = Math.max(2, fontSize * 0.08); ctx.shadowOffsetY = Math.max(1, fontSize * 0.035); }
    const textWidth = ctx.measureText(label).width;
    const drawOne = (x, y) => { ctx.save(); ctx.translate(x, y); ctx.rotate(rotation); ctx.fillText(label, 0, 0); ctx.restore(); };
    if (settings.repeat) {
      const stepX = textWidth + fontSize * 1.2;
      const stepY = fontSize * 3;
      for (let y = -stepY; y < canvas.height + stepY; y += stepY) for (let x = -stepX; x < canvas.width + stepX; x += stepX) drawOne(x + textWidth / 2, y + fontSize / 2);
    } else {
      const center = positionCenter(canvas.width, canvas.height, textWidth, fontSize, settings.position, settings.padding);
      drawOne(center.x, center.y);
    }
  } else if (logo?.img) {
    let logoW = (canvas.width * Number(settings.logoScale)) / 100;
    let logoH = logoW * (logo.height / logo.width);
    if (logoH > canvas.height * 0.85) { const scale = (canvas.height * 0.85) / logoH; logoW *= scale; logoH *= scale; }
    const drawOne = (x, y) => { ctx.save(); ctx.translate(x, y); ctx.rotate(rotation); ctx.drawImage(logo.img, -logoW / 2, -logoH / 2, logoW, logoH); ctx.restore(); };
    if (settings.repeat) {
      const stepX = logoW * 1.35, stepY = logoH * 2.2;
      for (let y = -stepY; y < canvas.height + stepY; y += stepY) for (let x = -stepX; x < canvas.width + stepX; x += stepX) drawOne(x + logoW / 2, y + logoH / 2);
    } else {
      const center = positionCenter(canvas.width, canvas.height, logoW, logoH, settings.position, settings.padding);
      drawOne(center.x, center.y);
    }
  }
  ctx.restore();
}

export function WatermarkImage() {
  const [items, setItems] = useState([]);
  const [logo, setLogo] = useState(null);
  const [type, setType] = useState("text");
  const [text, setText] = useState("© Tools Stars");
  const [color, setColor] = useState("#ffffff");
  const [size, setSize] = useState(7);
  const [logoScale, setLogoScale] = useState(22);
  const [opacity, setOpacity] = useState(55);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState("bottom-right");
  const [repeat, setRepeat] = useState(false);
  const [padding, setPadding] = useState(4);
  const [shadow, setShadow] = useState(true);
  const [format, setFormat] = useState("image/png");
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");
  const previewRef = useRef(null);
  const first = items[0] || null;
  const settings = useMemo(() => ({ type, text, color, size, logoScale, opacity, rotation, position, repeat, padding, shadow }), [type, text, color, size, logoScale, opacity, rotation, position, repeat, padding, shadow]);

  const add = useCallback(async (files) => {
    setError(""); setResults([]);
    const fresh = [];
    const skipped = [];
    for (const file of files.slice(0, 30)) {
      try { fresh.push({ id: uid(), file, ...(await loadImage(file)) }); } catch { skipped.push(file.name); }
    }
    if (!fresh.length) setError("Could not read those images. Try JPG, PNG or WebP files.");
    else if (skipped.length) setError(`Added ${fresh.length}, but could not read ${skipped.length} file${skipped.length === 1 ? "" : "s"}: ${skipped.slice(0, 3).join(", ")}${skipped.length > 3 ? "…" : ""}.`);
    setItems((current) => [...current, ...fresh]);
  }, []);

  const addLogo = useCallback(async (files) => {
    const file = files?.[0];
    if (!file) return;
    try { setLogo({ file, ...(await loadImage(file)) }); setError(""); }
    catch { setError("Could not read that logo. A transparent PNG works best."); }
  }, []);

  useEffect(() => { if (first) drawImageWatermark(previewRef.current, first, settings, logo); }, [first, settings, logo]);

  const run = async () => {
    if (!items.length) { setError("Add at least one image first."); return; }
    if (type === "text" && !text.trim()) { setError("Type your watermark text first."); return; }
    if (type === "logo" && !logo) { setError("Upload your logo watermark first."); return; }
    setBusy(true); setError(""); setResults([]);
    try {
      const ext = format === "image/jpeg" ? "jpg" : format === "image/webp" ? "webp" : "png";
      const outputs = [];
      for (const item of items) {
        const canvas = document.createElement("canvas");
        drawImageWatermark(canvas, item, settings, logo, format === "image/jpeg");
        const blob = await canvasBlob(canvas, format, 0.92);
        outputs.push({ blob, name: `${stripExt(item.file.name)}-watermarked.${ext}`, url: URL.createObjectURL(blob) });
      }
      setResults(outputs);
    } catch {
      setError("Watermark export failed. One of the images may be too large for this device; try fewer files at a time.");
    } finally { setBusy(false); }
  };

  return (
    <div>
      <Dropzone accept="image/*" multiple compact={items.length > 0} onFiles={add} title={items.length ? "Add more images" : "Drop images to watermark"} hint="Apply the same text or logo watermark to one photo or a whole batch" icon="layers" />
      <Alert msg={error} />
      {items.length > 0 && (
        <>
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1" aria-label="Selected images">
            {items.map((item, index) => (
              <span key={item.id} className="relative shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.url} alt={item.file.name} className="checker h-16 w-16 rounded-xl object-cover" />
                <button type="button" onClick={() => setItems((current) => current.filter((x) => x.id !== item.id))} aria-label={`Remove image ${index + 1}`} className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-rose-500 text-white"><Icon name="x" size={11} /></button>
              </span>
            ))}
          </div>

          <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_390px] lg:items-start">
            <div>
              <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/20">
                <canvas ref={previewRef} width={first?.width || 800} height={first?.height || 600} className="block max-h-[620px] w-full object-contain" aria-label="Watermark preview" />
              </div>
              <p className="mt-2 text-xs text-slate-500">Previewing {first.file.name}. The same relative size and position will be applied to all {items.length} image{items.length === 1 ? "" : "s"}.</p>
            </div>

            <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-5">
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setType("text")} className={`rounded-xl border px-3 py-2.5 text-sm font-bold ${type === "text" ? "border-amber-400 bg-amber-400/10 text-white" : "border-white/10 text-slate-300"}`}>Text</button>
                <button type="button" onClick={() => setType("logo")} className={`rounded-xl border px-3 py-2.5 text-sm font-bold ${type === "logo" ? "border-amber-400 bg-amber-400/10 text-white" : "border-white/10 text-slate-300"}`}>Logo</button>
              </div>
              {type === "text" ? (
                <>
                  <label htmlFor="image-wm-text" className="mt-5 block text-sm font-semibold text-white">Watermark text</label>
                  <input id="image-wm-text" value={text} maxLength={60} onChange={(e) => setText(e.target.value)} className={inputCls} />
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {[["#ffffff", "White"], ["#111827", "Black"], ["#94a3b8", "Grey"], ["#ef4444", "Red"], ["#3b82f6", "Blue"]].map(([value, label]) => <button key={value} type="button" onClick={() => setColor(value)} aria-label={label} title={label} className={`h-8 w-8 rounded-full border-2 ${color === value ? "border-amber-300 scale-110" : "border-white/20"}`} style={{ background: value }} />)}
                    <input type="color" value={color} onChange={(e) => setColor(e.target.value)} aria-label="Custom text colour" className="h-8 w-11 rounded-lg border border-white/15 bg-transparent" />
                  </div>
                  <label htmlFor="image-wm-size" className="mt-5 flex justify-between text-sm font-semibold text-white">Text size <span className="text-amber-300">{size}%</span></label>
                  <input id="image-wm-size" type="range" min="3" max="18" step="0.5" value={size} onChange={(e) => setSize(Number(e.target.value))} className="mt-3 w-full" />
                  <label className="mt-3 flex items-center gap-2 text-sm text-slate-300"><input type="checkbox" checked={shadow} onChange={(e) => setShadow(e.target.checked)} className="h-4 w-4" /> Subtle shadow (easier to read)</label>
                </>
              ) : (
                <div className="mt-5">
                  {!logo ? <Dropzone accept="image/*,.svg" compact onFiles={addLogo} title="Add logo watermark" hint="Transparent PNG works best" icon="image" /> : (
                    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={logo.url} alt="Logo watermark" className="checker h-14 w-14 rounded-lg object-contain" />
                      <span className="min-w-0 flex-1 truncate text-sm text-white">{logo.file.name}</span>
                      <button type="button" onClick={() => setLogo(null)} className={btnSmall}>Replace</button>
                    </div>
                  )}
                  <label htmlFor="logo-scale" className="mt-5 flex justify-between text-sm font-semibold text-white">Logo width <span className="text-amber-300">{logoScale}%</span></label>
                  <input id="logo-scale" type="range" min="5" max="60" value={logoScale} onChange={(e) => setLogoScale(Number(e.target.value))} className="mt-3 w-full" />
                </div>
              )}

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div><label htmlFor="wm-opacity" className="flex justify-between text-sm font-semibold text-white">Opacity <span className="text-amber-300">{opacity}%</span></label><input id="wm-opacity" type="range" min="5" max="100" value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} className="mt-3 w-full" /></div>
                <div><label htmlFor="wm-rotation" className="flex justify-between text-sm font-semibold text-white">Rotation <span className="text-amber-300">{rotation}°</span></label><input id="wm-rotation" type="range" min="-45" max="45" value={rotation} onChange={(e) => setRotation(Number(e.target.value))} className="mt-3 w-full" /></div>
              </div>

              <label className="mt-5 flex items-center gap-2 text-sm text-slate-300"><input type="checkbox" checked={repeat} onChange={(e) => { setRepeat(e.target.checked); if (e.target.checked && rotation === 0) setRotation(-28); }} className="h-4 w-4" /> Repeat all over the image</label>
              {!repeat && (
                <div>
                  <label htmlFor="wm-position" className="mt-4 block text-sm font-semibold text-white">Position</label>
                  <select id="wm-position" value={position} onChange={(e) => setPosition(e.target.value)} className={selectCls}>{POSITIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
                  <label htmlFor="wm-padding" className="mt-4 flex justify-between text-sm font-semibold text-white">Distance from edge <span className="text-amber-300">{padding}%</span></label>
                  <input id="wm-padding" type="range" min="0" max="15" value={padding} onChange={(e) => setPadding(Number(e.target.value))} className="mt-3 w-full" />
                </div>
              )}
              <label htmlFor="wm-format" className="mt-5 block text-sm font-semibold text-white">Download format</label>
              <select id="wm-format" value={format} onChange={(e) => setFormat(e.target.value)} className={selectCls}><option value="image/png">PNG — best quality</option><option value="image/jpeg">JPG — universal & smaller</option><option value="image/webp">WebP — modern & small</option></select>
              <button type="button" onClick={run} disabled={busy} className={`${btnPrimary} mt-6 w-full justify-center`}><Icon name="layers" size={18} /> {busy ? "Watermarking…" : `Watermark ${items.length} image${items.length === 1 ? "" : "s"}`}</button>
            </div>
          </div>

          {results.length > 0 && (
            <div className="mt-7 rounded-3xl border border-emerald-400/25 bg-emerald-400/[0.05] p-5" role="status">
              <div className="flex flex-wrap items-center gap-3"><h2 className="flex-1 font-extrabold text-white">{results.length} watermarked image{results.length === 1 ? "" : "s"} ready</h2>{results.length > 1 && <button type="button" onClick={() => downloadZip(results, "toolsstars-watermarked-images.zip")} className={btnGreen}><Icon name="download" size={17} /> Download all ZIP</button>}</div>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {results.map((result) => <button key={result.name} type="button" onClick={() => downloadBlob(result.blob, result.name)} className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] text-left"><img src={result.url} alt={result.name} className="checker h-32 w-full object-contain" /><span className="block truncate px-3 py-2 text-xs font-bold text-emerald-300">↓ {result.name}</span></button>)}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ═════════════════ EXIF VIEWER & METADATA REMOVER ═════════════════ */
let exifrPromise = null;
async function getExifr() {
  if (window.exifr) return window.exifr;
  if (!exifrPromise) exifrPromise = loadScript("https://cdn.jsdelivr.net/npm/exifr@7.1.3/dist/full.umd.js");
  await exifrPromise;
  if (!window.exifr) throw new Error("The metadata reader failed to load. Check your connection or ad-blocker.");
  return window.exifr;
}

function isPlainObject(value) {
  return value && typeof value === "object" && !(value instanceof Date) && !Array.isArray(value) && !ArrayBuffer.isView(value);
}
function flattenMetadata(value, prefix = "", out = {}) {
  if (!isPlainObject(value)) return out;
  Object.entries(value).forEach(([key, child]) => {
    const next = prefix ? `${prefix}.${key}` : key;
    if (isPlainObject(child)) flattenMetadata(child, next, out);
    else if (child !== undefined && child !== null && child !== "") out[next] = child;
  });
  return out;
}
function displayValue(value) {
  if (value instanceof Date) return value.toLocaleString();
  if (Array.isArray(value)) return value.map(displayValue).join(", ");
  if (ArrayBuffer.isView(value)) return `[${Array.from(value.slice(0, 24)).join(", ")}${value.length > 24 ? ", …" : ""}]`;
  if (typeof value === "number") return Number.isInteger(value) ? String(value) : String(Math.round(value * 10000) / 10000);
  if (typeof value === "object") { try { return JSON.stringify(value); } catch { return String(value); } }
  return String(value);
}
function findMeta(flat, names) {
  const keys = Object.keys(flat);
  for (const wanted of names) {
    const key = keys.find((candidate) => candidate.toLowerCase() === wanted.toLowerCase() || candidate.toLowerCase().endsWith(`.${wanted.toLowerCase()}`));
    if (key) return flat[key];
  }
  return undefined;
}

export function ExifViewer() {
  const [item, setItem] = useState(null);
  const [imageInfo, setImageInfo] = useState(null);
  const [previewError, setPreviewError] = useState(false);
  const [metadata, setMetadata] = useState(null);
  const [gps, setGps] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [outputFormat, setOutputFormat] = useState("auto");
  const [quality, setQuality] = useState(92);
  const [cleaning, setCleaning] = useState(false);
  const [cleaned, setCleaned] = useState(null);
  const [error, setError] = useState("");
  const imgRef = useRef(null);

  const reset = () => {
    if (item?.url) URL.revokeObjectURL(item.url);
    if (cleaned?.url) URL.revokeObjectURL(cleaned.url);
    setItem(null); setImageInfo(null); setPreviewError(false); setMetadata(null); setGps(null); setCleaned(null); setError(""); setSearch("");
  };

  const add = useCallback(async (files) => {
    const file = files?.[0];
    if (!file) return;
    setError(""); setMetadata(null); setGps(null); setCleaned(null); setImageInfo(null); setPreviewError(false); setLoading(true);
    setItem((old) => { if (old?.url) URL.revokeObjectURL(old.url); return { file, url: URL.createObjectURL(file) }; });
    try {
      const exifr = await getExifr();
      const options = { tiff: true, exif: true, gps: true, jfif: true, ihdr: true, xmp: true, iptc: true, icc: false, interop: true };
      const [parsed, coords] = await Promise.all([
        exifr.parse(file, options).catch(() => null),
        exifr.gps ? exifr.gps(file).catch(() => null) : Promise.resolve(null),
      ]);
      setMetadata(flattenMetadata(parsed || {}));
      if (coords?.latitude != null && coords?.longitude != null) setGps(coords);
    } catch (error) {
      setError(friendlyError(error, "Could not read metadata from this file."));
      setMetadata({});
    } finally { setLoading(false); }
  }, []);

  const flat = metadata || {};
  const rows = useMemo(() => Object.entries(flat)
    .sort(([a], [b]) => a.localeCompare(b))
    .filter(([key, value]) => !search || `${key} ${displayValue(value)}`.toLowerCase().includes(search.toLowerCase())), [flat, search]);

  const camera = [findMeta(flat, ["Make"]), findMeta(flat, ["Model"])].filter(Boolean).map(displayValue).join(" ");
  const taken = findMeta(flat, ["DateTimeOriginal", "CreateDate", "DateTime", "ModifyDate"]);
  const focal = findMeta(flat, ["FocalLength"]);
  const aperture = findMeta(flat, ["FNumber", "ApertureValue"]);
  const exposure = findMeta(flat, ["ExposureTime"]);
  const iso = findMeta(flat, ["ISO", "ISOSpeedRatings"]);
  const software = findMeta(flat, ["Software", "CreatorTool"]);
  const hasSensitive = Boolean(gps || camera || taken || findMeta(flat, ["GPSLatitude", "GPSLongitude", "latitude", "longitude"]));

  const clean = async () => {
    const img = imgRef.current;
    if (!item || !img || !img.naturalWidth) { setError("This browser cannot decode the image, so it cannot rebuild a clean copy. Convert HEIC/RAW files to JPG first."); return; }
    setCleaning(true); setError(""); setCleaned(null);
    try {
      const autoType = ["image/jpeg", "image/png", "image/webp"].includes(item.file.type) ? item.file.type : "image/jpeg";
      const type = outputFormat === "auto" ? autoType : outputFormat;
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (type === "image/jpeg") { ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, canvas.width, canvas.height); }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const blob = await canvasBlob(canvas, type, quality / 100);
      let verified = "Clean copy created by redrawing pixels into a brand-new file.";
      try {
        const exifr = await getExifr();
        const parsed = flattenMetadata(await exifr.parse(blob, { tiff: true, exif: true, gps: true, xmp: true, iptc: true }).catch(() => ({})) || {});
        const sensitiveKeys = Object.keys(parsed).filter((key) => /gps|latitude|longitude|make|model|datetimeoriginal|createdate|software/i.test(key));
        if (!sensitiveKeys.length) verified = "Verified: no GPS, camera or capture-date fields were found in the clean copy.";
      } catch {}
      const ext = type === "image/jpeg" ? "jpg" : type === "image/webp" ? "webp" : "png";
      setCleaned({ blob, url: URL.createObjectURL(blob), name: `${stripExt(item.file.name)}-no-metadata.${ext}`, verified });
    } catch {
      setError("Could not create the clean copy. The image may be too large for this device.");
    } finally { setCleaning(false); }
  };

  return (
    <div>
      {!item && <Dropzone accept="image/*,.jpg,.jpeg,.png,.webp,.tif,.tiff" onFiles={add} title="Drop a photo to inspect its hidden data" hint="See camera, date and GPS metadata — then remove it before sharing" icon="shield" />}
      <Alert msg={error} />
      {item && (
        <>
          <div className="grid gap-6 lg:grid-cols-[360px_1fr] lg:items-start">
            <div>
              <div className="checker grid min-h-[260px] place-items-center overflow-hidden rounded-3xl border border-white/10 p-3">
                {!previewError ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img ref={imgRef} src={item.url} alt="Photo being inspected" onLoad={(e) => setImageInfo({ width: e.currentTarget.naturalWidth, height: e.currentTarget.naturalHeight })} onError={() => setPreviewError(true)} className="max-h-[420px] w-auto max-w-full object-contain" />
                ) : <p className="max-w-xs text-center text-sm text-slate-400">This browser cannot preview this format, but metadata reading may still work.</p>}
              </div>
              <div className="mt-3"><FileFacts><Fact>{item.file.name}</Fact><Fact>{formatBytes(item.file.size)}</Fact>{imageInfo && <Fact>{imageInfo.width}×{imageInfo.height}px</Fact>}<Fact>{item.file.type || "Unknown type"}</Fact></FileFacts></div>
              <button type="button" onClick={reset} className={`${btnGhost} mt-4`}><Icon name="trash" size={15} /> Inspect another photo</button>
            </div>

            <div>
              {loading && <p className="text-sm text-amber-300" role="status">Reading metadata inside the file…</p>}
              {!loading && metadata && (
                <>
                  {hasSensitive ? (
                    <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm leading-relaxed text-amber-100" role="status">
                      <strong>Share carefully:</strong> this photo contains camera or capture metadata{gps ? ", including GPS location" : ""}. Create a clean copy below before posting it publicly.
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-emerald-400/25 bg-emerald-400/[0.06] px-4 py-3 text-sm text-emerald-100" role="status"><strong>No camera/GPS metadata found.</strong> Basic file dimensions below are safe technical facts.</div>
                  )}

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {[["Camera", camera || "Not recorded"], ["Taken", taken ? displayValue(taken) : "Not recorded"], ["Lens settings", [focal ? `${displayValue(focal)}mm` : "", aperture ? `f/${displayValue(aperture)}` : "", exposure ? `${displayValue(exposure)}s` : "", iso ? `ISO ${displayValue(iso)}` : ""].filter(Boolean).join(" · ") || "Not recorded"], ["Software", software ? displayValue(software) : "Not recorded"]].map(([label, value]) => (
                      <div key={label} className="rounded-2xl border border-white/[0.08] bg-white/[0.02] px-4 py-3"><p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">{label}</p><p className="mt-1 break-words text-sm font-semibold text-white">{value}</p></div>
                    ))}
                  </div>
                  {gps && (
                    <div className="mt-3 rounded-2xl border border-rose-400/25 bg-rose-400/[0.07] px-4 py-3 text-sm text-rose-100">
                      <strong>GPS location found:</strong> {gps.latitude.toFixed(6)}, {gps.longitude.toFixed(6)}
                      <span className="mt-1 block text-xs text-rose-200/80">Anyone receiving the original file may be able to learn where it was taken.</span>
                    </div>
                  )}

                  <div className="mt-6 rounded-3xl border border-white/[0.08] bg-white/[0.02] p-5">
                    <h2 className="font-extrabold text-white">Remove metadata</h2>
                    <p className="mt-1 text-sm leading-relaxed text-slate-400">We redraw the visible pixels into a brand-new image. EXIF, GPS, camera details and most descriptive tags do not carry over.</p>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <div><label htmlFor="exif-format" className="text-sm font-semibold text-white">Clean copy format</label><select id="exif-format" value={outputFormat} onChange={(e) => setOutputFormat(e.target.value)} className={selectCls}><option value="auto">Same as original (or JPG) ★</option><option value="image/jpeg">JPG</option><option value="image/png">PNG</option><option value="image/webp">WebP</option></select></div>
                      <div><label htmlFor="exif-quality" className="flex justify-between text-sm font-semibold text-white">JPG/WebP quality <span className="text-amber-300">{quality}%</span></label><input id="exif-quality" type="range" min="50" max="100" value={quality} onChange={(e) => setQuality(Number(e.target.value))} className="mt-4 w-full" /></div>
                    </div>
                    <button type="button" onClick={clean} disabled={cleaning || previewError} className={`${btnPrimary} mt-5`}><Icon name="shield" size={18} /> {cleaning ? "Removing metadata…" : "Create clean copy"}</button>
                    {cleaned && (
                      <div className="mt-4 rounded-2xl border border-emerald-400/25 bg-emerald-400/[0.05] p-4" role="status">
                        <p className="text-sm font-semibold text-white">{cleaned.verified}</p>
                        <p className="mt-1 text-xs text-slate-400">{formatBytes(item.file.size)} → {formatBytes(cleaned.blob.size)} · {cleaned.name}</p>
                        <button type="button" onClick={() => downloadBlob(cleaned.blob, cleaned.name)} className={`${btnGreen} mt-3`}><Icon name="download" size={17} /> Download clean image</button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {!loading && metadata && (
            <section className="mt-8" aria-label="All metadata">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div><h2 className="text-xl font-extrabold text-white">All metadata found</h2><p className="mt-1 text-sm text-slate-500">{rows.length} field{rows.length === 1 ? "" : "s"} shown. Search for GPS, date, camera, lens or software.</p></div>
                <label className="w-full sm:w-72"><span className="sr-only">Search metadata</span><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search metadata…" className={inputCls} /></label>
              </div>
              {rows.length ? (
                <div className="mt-4 overflow-hidden rounded-3xl border border-white/[0.08]">
                  <div className="max-h-[520px] divide-y divide-white/[0.06] overflow-auto bg-white/[0.015]">
                    {rows.map(([key, value]) => <div key={key} className="grid gap-1 px-4 py-3 sm:grid-cols-[280px_1fr] sm:gap-4"><span className="break-all font-mono text-xs font-semibold text-cyan-200">{key}</span><span className="break-words text-sm text-slate-300">{displayValue(value)}</span></div>)}
                  </div>
                </div>
              ) : <p className="mt-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] px-4 py-3 text-sm text-slate-400">No fields match.</p>}
            </section>
          )}
        </>
      )}
    </div>
  );
}

/* ═════════════════════════ WEBP TO JPG / PNG ═════════════════════════
   Bulk converter for Google's WebP format — the pictures you save from
   modern websites. Handles transparency the honest way: JPG has no alpha, so
   you choose the paper colour it lands on (or switch to PNG and keep it). */
const BG_PRESETS = [
  ["#ffffff", "White"],
  ["#f1f5f9", "Light grey"],
  ["#000000", "Black"],
  ["#fde68a", "Cream"],
];

export function WebpToJpg() {
  const [rows, setRows] = useState([]);
  const [format, setFormat] = useState("image/jpeg");
  const [quality, setQuality] = useState(92);
  const [background, setBackground] = useState("#ffffff");
  const [keepTransparent, setKeepTransparent] = useState(false);
  const [maxDim, setMaxDim] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [zipping, setZipping] = useState(false);

  const isPng = format === "image/png";
  const ext = isPng ? "png" : "jpg";

  const convert = useCallback(async (files) => {
    const accepted = Array.from(files || []).filter(
      (f) => /\.webp$/i.test(f.name) || f.type === "image/webp"
    );
    if (!accepted.length) {
      setError("No WebP files in that selection. This tool converts .webp images — for other formats use the Image Converter.");
      return;
    }
    setError("");
    setBusy(true);
    const id = uid();
    setRows(() => accepted.map((file) => ({ id: `${id}-${file.name}-${file.size}`, file, name: file.name, size: file.size, status: "Converting…", result: null })));

    const bg = isPng && keepTransparent ? null : background;
    const done = [];
    for (const file of accepted.slice(0, 50)) {
      const rowId = `${id}-${file.name}-${file.size}`;
      try {
        const loaded = await loadImage(file);
        const { width, height } = fitWithin(loaded.width, loaded.height, maxDim);
        const blob = await renderToBlob(loaded.img, {
          width,
          height,
          type: format,
          quality: quality / 100,
          background: bg,
          fit: "stretch",
        });
        URL.revokeObjectURL(loaded.url);
        const result = { blob, url: URL.createObjectURL(blob), name: `${stripExt(file.name)}.${ext}` };
        done.push({ rowId, width, height, result });
        setRows((prev) => prev.map((row) => (row.id === rowId ? { ...row, status: "done", width, height, result } : row)));
      } catch (e) {
        setRows((prev) => prev.map((row) => (row.id === rowId ? { ...row, status: e?.message || "Could not read this WebP file." } : row)));
      }
    }
    if (accepted.length > 50) setError("Only the first 50 files were converted, to protect your device's memory.");
    setBusy(false);
    return done;
  }, [background, ext, format, isPng, keepTransparent, maxDim, quality]);

  const results = rows.filter((row) => row.result).map((row) => row.result);
  const totalIn = rows.reduce((sum, row) => sum + (row.size || 0), 0);
  const totalOut = results.reduce((sum, item) => sum + item.blob.size, 0);

  return (
    <div>
      <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-5">
        <div className="grid gap-5 md:grid-cols-3">
          <div>
            <label htmlFor="webp-format" className="text-sm font-semibold text-white">Convert to</label>
            <select id="webp-format" value={format} onChange={(e) => setFormat(e.target.value)} className={selectCls}>
              <option value="image/jpeg">JPG — opens everywhere ★</option>
              <option value="image/png">PNG — lossless, keeps transparency</option>
            </select>
          </div>
          <div>
            <label htmlFor="webp-quality" className="flex justify-between text-sm font-semibold text-white">
              JPG quality <span className="font-bold text-amber-300">{quality}%</span>
            </label>
            <input id="webp-quality" type="range" min="50" max="100" value={quality} disabled={isPng} onChange={(e) => setQuality(Number(e.target.value))} className="mt-4 w-full disabled:opacity-40" />
            <p className="mt-1 text-xs text-slate-500">{isPng ? "PNG is lossless — quality does not apply." : "88–94% looks identical to the original for photos."}</p>
          </div>
          <div>
            <label htmlFor="webp-size" className="text-sm font-semibold text-white">Resize (optional)</label>
            <select id="webp-size" value={maxDim} onChange={(e) => setMaxDim(Number(e.target.value))} className={selectCls}>
              <option value={0}>Keep original size ★</option>
              <option value={2560}>Max 2560 px long edge</option>
              <option value={1920}>Max 1920 px — HD</option>
              <option value={1280}>Max 1280 px — email friendly</option>
              <option value={800}>Max 800 px — thumbnails</option>
            </select>
          </div>
        </div>

        <div className="mt-5 border-t border-white/[0.07] pt-4">
          <p className="text-sm font-semibold text-white">Transparent areas become…</p>
          {isPng ? (
            <label className="mt-3 flex items-center gap-2 text-xs text-slate-300">
              <input type="checkbox" checked={keepTransparent} onChange={(e) => setKeepTransparent(e.target.checked)} />
              Keep transparency (PNG supports it) — untick to flatten onto the colour below
            </label>
          ) : (
            <p className="mt-2 text-xs text-slate-500">JPG cannot store transparency, so empty areas are filled with the colour you pick.</p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {BG_PRESETS.map(([value, title]) => (
              <button
                key={value}
                type="button"
                onClick={() => setBackground(value)}
                disabled={isPng && keepTransparent}
                aria-pressed={background === value}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold transition disabled:opacity-40 ${background === value ? "border-amber-400 bg-amber-400/10 text-white" : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/25"}`}
              >
                <span className="h-3.5 w-3.5 rounded-full border border-white/25" style={{ background: value }} /> {title}
              </button>
            ))}
            <label className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-bold text-slate-300">
              Custom
              <input type="color" value={background} disabled={isPng && keepTransparent} onChange={(e) => setBackground(e.target.value)} className="h-5 w-7 cursor-pointer rounded border-0 bg-transparent p-0 disabled:opacity-40" aria-label="Custom background colour" />
            </label>
          </div>
        </div>
      </div>

      <div className="mt-5">
        <Dropzone
          accept=".webp,image/webp"
          multiple
          compact={rows.length > 0}
          onFiles={convert}
          title={rows.length ? "Convert more WebP images" : "Drop your WebP images"}
          hint="Bulk conversion — up to 50 files at once, they convert the moment you drop them"
          icon="convert"
        />
      </div>
      <Alert msg={error} />

      {rows.length > 0 && (
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-300">
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">{rows.length} file{rows.length === 1 ? "" : "s"}</span>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">In {formatBytes(totalIn)}</span>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">Out {formatBytes(totalOut)}</span>
            {totalOut > 0 && <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1.5 text-emerald-300">{savedPct(totalIn, totalOut)}% size change</span>}
          </div>
          <div className="ml-auto flex flex-wrap gap-2">
            <button type="button" onClick={() => convert(rows.map((row) => row.file))} disabled={busy} className={btnSmall}>
              <Icon name="refresh" size={13} /> Re-run with these settings
            </button>
            {results.length > 1 && (
              <button
                type="button"
                disabled={zipping || busy}
                onClick={async () => { setZipping(true); await downloadZip(results, `toolsstars-webp-to-${ext}.zip`); setZipping(false); }}
                className={btnGreen}
              >
                <Icon name="download" size={16} /> {zipping ? "Zipping…" : `Download all (${results.length}) as ZIP`}
              </button>
            )}
            <button type="button" onClick={() => { setRows([]); setError(""); }} className={btnGhost}><Icon name="trash" size={15} /> Clear</button>
          </div>
        </div>
      )}

      {busy && <p className="mt-4 text-xs text-amber-300" role="status">Converting on your device…</p>}

      <ul className="mt-5 space-y-3">
        {rows.map((row) => (
          <li key={row.id} className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-3.5">
            <div className="flex flex-wrap items-center gap-3">
              {row.result ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={row.result.url} alt={row.name} className="h-14 w-14 rounded-lg border border-white/10 object-cover" />
              ) : (
                <span className="grid h-14 w-14 place-items-center rounded-lg bg-white/[0.05] text-slate-500"><Icon name="image" size={20} /></span>
              )}
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-white" title={row.name}>{row.name}</span>
                {row.status === "done" ? (
                  <span className="text-xs text-slate-500">
                    {row.width} × {row.height} px · {formatBytes(row.size)} → {formatBytes(row.result.blob.size)}
                    {savedPct(row.size, row.result.blob.size) > 0 && <span className="text-emerald-300"> · {savedPct(row.size, row.result.blob.size)}% smaller</span>}
                  </span>
                ) : (
                  <span className={`text-xs ${row.status === "Converting…" ? "text-amber-300" : "text-rose-300"}`}>{row.status}</span>
                )}
              </span>
              {row.result && (
                <button type="button" onClick={() => downloadBlob(row.result.blob, row.result.name)} className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-3.5 py-2 text-sm font-bold text-emerald-300 transition hover:bg-emerald-400/15">
                  <Icon name="download" size={15} /> {row.result.name}
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>

      <p className="mt-5 text-xs leading-relaxed text-slate-500">
        Animated WebP files export as their first frame — browsers decode only the still image here. For animation, keep the original .webp file.
      </p>
    </div>
  );
}
