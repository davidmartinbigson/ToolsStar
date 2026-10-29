"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Dropzone from "@/components/Dropzone";
import { Icon } from "@/components/icons";
import { formatBytes, downloadBlob, stripExt, loadImage } from "@/lib/utils";

const BG_OPTIONS = [
  { id: "transparent", label: "Transparent" },
  { id: "white", label: "White" },
  { id: "black", label: "Black" },
  { id: "custom", label: "Custom colour" },
  { id: "sunset", label: "Sunset" },
  { id: "ocean", label: "Ocean" },
  { id: "studio", label: "Studio" },
];

const GRADIENTS = {
  sunset: ["#ff9a56", "#ff5e8a", "#7c3aed"],
  ocean: ["#22d3ee", "#2563eb", "#0f172a"],
  studio: ["#f8fafc", "#cbd5e1", "#64748b"],
};

/* ── Pure alpha refinement (no DOM — pinned by tests) ────────────────────
   Segmentation models leave two artefacts: faint low-alpha haze where the
   background almost went, and isolated speckle patches that survived the
   mask. refineAlpha cleans the alpha channel only — colours stay untouched.
     strict    – soft threshold: alpha at/below the knee goes fully clear
     despeckle – deletes small isolated opaque blobs far from the subject
     soften    – feathers the matte edge so cut-outs don't look stickered */
function refineAlpha(src, w, h, { strict = 0, soften = 0, despeckle = true } = {}) {
  const a = new Uint8ClampedArray(src);
  if (strict > 0) {
    const lo = strict * 1.2;
    const hi = lo + 70;
    for (let i = 3; i < a.length; i += 4) {
      const v = a[i];
      a[i] = v <= lo ? 0 : v >= hi ? 255 : Math.round(((v - lo) / (hi - lo)) * 255);
    }
  }
  if (despeckle) {
    const sw = Math.max(8, Math.floor(w / 4));
    const sh = Math.max(8, Math.floor(h / 4));
    const gx = new Float32Array(sw * sh);
    for (let gy = 0; gy < sh; gy++) {
      for (let x = 0; x < sw; x++) {
        let acc = 0;
        for (let dy = 0; dy < 4; dy++) for (let dx = 0; dx < 4; dx++) {
          const px = Math.min(w - 1, x * 4 + dx), py = Math.min(h - 1, gy * 4 + dy);
          acc += a[(py * w + px) * 4 + 3];
        }
        gx[gy * sw + x] = acc / 16;
      }
    }
    const label = new Int32Array(sw * sh).fill(-1);
    const sizes = [];
    for (let i = 0; i < gx.length; i++) {
      if (gx[i] < 60 || label[i] !== -1) continue;
      const id = sizes.length;
      let size = 0;
      const stack = [i];
      label[i] = id;
      while (stack.length) {
        const c = stack.pop();
        size++;
        const cx = c % sw, cy = (c / sw) | 0;
        const nb = [cx > 0 ? c - 1 : -1, cx < sw - 1 ? c + 1 : -1, cy > 0 ? c - sw : -1, cy < sh - 1 ? c + sw : -1];
        for (const n of nb) if (n >= 0 && label[n] === -1 && gx[n] >= 60) { label[n] = id; stack.push(n); }
      }
      sizes.push(size);
    }
    if (sizes.length > 1) {
      const biggest = Math.max(...sizes);
      const minKeep = Math.max(6, biggest * 0.02);
      for (let gy = 0; gy < sh; gy++) {
        for (let x = 0; x < sw; x++) {
          const id = label[gy * sw + x];
          if (id >= 0 && sizes[id] < minKeep) {
            for (let dy = 0; dy < 4; dy++) for (let dx = 0; dx < 4; dx++) {
              const px = x * 4 + dx, py = gy * 4 + dy;
              if (px < w && py < h) a[(py * w + px) * 4 + 3] = 0;
            }
          }
        }
      }
    }
  }
  if (soften > 0) {
    const base = new Uint8ClampedArray(a);
    const t = (soften / 100) * 0.6;
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const i = (y * w + x) * 4 + 3;
        const avg = (base[i - 4] + base[i + 4] + base[i - w * 4] + base[i + w * 4] + base[i]) / 5;
        a[i] = base[i] + (avg - base[i]) * t;
      }
    }
  }
  return a;
}

/* Guided-filter edge matting (He et al.), guide = the photo itself.
   The AI mask is only a prior: filtering it with the image as the guide snaps
   soft halos and stair-steps onto the real colour edges, which is what makes
   hair, fur and soft fringes survive the cut-out instead of turning into a
   sticker silhouette. Pure + O(n), so tests pin the behaviour.            */
function boxMean(arr, w, h, r) {
  const n = w * h;
  const tmp = new Float32Array(n);
  const out = new Float32Array(n);
  const div = 2 * r + 1;
  const cx = (x) => (x < 0 ? 0 : x >= w ? w - 1 : x);
  const cy = (y) => (y < 0 ? 0 : y >= h ? h - 1 : y);
  for (let y = 0; y < h; y++) {
    const row = y * w;
    let sum = 0;
    for (let x = -r; x <= r; x++) sum += arr[row + cx(x)];
    for (let x = 0; x < w; x++) {
      tmp[row + x] = sum / div;
      sum += arr[row + cx(x + r + 1)] - arr[row + cx(x - r)];
    }
  }
  for (let x = 0; x < w; x++) {
    let sum = 0;
    for (let y = -r; y <= r; y++) sum += tmp[cy(y) * w + x];
    for (let y = 0; y < h; y++) {
      out[y * w + x] = sum / div;
      sum += tmp[cy(y + r + 1) * w + x] - tmp[cy(y - r) * w + x];
    }
  }
  return out;
}

function guidedAlpha(rgb, alpha, w, h, opts = {}) {
  const { radius = 4, eps = 0.02 } = opts;
  const n = w * h;
  const out = new Uint8ClampedArray(alpha);
  if (n > 8_000_000) return out; // memory guard: skip matting on giant images
  const I = new Float32Array(n);
  const P = new Float32Array(n);
  const II = new Float32Array(n);
  const IP = new Float32Array(n);
  for (let p = 0, i = 0; p < n; p++, i += 4) {
    const l = (0.299 * rgb[i] + 0.587 * rgb[i + 1] + 0.114 * rgb[i + 2]) / 255;
    const m = alpha[i + 3] / 255;
    I[p] = l;
    P[p] = m;
    II[p] = l * l;
    IP[p] = l * m;
  }
  const meanI = boxMean(I, w, h, radius);
  const meanP = boxMean(P, w, h, radius);
  const meanII = boxMean(II, w, h, radius);
  const meanIP = boxMean(IP, w, h, radius);
  const a = IP; // reuse buffer
  const b = II;
  for (let p = 0; p < n; p++) {
    const cov = meanIP[p] - meanI[p] * meanP[p];
    const varI = Math.max(0, meanII[p] - meanI[p] * meanI[p]);
    const ak = cov / (varI + eps);
    a[p] = ak;
    b[p] = meanP[p] - ak * meanI[p];
  }
  const meanA = boxMean(a, w, h, radius);
  const meanB = boxMean(b, w, h, radius);
  for (let p = 0, i = 0; p < n; p++, i += 4) {
    const q = meanA[p] * I[p] + meanB[p];
    out[i + 3] = q <= 0 ? 0 : q >= 1 ? 255 : Math.round(q * 255);
  }
  return out;
}

export default function BackgroundRemover() {
  const [file, setFile] = useState(null);
  const [srcUrl, setSrcUrl] = useState("");
  const [dims, setDims] = useState(null);
  const [model, setModel] = useState("large");
  const [working, setWorking] = useState(false);
  const [stage, setStage] = useState("");
  const [progress, setProgress] = useState(null);
  const [cutout, setCutout] = useState(null); // { blob, url }
  const [bg, setBg] = useState("transparent");
  const [color, setColor] = useState("#7c5cff");
  const [strict, setStrict] = useState(35);
  const [soften, setSoften] = useState(12);
  const [despeckle, setDespeckle] = useState(true);
  const rawRef = useRef(null); // un-refined matte, so sliders can re-run instantly
  const [finalBlob, setFinalBlob] = useState(null);
  const [finalUrl, setFinalUrl] = useState("");
  const [error, setError] = useState("");
  const seqRef = useRef(0);

  const onFiles = useCallback(async (files) => {
    const f = files[0];
    if (!f) return;
    setError("");
    setCutout(null);
    setFile(f);
    setSrcUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(f);
    });
    try {
      const { width, height, url } = await loadImage(f);
      setDims({ width, height });
      URL.revokeObjectURL(url);
    } catch {}
  }, []);

  const remove = async () => {
    if (!file) return;
    const seq = ++seqRef.current;
    setWorking(true);
    setError("");
    setProgress(2);
    setStage("Loading the on-device AI engine… (first use downloads the model once, then it is cached)");

    try {
      let mod;
      try {
        // Loaded from CDN at runtime so THIS website stays tiny and fast.
        // The AI still runs 100% inside the visitor's browser tab.
        mod = await import(/* webpackIgnore: true */ "https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.7.0/+esm");
      } catch {
        mod = await import(/* webpackIgnore: true */ "https://esm.sh/@imgly/background-removal@1.7.0");
      }
      const removeBackground =
        mod.removeBackground ||
        mod.imglyRemoveBackground ||
        mod.default?.removeBackground ||
        mod.default?.imglyRemoveBackground ||
        mod.default;
      if (typeof removeBackground !== "function") throw new Error("AI engine failed to load.");

      const blob = await removeBackground(file, {
        model,
        progress: (key, current, total) => {
          if (seqRef.current !== seq) return;
          const isCompute = String(key).startsWith("compute");
          const pct = total > 0 ? Math.round((current / total) * 100) : 0;
          if (isCompute) {
            setStage("AI is separating subject from background & refining edges…");
            setProgress(82 + Math.round(pct * 0.18));
          } else {
            setStage("Downloading AI model (one-time)…");
            setProgress(Math.min(80, Math.max(4, Math.round(pct * 0.8))));
          }
        },
      });

      if (seqRef.current !== seq) return;
      const raw = await blobToImageData(blob);
      if (seqRef.current !== seq) return;
      // Edge-mat the mask against the photo's own colours once per run; the
      // cleanup sliders then re-run only the cheap alpha passes on top.
      raw.matted = guidedAlpha(raw.data, raw.data, raw.width, raw.height);
      rawRef.current = raw;
      applyRefined(raw, { strict, soften, despeckle });
      setProgress(100);
      setStage("Done! The matte is auto-cleaned — tune it below, pick a background, or download the transparent PNG.");
    } catch (e) {
      console.error(e);
      setError(
        "Background removal failed. This usually means the AI model could not download (check your connection / ad-blocker) or the image was too large for your device's memory. Try the Fast model or a smaller photo."
      );
      setStage("");
      setProgress(null);
    } finally {
      if (seqRef.current === seq) setWorking(false);
    }
  };

  const blobToImageData = async (blob) => {
    const { img, url, width, height } = await loadImage(blob);
    URL.revokeObjectURL(url);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(img, 0, 0);
    const d = ctx.getImageData(0, 0, width, height);
    return { data: new Uint8ClampedArray(d.data), width, height };
  };

  const applyRefined = (raw, cfg) => {
    const data = refineAlpha(raw.matted || raw.data, raw.width, raw.height, cfg);
    const canvas = document.createElement("canvas");
    canvas.width = raw.width;
    canvas.height = raw.height;
    const ctx = canvas.getContext("2d");
    const frame = ctx.createImageData(raw.width, raw.height);
    frame.data.set(data);
    ctx.putImageData(frame, 0, 0);
    canvas.toBlob((b) => {
      if (!b) return;
      setCutout((prev) => {
        if (prev) URL.revokeObjectURL(prev.url);
        return { blob: b, url: URL.createObjectURL(b) };
      });
    }, "image/png");
  };

  const retune = (next) => {
    if (rawRef.current) applyRefined(rawRef.current, next);
  };

  // Compose final image whenever background choice changes.
  useEffect(() => {
    let revoke = "";
    (async () => {
      if (!cutout) {
        setFinalBlob(null);
        setFinalUrl("");
        return;
      }
      if (bg === "transparent") {
        setFinalBlob(cutout.blob);
        setFinalUrl(cutout.url);
        return;
      }
      const { img, url, width, height } = await loadImage(cutout.blob);
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (GRADIENTS[bg]) {
        const g = ctx.createLinearGradient(0, 0, width, height);
        GRADIENTS[bg].forEach((c, i) => g.addColorStop(i / (GRADIENTS[bg].length - 1), c));
        ctx.fillStyle = g;
      } else {
        ctx.fillStyle = bg === "white" ? "#ffffff" : bg === "black" ? "#000000" : color;
      }
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((b) => {
        if (revoke) URL.revokeObjectURL(revoke);
        setFinalBlob(b);
        const u = URL.createObjectURL(b);
        revoke = u;
        setFinalUrl(u);
      }, "image/png");
    })();
    return () => { if (revoke) URL.revokeObjectURL(revoke); };
  }, [cutout, bg, color]);

  const reset = () => {
    seqRef.current++;
    [srcUrl, cutout?.url, finalUrl].forEach((u) => u && URL.revokeObjectURL(u));
    rawRef.current = null;
    setFile(null); setSrcUrl(""); setDims(null); setCutout(null);
    setFinalBlob(null); setFinalUrl(""); setStage(""); setProgress(null); setError(""); setWorking(false);
  };

  const outExt = bg === "transparent" ? "png" : "png";

  return (
    <div>
      {!file && (
        <Dropzone
          accept="image/*"
          allowPaste
          onFiles={onFiles}
          title="Drop an image to remove its background"
          hint="People, products, pets, cars, logos — AI runs in your browser, photo is never uploaded"
          icon="wand"
        />
      )}

      {error && (
        <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm leading-relaxed text-rose-200" role="alert">
          <Icon name="x" size={17} className="mt-0.5 shrink-0" /> {error}
        </div>
      )}

      {file && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* original */}
          <div>
            <p className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
              Original
              <span className="font-semibold normal-case tracking-normal text-slate-500">
                {dims ? `${dims.width} × ${dims.height} · ` : ""}{formatBytes(file.size)}
              </span>
            </p>
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/30">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={srcUrl} alt="Original upload" className="max-h-[460px] w-full object-contain" />
              {working && (
                <span className="anim-scan absolute left-0 right-0 h-[3px] bg-cyan-300 shadow-[0_0_16px_4px_rgba(34,211,238,.8)]" aria-hidden="true" />
              )}
            </div>

            {/* model choice */}
            <h2 className="mt-5 text-sm font-bold uppercase tracking-wider text-slate-300">AI model</h2>
            <div className="mt-2.5 grid grid-cols-3 gap-2">
              {[
                ["small", "Fast", "Quickest download, fine for simple backgrounds"],
                ["medium", "Balanced", "Middle ground for busy backgrounds"],
                ["large", "Best quality ★", "Studio-class hair & edge detail — larger one-time download, cached after"],
              ].map(([val, title, desc]) => (
                <button
                  key={val}
                  onClick={() => setModel(val)}
                  disabled={working}
                  className={`rounded-xl border px-3 py-2.5 text-left transition disabled:opacity-50 ${
                    model === val ? "border-violet-400 bg-violet-400/10" : "border-white/10 bg-white/[0.02] hover:border-violet-400/40"
                  }`}
                >
                  <span className="block text-sm font-bold text-white">{title}</span>
                  <span className="block text-[11px] leading-snug text-slate-400">{desc}</span>
                </button>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                onClick={remove}
                disabled={working}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-6 py-3 font-extrabold text-white shadow-xl shadow-violet-500/25 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Icon name="wand" size={19} strokeWidth={2} />
                {working ? "AI is working…" : cutout ? "Run again" : "Remove background"}
              </button>
              <button onClick={reset} className="inline-flex items-center gap-1.5 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-slate-300 hover:border-rose-400/40 hover:text-rose-300">
                <Icon name="trash" size={16} /> Different image
              </button>
            </div>

            {(working || stage) && (
              <div className="mt-5" role="status" aria-live="polite">
                {progress != null && (
                  <div className="h-3 overflow-hidden rounded-full bg-white/[0.08]">
                    <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-400 transition-all duration-500" style={{ width: `${progress}%` }} />
                  </div>
                )}
                <p className="mt-2 text-xs leading-relaxed text-slate-400">{stage}</p>
                {working && <p className="mt-1 text-xs text-slate-500">Keep this tab open — everything happens on your device. Larger photos take longer.</p>}
              </div>
            )}
          </div>

          {/* result */}
          <div>
            <p className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
              Result
              {finalBlob && <span className="font-semibold normal-case tracking-normal text-emerald-300">PNG · {formatBytes(finalBlob.size)}</span>}
            </p>
            <div className={`relative grid min-h-[300px] place-items-center overflow-hidden rounded-2xl border border-white/10 ${bg === "transparent" ? "checker" : "bg-black/30"}`}>
              {finalUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={finalUrl} alt="Background removed result" className="max-h-[460px] w-full object-contain" />
              ) : (
                <div className="p-8 text-center">
                  <span className="anim-floaty mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-violet-500/15 text-violet-300">
                    <Icon name="sparkles" size={30} />
                  </span>
                  <p className="mt-4 font-semibold text-white">Your cutout will appear here</p>
                  <p className="mx-auto mt-1 max-w-[260px] text-sm text-slate-400">
                    Press “Remove background” and the AI will isolate the subject with a transparent background.
                  </p>
                </div>
              )}
            </div>

            {cutout && (
              <>
                <h2 className="mt-5 text-sm font-bold uppercase tracking-wider text-slate-300">Background</h2>
                <div className="mt-2.5 flex flex-wrap items-center gap-2">
                  {BG_OPTIONS.map((o) => (
                    <button
                      key={o.id}
                      onClick={() => setBg(o.id)}
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                        bg === o.id ? "border-amber-400 bg-amber-400/15 text-amber-200" : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-amber-400/40"
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className="h-3.5 w-3.5 rounded-full border border-white/25"
                        style={{
                          background:
                            o.id === "transparent"
                              ? "repeating-conic-gradient(#94a3b8 0% 25%, #e2e8f0 0% 50%) 0 0/7px 7px"
                              : GRADIENTS[o.id]
                                ? `linear-gradient(135deg, ${GRADIENTS[o.id].join(",")})`
                                : o.id === "custom"
                                  ? color
                                  : o.id,
                        }}
                      />
                      {o.label}
                    </button>
                  ))}
                  {bg === "custom" && (
                    <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300">
                      Pick:
                      <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-8 w-10 cursor-pointer rounded-lg border border-white/15 bg-transparent" />
                    </label>
                  )}
                </div>

                <h2 className="mt-5 text-sm font-bold uppercase tracking-wider text-slate-300">Matte cleanup</h2>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                  Edges are re-matted against your photo's own colours (a guided filter), so hair, fur and soft fringes keep
                  their detail instead of a hard halo. If faint haze or stray patches still survive, raise
                  <strong className="text-slate-300"> strictness</strong> to push them fully transparent; despeckle deletes isolated
                  leftover blobs and softening feathers the edge. All of it runs instantly on your device.
                </p>
                <div className="mt-3 space-y-3 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
                  <div>
                    <label className="flex items-center justify-between text-sm font-semibold text-white">
                      Leftover strictness <span className="rounded-md bg-violet-400/15 px-2 py-0.5 text-xs font-bold text-violet-300">{strict}</span>
                    </label>
                    <input type="range" min="0" max="60" value={strict} onChange={(e) => { const v = +e.target.value; setStrict(v); retune({ strict: v, soften, despeckle }); }} className="mt-2 w-full" />
                  </div>
                  <div>
                    <label className="flex items-center justify-between text-sm font-semibold text-white">
                      Edge softening <span className="rounded-md bg-violet-400/15 px-2 py-0.5 text-xs font-bold text-violet-300">{soften}</span>
                    </label>
                    <input type="range" min="0" max="100" value={soften} onChange={(e) => { const v = +e.target.value; setSoften(v); retune({ strict, soften: v, despeckle }); }} className="mt-2 w-full" />
                  </div>
                  <label className="flex items-center gap-2.5 text-sm text-slate-300">
                    <input type="checkbox" checked={despeckle} onChange={(e) => { const v = e.target.checked; setDespeckle(v); retune({ strict, soften, despeckle: v }); }} className="h-4 w-4" />
                    Remove stray leftover patches (despeckle)
                  </label>
                </div>

                <button
                  onClick={() => finalBlob && downloadBlob(finalBlob, `${stripExt(file.name)}-no-bg.${outExt}`)}
                  disabled={!finalBlob}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-6 py-3.5 font-extrabold text-[#032114] shadow-xl shadow-emerald-500/20 transition hover:bg-emerald-300 disabled:opacity-50 sm:w-auto"
                >
                  <Icon name="download" size={19} strokeWidth={2.1} />
                  Download {bg === "transparent" ? "transparent PNG" : "image"}
                </button>
                <p className="mt-2.5 text-xs text-slate-500">Full resolution, no watermark, no HD paywall — forever free.</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
