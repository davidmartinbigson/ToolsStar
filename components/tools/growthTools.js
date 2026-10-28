"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Dropzone from "@/components/Dropzone";
import { Icon } from "@/components/icons";
import { formatBytes, downloadBlob, downloadZip, stripExt, loadImage, renderToBlob, uid } from "@/lib/utils";

const EXT = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
const btnP = "inline-flex items-center gap-2 rounded-2xl bg-amber-400 px-6 py-3 font-extrabold text-[#241a00] shadow-xl shadow-amber-500/20 transition hover:bg-amber-300 disabled:opacity-60";
const btnG = "inline-flex items-center gap-2 rounded-2xl bg-emerald-400 px-6 py-3 font-extrabold text-[#032114] shadow-xl shadow-emerald-500/20 transition hover:bg-emerald-300 disabled:opacity-60";
const btnGhost = "inline-flex items-center gap-1.5 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-slate-300 hover:border-rose-400/40 hover:text-rose-300";
const sel = "mt-2 w-full rounded-xl border border-white/10 bg-[#12152e] px-3 py-2.5 text-sm text-white outline-none focus:border-amber-400/60 disabled:opacity-50";
const inp = "mt-2 w-full rounded-xl border border-white/10 bg-[#12152e] px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-amber-400/60";
function Alert({ msg }) { return msg ? <div className="mt-4 rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-200" role="alert">{msg}</div> : null; }

/* ═══════════════ COMPRESS IMAGE TO EXACT KB ═══════════════ */
async function encode(item, w, h, type, q) {
  return renderToBlob(item.img, { width: w, height: h, type, quality: q, background: type === "image/jpeg" ? "#ffffff" : null });
}
async function searchAtDims(item, w, h, type, target) {
  const hiBlob = await encode(item, w, h, type, 0.92);
  if (hiBlob.size <= target) return { blob: hiBlob, quality: 92, width: w, height: h, fits: true };
  let lo = 0.05, hi = 0.92, best = null, loBlob = await encode(item, w, h, type, lo);
  if (loBlob.size <= target) best = { blob: loBlob, quality: 5, width: w, height: h, fits: true };
  else return { blob: loBlob, quality: 5, width: w, height: h, fits: false };
  for (let i = 0; i < 7; i++) {
    const mid = (lo + hi) / 2;
    const blob = await encode(item, w, h, type, mid);
    if (blob.size <= target) { best = { blob, quality: Math.round(mid * 100), width: w, height: h, fits: true }; lo = mid; } else hi = mid;
  }
  return best;
}
async function fitToTarget(item, type, target) {
  if (type === "image/png") {
    let lo = 0.05, hi = 1, best = null;
    for (let i = 0; i < 8; i++) {
      const mid = (lo + hi) / 2;
      const w = Math.max(24, Math.round(item.width * mid)), h = Math.max(24, Math.round(item.height * mid));
      const blob = await encode(item, w, h, type, 1);
      if (blob.size <= target) { best = { blob, width: w, height: h, quality: 100, fits: true }; lo = mid; } else hi = mid;
    }
    if (best) return best;
    const w = Math.max(24, Math.round(item.width * 0.05)), h = Math.max(24, Math.round(item.height * 0.05));
    return { blob: await encode(item, w, h, type, 1), width: w, height: h, quality: 100, fits: false };
  }
  let w = item.width, h = item.height;
  let res = await searchAtDims(item, w, h, type, target);
  for (let tries = 0; !res.fits && tries < 3; tries++) {
    const f = Math.max(0.12, Math.sqrt(target / res.blob.size) * 0.94);
    w = Math.max(32, Math.round(w * f)); h = Math.max(32, Math.round(h * f));
    res = await searchAtDims(item, w, h, type, target);
  }
  return res;
}

export function TargetKbCompressor() {
  const [items, setItems] = useState([]);
  const [targetKB, setTargetKB] = useState(100);
  const [format, setFormat] = useState("image/jpeg");
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState("");
  const [zipping, setZipping] = useState(false);
  const ref = useRef([]); ref.current = items;

  const add = useCallback(async (files) => {
    const fresh = [];
    for (const file of files.slice(0, 30)) {
      try { fresh.push({ id: uid(), file, ...(await loadImage(file)), status: "ready", result: null }); } catch {}
    }
    setItems((p) => [...p, ...fresh]);
  }, []);

  const run = async () => {
    const target = Math.max(5, +targetKB || 100) * 1024;
    setBusy(true);
    for (const item of ref.current) {
      setItems((p) => p.map((x) => x.id === item.id ? { ...x, status: "working" } : x));
      setStage(`Finding the highest quality that fits ${targetKB} KB for ${item.file.name}…`);
      try {
        const res = await fitToTarget(item, format, target);
        setItems((p) => p.map((x) => x.id === item.id ? { ...x, status: "done", result: { ...res, url: URL.createObjectURL(res.blob), name: `${stripExt(item.file.name)}-${targetKB}kb.${EXT[format]}` } } : x));
      } catch { setItems((p) => p.map((x) => x.id === item.id ? { ...x, status: "error" } : x)); }
    }
    setStage(""); setBusy(false);
  };

  const done = items.filter((i) => i.result);
  return (
    <div>
      <Dropzone accept="image/*" multiple allowPaste compact={items.length > 0} onFiles={add} title={items.length ? "Add more images" : "Drop images to shrink to an exact size"} hint="For job applications, university portals & forms with strict KB limits" icon="gauge" />
      {items.length > 0 && (
        <>
          <div className="mt-6 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
            <label className="text-sm font-semibold text-white">Target file size — each image will be at or below this</label>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {[20, 50, 100, 200, 500, 1024].map((v) => (
                <button key={v} onClick={() => setTargetKB(v)} className={`rounded-full border px-4 py-2 text-sm font-bold ${+targetKB === v ? "border-amber-400 bg-amber-400 text-[#241a00]" : "border-white/10 bg-white/[0.03] text-slate-200"}`}>{v >= 1024 ? "1 MB" : `${v} KB`}</button>
              ))}
              <span className="inline-flex items-center gap-2 text-sm text-slate-400">or custom:
                <input type="number" min="5" max="10240" value={targetKB} onChange={(e) => setTargetKB(e.target.value)} className="w-24 rounded-xl border border-white/10 bg-[#12152e] px-3 py-2 text-white outline-none focus:border-amber-400/60" /> KB
              </span>
              <span className="ml-auto">
                <select value={format} onChange={(e) => setFormat(e.target.value)} className="rounded-xl border border-white/10 bg-[#12152e] px-3 py-2.5 text-sm text-white outline-none focus:border-amber-400/60">
                  <option value="image/jpeg">JPG (forms love this) ★</option><option value="image/webp">WebP</option><option value="image/png">PNG (shrinks by resizing)</option>
                </select>
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-500">Our smart search automatically balances quality and dimensions, testing settings until the file fits — always keeping the best quality allowed by your limit.</p>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button onClick={run} disabled={busy} className={btnP}><Icon name="compress" size={18} /> {busy ? "Fitting…" : `Compress to ${targetKB} KB`}</button>
            {done.length > 1 && <button disabled={zipping} onClick={async () => { setZipping(true); await downloadZip(done.map((d) => ({ blob: d.result.blob, name: d.result.name })), `toolsstars-${targetKB}kb-images.zip`); setZipping(false); }} className={btnG}><Icon name="download" size={17} /> {zipping ? "Zipping…" : "Download all as ZIP"}</button>}
            <button onClick={() => setItems([])} className={btnGhost}><Icon name="trash" size={15} /> Clear</button>
          </div>
          {stage && <p className="mt-3 text-xs text-amber-300" role="status">{stage}</p>}
          <ul className="mt-6 space-y-3">
            {items.map((item) => (
              <li key={item.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-3.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.url} alt={item.file.name} className="h-16 w-16 rounded-xl object-cover checker" />
                <span className="min-w-[170px] flex-1">
                  <span className="block truncate text-sm font-semibold text-white">{item.file.name}</span>
                  <span className="text-xs text-slate-500">{item.width}×{item.height} · {formatBytes(item.file.size)}</span>
                  {item.status === "working" && <span className="block text-xs text-amber-300">Searching for the perfect fit…</span>}
                  {item.status === "error" && <span className="block text-xs text-rose-300">Something went wrong with this file.</span>}
                </span>
                {item.result && (
                  <>
                    <span className="text-right text-sm">
                      <strong className={item.result.fits ? "text-emerald-300" : "text-amber-300"}>{formatBytes(item.result.blob.size)}</strong>
                      <span className="block text-[11px] text-slate-500">{item.result.width}×{item.result.height} · Q{item.result.quality}{item.result.fits ? ` · ≤ ${targetKB} KB ✓` : " · smallest possible"}</span>
                    </span>
                    <button onClick={() => downloadBlob(item.result.blob, item.result.name)} className="inline-flex items-center gap-1.5 rounded-xl bg-white/[0.06] border border-white/10 px-3.5 py-2 text-sm font-semibold text-white hover:border-emerald-400/50"><Icon name="download" size={15} /> Download</button>
                  </>
                )}
                <button onClick={() => setItems((p) => p.filter((x) => x.id !== item.id))} aria-label="Remove" className="rounded-lg p-2 text-slate-500 hover:bg-rose-400/10 hover:text-rose-300"><Icon name="trash" size={16} /></button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

/* ═══════════════ PASSPORT SIZE PHOTO MAKER ═══════════════ */
const SIZES = [
  { id: "eu", label: "35 × 45 mm — UK / EU / Schengen / Visa", w: 35, h: 45 },
  { id: "us", label: "2 × 2 inch (51 × 51 mm) — US / Canada Passport", w: 51, h: 51 },
  { id: "form15", label: "1.5 × 2 inch — Jobs / Forms", w: 38.1, h: 50.8 },
  { id: "cn", label: "33 × 48 mm — China Visa", w: 33, h: 48 },
  { id: "sq", label: "1 × 1 inch — small square", w: 25.4, h: 25.4 },
];
const mmToPx = (mm) => Math.round((mm / 25.4) * 300);

export function PassportPhotoMaker() {
  const [item, setItem] = useState(null);
  const [size, setSize] = useState(SIZES[0]);
  const [bg, setBg] = useState("#ffffff");
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ x: 50, y: 35 });
  const [cutout, setCutout] = useState(null);
  const [aiBusy, setAiBusy] = useState(false);
  const [copies, setCopies] = useState(8);
  const [stage, setStage] = useState("");
  const [error, setError] = useState("");
  const canvasRef = useRef(null);
  const dragRef = useRef(null);

  const W = mmToPx(size.w), H = mmToPx(size.h);
  const draw = useCallback(() => {
    const c = canvasRef.current; if (!c || !item) return;
    const ctx = c.getContext("2d");
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    const img = cutout || item.img;
    const iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
    const sc = Math.max(W / iw, H / ih) * zoom;
    const dw = iw * sc, dh = ih * sc;
    const dx = ((W - dw) * pos.x) / 100, dy = ((H - dh) * pos.y) / 100;
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, dx, dy, dw, dh);
  }, [item, cutout, W, H, zoom, pos, bg]);
  useEffect(draw, [draw]);

  const add = useCallback(async (files) => {
    setError(""); setCutout(null); setZoom(1); setPos({ x: 50, y: 35 });
    try { setItem({ file: files[0], ...(await loadImage(files[0])) }); } catch (e) { setError(e.message); }
  }, []);

  const aiBackground = async () => {
    setAiBusy(true); setError(""); setStage("Loading AI & cutting out your portrait (first time downloads the model)…");
    try {
      let mod;
      try { mod = await import(/* webpackIgnore: true */ "https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.7.0/+esm"); }
      catch { mod = await import(/* webpackIgnore: true */ "https://esm.sh/@imgly/background-removal@1.7.0"); }
      const fn = mod.removeBackground || mod.imglyRemoveBackground || mod.default?.removeBackground || mod.default;
      const blob = await fn(item.file, { model: "small", progress: () => {} });
      const loaded = await loadImage(blob);
      setCutout(loaded.img);
      setStage("Background replaced! Now position your face in the oval, then download.");
    } catch { setError("AI background could not run (model blocked or low memory). No problem — use a plain-wall photo, position it well, and it will still look professional."); setStage(""); }
    finally { setAiBusy(false); }
  };

  const downloadSingle = () => canvasRef.current?.toBlob((b) => downloadBlob(b, `passport-photo-${size.w}x${size.h}mm.jpg`), "image/jpeg", 0.95);

  const downloadSheet = async () => {
    const src = canvasRef.current; if (!src) return;
    // A4 @300dpi
    const SW = 2480, SH = 3508, gap = 36, margin = 90;
    const cols = Math.floor((SW - margin * 2 + gap) / (W + gap));
    const sheet = document.createElement("canvas"); sheet.width = SW; sheet.height = SH;
    const ctx = sheet.getContext("2d");
    ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, SW, SH);
    const blockW = cols * W + (cols - 1) * gap;
    const x0 = (SW - blockW) / 2;
    for (let i = 0; i < copies; i++) {
      const col = i % cols, row = Math.floor(i / cols);
      const x = x0 + col * (W + gap), y = margin + row * (H + gap);
      if (y + H > SH - margin) break;
      ctx.drawImage(src, x, y);
      ctx.strokeStyle = "#cbd5e1"; ctx.lineWidth = 2; ctx.setLineDash([10, 8]); ctx.strokeRect(x, y, W, H);
    }
    sheet.toBlob((b) => downloadBlob(b, `passport-photos-sheet-a4-x${copies}.jpg`), "image/jpeg", 0.92);
  };

  const onPointer = (e, phase) => {
    if (phase === "down") { dragRef.current = { x: e.clientX, y: e.clientY, pos: { ...pos } }; e.currentTarget.setPointerCapture?.(e.pointerId); }
    if (phase === "move" && dragRef.current) {
      const d = dragRef.current;
      setPos({ x: Math.max(0, Math.min(100, d.pos.x + (e.clientX - d.x) / 2.2)), y: Math.max(0, Math.min(100, d.pos.y + (e.clientY - d.y) / 2.2)) });
    }
    if (phase === "up") dragRef.current = null;
  };

  return (
    <div>
      {!item && <Dropzone accept="image/*" onFiles={add} title="Drop your photo — make it passport size" hint="Face the camera, plain light behind you works best" icon="image" />}
      <Alert msg={error} />
      {item && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <div className="relative mx-auto w-fit touch-none overflow-hidden rounded-2xl border-2 border-amber-400/50 shadow-2xl" onPointerDown={(e) => onPointer(e, "down")} onPointerMove={(e) => onPointer(e, "move")} onPointerUp={(e) => onPointer(e, "up")}>
              <canvas ref={canvasRef} width={W} height={H} style={{ width: `${Math.min(340, (340 * W) / H)}px`, height: "auto", display: "block", cursor: "move" }} />
              <span className="pointer-events-none absolute left-1/2 top-[7%] h-[68%] w-[62%] -translate-x-1/2 rounded-[50%] border-2 border-dashed border-amber-300/80" aria-hidden="true" />
            </div>
            <p className="mt-2.5 text-center text-xs text-slate-500">Drag the photo to position it · face inside the oval, eyes on the upper third · {W}×{H}px @300 DPI</p>
            <div className="mt-4 space-y-3">
              {[["Zoom", zoom, (v) => setZoom(v), 1, 3, 0.01], ["Move left ↔ right", pos.x, (v) => setPos({ ...pos, x: v }), 0, 100, 1], ["Move up ↕ down", pos.y, (v) => setPos({ ...pos, y: v }), 0, 100, 1]].map(([l, v, set, mn, mx, st]) => (
                <label key={l} className="flex items-center gap-3 text-sm font-semibold text-white">{l}<input type="range" min={mn} max={mx} step={st} value={v} onChange={(e) => set(+e.target.value)} className="flex-1" /></label>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-white">Official size</label>
            <select value={size.id} onChange={(e) => setSize(SIZES.find((s) => s.id === e.target.value))} className={sel}>
              {SIZES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
            <label className="mt-5 block text-sm font-semibold text-white">Background colour</label>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {[["#ffffff", "White ★"], ["#3b82c4", "Blue"], ["#e8e8e8", "Light grey"], ["#c83737", "Red"]].map(([c, l]) => (
                <button key={c} onClick={() => setBg(c)} className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold ${bg === c ? "border-amber-400 bg-amber-400/15 text-amber-200" : "border-white/10 bg-white/[0.03] text-slate-300"}`}>
                  <span className="h-3.5 w-3.5 rounded-full border border-white/30" style={{ background: c }} />{l}
                </button>
              ))}
              <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} className="h-8 w-10 cursor-pointer rounded-lg border border-white/15 bg-transparent" aria-label="Custom background colour" />
            </div>
            <button onClick={aiBackground} disabled={aiBusy} className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 py-3 font-extrabold text-white shadow-xl shadow-violet-500/20 transition hover:brightness-110 disabled:opacity-60">
              <Icon name="wand" size={17} /> {aiBusy ? "AI working…" : cutout ? "Run AI background again" : "Replace background with AI (studio look)"}
            </button>
            {stage && <p className="mt-2.5 text-xs leading-relaxed text-violet-300" role="status">{stage}</p>}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button onClick={downloadSingle} className={btnP}><Icon name="download" size={17} /> Download photo</button>
              <span className="inline-flex items-center gap-2 text-sm text-slate-300">
                <select value={copies} onChange={(e) => setCopies(+e.target.value)} className="rounded-xl border border-white/10 bg-[#12152e] px-2.5 py-2.5 text-sm text-white outline-none">
                  {[4, 6, 8, 12, 16].map((n) => <option key={n} value={n}>{n} copies</option>)}
                </select>
                <button onClick={downloadSheet} className={btnG}><Icon name="grid" size={16} /> Print sheet (A4)</button>
              </span>
              <button onClick={() => { setItem(null); setCutout(null); }} className={btnGhost}><Icon name="trash" size={15} /> New photo</button>
            </div>
            <div className="mt-6 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 text-xs leading-relaxed text-slate-400">
              <strong className="text-slate-200">Checklist (most applications):</strong> plain background ✓ face clearly visible, mouth closed ✓ no glasses glare / cap ✓ recent photo (last 6 months) ✓. Photo too big for an online form? Shrink it with our <em>Compress Image to 50KB</em> tool next.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════ RESUME / CV MAKER ═══════════════ */
const esc = (s) => String(s || "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const lines = (s) => String(s || "").split("\n").map((x) => x.trim()).filter(Boolean);

/* Eight layouts: three two-column, five single-column. The ATS one deliberately
   drops colour, graphics and the photo because parser software reads plain text
   headings most reliably. */
const CV_TEMPLATES = [
  { id: "modern", name: "Modern Sidebar", hint: "Dark left column, photo on top", group: "Two-column" },
  { id: "sidebar", name: "Clean Sidebar", hint: "Light left column, coloured headings", group: "Two-column" },
  { id: "elegant", name: "Elegant", hint: "Slim colour rail, details on the right", group: "Two-column" },
  { id: "classic", name: "Classic", hint: "Centred header — timeless and safe", group: "Single-column" },
  { id: "professional", name: "Professional", hint: "Name left, contact right, compact", group: "Single-column" },
  { id: "minimal", name: "Minimal", hint: "Serif type, generous white space", group: "Single-column" },
  { id: "creative", name: "Creative", hint: "Bold colour band + skill chips", group: "Single-column" },
  { id: "ats", name: "ATS-Friendly", hint: "Plain black text, parser-safe (no photo)", group: "Single-column" },
];

const CV_COLORS = ["#b45309", "#1d4ed8", "#047857", "#7c3aed", "#be123c", "#0f766e", "#c2410c", "#111827"];
const PHOTO_SHAPES = [["circle", "Circle"], ["rounded", "Rounded"], ["square", "Square"]];
const PHOTO_SIZES = [["sm", "Small"], ["md", "Medium"], ["lg", "Large"]];

function resumeHtml(d, withPrint) {
  const accent = d.color || "#b45309";
  const template = CV_TEMPLATES.some((t) => t.id === d.template) ? d.template : "modern";
  const name = esc(d.name) || "Your Name";
  const title = esc(d.title);
  const photoCls = `photo ${d.photoShape || "circle"} ${d.photoSize || "md"}`;
  const photo = d.photo ? `<img class="${photoCls}" src="${d.photo}" alt="Profile photo"/>` : "";

  const exps = d.experiences.filter((e) => e.title || e.org).map((e) => `<div class="job"><div class="row"><strong>${esc(e.title)}</strong><span>${esc(e.dates)}</span></div><div class="org">${esc(e.org)}</div><p>${lines(e.desc).map((l) => "• " + esc(l)).join("<br>")}</p></div>`).join("");
  const edus = d.education.filter((e) => e.title || e.org).map((e) => `<div class="job"><div class="row"><strong>${esc(e.title)}</strong><span>${esc(e.dates)}</span></div><div class="org">${esc(e.org)}</div><p>${lines(e.desc).map((l) => "• " + esc(l)).join("<br>")}</p></div>`).join("");

  const skillList = lines(d.skills);
  const skillLine = skillList.join(" · ");
  const skillBullets = skillList.map((s) => `<div>• ${esc(s)}</div>`).join("");
  const skillChips = skillList.map((s) => `<span class="chip">${esc(s)}</span>`).join("");
  const langList = lines(d.languages);
  const langLine = langList.join(" · ");
  const langs = langList.map((s) => `<div>• ${esc(s)}</div>`).join("");
  const contactList = [d.email, d.phone, d.city, d.website].filter(Boolean);
  const contact = contactList.map(esc).join(" · ");
  const contactDivs = contactList.map((x) => `<div>${esc(x)}</div>`).join("");
  const summary = d.summary ? `<h2>Profile</h2><p>${esc(d.summary)}</p>` : "";
  const skillsSection = skillLine ? `<h2>Skills</h2><p>${esc(skillLine)}</p>` : "";
  const langsSection = langLine ? `<h2>Languages</h2><p>${esc(langLine)}</p>` : "";

  /* sidebar content reused by modern / sidebar / elegant */
  const asideInner = `${photo}<h3>Contact</h3><div class="side">${contactDivs}</div>${skillBullets ? `<h3>Skills</h3><div class="side">${skillBullets}</div>` : ""}${langs ? `<h3>Languages</h3><div class="side">${langs}</div>` : ""}`;

  let body = "";
  if (template === "modern" || template === "sidebar") {
    body = `<div class="page ${template}"><aside>${asideInner}</aside><main><h1>${name}</h1><div class="title">${title}</div>${summary}<h2>Experience</h2>${exps}<h2>Education</h2>${edus}</main></div>`;
  } else if (template === "elegant") {
    body = `<div class="page elegant"><div class="rail"></div><div class="wrap"><main><h1>${name}</h1><div class="title">${title}</div>${summary}<h2>Experience</h2>${exps}<h2>Education</h2>${edus}</main><aside>${asideInner}</aside></div></div>`;
  } else if (template === "professional") {
    body = `<div class="page professional"><header><div><h1>${name}</h1><div class="title">${title}</div></div><div class="contact">${contactDivs}</div>${photo}</header>${summary}<h2>Experience</h2>${exps}<h2>Education</h2>${edus}${skillsSection}${langsSection}</div>`;
  } else if (template === "minimal") {
    body = `<div class="page minimal"><header>${photo}<h1>${name}</h1><div class="title">${title}</div><div class="contact">${contact}</div></header>${summary}<h2>Experience</h2>${exps}<h2>Education</h2>${edus}${skillsSection}${langsSection}</div>`;
  } else if (template === "creative") {
    body = `<div class="page creative"><div class="band">${photo}<h1>${name}</h1><div class="title">${title}</div><div class="contact">${contact}</div></div><div class="inner">${summary}<h2>Experience</h2>${exps}<h2>Education</h2>${edus}${skillChips ? `<h2>Skills</h2><div class="chips">${skillChips}</div>` : ""}${langList.length ? `<h2>Languages</h2><div class="chips">${langList.map((l) => `<span class="chip">${esc(l)}</span>`).join("")}</div>` : ""}</div></div>`;
  } else if (template === "ats") {
    body = `<div class="page ats"><header><h1>${name}</h1><div class="title">${title}</div><div class="contact">${contact}</div></header>${d.summary ? `<h2>Summary</h2><p>${esc(d.summary)}</p>` : ""}<h2>Work Experience</h2>${exps}<h2>Education</h2>${edus}${skillsSection}${langsSection}</div>`;
  } else {
    body = `<div class="page classic"><header>${photo}<h1>${name}</h1><div class="title">${title}</div><div class="contact">${contact}</div></header>${summary}<h2>Experience</h2>${exps}<h2>Education</h2>${edus}${skillsSection}${langsSection}</div>`;
  }

  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(d.name)} — CV</title><style>
  @page{size:A4;margin:0}*{box-sizing:border-box}body{margin:0;font-family:Arial,Helvetica,sans-serif;color:#1f2430;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  .page{width:210mm;min-height:296mm;margin:0 auto;background:#fff;padding:16mm}
  h1{margin:0;font-size:30px;line-height:1.1}.title{color:${accent};font-weight:700;margin-top:3px;font-size:15px}.contact{color:#555;font-size:12.5px;margin-top:6px;line-height:1.5}
  h2{font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:${accent};border-bottom:2px solid ${accent};padding-bottom:4px;margin:20px 0 10px}
  p{font-size:13px;line-height:1.55;margin:4px 0}.job{margin-bottom:12px}.row{display:flex;justify-content:space-between;gap:10px;font-size:14px}.row span{color:#666;font-size:12px;white-space:nowrap}.org{color:${accent};font-weight:600;font-size:13px}
  header{text-align:center;border-bottom:3px solid ${accent};padding-bottom:12px}header img{margin-bottom:8px}
  .photo{object-fit:cover;display:block;background:#fff}
  .photo.circle{border-radius:50%}.photo.rounded{border-radius:12px}.photo.square{border-radius:0}
  .photo.sm{width:72px;height:72px}.photo.md{width:96px;height:96px}.photo.lg{width:124px;height:124px}
  .chip{display:inline-block;border:1px solid ${accent};color:${accent};border-radius:999px;padding:2px 10px;font-size:11.5px;margin:0 5px 6px 0}
  /* two-column: dark sidebar */
  .modern{display:flex;padding:0}.modern aside{width:62mm;background:#232838;color:#e8eaf6;padding:14mm 9mm;min-height:296mm}.modern aside h3{font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#ffc531;margin:18px 0 8px}.modern aside h3:first-of-type{margin-top:14px}.modern .side{font-size:12.5px;line-height:1.7;word-break:break-word}.modern main{flex:1;padding:16mm 14mm}.modern .photo{margin:0 auto 6px;border:3px solid rgba(255,255,255,.25)}
  /* two-column: light sidebar */
  .sidebar{display:flex;padding:0}.sidebar aside{width:62mm;background:#f4f5f7;color:#2a2f3a;padding:14mm 9mm;min-height:296mm;border-right:1px solid #e3e5ea}.sidebar aside h3{font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:${accent};margin:18px 0 8px}.sidebar aside h3:first-of-type{margin-top:14px}.sidebar .side{font-size:12.5px;line-height:1.7;word-break:break-word}.sidebar main{flex:1;padding:16mm 14mm}.sidebar .photo{margin:0 auto 6px;border:1px solid #dfe2e8}
  /* two-column: accent rail, details right */
  .elegant{display:flex;padding:0}.elegant .rail{width:7mm;background:${accent};min-height:296mm}.elegant .wrap{flex:1;display:flex}.elegant main{flex:1;padding:16mm 10mm 16mm 14mm}.elegant aside{width:52mm;padding:16mm 10mm 16mm 4mm;border-left:1px solid #e6e8ee}.elegant aside h3{font-size:11.5px;letter-spacing:.14em;text-transform:uppercase;color:${accent};margin:16px 0 6px}.elegant .side{font-size:12px;line-height:1.7;word-break:break-word;color:#3a4051}.elegant h1{font-weight:300;font-size:34px;letter-spacing:.02em}.elegant h2{border-bottom:1px solid #d9dce3;color:#1f2430;font-weight:700}.elegant .photo{margin-bottom:8px}
  /* single-column: name left, contact right */
  .professional header{display:flex;align-items:flex-start;gap:14px;text-align:left;border-bottom:2px solid ${accent};padding-bottom:10px}.professional header>div:first-child{flex:1}.professional .contact{text-align:right;margin-top:4px;flex:0 1 auto}.professional .photo{margin-left:auto}.professional h2{margin:16px 0 8px}
  /* single-column: serif */
  .minimal{font-family:Georgia,"Times New Roman",serif}.minimal header{text-align:left;border-bottom:1px solid #ccc;display:flex;align-items:center;gap:14px}.minimal header>img{margin:0}.minimal h2{border-bottom:1px solid #ccc;color:#1f2430}.minimal .title{color:#444}.minimal .org{color:#333}
  /* single-column: colour band */
  .creative{padding:0}.creative .band{background:${accent};color:#fff;padding:13mm 16mm}.creative .band h1{font-size:34px}.creative .band .title{color:#fff;opacity:.92}.creative .band .contact{color:#fff;opacity:.9}.creative .band .photo{float:right;margin:-4mm 0 0 6mm;border:3px solid rgba(255,255,255,.55)}.creative .inner{padding:11mm 16mm 14mm}.creative h2{border-bottom:none;padding-bottom:0;margin:16px 0 8px}.creative .chips{margin-top:2px}
  /* single-column: parser-safe */
  .ats{font-family:"Times New Roman",Times,serif;padding:18mm 20mm}.ats h1{font-size:23px;text-align:center;text-transform:uppercase;letter-spacing:.08em}.ats .title{text-align:center;color:#333;font-weight:400;font-size:14px}.ats .contact{text-align:center;color:#333}.ats header{border-bottom:1px solid #000;padding-bottom:8px}.ats h2{color:#000;border-bottom:1px solid #000;font-size:12px;margin:14px 0 6px}.ats .org{color:#000;font-weight:700}.ats .row span{color:#333}.ats p{font-size:12.5px}
  @media print{body{background:#fff}}
  </style>${withPrint ? "<script>window.onload=function(){setTimeout(function(){window.print()},350)}<\/script>" : ""}</head><body>${body}</body></html>`;
}

const emptyEntry = () => ({ title: "", org: "", dates: "", desc: "" });

const SAMPLE_CV = {
  name: "Ahmed Khan", title: "Sales Officer", email: "ahmedkhan@example.com", phone: "+1 234 567 8900", city: "Your City", website: "",
  summary: "Hardworking and punctual professional with 3 years of experience. Strong communication skills, quick learner, and comfortable with MS Office and field work.",
  skills: "Communication\nMS Excel\nCustomer dealing\nUrdu / English typing", languages: "Urdu (native)\nEnglish (good)",
  experiences: [{ title: "Sales Officer", org: "ABC Traders", dates: "2022 — Present", desc: "Visited 40+ shops weekly and grew area sales by 25%\nPrepared daily sales reports in Excel" }],
  education: [{ title: "Intermediate (Commerce)", org: "Board of Intermediate Education", dates: "2020", desc: "" }],
  color: "#b45309", template: "modern", photo: "", photoShape: "circle", photoSize: "md",
};

const BLANK_CV = {
  name: "", title: "", email: "", phone: "", city: "", website: "", summary: "", skills: "", languages: "",
  experiences: [emptyEntry()], education: [emptyEntry()],
  color: "#b45309", template: "modern", photo: "", photoShape: "circle", photoSize: "md",
};

export function ResumeMaker() {
  const [d, setD] = useState(SAMPLE_CV);
  const [photoNote, setPhotoNote] = useState("");

  // merge over SAMPLE_CV so CVs saved by older versions still get the new fields
  useEffect(() => {
    try {
      const saved = localStorage.getItem("toolsstars-resume");
      if (saved) setD({ ...SAMPLE_CV, ...JSON.parse(saved) });
    } catch {}
  }, []);
  useEffect(() => { try { localStorage.setItem("toolsstars-resume", JSON.stringify(d)); } catch {} }, [d]);

  const set = (k, v) => setD((p) => ({ ...p, [k]: v }));
  const setEntry = (key, i, k, v) => setD((p) => ({ ...p, [key]: p[key].map((e, j) => j === i ? { ...e, [k]: v } : e) }));
  const html = useMemo(() => resumeHtml(d, false), [d]);

  const printPdf = () => {
    const blob = new Blob([resumeHtml(d, true)], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const w = window.open(url, "_blank");
    if (!w) downloadBlob(blob, "my-cv.html");
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  };

  /* Centre-crop to a 400×400 JPEG before storing: keeps the CV sharp at any
     template size while staying far inside the localStorage quota. */
  const onPhoto = async (file) => {
    if (!file) return;
    setPhotoNote("");
    try {
      const loaded = await loadImage(file);
      const blob = await renderToBlob(loaded.img, { width: 400, height: 400, type: "image/jpeg", quality: 0.88, background: "#ffffff", fit: "cover" });
      URL.revokeObjectURL(loaded.url);
      const reader = new FileReader();
      reader.onload = () => { set("photo", reader.result); setPhotoNote("Photo added — cropped to a square and resized so your CV saves instantly."); };
      reader.readAsDataURL(blob);
    } catch {
      setPhotoNote("That image could not be opened. Please use a JPG or PNG photo.");
    }
  };

  const renderField = (label, k) => (
    <label className="block" key={k}>
      <span className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</span>
      <input value={d[k]} onChange={(e) => set(k, e.target.value)} className={inp} />
    </label>
  );

  const renderEntries = (title, keyName) => (
    <fieldset className="mt-5">
      <legend className="text-sm font-bold text-white">{title}</legend>
      {d[keyName].map((e, i) => (
        <div key={i} className="mt-3 grid gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-3.5 sm:grid-cols-2">
          <input value={e.title} onChange={(ev) => setEntry(keyName, i, "title", ev.target.value)} placeholder={keyName === "education" ? "Degree (e.g. BS Computer Science)" : "Job title"} className={inp} />
          <input value={e.org} onChange={(ev) => setEntry(keyName, i, "org", ev.target.value)} placeholder={keyName === "education" ? "University / Board" : "Company, City"} className={inp} />
          <input value={e.dates} onChange={(ev) => setEntry(keyName, i, "dates", ev.target.value)} placeholder="Dates (e.g. 2021 — 2024)" className={inp} />
          <span className="flex items-end justify-end"><button onClick={() => setD((p) => ({ ...p, [keyName]: p[keyName].filter((_, j) => j !== i) }))} className="rounded-lg p-2 text-slate-500 hover:text-rose-300" aria-label="Remove entry"><Icon name="trash" size={16} /></button></span>
          <textarea value={e.desc} onChange={(ev) => setEntry(keyName, i, "desc", ev.target.value)} rows={3} placeholder="Achievements — one per line" className={`${inp} sm:col-span-2`} />
        </div>
      ))}
      <button onClick={() => setD((p) => ({ ...p, [keyName]: [...p[keyName], emptyEntry()] }))} className="mt-2.5 rounded-xl border border-amber-400/40 bg-amber-400/10 px-3.5 py-2 text-sm font-bold text-amber-200">+ Add {title.toLowerCase()}</button>
    </fieldset>
  );

  const groups = ["Two-column", "Single-column"];

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <div>
        <div className="grid gap-3 sm:grid-cols-2">
          {[["Full name","name"],["Job title","title"],["Email","email"],["Phone","phone"],["City","city"],["LinkedIn / Website (optional)","website"]].map(([l,k])=>renderField(l,k))}
        </div>
        <label className="mt-4 block"><span className="text-xs font-bold uppercase tracking-wide text-slate-400">Profile summary</span>
          <textarea value={d.summary} onChange={(e) => set("summary", e.target.value)} rows={3} className={inp} /></label>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block"><span className="text-xs font-bold uppercase tracking-wide text-slate-400">Skills (one per line)</span><textarea value={d.skills} onChange={(e) => set("skills", e.target.value)} rows={4} className={inp} /></label>
          <label className="block"><span className="text-xs font-bold uppercase tracking-wide text-slate-400">Languages (one per line)</span><textarea value={d.languages} onChange={(e) => set("languages", e.target.value)} rows={4} className={inp} /></label>
        </div>
        {renderEntries("Experience", "experiences")}
        {renderEntries("Education", "education")}

        {/* ── template gallery ── */}
        <fieldset className="mt-6">
          <legend className="text-sm font-bold text-white">Choose a template <span className="font-normal text-slate-500">({CV_TEMPLATES.length} designs)</span></legend>
          {groups.map((group) => (
            <div key={group} className="mt-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{group}</p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {CV_TEMPLATES.filter((t) => t.group === group).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => set("template", t.id)}
                    aria-pressed={d.template === t.id}
                    className={`rounded-2xl border px-3.5 py-2.5 text-left transition ${d.template === t.id ? "border-amber-400 bg-amber-400/10 text-white" : "border-white/10 bg-white/[0.02] text-slate-300 hover:border-white/25"}`}
                  >
                    <span className="block text-sm font-bold">{t.name}{d.template === t.id && <span className="ml-1.5 text-amber-300">✓</span>}</span>
                    <span className="mt-0.5 block text-[11px] leading-snug text-slate-500">{t.hint}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </fieldset>

        {/* ── photo ── */}
        <fieldset className="mt-6">
          <legend className="text-sm font-bold text-white">Photo <span className="font-normal text-slate-500">(optional)</span></legend>
          <div className="mt-3 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
            <div className="flex flex-wrap items-center gap-4">
              <span className="grid h-[76px] w-[76px] shrink-0 place-items-center overflow-hidden rounded-2xl border border-white/10 bg-[#12152e]">
                {d.photo
                  ? /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={d.photo} alt="Your CV photo" className="h-full w-full object-cover" />
                  : <Icon name="image" size={24} className="text-slate-600" />}
              </span>
              <div className="min-w-[200px] flex-1">
                <input type="file" accept="image/*" onChange={(e) => onPhoto(e.target.files?.[0])} aria-label="Upload your photo" className="block w-full text-xs text-slate-400 file:mr-2 file:rounded-lg file:border-0 file:bg-amber-400 file:px-3 file:py-2 file:font-bold file:text-[#241a00]" />
                <div className="mt-2.5 flex flex-wrap gap-3">
                  <span className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Shape</span>
                    {PHOTO_SHAPES.map(([v, l]) => (
                      <button key={v} type="button" onClick={() => set("photoShape", v)} aria-pressed={d.photoShape === v} className={`rounded-lg border px-2 py-1 text-[11px] font-bold transition ${d.photoShape === v ? "border-amber-400 bg-amber-400/10 text-white" : "border-white/10 text-slate-400 hover:border-white/25"}`}>{l}</button>
                    ))}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Size</span>
                    {PHOTO_SIZES.map(([v, l]) => (
                      <button key={v} type="button" onClick={() => set("photoSize", v)} aria-pressed={d.photoSize === v} className={`rounded-lg border px-2 py-1 text-[11px] font-bold transition ${d.photoSize === v ? "border-amber-400 bg-amber-400/10 text-white" : "border-white/10 text-slate-400 hover:border-white/25"}`}>{l}</button>
                    ))}
                  </span>
                </div>
              </div>
              {d.photo && (
                <button type="button" onClick={() => { set("photo", ""); setPhotoNote(""); }} className="rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-slate-300 transition hover:border-rose-400/40 hover:text-rose-300">
                  <Icon name="trash" size={14} /> Remove
                </button>
              )}
            </div>
            {photoNote && <p className="mt-2.5 text-xs text-emerald-300" role="status">{photoNote}</p>}
            <p className="mt-2.5 text-xs leading-relaxed text-slate-500">
              Photos are cropped to a square and resized on your device before they are stored, so your CV keeps auto-saving instantly. The <strong className="text-slate-300">ATS-Friendly</strong> template leaves the photo out on purpose — applicant-tracking software reads text, not images.
            </p>
          </div>
        </fieldset>

        {/* ── accent colour ── */}
        <div className="mt-5">
          <span className="text-xs font-bold uppercase tracking-wide text-slate-400">Accent colour</span>
          <span className="mt-2 flex flex-wrap gap-2">
            {CV_COLORS.map((c) => (
              <button key={c} type="button" onClick={() => set("color", c)} aria-label={`Accent colour ${c}`} aria-pressed={d.color === c} className={`h-8 w-8 rounded-full border-2 transition ${d.color === c ? "scale-110 border-amber-300" : "border-white/20"}`} style={{ background: c }} />
            ))}
          </span>
          {d.template === "ats" && <p className="mt-2 text-xs text-slate-500">The ATS template stays black-and-white by design; this colour applies to the other seven templates.</p>}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button onClick={printPdf} className={btnP}><Icon name="pdf" size={17} /> Download PDF (Print → Save as PDF)</button>
          <button onClick={() => downloadBlob(new Blob([resumeHtml(d, false)], { type: "text/html" }), "my-cv.html")} className={btnGhost}><Icon name="download" size={15} /> Save as HTML</button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={() => setD({ ...SAMPLE_CV, photo: d.photo })} className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-bold text-slate-300 transition hover:border-amber-400/50"><Icon name="refresh" size={13} /> Load sample CV</button>
          <button type="button" onClick={() => setD({ ...BLANK_CV })} className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-bold text-slate-300 transition hover:border-rose-400/40 hover:text-rose-300"><Icon name="trash" size={13} /> Clear everything</button>
        </div>
        <p className="mt-2.5 text-xs text-slate-500">Your CV auto-saves in this browser only. Tip: many employers prefer no photo unless asked — keep it optional.</p>
      </div>
      <div className="xl:sticky xl:top-24 h-fit">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Live A4 preview</p>
          <p className="text-xs text-slate-500">{CV_TEMPLATES.find((t) => t.id === d.template)?.name}</p>
        </div>
        <iframe title="CV preview" srcDoc={html} className="h-[760px] w-full rounded-2xl border border-white/12 bg-white shadow-2xl" />
      </div>
    </div>
  );
}
