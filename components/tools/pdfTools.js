"use client";

import { useCallback, useRef, useState } from "react";
import Dropzone from "@/components/Dropzone";
import { Icon } from "@/components/icons";
import { formatBytes, savedPct, downloadBlob, downloadZip, stripExt, uid } from "@/lib/utils";

/* ── shared loaders (CDN ES modules, nothing bundled → site stays light) ── */
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
const errText = (e) =>
  /encrypt|password/i.test(e?.message || "")
    ? "This PDF is password-protected. Remove the password first, then try again."
    : "Could not read this PDF — it may be corrupted or in an unusual format.";

function Alert({ msg }) {
  if (!msg) return null;
  return (
    <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-200" role="alert">
      <Icon name="x" size={17} className="mt-0.5 shrink-0" /> {msg}
    </div>
  );
}
function Progress({ pct, text }) {
  if (!text && pct == null) return null;
  return (
    <div className="mt-5" role="status" aria-live="polite">
      {pct != null && (
        <div className="h-3 overflow-hidden rounded-full bg-white/[0.08]">
          <div className="h-full rounded-full bg-gradient-to-r from-red-400 to-amber-400 transition-all duration-300" style={{ width: `${pct}%` }} />
        </div>
      )}
      {text && <p className="mt-2 text-xs text-slate-400">{text}</p>}
    </div>
  );
}
const btnPrimary = "inline-flex items-center gap-2 rounded-2xl bg-amber-400 px-6 py-3 font-extrabold text-[#241a00] shadow-xl shadow-amber-500/20 transition hover:bg-amber-300 disabled:opacity-60 disabled:cursor-not-allowed";
const btnGreen = "inline-flex items-center gap-2 rounded-2xl bg-emerald-400 px-6 py-3 font-extrabold text-[#032114] shadow-xl shadow-emerald-500/20 transition hover:bg-emerald-300 disabled:opacity-60";
const btnGhost = "inline-flex items-center gap-1.5 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-slate-300 hover:border-rose-400/40 hover:text-rose-300";
const selectCls = "mt-2 w-full rounded-xl border border-white/10 bg-[#12152e] px-3 py-2.5 text-sm text-white outline-none focus:border-amber-400/60";
const inputCls = "mt-2 w-full rounded-xl border border-white/10 bg-[#12152e] px-3.5 py-2.5 text-white placeholder:text-slate-500 outline-none focus:border-amber-400/60";

/* ════════════════════════ MERGE PDF ════════════════════════ */
export function MergePdf() {
  const [items, setItems] = useState([]);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const add = useCallback(async (files) => {
    setError(""); setResult(null);
    const { PDFDocument } = await pdfLib();
    for (const file of files.filter((f) => /pdf$/i.test(f.type) || /\.pdf$/i.test(f.name))) {
      try {
        const bytes = new Uint8Array(await file.arrayBuffer());
        const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
        setItems((p) => [...p, { id: uid(), file, bytes, pages: doc.getPageCount() }]);
      } catch (e) {
        setError(`"${file.name}": ${errText(e)}`);
      }
    }
  }, []);

  const move = (i, d) => setItems((p) => { const n = [...p]; const j = i + d; if (j < 0 || j >= n.length) return p; [n[i], n[j]] = [n[j], n[i]]; return n; });

  const merge = async () => {
    setBusy(true); setError("");
    try {
      const { PDFDocument } = await pdfLib();
      const out = await PDFDocument.create();
      for (const it of items) {
        const src = await PDFDocument.load(it.bytes, { ignoreEncryption: true });
        const copied = await out.copyPages(src, src.getPageIndices());
        copied.forEach((pg) => out.addPage(pg));
      }
      const saved = await out.save({ useObjectStreams: true });
      const blob = new Blob([saved], { type: "application/pdf" });
      setResult({ blob, url: URL.createObjectURL(blob), pages: out.getPageCount() });
    } catch (e) { setError(errText(e)); } finally { setBusy(false); }
  };

  const totalPages = items.reduce((s, i) => s + i.pages, 0);
  return (
    <div>
      <Dropzone accept="application/pdf,.pdf" multiple compact={items.length > 0} onFiles={add} title={items.length ? "Add more PDFs" : "Drop PDFs to merge"} hint="Order them below — they will be joined top to bottom" icon="pdf" />
      <Alert msg={error} />
      {items.length > 0 && (
        <>
          <ol className="mt-6 space-y-2.5">
            {items.map((it, i) => (
              <li key={it.id} className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.02] px-4 py-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-red-400/15 text-xs font-extrabold text-red-300">{i + 1}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-white" title={it.file.name}>{it.file.name}</span>
                  <span className="text-xs text-slate-500">{it.pages} pages · {formatBytes(it.file.size)}</span>
                </span>
                <button onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up" className="rounded-lg p-2 text-slate-300 hover:bg-white/[0.07] disabled:opacity-25"><Icon name="chevron" size={16} className="rotate-180" /></button>
                <button onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label="Move down" className="rounded-lg p-2 text-slate-300 hover:bg-white/[0.07] disabled:opacity-25"><Icon name="chevron" size={16} /></button>
                <button onClick={() => setItems((p) => p.filter((x) => x.id !== it.id))} aria-label="Remove" className="rounded-lg p-2 text-slate-500 hover:bg-rose-400/10 hover:text-rose-300"><Icon name="trash" size={16} /></button>
              </li>
            ))}
          </ol>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button onClick={merge} disabled={busy || items.length < 2} className={btnPrimary}><Icon name="layers" size={18} /> {busy ? "Merging…" : `Merge ${items.length} PDFs (${totalPages} pages)`}</button>
            <button onClick={() => { setItems([]); setResult(null); }} className={btnGhost}><Icon name="trash" size={15} /> Clear</button>
            {items.length < 2 && <span className="text-xs text-slate-500">Add at least 2 PDFs to merge.</span>}
          </div>
          {result && (
            <div className="mt-6 flex flex-wrap items-center gap-4 rounded-2xl border border-emerald-400/25 bg-emerald-400/[0.06] p-4" role="status">
              <Icon name="check" size={22} className="text-emerald-300" />
              <p className="flex-1 text-sm text-white"><strong>Merged PDF ready</strong> — {result.pages} pages · {formatBytes(result.blob.size)}</p>
              <button onClick={() => downloadBlob(result.blob, "toolsstars-merged.pdf")} className={btnGreen}><Icon name="download" size={17} /> Download PDF</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ════════════════════════ SPLIT PDF ════════════════════════ */
function parsePages(str, total) {
  const set = new Set();
  for (const part of String(str).split(/[,\s]+/).map((s) => s.trim()).filter(Boolean)) {
    const m = part.match(/^(\d*)-(\d*)$/);
    if (m) {
      const a = m[1] ? +m[1] : 1, b = m[2] ? +m[2] : total;
      if (a < 1 || b > total || a > b) throw new Error(`"${part}" is outside 1–${total}.`);
      for (let i = a; i <= b; i++) set.add(i);
    } else if (/^\d+$/.test(part)) {
      const n = +part;
      if (n < 1 || n > total) throw new Error(`Page ${n} does not exist (document has ${total}).`);
      set.add(n);
    } else throw new Error(`I don't understand "${part}". Try something like 1-3, 5, 8-10.`);
  }
  return [...set].sort((a, b) => a - b);
}

export function SplitPdf() {
  const [item, setItem] = useState(null);
  const [mode, setMode] = useState("extract");
  const [range, setRange] = useState("1-");
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");
  const [zipping, setZipping] = useState(false);

  const add = useCallback(async (files) => {
    setError(""); setResults([]);
    try {
      const { PDFDocument } = await pdfLib();
      const file = files[0];
      const bytes = new Uint8Array(await file.arrayBuffer());
      const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      setItem({ file, bytes, pages: doc.getPageCount() });
      setRange(`1-${doc.getPageCount()}`);
    } catch (e) { setError(errText(e)); }
  }, []);

  const build = async (srcDoc, pageNums, PDFDocument) => {
    const out = await PDFDocument.create();
    const copied = await out.copyPages(srcDoc, pageNums.map((n) => n - 1));
    copied.forEach((p) => out.addPage(p));
    return new Blob([await out.save({ useObjectStreams: true })], { type: "application/pdf" });
  };

  const run = async () => {
    setBusy(true); setError(""); setResults([]);
    try {
      const selected = parsePages(range, item.pages);
      if (!selected.length) throw new Error("Select at least one page, e.g. 1-3.");
      const { PDFDocument } = await pdfLib();
      const src = await PDFDocument.load(item.bytes, { ignoreEncryption: true });
      const base = stripExt(item.file.name);
      if (mode === "separate") {
        const outs = [];
        for (const n of selected) outs.push({ name: `${base}-page-${n}.pdf`, blob: await build(src, [n], PDFDocument) });
        setResults(outs.map((o) => ({ ...o, url: URL.createObjectURL(o.blob) })));
      } else {
        const nums = mode === "remove" ? Array.from({ length: item.pages }, (_, i) => i + 1).filter((n) => !selected.includes(n)) : selected;
        if (!nums.length) throw new Error("That would delete every page. Keep at least one page.");
        const blob = await build(src, nums, PDFDocument);
        setResults([{ name: mode === "remove" ? `${base}-cleaned.pdf` : `${base}-pages-${nums[0]}-${nums[nums.length - 1]}.pdf`, blob, url: URL.createObjectURL(blob) }]);
      }
    } catch (e) { setError(e.message || errText(e)); } finally { setBusy(false); }
  };

  return (
    <div>
      {!item && <Dropzone accept="application/pdf,.pdf" onFiles={add} title="Drop a PDF to split" hint="Extract pages, delete pages, or save every page as its own PDF" icon="pdf" />}
      <Alert msg={error} />
      {item && (
        <>
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.02] px-4 py-3">
            <Icon name="pdf" size={22} className="text-red-300" />
            <span className="min-w-0 flex-1"><span className="block truncate font-semibold text-white">{item.file.name}</span><span className="text-xs text-slate-500">{item.pages} pages · {formatBytes(item.file.size)}</span></span>
            <button onClick={() => { setItem(null); setResults([]); }} className={btnGhost}><Icon name="trash" size={15} /> Different PDF</button>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-semibold text-white">What do you want to do?</label>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {[["extract", "Extract pages"], ["remove", "Delete pages"], ["separate", "Each page = 1 PDF"]].map(([v, l]) => (
                  <button key={v} onClick={() => setMode(v)} className={`rounded-xl border px-2 py-2.5 text-xs font-bold ${mode === v ? "border-amber-400 bg-amber-400/10 text-white" : "border-white/10 bg-white/[0.02] text-slate-300"}`}>{l}</button>
                ))}
              </div>
            </div>
            <div>
              <label htmlFor="rng" className="text-sm font-semibold text-white">Pages {mode === "remove" ? "to delete" : "to take"}</label>
              <input id="rng" value={range} onChange={(e) => setRange(e.target.value)} placeholder="e.g. 1-3, 5, 8-10" className={inputCls} />
              <div className="mt-2 flex flex-wrap gap-1.5">
                {[["All", `1-${item.pages}`], ["First page", "1"], ["First half", `1-${Math.ceil(item.pages / 2)}`], ["Second half", `${Math.ceil(item.pages / 2) + 1}-${item.pages}`]].map(([l, v]) => (
                  <button key={l} onClick={() => setRange(v)} className="rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs font-semibold text-slate-300 hover:border-amber-400/40">{l}</button>
                ))}
              </div>
            </div>
          </div>
          <button onClick={run} disabled={busy} className={`${btnPrimary} mt-6`}><Icon name="layers" size={18} /> {busy ? "Working…" : mode === "separate" ? "Split into separate PDFs" : mode === "remove" ? "Delete those pages" : "Extract pages"}</button>
          {results.length > 0 && (
            <div className="mt-6 rounded-2xl border border-emerald-400/25 bg-emerald-400/[0.05] p-4" role="status">
              <p className="font-bold text-white">{results.length} file(s) ready:</p>
              <ul className="mt-3 space-y-2">
                {results.map((r) => (
                  <li key={r.name} className="flex items-center gap-3 text-sm">
                    <span className="min-w-0 flex-1 truncate text-slate-200">{r.name} <span className="text-slate-500">({formatBytes(r.blob.size)})</span></span>
                    <button onClick={() => downloadBlob(r.blob, r.name)} className="inline-flex items-center gap-1 rounded-lg bg-white/[0.06] border border-white/10 px-3 py-1.5 font-semibold text-white hover:border-emerald-400/50"><Icon name="download" size={14} /> Download</button>
                  </li>
                ))}
              </ul>
              {results.length > 1 && (
                <button disabled={zipping} onClick={async () => { setZipping(true); await downloadZip(results, "toolsstars-split-pdf.zip"); setZipping(false); }} className={`${btnGreen} mt-4`}>
                  <Icon name="download" size={17} /> {zipping ? "Zipping…" : "Download all as ZIP"}
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ════════════════════════ PDF TO JPG ════════════════════════ */
export function PdfToJpg() {
  const [item, setItem] = useState(null);
  const [dpi, setDpi] = useState(150);
  const [format, setFormat] = useState("image/jpeg");
  const [quality, setQuality] = useState(88);
  const [busy, setBusy] = useState(false);
  const [pct, setPct] = useState(null);
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");
  const [zipping, setZipping] = useState(false);
  const pdfRef = useRef(null);

  const add = useCallback(async (files) => {
    setError(""); setResults([]);
    try {
      const lib = await pdfjs();
      const file = files[0];
      const data = new Uint8Array(await file.arrayBuffer());
      pdfRef.current = await lib.getDocument({ data }).promise;
      setItem({ file, pages: pdfRef.current.numPages });
    } catch (e) { setError(errText(e)); }
  }, []);

  const run = async () => {
    setBusy(true); setError(""); setResults([]);
    try {
      const ext = format === "image/png" ? "png" : format === "image/webp" ? "webp" : "jpg";
      const outs = [];
      for (let n = 1; n <= item.pages; n++) {
        const page = await pdfRef.current.getPage(n);
        const viewport = page.getViewport({ scale: dpi / 72 });
        const canvas = document.createElement("canvas");
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        await page.render({ canvasContext: ctx, viewport }).promise;
        const blob = await new Promise((r) => canvas.toBlob(r, format, quality / 100));
        outs.push({ name: `${stripExt(item.file.name)}-page-${n}.${ext}`, blob, url: URL.createObjectURL(blob), page: n });
        setResults([...outs]);
        setPct(Math.round((n / item.pages) * 100));
      }
    } catch (e) { setError("Rendering failed — try a lower DPI (this device may be low on memory)."); }
    finally { setBusy(false); }
  };

  return (
    <div>
      {!item && <Dropzone accept="application/pdf,.pdf" onFiles={add} title="Drop a PDF to convert to images" hint="Every page becomes a JPG, PNG or WebP picture" icon="image" />}
      <Alert msg={error} />
      {item && (
        <>
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.02] px-4 py-3">
            <Icon name="pdf" size={22} className="text-red-300" />
            <span className="min-w-0 flex-1"><span className="block truncate font-semibold text-white">{item.file.name}</span><span className="text-xs text-slate-500">{item.pages} pages · {formatBytes(item.file.size)}</span></span>
            <button onClick={() => { setItem(null); setResults([]); setPct(null); }} className={btnGhost}><Icon name="trash" size={15} /> Different PDF</button>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <div><label className="text-sm font-semibold text-white">Resolution (DPI)</label>
              <select value={dpi} onChange={(e) => setDpi(+e.target.value)} className={selectCls}>
                <option value={72}>72 DPI — screen / smallest</option><option value={150}>150 DPI — good ★</option><option value={200}>200 DPI — sharp</option><option value={300}>300 DPI — print quality</option>
              </select></div>
            <div><label className="text-sm font-semibold text-white">Image format</label>
              <select value={format} onChange={(e) => setFormat(e.target.value)} className={selectCls}>
                <option value="image/jpeg">JPG — smallest, universal</option><option value="image/png">PNG — lossless, crisp text</option><option value="image/webp">WebP — modern & small</option>
              </select></div>
            <div><label className="flex justify-between text-sm font-semibold text-white">Quality <span className="font-bold text-amber-300">{quality}%</span></label>
              <input type="range" min="40" max="100" value={quality} disabled={format === "image/png"} onChange={(e) => setQuality(+e.target.value)} className="mt-3.5 w-full disabled:opacity-40" /></div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button onClick={run} disabled={busy} className={btnPrimary}><Icon name="image" size={18} /> {busy ? "Converting…" : `Convert ${item.pages} pages`}</button>
            {results.length > 1 && <button disabled={zipping || busy} onClick={async () => { setZipping(true); await downloadZip(results, "toolsstars-pdf-images.zip"); setZipping(false); }} className={btnGreen}><Icon name="download" size={17} /> {zipping ? "Zipping…" : "Download all as ZIP"}</button>}
          </div>
          <Progress pct={busy || pct ? pct : null} text={busy ? "Rendering pages one by one on your device…" : ""} />
          {results.length > 0 && (
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {results.map((r) => (
                <figure key={r.page} className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={r.url} alt={`Page ${r.page}`} className="h-44 w-full bg-white object-contain" />
                  <figcaption className="flex items-center justify-between px-3 py-2 text-xs">
                    <span className="text-slate-400">Page {r.page} · {formatBytes(r.blob.size)}</span>
                    <button onClick={() => downloadBlob(r.blob, r.name)} className="inline-flex items-center gap-1 font-bold text-emerald-300"><Icon name="download" size={13} /> Save</button>
                  </figcaption>
                </figure>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ════════════════════════ COMPRESS PDF ════════════════════════ */
export function CompressPdf() {
  const [item, setItem] = useState(null);
  const [method, setMethod] = useState("rebuild");
  const [level, setLevel] = useState("balanced");
  const [busy, setBusy] = useState(false);
  const [pct, setPct] = useState(null);
  const [stage, setStage] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const add = useCallback(async (files) => {
    setError(""); setResult(null);
    try {
      const { PDFDocument } = await pdfLib();
      const file = files[0];
      const bytes = new Uint8Array(await file.arrayBuffer());
      const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      setItem({ file, bytes, pages: doc.getPageCount() });
    } catch (e) { setError(errText(e)); }
  }, []);

  const run = async () => {
    setBusy(true); setError(""); setResult(null); setPct(1);
    try {
      const { PDFDocument } = await pdfLib();
      let blob;
      if (method === "optimize") {
        setStage("Rebuilding the PDF structure and dropping unused data (text stays selectable)…");
        const src = await PDFDocument.load(item.bytes, { ignoreEncryption: true });
        const out = await PDFDocument.create();
        const copied = await out.copyPages(src, src.getPageIndices());
        copied.forEach((p) => out.addPage(p));
        setPct(80);
        blob = new Blob([await out.save({ useObjectStreams: true })], { type: "application/pdf" });
      } else {
        const cfg = { balanced: { dpi: 150, q: 0.78 }, strong: { dpi: 120, q: 0.62 }, extreme: { dpi: 96, q: 0.46 } }[level];
        const lib = await pdfjs();
        const pdf = await lib.getDocument({ data: item.bytes.slice() }).promise;
        const out = await PDFDocument.create();
        for (let n = 1; n <= item.pages; n++) {
          setStage(`Re-rendering page ${n} of ${item.pages} at ${cfg.dpi} DPI…`);
          const page = await pdf.getPage(n);
          const v1 = page.getViewport({ scale: 1 });
          const viewport = page.getViewport({ scale: cfg.dpi / 72 });
          const canvas = document.createElement("canvas");
          canvas.width = Math.floor(viewport.width);
          canvas.height = Math.floor(viewport.height);
          const ctx = canvas.getContext("2d");
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          await page.render({ canvasContext: ctx, viewport }).promise;
          const jpg = await new Promise((r) => canvas.toBlob(r, "image/jpeg", cfg.q));
          const embedded = await out.embedJpg(new Uint8Array(await jpg.arrayBuffer()));
          const pg = out.addPage([v1.width, v1.height]);
          pg.drawImage(embedded, { x: 0, y: 0, width: v1.width, height: v1.height });
          setPct(Math.round((n / item.pages) * 95));
        }
        blob = new Blob([await out.save({ useObjectStreams: true })], { type: "application/pdf" });
      }
      setPct(100);
      setStage(blob.size < item.file.size ? "Done — nice and small!" : "Done. Heads-up: your original was already very efficiently made, so it is about the same size.");
      setResult({ blob, bigger: blob.size >= item.file.size });
    } catch (e) { console.error(e); setError("Compression failed on this device — try the 'Keep text' method, a smaller PDF, or a desktop browser."); setStage(""); setPct(null); }
    finally { setBusy(false); }
  };

  return (
    <div>
      {!item && <Dropzone accept="application/pdf,.pdf" onFiles={add} title="Drop a PDF to compress" hint="Perfect for scanned documents, assignments & email attachments" icon="compress" />}
      <Alert msg={error} />
      {item && (
        <>
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.02] px-4 py-3">
            <Icon name="pdf" size={22} className="text-red-300" />
            <span className="min-w-0 flex-1"><span className="block truncate font-semibold text-white">{item.file.name}</span><span className="text-xs text-slate-500">{item.pages} pages · <strong className="text-rose-300">{formatBytes(item.file.size)}</strong></span></span>
            <button onClick={() => { setItem(null); setResult(null); }} className={btnGhost}><Icon name="trash" size={15} /> Different PDF</button>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-semibold text-white">Method</label>
              <div className="mt-2 space-y-2">
                {[["rebuild", "Smallest size ★", "Rebuilds pages as optimized images. Scanned PDFs often shrink 70–95%. Text no longer selectable."], ["optimize", "Keep text selectable", "Cleans the PDF structure losslessly. Gentle saving, text & quality untouched."]].map(([v, t, d]) => (
                  <button key={v} onClick={() => setMethod(v)} className={`block w-full rounded-xl border px-3.5 py-3 text-left ${method === v ? "border-amber-400 bg-amber-400/10" : "border-white/10 bg-white/[0.02]"}`}>
                    <span className="block text-sm font-bold text-white">{t}</span><span className="block text-xs text-slate-400">{d}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-white">Compression level {method === "optimize" && <span className="font-normal text-slate-500">(rebuild method only)</span>}</label>
              <div className="mt-2 space-y-2">
                {[["balanced", "Balanced", "150 DPI — sharp & small"], ["strong", "Strong", "120 DPI — much smaller"], ["extreme", "Extreme (email / upload limits)", "96 DPI — smallest possible"]].map(([v, t, d]) => (
                  <button key={v} onClick={() => setLevel(v)} disabled={method === "optimize"} className={`block w-full rounded-xl border px-3.5 py-3 text-left disabled:opacity-40 ${level === v ? "border-red-400 bg-red-400/10" : "border-white/10 bg-white/[0.02]"}`}>
                    <span className="block text-sm font-bold text-white">{t}</span><span className="block text-xs text-slate-400">{d}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <button onClick={run} disabled={busy} className={`${btnPrimary} mt-6`}><Icon name="compress" size={18} /> {busy ? "Compressing…" : "Compress PDF"}</button>
          <Progress pct={pct} text={stage} />
          {result && (
            <div className="mt-6 rounded-2xl border border-emerald-400/25 bg-emerald-400/[0.05] p-4" role="status">
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="font-semibold text-white">{formatBytes(item.file.size)} → <span className="font-extrabold text-emerald-300">{formatBytes(result.blob.size)}</span></span>
                {!result.bigger && <span className="rounded-full bg-emerald-400 px-3 py-1 text-xs font-extrabold text-[#032114]">Saved {savedPct(item.file.size, result.blob.size)}%</span>}
              </div>
              <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/[0.08]" aria-hidden="true">
                <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-300" style={{ width: `${Math.max(2, Math.min(100, (result.blob.size / item.file.size) * 100))}%` }} />
              </div>
              <button onClick={() => downloadBlob(result.blob, `${stripExt(item.file.name)}-compressed.pdf`)} className={`${btnGreen} mt-4`}><Icon name="download" size={17} /> Download compressed PDF</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
