"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Dropzone from "@/components/Dropzone";
import { Icon } from "@/components/icons";
import { formatBytes, downloadBlob, downloadZip, stripExt, loadImage, uid, loadScript, friendlyError } from "@/lib/utils";

const btnP = "inline-flex items-center gap-2 rounded-2xl bg-amber-400 px-6 py-3 font-extrabold text-[#241a00] shadow-xl shadow-amber-500/20 transition hover:bg-amber-300 disabled:opacity-60";
const btnG = "inline-flex items-center gap-2 rounded-2xl bg-emerald-400 px-6 py-3 font-extrabold text-[#032114] shadow-xl shadow-emerald-500/20 transition hover:bg-emerald-300 disabled:opacity-60";
const btnGhost = "inline-flex items-center gap-1.5 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-slate-300 hover:border-rose-400/40 hover:text-rose-300";
const sel = "mt-2 w-full rounded-xl border border-white/10 bg-[#12152e] px-3 py-2.5 text-sm text-white outline-none focus:border-amber-400/60";
function Alert({ msg }) { return msg ? <div className="mt-4 rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm leading-relaxed text-rose-200" role="alert">{msg}</div> : null; }
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/* ═══════════════ IMAGE CROPPER ═══════════════ */
const ASPECTS = [["free", "Free", 0], ["1:1", "1:1 Square / DP", 1], ["4:3", "4:3", 4 / 3], ["3:4", "3:4 Portrait", 3 / 4], ["16:9", "16:9 Wide", 16 / 9], ["9:16", "9:16 Story", 9 / 16], ["3:2", "3:2 Photo", 1.5]];
export function ImageCropper() {
  const [item, setItem] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0, w: 10, h: 10 });
  const [aspectId, setAspectId] = useState("free");
  const [circle, setCircle] = useState(false);
  const [format, setFormat] = useState("image/png");
  const [disp, setDisp] = useState({ w: 640, h: 400 });
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const wrapRef = useRef(null);
  const dragRef = useRef(null);

  const fitInitial = useCallback((it) => {
    const w = Math.round(it.width * 0.8), h = Math.round(it.height * 0.8);
    setCrop({ x: Math.round((it.width - w) / 2), y: Math.round((it.height - h) / 2), w, h });
  }, []);

  const add = useCallback(async (files) => {
    setError(""); setResult(null);
    try { const it = { file: files[0], ...(await loadImage(files[0])) }; setItem(it); fitInitial(it); } catch (e) { setError(friendlyError(e, "Could not read that image. Try a different file.")); }
  }, [fitInitial]);

  useEffect(() => {
    const update = () => {
      if (!wrapRef.current || !item) return;
      const maxW = wrapRef.current.clientWidth || 640;
      let w = maxW, h = (w * item.height) / item.width;
      if (h > 540) { h = 540; w = (h * item.width) / item.height; }
      setDisp({ w: Math.round(w), h: Math.round(h) });
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [item]);

  const scale = item ? disp.w / item.width : 1;
  const aspect = ASPECTS.find((a) => a[0] === aspectId)?.[2] || 0;

  const applyAspect = (id) => {
    setAspectId(id);
    const a = ASPECTS.find((x) => x[0] === id)?.[2] || 0;
    if (!a || !item) return;
    setCrop((c) => {
      let w = c.w, h = Math.round(w / a);
      if (h > item.height) { h = item.height; w = Math.round(h * a); }
      return { w, h, x: clamp(Math.round(c.x + (c.w - w) / 2), 0, item.width - w), y: clamp(Math.round(c.y + (c.h - h) / 2), 0, item.height - h) };
    });
  };

  const onPointer = (e, phase, mode) => {
    e.preventDefault();
    if (phase === "down") { dragRef.current = { mode, sx: e.clientX, sy: e.clientY, crop: { ...crop } }; e.currentTarget.setPointerCapture?.(e.pointerId); return; }
    if (phase === "up") { dragRef.current = null; return; }
    const d = dragRef.current; if (!d || !item) return;
    const dx = (e.clientX - d.sx) / scale, dy = (e.clientY - d.sy) / scale;
    if (d.mode === "move") {
      setCrop({ ...d.crop, x: clamp(Math.round(d.crop.x + dx), 0, item.width - d.crop.w), y: clamp(Math.round(d.crop.y + dy), 0, item.height - d.crop.h) });
    } else {
      let w = clamp(Math.round(d.crop.w + dx), 24, item.width - d.crop.x);
      let h = aspect ? Math.round(w / aspect) : clamp(Math.round(d.crop.h + dy), 24, item.height - d.crop.y);
      if (h > item.height - d.crop.y) { h = item.height - d.crop.y; if (aspect) w = Math.round(h * aspect); }
      setCrop({ ...d.crop, w, h });
    }
    setResult(null);
  };

  const transform = async (kind) => {
    const src = item.img;
    const rotate = kind === "rotate";
    const c = document.createElement("canvas");
    c.width = rotate ? item.height : item.width; c.height = rotate ? item.width : item.height;
    const ctx = c.getContext("2d");
    if (rotate) { ctx.translate(c.width, 0); ctx.rotate(Math.PI / 2); }
    if (kind === "flipH") { ctx.translate(c.width, 0); ctx.scale(-1, 1); }
    if (kind === "flipV") { ctx.translate(0, c.height); ctx.scale(1, -1); }
    ctx.drawImage(src, 0, 0);
    const blob = await new Promise((r) => c.toBlob(r, "image/png"));
    const it = { file: item.file, ...(await loadImage(blob)) };
    setItem(it); fitInitial(it); setResult(null);
  };

  const exportCrop = () => {
    const c = document.createElement("canvas"); c.width = crop.w; c.height = crop.h;
    const ctx = c.getContext("2d");
    if (format === "image/jpeg") { ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, c.width, c.height); }
    if (circle) { ctx.beginPath(); ctx.ellipse(c.width / 2, c.height / 2, c.width / 2, c.height / 2, 0, 0, Math.PI * 2); ctx.clip(); }
    ctx.drawImage(item.img, crop.x, crop.y, crop.w, crop.h, 0, 0, crop.w, crop.h);
    const ext = format === "image/jpeg" ? "jpg" : format === "image/webp" ? "webp" : "png";
    c.toBlob((b) => b && setResult({ blob: b, url: URL.createObjectURL(b), name: `${stripExt(item.file.name)}-cropped-${crop.w}x${crop.h}.${ext}` }), format, 0.92);
  };

  return (
    <div>
      {!item && <Dropzone accept="image/*" allowPaste onFiles={add} title="Drop an image to crop" hint="Drag the box, pull the corner, export exactly what you framed" icon="resize" />}
      <Alert msg={error} />
      {item && (
        <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
          <div ref={wrapRef}>
            <div className="relative mx-auto select-none overflow-hidden rounded-2xl border border-white/10 bg-black/40 touch-none" style={{ width: disp.w, height: disp.h }}
              onPointerMove={(e) => dragRef.current && onPointer(e, "move")} onPointerUp={(e) => onPointer(e, "up")}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.url} alt="Image to crop" draggable={false} className="absolute inset-0 h-full w-full checker" />
              <span className="absolute inset-0 bg-black/45" style={{ clipPath: `polygon(0 0,100% 0,100% 100%,0 100%,0 ${crop.y * scale}px,${crop.x * scale}px ${crop.y * scale}px,${crop.x * scale}px ${(crop.y + crop.h) * scale}px,${(crop.x + crop.w) * scale}px ${(crop.y + crop.h) * scale}px,${(crop.x + crop.w) * scale}px ${crop.y * scale}px,0 ${crop.y * scale}px)` }} aria-hidden="true" />
              <div className={`absolute cursor-move border-2 border-amber-400 ${circle ? "rounded-[50%]" : ""}`}
                style={{ left: crop.x * scale, top: crop.y * scale, width: crop.w * scale, height: crop.h * scale, boxShadow: "0 0 0 1px rgba(0,0,0,.5)" }}
                onPointerDown={(e) => onPointer(e, "down", "move")}>
                <span className="absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-40" aria-hidden="true">{Array.from({ length: 9 }).map((_, i) => <span key={i} className="border border-white/50" />)}</span>
                <span className="absolute -bottom-2.5 -right-2.5 grid h-6 w-6 cursor-nwse-resize place-items-center rounded-full bg-amber-400 text-[10px] font-black text-[#241a00]" onPointerDown={(e) => { e.stopPropagation(); onPointer(e, "down", "resize"); }}>↘</span>
              </div>
            </div>
            <p className="mt-2.5 text-center text-xs text-slate-500">Drag box to move · pull the amber corner to resize · selection: <strong className="text-slate-300">{crop.w} × {crop.h}px</strong></p>
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">Aspect ratio</h2>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {ASPECTS.map(([id, label]) => <button key={id} onClick={() => applyAspect(id)} className={`rounded-full border px-3 py-1.5 text-xs font-bold ${aspectId === id ? "border-amber-400 bg-amber-400/15 text-amber-200" : "border-white/10 bg-white/[0.03] text-slate-300"}`}>{label}</button>)}
              <button onClick={() => fitInitial(item)} className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-bold text-slate-300">Reset (80%)</button>
              <button onClick={() => setCrop({ x: 0, y: 0, w: item.width, h: item.height })} className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-bold text-slate-300">Full image</button>
            </div>
            <label className="mt-4 flex cursor-pointer items-center gap-2.5 text-sm text-slate-300"><input type="checkbox" checked={circle} onChange={(e) => { setCircle(e.target.checked); if (e.target.checked && aspectId !== "1:1") applyAspect("1:1"); if (e.target.checked) setFormat("image/png"); }} className="h-4 w-4" /> Circle crop (profile DP — transparent corners in PNG)</label>
            <h2 className="mt-5 text-sm font-bold uppercase tracking-wider text-slate-300">Quick transforms</h2>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {[["rotate", "Rotate 90°"], ["flipH", "Flip ↔"], ["flipV", "Flip ↕"]].map(([k, l]) => <button key={k} onClick={() => transform(k)} className="rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2 text-sm font-semibold text-slate-200 hover:border-amber-400/40">{l}</button>)}
            </div>
            <label className="mt-5 block text-sm font-semibold text-white">Download format</label>
            <select value={format} onChange={(e) => setFormat(e.target.value)} className={sel}><option value="image/png">PNG</option><option value="image/jpeg">JPG</option><option value="image/webp">WebP</option></select>
            <div className="mt-5 flex flex-wrap gap-3">
              <button onClick={exportCrop} className={btnP}><Icon name="resize" size={17} /> Crop image</button>
              <button onClick={() => { setItem(null); setResult(null); }} className={btnGhost}><Icon name="trash" size={15} /> New image</button>
            </div>
            {result && (
              <div className="mt-5 flex items-center gap-4 rounded-2xl border border-emerald-400/25 bg-emerald-400/[0.05] p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={result.url} alt="Cropped result" className="h-20 w-20 rounded-xl object-contain checker ring-2 ring-emerald-400/40" />
                <div><p className="text-sm font-bold text-white">{crop.w}×{crop.h} · {formatBytes(result.blob.size)}</p>
                  <button onClick={() => downloadBlob(result.blob, result.name)} className="mt-2 inline-flex items-center gap-1.5 rounded-xl bg-emerald-400 px-4 py-2 text-sm font-extrabold text-[#032114]"><Icon name="download" size={15} /> Download cropped image</button></div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════ HEIC TO JPG ═══════════════ */
export function HeicToJpg() {
  const [rows, setRows] = useState([]);
  const [format, setFormat] = useState("image/jpeg");
  const [quality, setQuality] = useState(90);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [zipping, setZipping] = useState(false);

  const run = async (files) => {
    setBusy(true); setError("");
    try {
      await loadScript("https://cdn.jsdelivr.net/npm/heic2any@0.0.4/dist/heic2any.min.js");
      const heic2any = window.heic2any;
      if (!heic2any) throw new Error("HEIC decoder failed to load");
      for (const file of files.slice(0, 20)) {
        const id = uid();
        setRows((p) => [...p, { id, name: file.name, status: "Converting… (HEIC decoding is heavy — give it a few seconds each)", results: [] }]);
        try {
          const out = await heic2any({ blob: file, toType: format, quality: format === "image/png" ? undefined : quality / 100 });
          const blobs = Array.isArray(out) ? out : [out];
          const ext = format === "image/png" ? "png" : "jpg";
          const results = blobs.map((b, i) => ({ blob: b, url: URL.createObjectURL(b), name: `${stripExt(file.name)}${blobs.length > 1 ? `-${i + 1}` : ""}.${ext}` }));
          setRows((p) => p.map((r) => r.id === id ? { ...r, status: "done", results } : r));
        } catch { setRows((p) => p.map((r) => r.id === id ? { ...r, status: "Could not decode this HEIC (it may be a newer iPhone variant — try Safari, or re-export as 'Most Compatible')." } : r)); }
      }
    } catch { setError("The HEIC decoder could not be downloaded. Check your connection or ad-blocker."); }
    finally { setBusy(false); }
  };

  const allResults = rows.flatMap((r) => r.results);
  return (
    <div>
      <div className="mb-5 grid gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 sm:grid-cols-2">
        <div><label className="text-sm font-semibold text-white">Convert to</label>
          <select value={format} onChange={(e) => setFormat(e.target.value)} className={sel}><option value="image/jpeg">JPG — works everywhere ★</option><option value="image/png">PNG — lossless, larger</option></select></div>
        <div><label className="flex justify-between text-sm font-semibold text-white">JPG quality <span className="font-bold text-amber-300">{quality}%</span></label>
          <input type="range" min="50" max="100" value={quality} disabled={format === "image/png"} onChange={(e) => setQuality(+e.target.value)} className="mt-3.5 w-full disabled:opacity-40" /></div>
      </div>
      <Dropzone accept=".heic,.heif,image/heic,image/heif" multiple compact={rows.length > 0} onFiles={run} title={rows.length ? "Convert more HEIC photos" : "Drop iPhone HEIC photos"} hint="They convert the moment you drop them — JPGs everyone can open" icon="convert" />
      <Alert msg={error} />
      {busy && <p className="mt-3 text-xs text-amber-300" role="status">Decoding HEIC… this format is very heavy, a few seconds per photo is normal.</p>}
      {allResults.length > 1 && <button disabled={zipping} onClick={async () => { setZipping(true); await downloadZip(allResults, "toolsstars-heic-converted.zip"); setZipping(false); }} className={`${btnG} mt-5`}><Icon name="download" size={16} /> {zipping ? "Zipping…" : `Download all (${allResults.length}) as ZIP`}</button>}
      <ul className="mt-5 space-y-3">
        {rows.map((r) => (
          <li key={r.id} className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-3.5">
            <p className="truncate text-sm font-semibold text-white">{r.name}</p>
            {r.status !== "done" ? <p className={`mt-1 text-xs ${r.status.startsWith("Could") ? "text-rose-300" : "text-amber-300"}`}>{r.status}</p> :
              <div className="mt-2.5 flex flex-wrap gap-3">{r.results.map((o) => (
                <span key={o.name} className="inline-flex items-center gap-2.5">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={o.url} alt={o.name} className="h-14 w-14 rounded-lg object-cover" /><button onClick={() => downloadBlob(o.blob, o.name)} className="inline-flex items-center gap-1 text-sm font-bold text-emerald-300"><Icon name="download" size={14} /> {formatBytes(o.blob.size)}</button></span>
              ))}</div>}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ═══════════════ OCR — IMAGE TO TEXT ═══════════════ */
export function ImageToText() {
  const [item, setItem] = useState(null);
  const [lang, setLang] = useState("eng");
  const [busy, setBusy] = useState(false);
  const [pct, setPct] = useState(null);
  const [stage, setStage] = useState("");
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const add = useCallback(async (files) => { setError(""); setText(""); try { setItem({ file: files[0], ...(await loadImage(files[0])) }); } catch (e) { setError(friendlyError(e, "Could not read that image. Try a different file.")); } }, []);

  const sample = async () => {
    const c = document.createElement("canvas"); c.width = 900; c.height = 420;
    const x = c.getContext("2d"); x.fillStyle = "#ffffff"; x.fillRect(0, 0, 900, 420); x.fillStyle = "#111827";
    x.font = "bold 54px Georgia"; x.fillText("Tools Stars OCR Test", 50, 100);
    x.font = "34px Georgia"; x.fillText("The quick brown fox jumps over", 50, 190); x.fillText("the lazy dog near the river bank.", 50, 245);
    x.font = "28px Georgia"; x.fillText("Invoice No: 1042   Date: 27-10-2026", 50, 330); x.fillText("Total: Rs. 4,850 only", 50, 380);
    const blob = await new Promise((r) => c.toBlob(r, "image/png"));
    add([new File([blob], "ocr-sample.png", { type: "image/png" })]);
  };

  const run = async () => {
    setBusy(true); setError(""); setText(""); setPct(1);
    try {
      setStage("Loading the OCR brain (first use downloads language data)…");
      await loadScript("https://cdn.jsdelivr.net/npm/tesseract.js@5.0.5/dist/tesseract.min.js");
      // gentle pre-process: upscale small scans + grayscale contrast
      let input = item.file;
      if (Math.max(item.width, item.height) < 1600) {
        const f = Math.min(2.5, 1600 / Math.max(item.width, item.height));
        const c = document.createElement("canvas"); c.width = Math.round(item.width * f); c.height = Math.round(item.height * f);
        const x = c.getContext("2d"); x.filter = "grayscale(1) contrast(1.25)"; x.imageSmoothingQuality = "high"; x.drawImage(item.img, 0, 0, c.width, c.height);
        input = await new Promise((r) => c.toBlob(r, "image/png"));
      }
      const { data } = await window.Tesseract.recognize(input, lang, {
        logger: (m) => { if (m.status === "recognizing text") { setPct(Math.round(m.progress * 100)); setStage("Reading your image…"); } else setStage(m.status.replace(/_/g, " ")); },
      });
      if (!data.text.trim()) throw new Error("No readable text found. Try a sharper, straight, well-lit photo of the document.");
      setText(data.text.trim()); setStage("Done — edit anything below, then copy or download.");
    } catch (e) { setError(friendlyError(e, "OCR failed in this browser. Try Chrome/Edge on desktop.")); setStage(""); setPct(null); }
    finally { setBusy(false); }
  };

  return (
    <div>
      {!item && (
        <>
          <Dropzone accept="image/*" allowPaste onFiles={add} title="Drop a photo of text — get editable text" hint="Scanned pages, receipts, screenshots, notes, signs" icon="type" />
          <div className="mt-4 text-center"><button onClick={sample} className="inline-flex items-center gap-2 rounded-xl border border-cyan-400/40 bg-cyan-400/10 px-4 py-2.5 text-sm font-bold text-cyan-200 hover:bg-cyan-400/20"><Icon name="type" size={15} /> Try with a sample document</button></div>
        </>
      )}
      <Alert msg={error} />
      {item && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.url} alt="Document to read" className="max-h-[480px] w-full rounded-2xl border border-white/10 bg-white object-contain" />
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div><label className="text-sm font-semibold text-white">Document language</label>
                <select value={lang} onChange={(e) => setLang(e.target.value)} className={sel}>
                  <option value="eng">English</option><option value="urd">Urdu (اردو)</option><option value="eng+urd">English + Urdu mix</option><option value="ara">Arabic</option><option value="hin">Hindi</option><option value="spa">Spanish</option><option value="fra">French</option><option value="deu">German</option>
                </select></div>
              <div className="flex items-end gap-2">
                <button onClick={run} disabled={busy} className={btnP}><Icon name="type" size={16} /> {busy ? "Reading…" : "Extract text"}</button>
                <button onClick={() => { setItem(null); setText(""); }} className={btnGhost}><Icon name="trash" size={15} /> New</button>
              </div>
            </div>
            {(busy || stage) && <div className="mt-4" role="status">{pct != null && <div className="h-2.5 overflow-hidden rounded-full bg-white/[0.08]"><div className="h-full rounded-full bg-cyan-400 transition-all" style={{ width: `${pct}%` }} /></div>}<p className="mt-2 text-xs capitalize text-slate-400">{stage}</p></div>}
          </div>
          <div>
            <label className="text-sm font-semibold text-white">Extracted text <span className="font-normal text-slate-500">(fully editable)</span></label>
            <textarea value={text} onChange={(e) => setText(e.target.value)} rows={16} placeholder="Your text will appear here…" className="mt-2 w-full rounded-2xl border border-white/10 bg-[#0d1025] px-4 py-3 font-mono text-[13.5px] leading-relaxed text-white placeholder:text-slate-500 outline-none focus:border-cyan-400/60" />
            <p className="mt-1.5 text-xs text-slate-500">{text ? `${text.split(/\s+/).filter(Boolean).length} words · ${text.length} characters` : "Tip: straight, sharp, shadow-free photos read best."}</p>
            {text && (
              <div className="mt-3 flex flex-wrap gap-2.5">
                <button onClick={async () => { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }} className="inline-flex items-center gap-1.5 rounded-xl bg-white/[0.06] border border-white/10 px-4 py-2.5 text-sm font-semibold text-white hover:border-cyan-400/50"><Icon name={copied ? "check" : "copy"} size={15} /> {copied ? "Copied!" : "Copy text"}</button>
                <button onClick={() => downloadBlob(new Blob([text], { type: "text/plain" }), `${stripExt(item.file.name)}.txt`)} className={btnG}><Icon name="download" size={15} /> Download .txt</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════ QR SCANNER ═══════════════ */
export function QrScanner() {
  const [scanning, setScanning] = useState(false);
  const [found, setFound] = useState([]);
  const [error, setError] = useState("");
  const [busyNote, setBusyNote] = useState("");
  const [copied, setCopied] = useState("");
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);

  const stopCam = useCallback(() => {
    clearInterval(timerRef.current);
    try { streamRef.current?.getTracks().forEach((t) => t.stop()); } catch {}
    setScanning(false);
  }, []);
  useEffect(() => stopCam, [stopCam]);

  const ensureLib = async () => { await loadScript("https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js"); if (!window.jsQR) throw new Error("Scanner failed to load"); };

  const remember = (val, via) => {
    setFound((p) => (p.some((f) => f.value === val) ? p : [{ value: val, via, at: new Date().toLocaleTimeString() }, ...p]));
  };

  const scanImage = async (files) => {
    setBusyNote("Scanning image…"); setError("");
    try {
      await ensureLib();
      const it = await loadImage(files[0]);
      const f = Math.min(1, 2000 / Math.max(it.width, it.height));
      const c = document.createElement("canvas"); c.width = Math.round(it.width * f); c.height = Math.round(it.height * f);
      const x = c.getContext("2d", { willReadFrequently: true }); x.drawImage(it.img, 0, 0, c.width, c.height);
      const code = window.jsQR(x.getImageData(0, 0, c.width, c.height).data, c.width, c.height);
      if (code?.data) remember(code.data, "image");
      else setError("No QR code spotted in that image. Try a closer, straighter, sharper shot of the code.");
      URL.revokeObjectURL(it.url);
    } catch (e) { setError("Could not scan that image."); }
    finally { setBusyNote(""); }
  };

  const startCam = async () => {
    setError("");
    try {
      await ensureLib();
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      setScanning(true);
      requestAnimationFrame(() => {
        const v = videoRef.current;
        if (v) { v.srcObject = stream; v.play().catch(() => {}); }
      });
      const c = document.createElement("canvas");
      timerRef.current = setInterval(() => {
        const v = videoRef.current;
        if (!v || !v.videoWidth) return;
        c.width = v.videoWidth; c.height = v.videoHeight;
        const x = c.getContext("2d", { willReadFrequently: true });
        x.drawImage(v, 0, 0);
        try {
          const code = window.jsQR(x.getImageData(0, 0, c.width, c.height).data, c.width, c.height);
          if (code?.data) { remember(code.data, "camera"); stopCam(); }
        } catch {}
      }, 300);
    } catch { setError("Camera was not allowed. You can still scan by uploading a photo/screenshot of the QR code below."); }
  };

  const isUrl = (v) => /^https?:\/\//i.test(v);
  return (
    <div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black">
            {scanning ? (
              <>
                <video ref={videoRef} muted playsInline className="aspect-[4/3] w-full object-cover" />
                <span className="pointer-events-none absolute left-1/2 top-1/2 h-52 w-52 -translate-x-1/2 -translate-y-1/2 rounded-3xl border-[3px] border-amber-400/90 shadow-[0_0_0_999px_rgba(0,0,0,.38)]" aria-hidden="true" />
                <span className="anim-scan pointer-events-none absolute left-[12%] right-[12%] h-[3px] bg-red-400 shadow-[0_0_14px_rgba(248,113,113,.9)]" aria-hidden="true" />
              </>
            ) : (
              <div className="grid aspect-[4/3] place-items-center p-8 text-center">
                <div>
                  <span className="anim-floaty mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-lime-400/15 text-lime-300"><Icon name="qr" size={30} /></span>
                  <p className="mt-4 font-bold text-white">Point your camera at any QR code</p>
                  <p className="mt-1 text-sm text-slate-400">Or upload a screenshot/photo of a code on the right.</p>
                </div>
              </div>
            )}
          </div>
          <div className="mt-4 flex gap-3">
            {!scanning ? <button onClick={startCam} className={btnP}><Icon name="video" size={17} /> Scan with camera</button>
              : <button onClick={stopCam} className="inline-flex items-center gap-2 rounded-2xl border border-rose-400/40 bg-rose-400/10 px-5 py-3 text-sm font-bold text-rose-300"><Icon name="x" size={16} /> Stop camera</button>}
          </div>
          {scanning && <p className="mt-2 text-xs text-amber-300" role="status">Looking for a QR code… hold it inside the box and keep steady.</p>}
        </div>
        <div>
          <Dropzone accept="image/*" compact onFiles={scanImage} title="…or drop a QR image / screenshot" hint="We read it locally — the image never leaves your device" icon="qr" />
          {busyNote && <p className="mt-2 text-xs text-slate-400">{busyNote}</p>}
          <Alert msg={error} />
          <h2 className="mt-6 text-sm font-bold uppercase tracking-wider text-slate-300">Results</h2>
          {found.length === 0 ? <p className="mt-2 text-sm text-slate-500">Nothing scanned yet this session.</p> : (
            <ul className="mt-3 space-y-2.5">
              {found.map((f) => (
                <li key={f.value} className="rounded-2xl border border-emerald-400/25 bg-emerald-400/[0.05] p-4">
                  <p className="break-all text-sm font-semibold text-white">{f.value}</p>
                  <p className="mt-0.5 text-[11px] text-slate-500">via {f.via} · {f.at}</p>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {isUrl(f.value) && <a href={f.value} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-400 px-3 py-1.5 text-xs font-extrabold text-[#032114]">Open link <Icon name="arrow" size={12} /></a>}
                    <button onClick={async () => { await navigator.clipboard.writeText(f.value); setCopied(f.value); setTimeout(() => setCopied(""), 1500); }} className="inline-flex items-center gap-1.5 rounded-lg bg-white/[0.06] border border-white/10 px-3 py-1.5 text-xs font-semibold text-white"><Icon name={copied === f.value ? "check" : "copy"} size={12} /> {copied === f.value ? "Copied!" : "Copy"}</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-4 rounded-xl border border-white/[0.08] bg-white/[0.02] px-3.5 py-2.5 text-xs leading-relaxed text-slate-400"><strong className="text-slate-200">Stay safe:</strong> always read a scanned link before opening it — genuine payment/menu codes should show a familiar domain, not a random short link.</p>
        </div>
      </div>
    </div>
  );
}
