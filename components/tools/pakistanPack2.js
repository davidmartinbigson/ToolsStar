"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Dropzone from "@/components/Dropzone";
import { Icon } from "@/components/icons";
import { formatBytes, downloadBlob, loadImage, stripExt, uid } from "@/lib/utils";

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

function ResultBox({ title, detail, onDownload, label = "Download" }) {
  return (
    <div className="mt-6 flex flex-wrap items-center gap-4 rounded-2xl border border-emerald-400/25 bg-emerald-400/[0.06] p-4" role="status">
      <span className="grid h-11 w-11 place-items-center rounded-full bg-emerald-400/15 text-emerald-300"><Icon name="check" size={22} /></span>
      <p className="min-w-[190px] flex-1 text-sm text-white"><strong>{title}</strong>{detail ? <span className="block text-slate-400">{detail}</span> : null}</p>
      <button type="button" onClick={onDownload} className={btnGreen}><Icon name="download" size={17} /> {label}</button>
    </div>
  );
}

/* ═════════════════ CNIC FRONT & BACK PDF MAKER ═════════════════ */
const CARD_W = 1012;
const CARD_H = 638;

function drawCnicSide(canvas, side) {
  if (!canvas || !side?.img) return;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, CARD_W, CARD_H);

  const img = side.img;
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  const rotation = ((side.rotation % 360) + 360) % 360;
  const swapped = rotation === 90 || rotation === 270;
  const source = document.createElement("canvas");
  source.width = swapped ? ih : iw;
  source.height = swapped ? iw : ih;
  const sctx = source.getContext("2d");
  sctx.translate(source.width / 2, source.height / 2);
  sctx.rotate((rotation * Math.PI) / 180);
  sctx.drawImage(img, -iw / 2, -ih / 2, iw, ih);

  const scale = side.fit === "cover"
    ? Math.max(CARD_W / source.width, CARD_H / source.height)
    : Math.min(CARD_W / source.width, CARD_H / source.height);
  const dw = source.width * scale;
  const dh = source.height * scale;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  try { ctx.filter = side.enhance ? "contrast(1.09) brightness(1.035) saturate(0.97)" : "none"; } catch {}
  ctx.drawImage(source, (CARD_W - dw) / 2, (CARD_H - dh) / 2, dw, dh);
  try { ctx.filter = "none"; } catch {}
}

function CnicSideEditor({ title, step, side, onChange, canvasRef }) {
  useEffect(() => { drawCnicSide(canvasRef.current, side); }, [canvasRef, side]);

  const add = useCallback(async (files) => {
    const file = files?.[0];
    if (!file) return;
    const loaded = await loadImage(file);
    onChange({ file, ...loaded, rotation: 0, fit: "contain", enhance: true });
  }, [onChange]);

  return (
    <section className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-4 sm:p-5" aria-label={title}>
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-amber-400 text-sm font-extrabold text-[#241a00]">{step}</span>
        <div>
          <h2 className="font-extrabold text-white">{title}</h2>
          <p className="text-xs text-slate-500">{side ? `${side.file.name} · ${formatBytes(side.file.size)}` : "Add a clear photo or scan"}</p>
        </div>
        {side && <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-emerald-400/10 px-2.5 py-1 text-[11px] font-bold text-emerald-300"><Icon name="check" size={12} /> Added</span>}
      </div>

      {!side ? (
        <div className="mt-4">
          <Dropzone accept="image/*" compact onFiles={add} title={`Add CNIC ${title.toLowerCase()}`} hint="Keep all four corners visible; avoid flash glare" icon="card" />
        </div>
      ) : (
        <>
          <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-white shadow-lg">
            <canvas ref={canvasRef} width={CARD_W} height={CARD_H} className="block aspect-[85.6/54] w-full" aria-label={`${title} preview`} />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={() => onChange({ ...side, rotation: side.rotation - 90 })} className={btnSmall}><span aria-hidden="true">↺</span> Rotate left</button>
            <button type="button" onClick={() => onChange({ ...side, rotation: side.rotation + 90 })} className={btnSmall}><span aria-hidden="true">↻</span> Rotate right</button>
            <button type="button" onClick={() => onChange(null)} className={`${btnSmall} ml-auto hover:border-rose-400/50 hover:text-rose-300`}><Icon name="trash" size={13} /> Replace</button>
          </div>

          <p className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-400">How should the photo fit?</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <button type="button" onClick={() => onChange({ ...side, fit: "contain" })} className={`rounded-xl border px-3 py-2.5 text-left ${side.fit === "contain" ? "border-amber-400 bg-amber-400/10" : "border-white/10 bg-white/[0.02]"}`} aria-pressed={side.fit === "contain"}>
              <span className="block text-sm font-bold text-white">Show full card ★</span><span className="text-xs text-slate-500">Nothing is cut or stretched</span>
            </button>
            <button type="button" onClick={() => onChange({ ...side, fit: "cover" })} className={`rounded-xl border px-3 py-2.5 text-left ${side.fit === "cover" ? "border-amber-400 bg-amber-400/10" : "border-white/10 bg-white/[0.02]"}`} aria-pressed={side.fit === "cover"}>
              <span className="block text-sm font-bold text-white">Fill card box</span><span className="text-xs text-slate-500">Neat edges; outside parts may crop</span>
            </button>
          </div>
          <label className="mt-3 flex items-center gap-2.5 text-sm text-slate-300">
            <input type="checkbox" checked={side.enhance} onChange={(e) => onChange({ ...side, enhance: e.target.checked })} className="h-4 w-4" />
            Make it a little clearer
          </label>
        </>
      )}
    </section>
  );
}

export function CnicPdfMaker() {
  const [front, setFront] = useState(null);
  const [back, setBack] = useState(null);
  const [layout, setLayout] = useState("one-page");
  const [printSize, setPrintSize] = useState("actual");
  const [showLabels, setShowLabels] = useState(true);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const frontRef = useRef(null);
  const backRef = useRef(null);

  const build = async () => {
    if (!front || !back) { setError("Add both the front and back photos first."); return; }
    setBusy(true); setError(""); setResult(null);
    try {
      drawCnicSide(frontRef.current, front);
      drawCnicSide(backRef.current, back);
      if (!frontRef.current || !backRef.current) throw new Error("Preview is not ready");
      const { jsPDF } = await import("jspdf");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
      const scale = printSize === "large" ? 1.25 : 1;
      const cardW = 85.6 * scale;
      const cardH = 53.98 * scale;
      const x = (210 - cardW) / 2;
      const frontUrl = frontRef.current.toDataURL("image/jpeg", 0.92);
      const backUrl = backRef.current.toDataURL("image/jpeg", 0.92);

      const addCard = (image, y, label) => {
        if (showLabels) {
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(11);
          pdf.setTextColor(70, 76, 88);
          pdf.text(label, 105, y - 4, { align: "center" });
        }
        pdf.addImage(image, "JPEG", x, y, cardW, cardH);
        pdf.setDrawColor(170, 176, 188);
        pdf.setLineWidth(0.25);
        pdf.rect(x, y, cardW, cardH);
      };

      if (layout === "one-page") {
        addCard(frontUrl, 35, "CNIC — FRONT");
        addCard(backUrl, 35 + cardH + 31, "CNIC — BACK");
      } else {
        addCard(frontUrl, 58, "CNIC — FRONT");
        pdf.addPage("a4", "portrait");
        addCard(backUrl, 58, "CNIC — BACK");
      }
      const blob = pdf.output("blob");
      setResult({ blob, pages: layout === "one-page" ? 1 : 2 });
    } catch (error) {
      console.error(error);
      setError("Could not make the PDF. Try smaller photos or a desktop browser if this phone is low on memory.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="rounded-2xl border border-amber-400/25 bg-amber-400/[0.07] px-4 py-3 text-sm leading-relaxed text-amber-100">
        <strong>Private by design:</strong> CNIC photos are sensitive. They are processed only in this browser tab and are never uploaded to Tools Stars.
      </div>
      <Alert msg={error} />
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <CnicSideEditor title="Front side" step="1" side={front} onChange={(side) => { setFront(side); setResult(null); }} canvasRef={frontRef} />
        <CnicSideEditor title="Back side" step="2" side={back} onChange={(side) => { setBack(side); setResult(null); }} canvasRef={backRef} />
      </div>

      <section className="mt-6 rounded-3xl border border-white/[0.08] bg-white/[0.02] p-5" aria-label="PDF settings">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-amber-400 text-sm font-extrabold text-[#241a00]">3</span>
          <h2 className="font-extrabold text-white">Choose the A4 PDF layout</h2>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <button type="button" onClick={() => setLayout("one-page")} className={`${choiceBase} ${layout === "one-page" ? choiceOn : choiceOff}`} aria-pressed={layout === "one-page"}>
            <span className="block font-bold">Front & back on one A4 page ★</span><span className="text-xs text-slate-500">Most common for forms, jobs and photocopies</span>
          </button>
          <button type="button" onClick={() => setLayout("two-pages")} className={`${choiceBase} ${layout === "two-pages" ? choiceOn : choiceOff}`} aria-pressed={layout === "two-pages"}>
            <span className="block font-bold">One side per page</span><span className="text-xs text-slate-500">Choose this only if the portal asks for separate pages</span>
          </button>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="cnic-size" className={labelCls}>Print size</label>
            <select id="cnic-size" value={printSize} onChange={(e) => setPrintSize(e.target.value)} className={selectCls}>
              <option value="actual">Actual CNIC size — 85.6 × 54 mm ★</option>
              <option value="large">Large & easy to read — 125%</option>
            </select>
          </div>
          <label className="flex items-start gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.02] px-4 py-3 text-sm text-slate-300 sm:mt-6">
            <input type="checkbox" checked={showLabels} onChange={(e) => setShowLabels(e.target.checked)} className="mt-0.5 h-4 w-4" />
            <span><strong className="text-white">Print “FRONT” and “BACK” labels</strong><span className="block text-xs text-slate-500">Helpful when submitting printed copies.</span></span>
          </label>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button type="button" onClick={build} disabled={busy || !front || !back} className={btnPrimary}><Icon name="pdf" size={18} /> {busy ? "Making PDF…" : "Make CNIC PDF"}</button>
          {!front || !back ? <span className="text-sm text-slate-500">Add both sides to enable the button.</span> : <span className="text-sm text-emerald-300">Both sides ready ✓</span>}
        </div>
      </section>
      {result && <ResultBox title="CNIC PDF ready" detail={`${result.pages} A4 page${result.pages === 1 ? "" : "s"} · ${formatBytes(result.blob.size)} · print at 100% / Actual size`} onDownload={() => downloadBlob(result.blob, "cnic-front-back.pdf")} label="Download CNIC PDF" />}
    </div>
  );
}

/* ═════════════════ SIGNATURE RESIZER / TRANSPARENT MAKER ═════════════════ */
const INK_COLORS = {
  original: null,
  black: [17, 24, 39],
  blue: [30, 64, 175],
  navy: [23, 37, 84],
};

function makeSignatureCanvas(item, { strength, ink, padding, outputWidth, exactMode, exactW, exactH, background }) {
  const maxSource = 1800;
  const sourceScale = Math.min(1, maxSource / Math.max(item.width, item.height));
  const sw = Math.max(1, Math.round(item.width * sourceScale));
  const sh = Math.max(1, Math.round(item.height * sourceScale));
  const source = document.createElement("canvas");
  source.width = sw; source.height = sh;
  const sctx = source.getContext("2d", { willReadFrequently: true });
  sctx.drawImage(item.img, 0, 0, sw, sh);
  const imageData = sctx.getImageData(0, 0, sw, sh);
  const data = imageData.data;
  const whitePoint = 252 - strength * 0.62;
  const blackPoint = 45 + strength * 0.72;
  const range = Math.max(25, whitePoint - blackPoint);
  const recolor = INK_COLORS[ink];
  let minX = sw, minY = sh, maxX = -1, maxY = -1;

  for (let y = 0; y < sh; y += 1) {
    for (let x = 0; x < sw; x += 1) {
      const i = (y * sw + x) * 4;
      const originalAlpha = data[i + 3] / 255;
      const lightestChannel = Math.min(data[i], data[i + 1], data[i + 2]);
      let alpha = (whitePoint - lightestChannel) / range;
      alpha = Math.max(0, Math.min(1, alpha));
      alpha = Math.pow(alpha, 0.86) * originalAlpha;
      if (alpha < 0.035) alpha = 0;
      data[i + 3] = Math.round(alpha * 255);
      if (recolor && alpha > 0) { data[i] = recolor[0]; data[i + 1] = recolor[1]; data[i + 2] = recolor[2]; }
      if (alpha > 0.04) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0) throw new Error("No dark ink was found. Use a darker pen, better light, or lower the background-removal strength.");
  sctx.putImageData(imageData, 0, 0);

  const pad = Math.round((padding / 100) * Math.max(maxX - minX + 1, maxY - minY + 1));
  const cropX = Math.max(0, minX - pad);
  const cropY = Math.max(0, minY - pad);
  const cropW = Math.min(sw - cropX, maxX - minX + 1 + pad * 2);
  const cropH = Math.min(sh - cropY, maxY - minY + 1 + pad * 2);
  const cropped = document.createElement("canvas");
  cropped.width = cropW; cropped.height = cropH;
  cropped.getContext("2d").drawImage(source, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

  const outW = exactMode ? Math.max(20, Number(exactW) || 500) : Math.max(40, Number(outputWidth) || 600);
  const outH = exactMode ? Math.max(20, Number(exactH) || 200) : Math.max(20, Math.round(outW * (cropH / cropW)));
  const output = document.createElement("canvas");
  output.width = outW; output.height = outH;
  const ctx = output.getContext("2d");
  if (background !== "transparent") { ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, outW, outH); }
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  const scale = Math.min(outW / cropW, outH / cropH);
  const dw = Math.max(1, Math.round(cropW * scale));
  const dh = Math.max(1, Math.round(cropH * scale));
  ctx.drawImage(cropped, Math.round((outW - dw) / 2), Math.round((outH - dh) / 2), dw, dh);
  return { canvas: output, cropW, cropH, outW, outH };
}

export function SignatureResizer() {
  const [item, setItem] = useState(null);
  const [strength, setStrength] = useState(58);
  const [ink, setInk] = useState("original");
  const [padding, setPadding] = useState(5);
  const [outputWidth, setOutputWidth] = useState(600);
  const [exactMode, setExactMode] = useState(false);
  const [exactW, setExactW] = useState(500);
  const [exactH, setExactH] = useState(200);
  const [background, setBackground] = useState("transparent");
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const resultUrlRef = useRef("");

  const add = useCallback(async (files) => {
    const file = files?.[0];
    if (!file) return;
    setError(""); setResult(null);
    try { setItem({ file, ...(await loadImage(file)) }); }
    catch { setError("Could not read that image. Try a JPG or PNG photo of the signature."); }
  }, []);

  useEffect(() => {
    if (!item) return undefined;
    setBusy(true);
    const timer = setTimeout(() => {
      try {
        const made = makeSignatureCanvas(item, { strength, ink, padding, outputWidth, exactMode, exactW, exactH, background });
        const type = background === "white-jpg" ? "image/jpeg" : "image/png";
        made.canvas.toBlob((blob) => {
          if (!blob) { setError("This browser could not export the signature image."); setBusy(false); return; }
          if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
          const url = URL.createObjectURL(blob);
          resultUrlRef.current = url;
          setResult({ ...made, blob, url, ext: type === "image/jpeg" ? "jpg" : "png" });
          setError("");
          setBusy(false);
        }, type, 0.95);
      } catch (error) {
        setResult(null);
        setError(error.message);
        setBusy(false);
      }
    }, 160);
    return () => clearTimeout(timer);
  }, [item, strength, ink, padding, outputWidth, exactMode, exactW, exactH, background]);

  useEffect(() => () => { if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current); }, []);

  return (
    <div>
      {!item && <Dropzone accept="image/*" onFiles={add} title="Drop a photo of your signature" hint="Best result: dark pen on plain white paper, photographed straight-on" icon="pen" />}
      <Alert msg={error} />
      {item && (
        <div className="grid gap-6 lg:grid-cols-[1fr_390px] lg:items-start">
          <div>
            <div className="grid gap-4 sm:grid-cols-2">
              <figure className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.url} alt="Original signature" className="h-52 w-full bg-white object-contain" />
                <figcaption className="px-3 py-2 text-xs text-slate-400">Original · {item.width}×{item.height} · {formatBytes(item.file.size)}</figcaption>
              </figure>
              <figure className="overflow-hidden rounded-2xl border border-emerald-400/25 bg-white/[0.02]">
                {result ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={result.url} alt="Processed transparent signature" className="checker h-52 w-full object-contain" />
                ) : <div className="grid h-52 place-items-center text-sm text-slate-500">{busy ? "Removing paper…" : "Preview will appear here"}</div>}
                <figcaption className="px-3 py-2 text-xs text-slate-400">{result ? `Result · ${result.outW}×${result.outH} · ${formatBytes(result.blob.size)}` : "Result preview"}</figcaption>
              </figure>
            </div>
            <div className="mt-4 rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.05] px-4 py-3 text-sm leading-relaxed text-cyan-100">
              <strong>Quick fix:</strong> if grey paper is still visible, increase strength. If thin pen strokes disappear, decrease it.
            </div>
            <button type="button" onClick={() => { setItem(null); setResult(null); }} className={`${btnGhost} mt-4`}><Icon name="trash" size={15} /> Use another photo</button>
          </div>

          <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-5">
            <label htmlFor="sig-strength" className="flex justify-between text-sm font-semibold text-white">Remove white paper <span className="text-amber-300">{strength}%</span></label>
            <input id="sig-strength" type="range" min="10" max="95" value={strength} onChange={(e) => setStrength(Number(e.target.value))} className="mt-3 w-full" />
            <div className="flex justify-between text-[11px] text-slate-500"><span>Keep faint ink</span><span>Remove more paper</span></div>

            <p className="mt-6 text-sm font-semibold text-white">Ink colour</p>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {[["original", "Original"], ["black", "Black"], ["blue", "Blue"], ["navy", "Navy"]].map(([value, label]) => (
                <button key={value} type="button" onClick={() => setInk(value)} className={`rounded-xl border px-2 py-2 text-xs font-bold ${ink === value ? "border-amber-400 bg-amber-400/10 text-white" : "border-white/10 bg-white/[0.02] text-slate-300"}`} aria-pressed={ink === value}>{label}</button>
              ))}
            </div>

            <label htmlFor="sig-padding" className="mt-6 flex justify-between text-sm font-semibold text-white">Space around signature <span className="text-amber-300">{padding}%</span></label>
            <input id="sig-padding" type="range" min="0" max="25" value={padding} onChange={(e) => setPadding(Number(e.target.value))} className="mt-3 w-full" />

            <label htmlFor="sig-background" className="mt-6 block text-sm font-semibold text-white">Output background</label>
            <select id="sig-background" value={background} onChange={(e) => setBackground(e.target.value)} className={selectCls}>
              <option value="transparent">Transparent PNG ★ — paste onto documents</option>
              <option value="white-png">White PNG</option>
              <option value="white-jpg">White JPG — many forms prefer this</option>
            </select>

            <label className="mt-5 flex items-start gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.02] px-4 py-3 text-sm text-slate-300">
              <input type="checkbox" checked={exactMode} onChange={(e) => setExactMode(e.target.checked)} className="mt-0.5 h-4 w-4" />
              <span><strong className="text-white">Exact form size</strong><span className="block text-xs text-slate-500">The signature is fitted inside the box — never stretched.</span></span>
            </label>
            {!exactMode ? (
              <div>
                <label htmlFor="sig-width" className="mt-5 flex justify-between text-sm font-semibold text-white">Output width <span className="text-amber-300">{outputWidth}px</span></label>
                <input id="sig-width" type="range" min="150" max="1500" step="10" value={outputWidth} onChange={(e) => setOutputWidth(Number(e.target.value))} className="mt-3 w-full" />
                <div className="mt-2 flex gap-2">{[300, 500, 800, 1200].map((w) => <button key={w} type="button" onClick={() => setOutputWidth(w)} className={btnSmall}>{w}px</button>)}</div>
              </div>
            ) : (
              <div className="mt-5">
                <div className="grid grid-cols-2 gap-3">
                  <div><label htmlFor="sig-exact-w" className="text-sm font-semibold text-white">Width (px)</label><input id="sig-exact-w" type="number" min="20" max="4000" value={exactW} onChange={(e) => setExactW(e.target.value)} className={inputCls} /></div>
                  <div><label htmlFor="sig-exact-h" className="text-sm font-semibold text-white">Height (px)</label><input id="sig-exact-h" type="number" min="20" max="4000" value={exactH} onChange={(e) => setExactH(e.target.value)} className={inputCls} /></div>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">{[["140×60", 140, 60], ["300×120", 300, 120], ["500×200", 500, 200]].map(([label, w, h]) => <button key={label} type="button" onClick={() => { setExactW(w); setExactH(h); }} className={btnSmall}>{label}</button>)}</div>
              </div>
            )}

            <button type="button" disabled={!result || busy} onClick={() => downloadBlob(result.blob, `${stripExt(item.file.name)}-signature.${result.ext}`)} className={`${btnGreen} mt-6 w-full justify-center`}>
              <Icon name="download" size={17} /> {busy ? "Processing…" : `Download signature${result ? ` (${formatBytes(result.blob.size)})` : ""}`}
            </button>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">Need a strict KB limit too? Download this first, then use Compress Image to KB if the form still rejects it.</p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═════════════════ COMPRESS PDF TO EXACT KB ═════════════════ */
let _pdfLib = null;
async function loadPdfLib() {
  if (_pdfLib) return _pdfLib;
  _pdfLib = await import(/* webpackIgnore: true */ "https://esm.sh/pdf-lib@1.17.1");
  return _pdfLib;
}
let _pdfjs = null;
async function loadPdfjs() {
  if (_pdfjs) return _pdfjs;
  const lib = await import(/* webpackIgnore: true */ "https://esm.sh/pdfjs-dist@4.8.69");
  lib.GlobalWorkerOptions.workerSrc = "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.8.69/build/pdf.worker.min.mjs";
  _pdfjs = lib;
  return lib;
}
const canvasBlob = (canvas, type, quality) => new Promise((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Image export failed")), type, quality));

export function CompressPdfToKb() {
  const [item, setItem] = useState(null);
  const [targetKB, setTargetKB] = useState(200);
  const [allowGray, setAllowGray] = useState(true);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(null);
  const [stage, setStage] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const add = useCallback(async (files) => {
    const file = files?.[0];
    if (!file) return;
    setError(""); setResult(null); setProgress(null);
    try {
      const { PDFDocument } = await loadPdfLib();
      const bytes = new Uint8Array(await file.arrayBuffer());
      const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      setItem({ file, bytes, pages: doc.getPageCount() });
      if (doc.getPageCount() > 30) setError("This exact-size tool supports up to 30 pages so phones do not run out of memory. For a longer PDF, use Compress PDF or split it first.");
    } catch {
      setItem(null);
      setError("Could not read this PDF. It may be password-protected or corrupted.");
    }
  }, []);

  const run = async () => {
    if (!item || item.pages > 30) return;
    const kb = Math.round(Number(targetKB));
    if (!Number.isFinite(kb) || kb < 20 || kb > 20480) { setError("Choose a target between 20 KB and 20 MB."); return; }
    const target = kb * 1024;
    if (item.file.size <= target) {
      setResult({ blob: item.file, fits: true, original: true, setting: "Original kept" });
      setStage("Your PDF is already within the target, so the original is best.");
      return;
    }

    const settings = [
      { dpi: 170, q: 0.84, gray: false, label: "170 DPI, high quality" },
      { dpi: 150, q: 0.76, gray: false, label: "150 DPI, balanced" },
      { dpi: 130, q: 0.68, gray: false, label: "130 DPI" },
      { dpi: 110, q: 0.58, gray: false, label: "110 DPI" },
      { dpi: 95, q: 0.50, gray: false, label: "95 DPI" },
      { dpi: 80, q: 0.43, gray: false, label: "80 DPI" },
      { dpi: 68, q: 0.37, gray: allowGray, label: allowGray ? "68 DPI, greyscale" : "68 DPI" },
      { dpi: 58, q: 0.31, gray: allowGray, label: allowGray ? "58 DPI, greyscale" : "58 DPI" },
      { dpi: 50, q: 0.26, gray: allowGray, label: allowGray ? "50 DPI, smallest greyscale" : "50 DPI, smallest" },
    ];

    setBusy(true); setError(""); setResult(null); setProgress(1); setStage("Reading your PDF pages…");
    try {
      const [{ PDFDocument }, pdfjsLib] = await Promise.all([loadPdfLib(), loadPdfjs()]);
      const pdf = await pdfjsLib.getDocument({ data: item.bytes.slice() }).promise;
      const pageDims = [];
      const imagesBySetting = settings.map(() => []);

      for (let n = 1; n <= item.pages; n += 1) {
        setStage(`Preparing page ${n} of ${item.pages} at several quality levels…`);
        const page = await pdf.getPage(n);
        const baseViewport = page.getViewport({ scale: 1 });
        pageDims.push({ width: baseViewport.width, height: baseViewport.height });
        const renderScale = Math.min(180 / 72, 2700 / Math.max(baseViewport.width, baseViewport.height));
        const viewport = page.getViewport({ scale: Math.max(0.5, renderScale) });
        const base = document.createElement("canvas");
        base.width = Math.floor(viewport.width); base.height = Math.floor(viewport.height);
        const btx = base.getContext("2d");
        btx.fillStyle = "#ffffff"; btx.fillRect(0, 0, base.width, base.height);
        await page.render({ canvasContext: btx, viewport }).promise;

        for (let s = 0; s < settings.length; s += 1) {
          const setting = settings[s];
          const canvas = document.createElement("canvas");
          canvas.width = Math.max(40, Math.round(baseViewport.width * (setting.dpi / 72)));
          canvas.height = Math.max(40, Math.round(baseViewport.height * (setting.dpi / 72)));
          const ctx = canvas.getContext("2d");
          ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = "high";
          try { ctx.filter = setting.gray ? "grayscale(1) contrast(1.05)" : "none"; } catch {}
          ctx.drawImage(base, 0, 0, canvas.width, canvas.height);
          try { ctx.filter = "none"; } catch {}
          const jpg = await canvasBlob(canvas, "image/jpeg", setting.q);
          imagesBySetting[s].push(new Uint8Array(await jpg.arrayBuffer()));
        }
        setProgress(Math.round((n / item.pages) * 70));
      }

      let chosen = null;
      let smallest = null;
      for (let s = 0; s < settings.length; s += 1) {
        setStage(`Trying ${settings[s].label} — looking for the best quality under ${kb} KB…`);
        const out = await PDFDocument.create();
        for (let p = 0; p < pageDims.length; p += 1) {
          const embedded = await out.embedJpg(imagesBySetting[s][p]);
          const page = out.addPage([pageDims[p].width, pageDims[p].height]);
          page.drawImage(embedded, { x: 0, y: 0, width: pageDims[p].width, height: pageDims[p].height });
        }
        const blob = new Blob([await out.save({ useObjectStreams: true })], { type: "application/pdf" });
        smallest = { blob, setting: settings[s].label, fits: blob.size <= target };
        setProgress(70 + Math.round(((s + 1) / settings.length) * 30));
        if (blob.size <= target) { chosen = smallest; break; }
      }
      setResult(chosen || smallest);
      setStage(chosen ? "Target reached with the best quality setting that fits." : "This is the smallest readable version we could make, but it is still above your target. Try allowing greyscale or split the PDF.");
    } catch (error) {
      console.error(error);
      setError("Compression failed on this device. Try fewer pages, close other tabs, or use the regular Compress PDF tool on a desktop browser.");
      setProgress(null); setStage("");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      {!item && <Dropzone accept="application/pdf,.pdf" onFiles={add} title="Drop a PDF to fit an exact KB limit" hint="For portals that say “PDF must be under 200 KB”" icon="gauge" />}
      <Alert msg={error} />
      {item && (
        <>
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.02] px-4 py-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-red-400/15 text-red-300"><Icon name="pdf" size={23} /></span>
            <span className="min-w-0 flex-1"><span className="block truncate font-semibold text-white">{item.file.name}</span><span className="text-xs text-slate-500">{item.pages} pages · current size <strong className="text-rose-300">{formatBytes(item.file.size)}</strong></span></span>
            <button type="button" onClick={() => { setItem(null); setResult(null); }} className={btnGhost}><Icon name="trash" size={15} /> Different PDF</button>
          </div>

          <div className="mt-6 rounded-3xl border border-white/[0.08] bg-white/[0.02] p-5">
            <label className="text-sm font-semibold text-white">The finished PDF must be at or below:</label>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {[100, 200, 300, 500, 1024, 2048].map((value) => (
                <button key={value} type="button" onClick={() => setTargetKB(value)} className={`rounded-full border px-4 py-2 text-sm font-bold ${Number(targetKB) === value ? "border-amber-400 bg-amber-400 text-[#241a00]" : "border-white/10 bg-white/[0.03] text-slate-200"}`} aria-pressed={Number(targetKB) === value}>{value >= 1024 ? `${value / 1024} MB` : `${value} KB`}</button>
              ))}
              <span className="inline-flex items-center gap-2 text-sm text-slate-400">or
                <input aria-label="Custom target in kilobytes" type="number" min="20" max="20480" value={targetKB} onChange={(e) => setTargetKB(e.target.value)} className="w-24 rounded-xl border border-white/10 bg-[#12152e] px-3 py-2 text-white outline-none focus:border-amber-400/60" /> KB
              </span>
            </div>
            <label className="mt-5 flex items-start gap-3 text-sm text-slate-300">
              <input type="checkbox" checked={allowGray} onChange={(e) => setAllowGray(e.target.checked)} className="mt-0.5 h-4 w-4" />
              <span><strong className="text-white">Use greyscale only if needed</strong><span className="block text-xs text-slate-500">Colour settings are tried first. Greyscale is a last resort for very small targets.</span></span>
            </label>
            <div className="mt-5 rounded-2xl border border-amber-400/20 bg-amber-400/[0.06] px-4 py-3 text-xs leading-relaxed text-amber-100">
              To reliably hit a strict size, pages are rebuilt as optimized images, so text in the new PDF will not be selectable. If your original already fits, we keep it unchanged.
            </div>
          </div>

          <button type="button" onClick={run} disabled={busy || item.pages > 30} className={`${btnPrimary} mt-6`}><Icon name="compress" size={18} /> {busy ? "Finding the best fit…" : `Compress to ${targetKB} KB`}</button>
          {progress != null && (
            <div className="mt-5" role="status" aria-live="polite">
              <div className="h-3 overflow-hidden rounded-full bg-white/[0.08]"><div className="h-full rounded-full bg-gradient-to-r from-red-400 to-amber-400 transition-all" style={{ width: `${progress}%` }} /></div>
              {stage && <p className="mt-2 text-xs text-slate-400">{stage}</p>}
            </div>
          )}
          {result && (
            <div className={`mt-6 rounded-2xl border p-5 ${result.fits ? "border-emerald-400/25 bg-emerald-400/[0.05]" : "border-amber-400/30 bg-amber-400/[0.06]"}`} role="status">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-extrabold text-white">{result.fits ? "Target reached ✓" : "Smallest version made"}</p>
                <span className={`rounded-full px-3 py-1 text-xs font-extrabold ${result.fits ? "bg-emerald-400 text-[#032114]" : "bg-amber-400 text-[#241a00]"}`}>{formatBytes(result.blob.size)} / {targetKB} KB</span>
              </div>
              <p className="mt-1 text-sm text-slate-400">{formatBytes(item.file.size)} → {formatBytes(result.blob.size)} · {result.setting}{result.original ? " · text remains selectable" : ""}</p>
              <button type="button" onClick={() => downloadBlob(result.blob, `${stripExt(item.file.name)}-${targetKB}kb.pdf`)} className={`${btnGreen} mt-4`}><Icon name="download" size={17} /> Download PDF</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ═════════════════ SOLAR LOAD CALCULATOR ═════════════════ */
const DEFAULT_APPLIANCES = [
  { id: "fan", name: "Ceiling / pedestal fan", watts: 75, qty: 4, hours: 10 },
  { id: "led", name: "LED bulb / light", watts: 12, qty: 8, hours: 6 },
  { id: "tv", name: "LED TV", watts: 100, qty: 1, hours: 5 },
  { id: "fridge", name: "Refrigerator (average running use)", watts: 150, qty: 1, hours: 10 },
  { id: "router", name: "Wi-Fi router", watts: 10, qty: 1, hours: 24 },
  { id: "washer", name: "Washing machine", watts: 500, qty: 0, hours: 1 },
  { id: "pump", name: "Water pump (1 HP)", watts: 750, qty: 0, hours: 1 },
  { id: "ac1", name: "Inverter AC — 1 ton", watts: 1100, qty: 0, hours: 8 },
  { id: "ac15", name: "Inverter AC — 1.5 ton", watts: 1600, qty: 0, hours: 8 },
  { id: "cooler", name: "Air cooler", watts: 200, qty: 0, hours: 8 },
  { id: "pc", name: "Computer / laptop setup", watts: 120, qty: 0, hours: 6 },
  { id: "iron", name: "Electric iron", watts: 1000, qty: 0, hours: 0.5 },
];
const INVERTER_SIZES = [0.5, 1, 1.5, 2, 3, 5, 8, 10, 15, 20, 30, 50];
const fmtNum = (value, digits = 1) => Number(value || 0).toLocaleString("en-US", { maximumFractionDigits: digits, minimumFractionDigits: 0 });

export function SolarLoadCalculator() {
  const [appliances, setAppliances] = useState(DEFAULT_APPLIANCES);
  const [sunHours, setSunHours] = useState(5.5);
  const [panelWatts, setPanelWatts] = useState(585);
  const [backupHours, setBackupHours] = useState(3);
  const [backupPercent, setBackupPercent] = useState(40);
  const [batteryType, setBatteryType] = useState("lithium");
  const [custom, setCustom] = useState({ name: "", watts: 100, qty: 1, hours: 4 });

  const update = (id, key, value) => setAppliances((items) => items.map((item) => item.id === id ? { ...item, [key]: value } : item));
  const remove = (id) => setAppliances((items) => items.filter((item) => item.id !== id));
  const addCustom = () => {
    if (!custom.name.trim() || !(Number(custom.watts) > 0)) return;
    setAppliances((items) => [...items, { id: uid(), name: custom.name.trim(), watts: Number(custom.watts), qty: Math.max(1, Number(custom.qty) || 1), hours: Math.max(0, Number(custom.hours) || 0), custom: true }]);
    setCustom({ name: "", watts: 100, qty: 1, hours: 4 });
  };

  const result = useMemo(() => {
    const runningW = appliances.reduce((sum, item) => sum + Math.max(0, Number(item.watts) || 0) * Math.max(0, Number(item.qty) || 0), 0);
    const dailyWh = appliances.reduce((sum, item) => sum + Math.max(0, Number(item.watts) || 0) * Math.max(0, Number(item.qty) || 0) * Math.max(0, Number(item.hours) || 0), 0);
    const efficiency = 0.78;
    const rawSolarKw = sunHours > 0 ? (dailyWh / 1000) / (sunHours * efficiency) : 0;
    const panelCount = rawSolarKw > 0 ? Math.max(1, Math.ceil((rawSolarKw * 1000) / panelWatts)) : 0;
    const actualSolarKw = (panelCount * panelWatts) / 1000;
    const recommendedInverter = INVERTER_SIZES.find((size) => size * 1000 >= runningW * 1.25) || Math.ceil((runningW * 1.25) / 1000);
    const backupLoadW = runningW * (Number(backupPercent) / 100);
    const usableWh = backupLoadW * Math.max(0, Number(backupHours) || 0);
    const depth = batteryType === "lithium" ? 0.9 : 0.5;
    const batteryWh = usableWh > 0 ? usableWh / (depth * 0.92) : 0;
    const batteryVoltage = recommendedInverter >= 3 ? 48 : recommendedInverter >= 1 ? 24 : 12;
    return {
      runningW,
      dailyKwh: dailyWh / 1000,
      panelCount,
      actualSolarKw,
      recommendedInverter,
      monthlyUnits: actualSolarKw * sunHours * efficiency * 30,
      roofSqFt: panelCount * 32,
      backupLoadW,
      batteryKwh: batteryWh / 1000,
      batteryAh: batteryVoltage ? batteryWh / batteryVoltage : 0,
      batteryVoltage,
    };
  }, [appliances, sunHours, panelWatts, backupHours, backupPercent, batteryType]);

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-live="polite">
        {[
          ["Total running load", `${fmtNum(result.runningW, 0)} W`, "If everything selected runs together"],
          ["Daily electricity use", `${fmtNum(result.dailyKwh, 2)} units`, "Estimated kWh per day"],
          ["Recommended solar", `${fmtNum(result.actualSolarKw, 2)} kW`, `${result.panelCount} × ${panelWatts}W panels`],
          ["Inverter size", `${fmtNum(result.recommendedInverter, 1)} kW`, "Includes a 25% safety margin"],
        ].map(([label, value, hint]) => (
          <div key={label} className="rounded-3xl border border-amber-400/20 bg-gradient-to-br from-amber-400/[0.12] to-white/[0.02] p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p>
            <p className="mt-2 text-3xl font-black tracking-tight text-white">{value}</p>
            <p className="mt-1 text-xs text-slate-500">{hint}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] px-4 py-3 text-sm text-slate-300"><strong className="text-white">Battery for backup:</strong> {result.batteryKwh ? `${fmtNum(result.batteryKwh, 2)} kWh (${fmtNum(result.batteryAh, 0)} Ah at ${result.batteryVoltage}V)` : "No backup selected"}</div>
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] px-4 py-3 text-sm text-slate-300"><strong className="text-white">Estimated generation:</strong> {fmtNum(result.monthlyUnits, 0)} units/month</div>
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] px-4 py-3 text-sm text-slate-300"><strong className="text-white">Rough roof area:</strong> {fmtNum(result.roofSqFt, 0)} sq ft including spacing</div>
      </div>

      <section className="mt-8" aria-label="Appliances">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-extrabold text-white">1. Tell us what you run</h2>
            <p className="mt-1 text-sm text-slate-500">Set quantity and average daily hours. Change watts if your appliance label says something different.</p>
          </div>
          <button type="button" onClick={() => setAppliances(DEFAULT_APPLIANCES)} className={btnSmall}><Icon name="refresh" size={13} /> Reset sample home</button>
        </div>

        <div className="mt-4 overflow-hidden rounded-3xl border border-white/[0.08]">
          <div className="hidden grid-cols-[1.6fr_0.7fr_0.55fr_0.7fr_0.75fr_36px] gap-3 bg-white/[0.05] px-4 py-3 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 md:grid">
            <span>Appliance</span><span>Watts each</span><span>Qty</span><span>Hours/day</span><span>Units/day</span><span />
          </div>
          <div className="divide-y divide-white/[0.06] bg-white/[0.015]">
            {appliances.map((item) => {
              const units = ((Number(item.watts) || 0) * (Number(item.qty) || 0) * (Number(item.hours) || 0)) / 1000;
              return (
                <div key={item.id} className="grid gap-3 px-4 py-3 md:grid-cols-[1.6fr_0.7fr_0.55fr_0.7fr_0.75fr_36px] md:items-center">
                  <span className="font-semibold text-white">{item.name}{item.custom && <span className="ml-2 rounded-full bg-cyan-400/10 px-2 py-0.5 text-[10px] font-bold text-cyan-300">CUSTOM</span>}</span>
                  <label className="text-xs text-slate-500 md:text-sm">Watts<input aria-label={`${item.name} watts`} type="number" min="0" max="20000" value={item.watts} onChange={(e) => update(item.id, "watts", e.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-[#12152e] px-2.5 py-2 text-sm text-white outline-none focus:border-amber-400/60 md:mt-0" /></label>
                  <label className="text-xs text-slate-500 md:text-sm">Qty<span className="mt-1 flex items-center gap-1 md:mt-0"><button type="button" onClick={() => update(item.id, "qty", Math.max(0, (Number(item.qty) || 0) - 1))} className="grid h-9 w-8 place-items-center rounded-lg bg-white/[0.06] font-black text-white" aria-label={`Decrease ${item.name}`}>−</button><input aria-label={`${item.name} quantity`} type="number" min="0" max="999" value={item.qty} onChange={(e) => update(item.id, "qty", e.target.value)} className="w-14 rounded-lg border border-white/10 bg-[#12152e] px-2 py-2 text-center text-sm text-white outline-none focus:border-amber-400/60" /><button type="button" onClick={() => update(item.id, "qty", (Number(item.qty) || 0) + 1)} className="grid h-9 w-8 place-items-center rounded-lg bg-white/[0.06] font-black text-white" aria-label={`Increase ${item.name}`}>+</button></span></label>
                  <label className="text-xs text-slate-500 md:text-sm">Hours/day<input aria-label={`${item.name} hours per day`} type="number" min="0" max="24" step="0.5" value={item.hours} onChange={(e) => update(item.id, "hours", e.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-[#12152e] px-2.5 py-2 text-sm text-white outline-none focus:border-amber-400/60 md:mt-0" /></label>
                  <span className="text-sm font-bold text-amber-200">{fmtNum(units, 2)} units</span>
                  <button type="button" onClick={() => remove(item.id)} aria-label={`Remove ${item.name}`} className="justify-self-end rounded-lg p-2 text-slate-500 hover:bg-rose-400/10 hover:text-rose-300"><Icon name="trash" size={16} /></button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-4 grid gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 sm:grid-cols-[1.5fr_0.7fr_0.5fr_0.7fr_auto] sm:items-end">
          <label className="text-sm font-semibold text-white">Add your own appliance<input value={custom.name} onChange={(e) => setCustom({ ...custom, name: e.target.value })} placeholder="Example: Deep freezer" className={inputCls} /></label>
          <label className="text-sm font-semibold text-white">Watts<input type="number" min="1" value={custom.watts} onChange={(e) => setCustom({ ...custom, watts: e.target.value })} className={inputCls} /></label>
          <label className="text-sm font-semibold text-white">Qty<input type="number" min="1" value={custom.qty} onChange={(e) => setCustom({ ...custom, qty: e.target.value })} className={inputCls} /></label>
          <label className="text-sm font-semibold text-white">Hours/day<input type="number" min="0" max="24" step="0.5" value={custom.hours} onChange={(e) => setCustom({ ...custom, hours: e.target.value })} className={inputCls} /></label>
          <button type="button" onClick={addCustom} className={btnPrimary}>Add</button>
        </div>
      </section>

      <section className="mt-8" aria-label="Solar and battery settings">
        <h2 className="text-xl font-extrabold text-white">2. Sun, panels and backup</h2>
        <div className="mt-4 grid gap-5 md:grid-cols-2">
          <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-5">
            <label htmlFor="solar-sun" className="flex justify-between text-sm font-semibold text-white">Average useful sun hours <span className="text-amber-300">{sunHours} hrs/day</span></label>
            <input id="solar-sun" type="range" min="3" max="7" step="0.25" value={sunHours} onChange={(e) => setSunHours(Number(e.target.value))} className="mt-4 w-full" />
            <p className="mt-1 text-xs text-slate-500">5–6 hours is a reasonable starting estimate for many sunny areas of Pakistan. Shade and panel direction matter.</p>
            <label htmlFor="solar-panel" className="mt-5 block text-sm font-semibold text-white">Panel size</label>
            <select id="solar-panel" value={panelWatts} onChange={(e) => setPanelWatts(Number(e.target.value))} className={selectCls}>
              <option value={550}>550W panel</option><option value={585}>585W panel ★</option><option value={610}>610W panel</option><option value={450}>450W panel</option>
            </select>
          </div>
          <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label htmlFor="solar-backup-hours" className="text-sm font-semibold text-white">Battery backup time</label><input id="solar-backup-hours" type="number" min="0" max="24" step="0.5" value={backupHours} onChange={(e) => setBackupHours(e.target.value)} className={inputCls} /></div>
              <div><label htmlFor="solar-backup-load" className="text-sm font-semibold text-white">Load during backup</label><select id="solar-backup-load" value={backupPercent} onChange={(e) => setBackupPercent(Number(e.target.value))} className={selectCls}><option value={25}>Essential only — 25%</option><option value={40}>Fans & lights — 40% ★</option><option value={60}>Half home — 60%</option><option value={100}>Full load — 100%</option></select></div>
            </div>
            <label htmlFor="solar-battery" className="mt-4 block text-sm font-semibold text-white">Battery type</label>
            <select id="solar-battery" value={batteryType} onChange={(e) => setBatteryType(e.target.value)} className={selectCls}>
              <option value="lithium">Lithium — about 90% usable ★</option>
              <option value="lead">Lead-acid / tubular — about 50% usable</option>
            </select>
            <p className="mt-2 text-xs text-slate-500">Backup avoids running every heavy appliance at once. Pumps, fridges and ACs also need starting/surge capacity.</p>
          </div>
        </div>
      </section>

      <div className="mt-6 rounded-2xl border border-amber-400/20 bg-amber-400/[0.05] px-4 py-3 text-xs leading-relaxed text-amber-100">
        <strong>Estimate only:</strong> check the watt label on your actual appliances. A qualified installer should confirm inverter surge capacity, wiring, roof shade, panel direction, net-metering rules and battery compatibility before purchase.
      </div>
    </div>
  );
}
