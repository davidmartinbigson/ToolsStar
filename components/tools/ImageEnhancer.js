"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Dropzone from "@/components/Dropzone";
import { Icon } from "@/components/icons";
import { formatBytes, downloadBlob, stripExt, loadImage, renderToBlob, fitWithin, friendlyError } from "@/lib/utils";

const EXT = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

function imgFromSrc(src) {
  return new Promise((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = () => reject(new Error("Could not read the processed image."));
    i.src = src;
  });
}

function drawToCanvas(img, w, h) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, w, h);
  return c;
}

// Non-AI fallback: gradual (stepwise) upscaling looks far smoother than one big jump.
function stepUpscale(img, w, h, tw, th) {
  let current = drawToCanvas(img, w, h);
  let cw = w;
  let ch = h;
  while (cw * 2 <= tw && ch * 2 <= th) {
    cw *= 2;
    ch *= 2;
    current = drawToCanvas(current, cw, ch);
  }
  if (cw !== tw || ch !== th) current = drawToCanvas(current, tw, th);
  return current;
}

async function loadAiUpscaler(scale) {
  const attempts = [
    {
      upscaler: "https://esm.sh/upscaler@1.0.0",
      model: `https://esm.sh/@upscalerjs/esrgan-slim@1.0.0/${scale}x`,
    },
    {
      upscaler: "https://cdn.jsdelivr.net/npm/upscaler@1.0.0/+esm",
      model: `https://cdn.jsdelivr.net/npm/@upscalerjs/esrgan-slim@1.0.0/${scale}x/+esm`,
    },
  ];
  let lastErr = null;
  for (const src of attempts) {
    try {
      const [uMod, mMod] = await Promise.all([
        import(/* webpackIgnore: true */ src.upscaler),
        import(/* webpackIgnore: true */ src.model),
      ]);
      const Upscaler = uMod.default || uMod.Upscaler;
      const model = mMod.default || mMod;
      if (typeof Upscaler !== "function" || !model) throw new Error("AI module shape unexpected");
      return new Upscaler({ model });
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error("AI engine could not be loaded");
}

/* ── Pure restoration pipeline (no DOM — pinned by tests) ─────────────────
   boxBlur: separable sliding-window blur, the workhorse behind both the
   local-contrast ("clarity") pass and the unsharp detail pass.
   enhancePixels: edge-safe denoise → clarity → unsharp → vibrance. This is
   what turns "just made it bigger" into a real clarity recovery.        */
function boxBlur(src, w, h, r) {
  if (r < 1) return src;
  const tmp = new Uint8ClampedArray(src);
  const out = new Uint8ClampedArray(src);
  const div = r * 2 + 1;
  for (let y = 0; y < h; y++) {
    const row = y * w * 4;
    for (let ch = 0; ch < 3; ch++) {
      let acc = 0;
      for (let x = -r; x <= r; x++) acc += src[row + Math.min(w - 1, Math.max(0, x)) * 4 + ch];
      for (let x = 0; x < w; x++) {
        tmp[row + x * 4 + ch] = acc / div;
        acc += src[row + Math.min(w - 1, x + r + 1) * 4 + ch] - src[row + Math.max(0, x - r) * 4 + ch];
      }
    }
  }
  for (let x = 0; x < w; x++) {
    for (let ch = 0; ch < 3; ch++) {
      let acc = 0;
      for (let y = -r; y <= r; y++) acc += tmp[(Math.min(h - 1, Math.max(0, y)) * w + x) * 4 + ch];
      for (let y = 0; y < h; y++) {
        out[(y * w + x) * 4 + ch] = acc / div;
        acc += tmp[(Math.min(h - 1, y + r + 1) * w + x) * 4 + ch] - tmp[(Math.max(0, y - r) * w + x) * 4 + ch];
      }
    }
  }
  return out;
}

function enhancePixels(src, w, h, opts = {}) {
  const { denoise = 0, clarity = 0, sharpen = 0, vibrance = 0 } = opts;
  const s = new Uint8ClampedArray(src);
  const lum = (k) => 0.299 * s[k] + 0.587 * s[k + 1] + 0.114 * s[k + 2];

  // 1) Edge-preserving denoise: flat regions (skin, sky, walls) relax toward a
  //    5-tap average while pixels sitting on an edge are left untouched, so
  //    JPEG block noise and sensor speckle fade without smearing real detail.
  if (denoise > 0) {
    const t = (denoise / 100) * 0.85;
    const L = (k) => 0.299 * s[k] + 0.587 * s[k + 1] + 0.114 * s[k + 2];
    // Two passes: the first relaxes speckle, the second (re-measuring the now
    // gentler gradient) finishes the job. sqrt keeps the curve effective on
    // low-contrast noise while g >= 90 still protects real edges.
    for (let pass = 0; pass < 2; pass++) {
      const base = new Uint8ClampedArray(s);
      for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
          const i = (y * w + x) * 4;
          const g = Math.abs(L(i) - L(i - 4)) + Math.abs(L(i) - L(i + 4)) + Math.abs(L(i) - L(i - w * 4)) + Math.abs(L(i) - L(i + w * 4));
          if (g >= 90) continue; // edge pixel — keep it crisp
          const mix = t * Math.sqrt(1 - g / 90);
          for (let ch = 0; ch < 3; ch++) {
            const avg = (base[i - 4 + ch] + base[i + 4 + ch] + base[i - w * 4 + ch] + base[i + w * 4 + ch] + base[i + ch]) / 5;
            s[i + ch] = base[i + ch] + (avg - base[i + ch]) * mix;
          }
        }
      }
    }
  }

  const unsharp = (radius, amount) => {
    if (amount <= 0) return;
    const blurred = boxBlur(s, w, h, radius);
    for (let i = 0; i < s.length; i += 4) {
      for (let ch = 0; ch < 3; ch++) s[i + ch] = s[i + ch] + amount * (s[i + ch] - blurred[i + ch]);
    }
  };

  // 2) Clarity: large-radius local contrast lifts the mid-tone structure that
  //    reads as "HD" without clipping global contrast.
  unsharp(Math.max(4, Math.min(12, Math.round(Math.min(w, h) / 120))), (clarity / 100) * 0.85);
  // 3) Unsharp: 1px detail pass — the deblur feel on edges, hair and text.
  unsharp(1, (sharpen / 100) * 0.9);

  // 4) Vibrance: muted pixels saturate more than already-vivid ones, so skin
  //    tones stay natural while flat colours wake up.
  if (vibrance > 0) {
    const v = vibrance / 100;
    for (let i = 0; i < s.length; i += 4) {
      const mx = Math.max(s[i], s[i + 1], s[i + 2]);
      const mn = Math.min(s[i], s[i + 1], s[i + 2]);
      const sat = mx === 0 ? 0 : (mx - mn) / mx;
      const amt = v * (1 - sat);
      if (amt <= 0.01) continue;
      const l = lum(i);
      s[i] += (s[i] - l) * amt;
      s[i + 1] += (s[i + 1] - l) * amt;
      s[i + 2] += (s[i + 2] - l) * amt;
    }
  }
  return s;
}

export default function ImageEnhancer() {
  const [item, setItem] = useState(null);
  const [engine, setEngine] = useState("ai");
  const [scale, setScale] = useState(2);
  const [inputCap, setInputCap] = useState(1024);
  const [denoise, setDenoise] = useState(35);
  const [clarity, setClarity] = useState(35);
  const [sharpen, setSharpen] = useState(35);
  const [color, setColor] = useState(10);
  const [format, setFormat] = useState("image/png");
  const [quality, setQuality] = useState(92);
  const [working, setWorking] = useState(false);
  const [progress, setProgress] = useState(null);
  const [stage, setStage] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [compare, setCompare] = useState(50);
  const abortRef = useRef(null);

  const onFiles = useCallback(async (files) => {
    const f = files[0];
    if (!f) return;
    setError("");
    setResult(null);
    setStage("");
    setProgress(null);
    try {
      const loaded = await loadImage(f);
      setItem({ file: f, ...loaded });
    } catch (e) {
      setError(friendlyError(e, "Could not read that image."));
    }
  }, []);

  // A tiny built-in picture so anyone can test the enhancer instantly.
  const makeSample = async () => {
    const big = document.createElement("canvas");
    big.width = 512;
    big.height = 384;
    const b = big.getContext("2d");
    const sky = b.createLinearGradient(0, 0, 0, 384);
    sky.addColorStop(0, "#f59e0b");
    sky.addColorStop(0.55, "#ec4899");
    sky.addColorStop(1, "#312e81");
    b.fillStyle = sky;
    b.fillRect(0, 0, 512, 384);
    b.beginPath();
    b.arc(390, 105, 46, 0, Math.PI * 2);
    b.fillStyle = "#fde68a";
    b.fill();
    b.fillStyle = "#1e293b";
    b.beginPath();
    b.moveTo(0, 300); b.lineTo(140, 150); b.lineTo(270, 300); b.closePath(); b.fill();
    b.beginPath();
    b.moveTo(170, 310); b.lineTo(330, 120); b.lineTo(470, 310); b.closePath(); b.fill();
    b.fillStyle = "#0f766e";
    b.fillRect(0, 300, 512, 84);
    b.fillStyle = "#ffffff";
    b.font = "bold 44px sans-serif";
    b.textAlign = "center";
    b.fillText("TOOLS STARS", 256, 70);
    b.font = "600 22px sans-serif";
    b.fillText("low-res sample — enhance me!", 256, 100);
    // crush it down to a genuinely low-res 128x96 image
    const small = drawToCanvas(big, 128, 96);
    const blob = await new Promise((r) => small.toBlob(r, "image/png"));
    const file = new File([blob], "sample-lowres.png", { type: "image/png" });
    setScale(4);
    onFiles([file]);
  };

  const prepared = useMemo(() => {
    if (!item) return null;
    return fitWithin(item.width, item.height, inputCap);
  }, [item, inputCap]);

  const output = useMemo(() => {
    if (!prepared) return null;
    return { width: prepared.width * scale, height: prepared.height * scale };
  }, [prepared, scale]);

  const prepareSource = async () => {
    if (prepared.width === item.width && prepared.height === item.height) {
      return { img: item.img, width: item.width, height: item.height, cleanup: () => {} };
    }
    setStage(`Preparing input (resizing to ${prepared.width}×${prepared.height} for the AI)…`);
    const blob = await renderToBlob(item.img, { width: prepared.width, height: prepared.height, type: "image/png" });
    const loaded = await loadImage(blob);
    return {
      img: loaded.img,
      width: loaded.width,
      height: loaded.height,
      cleanup: () => URL.revokeObjectURL(loaded.url),
    };
  };

  const applyFinish = async (canvas) => {
    if (denoise === 0 && clarity === 0 && sharpen === 0 && color === 0) return canvas;
    setStage("Restoring detail: edge-safe denoise → local-contrast clarity → unsharp → vibrance…");
    // let the status paint before the (synchronous) pixel loop
    await new Promise((r) => setTimeout(r, 30));
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
    frame.data.set(enhancePixels(frame.data, canvas.width, canvas.height, { denoise, clarity, sharpen, vibrance: color }));
    ctx.putImageData(frame, 0, 0);
    return canvas;
  };

  const enhance = async () => {
    if (!item || !output) return;
    const outPixels = output.width * output.height;
    if (outPixels > 24_000_000) {
      setError(`That output would be ${output.width}×${output.height} (${(outPixels / 1e6).toFixed(0)} megapixels) — too large for a browser tab. Lower the input size cap or choose 2x.`);
      return;
    }
    const started = Date.now();
    const controller = new AbortController();
    abortRef.current = controller;
    setWorking(true);
    setError("");
    setResult(null);
    setProgress(1);
    let upscaler = null;
    let prep = null;

    try {
      prep = await prepareSource();
      let canvas;

      if (engine === "ai") {
        setStage("Loading the on-device AI (ESRGAN) — first use downloads the model once, then it is cached…");
        upscaler = await loadAiUpscaler(scale);
        try {
          setStage("Warming up the AI…");
          await upscaler.warmup([{ patchSize: 64, padding: 4 }]);
        } catch {}
        setStage(`AI is rebuilding your image at ${scale}x, patch by patch — this is the slow, magical part…`);
        const upscaled = await upscaler.upscale(prep.img, {
          patchSize: 64,
          padding: 4,
          signal: controller.signal,
          progress: (amt) => {
            const pct = typeof amt === "number" ? (amt <= 1 ? amt * 100 : amt) : 0;
            setProgress(Math.max(1, Math.min(99, Math.round(pct))));
          },
        });
        const aiImg = await imgFromSrc(upscaled);
        canvas = drawToCanvas(aiImg, aiImg.naturalWidth, aiImg.naturalHeight);
      } else {
        setStage(`Fast-enhancing to ${scale}x with high-quality scaling…`);
        setProgress(45);
        await new Promise((r) => setTimeout(r, 30));
        canvas = stepUpscale(prep.img, prep.width, prep.height, output.width, output.height);
        setProgress(70);
      }

      canvas = await applyFinish(canvas);

      setStage("Exporting your HD image…");
      const blob = await new Promise((resolve, reject) =>
        canvas.toBlob((bb) => (bb ? resolve(bb) : reject(new Error("Export failed — the image may be too large for this device."))), format, quality / 100)
      );
      setResult({
        blob,
        url: URL.createObjectURL(blob),
        name: `${stripExt(item.file.name)}-enhanced-${scale}x.${EXT[format]}`,
        width: canvas.width,
        height: canvas.height,
        engineUsed: engine === "ai" ? `AI ESRGAN ${scale}x` : `Fast Enhance ${scale}x`,
        secs: ((Date.now() - started) / 1000).toFixed(1),
      });
      setProgress(100);
      setStage("Done! Drag the compare slider below to see the difference.");
    } catch (e) {
      console.error(e);
      if (controller.signal.aborted || e?.name === "AbortError") {
        setStage("Cancelled — no image was created.");
        setProgress(null);
      } else if (engine === "ai") {
        setError("The AI engine could not run here — usually a blocked model download (check connection/ad-blocker) or not enough device memory for this image size. Good news: switch the engine above to 'Fast Enhance' and press Enhance again — it needs no downloads and still gives a clean HD upscale.");
        setStage("");
        setProgress(null);
      } else {
        setError(friendlyError(e, "Enhancement failed. Try a smaller input size."));
        setStage("");
        setProgress(null);
      }
    } finally {
      try { upscaler?.dispose?.(); } catch {}
      try { prep?.cleanup?.(); } catch {}
      setWorking(false);
    }
  };

  const cancel = () => abortRef.current?.abort();

  const reset = () => {
    if (item?.url) URL.revokeObjectURL(item.url);
    if (result?.url) URL.revokeObjectURL(result.url);
    setItem(null);
    setResult(null);
    setStage("");
    setProgress(null);
    setError("");
  };

  return (
    <div>
      {!item && (
        <>
          <Dropzone
            accept="image/*"
            allowPaste
            onFiles={onFiles}
            title="Drop a low-res or pixelated image to enhance"
            hint="Old photo, tiny thumbnail, blurry screenshot — AI rebuilds it up to 4x bigger, sharp HD"
            icon="sparkles"
          />
          <div className="mt-4 text-center">
            <button onClick={makeSample} className="inline-flex items-center gap-2 rounded-xl border border-fuchsia-400/40 bg-fuchsia-400/10 px-4 py-2.5 text-sm font-bold text-fuchsia-200 transition hover:bg-fuchsia-400/20">
              <Icon name="sparkles" size={16} /> No image handy? Try our low-res sample (128×96)
            </button>
          </div>
        </>
      )}

      {error && (
        <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm leading-relaxed text-rose-200" role="alert">
          <Icon name="x" size={17} className="mt-0.5 shrink-0" /> {error}
        </div>
      )}

      {item && prepared && output && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* original */}
          <div>
            <p className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
              Original
              <span className="font-semibold normal-case tracking-normal text-slate-500">{item.width} × {item.height} · {formatBytes(item.file.size)}</span>
            </p>
            <div className="checker overflow-hidden rounded-2xl border border-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.url} alt="Original low resolution upload" className="max-h-[440px] w-full object-contain" style={{ imageRendering: item.width <= 512 ? "pixelated" : "auto" }} />
            </div>
            <p className="mt-2 truncate text-xs text-slate-500" title={item.file.name}>{item.file.name}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button onClick={reset} className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2 text-sm font-semibold text-slate-300 transition hover:border-rose-400/40 hover:text-rose-300">
                <Icon name="trash" size={15} /> Different image
              </button>
            </div>

            <div className="mt-5 rounded-2xl border border-fuchsia-400/25 bg-fuchsia-400/[0.05] p-4 text-sm">
              <p className="flex items-center justify-between">
                <span className="text-slate-400">AI input</span>
                <strong className="text-white">{prepared.width} × {prepared.height}</strong>
              </p>
              <p className="mt-1.5 flex items-center justify-between">
                <span className="text-slate-400">HD output</span>
                <strong className="text-fuchsia-300">{output.width} × {output.height} · {((output.width * output.height) / 1e6).toFixed(1)} MP</strong>
              </p>
              <div className="mt-3 flex items-center gap-2" aria-hidden="true">
                <span className="grid h-8 w-8 place-items-center rounded-md bg-rose-500/25 text-[9px] font-bold text-rose-200">LOW</span>
                <span className="h-0.5 flex-1 rounded bg-gradient-to-r from-rose-500 via-amber-400 to-fuchsia-400" />
                <span className="grid h-11 w-11 place-items-center rounded-md bg-fuchsia-500/30 text-[10px] font-extrabold text-fuchsia-100">HD {scale}x</span>
              </div>
            </div>
          </div>

          {/* settings */}
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">Engine</h2>
            <div className="mt-2.5 grid grid-cols-2 gap-2">
              {[
                ["ai", "AI Upscale ★", "ESRGAN neural net rebuilds real detail. Best quality, slower."],
                ["fast", "Fast Enhance", "Pro scaling + the full restoration finish. Instant, no downloads, works anywhere."],
              ].map(([val, title, desc]) => (
                <button key={val} onClick={() => setEngine(val)} disabled={working}
                  className={`rounded-xl border px-3 py-2.5 text-left transition disabled:opacity-50 ${engine === val ? "border-fuchsia-400 bg-fuchsia-400/10" : "border-white/10 bg-white/[0.02] hover:border-fuchsia-400/40"}`}>
                  <span className="block text-sm font-bold text-white">{title}</span>
                  <span className="block text-[11px] leading-snug text-slate-400">{desc}</span>
                </button>
              ))}
            </div>

            <h2 className="mt-5 text-sm font-bold uppercase tracking-wider text-slate-300">Upscale amount</h2>
            <div className="mt-2.5 grid grid-cols-2 gap-2">
              {[2, 4].map((s) => (
                <button key={s} onClick={() => setScale(s)} disabled={working}
                  className={`rounded-xl border px-3 py-3 text-center transition disabled:opacity-50 ${scale === s ? "border-amber-400 bg-amber-400/10" : "border-white/10 bg-white/[0.02] hover:border-amber-400/40"}`}>
                  <span className="text-xl font-black text-white">{s}x</span>
                  <span className="block text-[11px] text-slate-400">{s === 2 ? "Fast · great for most photos" : "Maximum HD · best for tiny images"}</span>
                </button>
              ))}
            </div>

            <div className="mt-5">
              <label htmlFor="cap" className="text-sm font-semibold text-white">Input size for processing</label>
              <select id="cap" value={inputCap} disabled={working} onChange={(e) => setInputCap(+e.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-[#12152e] px-3 py-2.5 text-sm text-white outline-none focus:border-fuchsia-400/60 disabled:opacity-50">
                <option value={768}>Max 768px — fastest, phone friendly</option>
                <option value={1024}>Max 1024px — balanced ★</option>
                <option value={1280}>Max 1280px — more detail, slower</option>
                <option value={0}>Original size — slowest, desktop only</option>
              </select>
              <p className="mt-1.5 text-xs text-slate-500">Smaller inputs upscale much faster. Your image is only pre-sized if it is bigger than this.</p>
            </div>

            <div className="mt-5 space-y-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Enhance finish</p>
              {[
                ["Clarity (deblur-style local contrast)", clarity, setClarity],
                ["Sharpen fine details", sharpen, setSharpen],
                ["Noise & block cleanup", denoise, setDenoise],
                ["Vibrance (colour life)", color, setColor],
              ].map(([label, val, set]) => (
                <div key={label}>
                  <label className="flex items-center justify-between text-sm font-semibold text-white">
                    {label} <span className="rounded-md bg-fuchsia-400/15 px-2 py-0.5 text-xs font-bold text-fuchsia-300">{val}%</span>
                  </label>
                  <input type="range" min="0" max="100" value={val} disabled={working} onChange={(e) => set(+e.target.value)} className="mt-2 w-full disabled:opacity-50" />
                </div>
              ))}
              <p className="text-xs leading-relaxed text-slate-500">
                The finish is a real restoration pipeline — edge-preserving denoise, large-radius local contrast
                (“clarity”), a 1px unsharp pass and vibrance — so blur, pixelation and JPEG blocks visibly clean up.
                It sharpens the detail your pixels already hold; like every on-device tool it does not invent new
                facial features the way server-side face-reenactment apps do.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="efmt" className="text-sm font-semibold text-white">Output format</label>
                  <select id="efmt" value={format} disabled={working} onChange={(e) => setFormat(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-[#12152e] px-3 py-2.5 text-sm text-white outline-none focus:border-fuchsia-400/60 disabled:opacity-50">
                    <option value="image/png">PNG — max quality (bigger file)</option>
                    <option value="image/jpeg">JPG — universal</option>
                    <option value="image/webp">WebP — HD but smaller</option>
                  </select>
                </div>
                {format !== "image/png" && (
                  <div>
                    <label className="flex items-center justify-between text-sm font-semibold text-white">Quality <span className="font-bold text-fuchsia-300">{quality}%</span></label>
                    <input type="range" min="50" max="100" value={quality} disabled={working} onChange={(e) => setQuality(+e.target.value)} className="mt-3.5 w-full disabled:opacity-50" />
                  </div>
                )}
              </div>
            </div>

            {!working ? (
              <button onClick={enhance} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-fuchsia-500 to-violet-500 px-6 py-3.5 font-extrabold text-white shadow-xl shadow-fuchsia-500/25 transition hover:brightness-110 sm:w-auto">
                <Icon name="sparkles" size={19} strokeWidth={2} /> Enhance to HD ({scale}x {engine === "ai" ? "AI" : "Fast"})
              </button>
            ) : (
              <button onClick={cancel} className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-rose-400/40 bg-rose-400/10 px-5 py-3 text-sm font-bold text-rose-300 hover:bg-rose-400/20">
                <Icon name="x" size={16} /> Cancel enhancement
              </button>
            )}

            {(working || stage) && (
              <div className="mt-5" role="status" aria-live="polite">
                {progress != null && (
                  <div className="h-3 overflow-hidden rounded-full bg-white/[0.08]">
                    <div className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 to-amber-400 transition-all duration-300" style={{ width: `${progress}%` }} />
                  </div>
                )}
                <p className="mt-2 text-xs leading-relaxed text-slate-400">{stage}{working && progress != null ? ` (${progress}%)` : ""}</p>
                {working && engine === "ai" && <p className="mt-1 text-xs text-slate-500">AI runs on your device GPU/CPU — big images can take 30 seconds to a few minutes. Keep this tab in front.</p>}
              </div>
            )}
          </div>
        </div>
      )}

      {result && item && (
        <div className="mt-8 rounded-3xl border border-emerald-400/25 bg-emerald-400/[0.04] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="inline-flex items-center gap-2 text-lg font-extrabold text-white">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-emerald-400 text-[#032114]"><Icon name="check" size={17} strokeWidth={2.4} /></span>
              Enhanced HD result
            </h2>
            <span className="rounded-full bg-emerald-400 px-3 py-1 text-xs font-extrabold text-[#032114]">
              {item.width}×{item.height} → {result.width}×{result.height} · {result.engineUsed} · {result.secs}s
            </span>
          </div>

          {/* before / after compare */}
          <div className="relative mx-auto mt-5 max-w-3xl select-none overflow-hidden rounded-2xl border border-white/12" style={{ aspectRatio: `${result.width} / ${result.height}` }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={result.url} alt="Enhanced HD result" className="absolute inset-0 h-full w-full object-cover checker" draggable={false} />
            <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - compare}% 0 0)` }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.url} alt="Original before enhancement" className="absolute inset-0 h-full w-full object-cover checker" style={{ imageRendering: "pixelated" }} draggable={false} />
            </div>
            <span className="absolute top-0 bottom-0 w-[3px] bg-amber-400 shadow-[0_0_14px_rgba(255,197,49,.9)]" style={{ left: `calc(${compare}% - 1px)` }} aria-hidden="true" />
            <span className="absolute left-3 top-3 rounded-md bg-black/60 px-2 py-1 text-[10px] font-bold text-white">BEFORE · {item.width}px</span>
            <span className="absolute right-3 top-3 rounded-md bg-fuchsia-600/85 px-2 py-1 text-[10px] font-bold text-white">AFTER · {result.width}px HD</span>
          </div>
          <div className="mx-auto mt-3 max-w-3xl">
            <label className="flex items-center gap-3 text-xs font-semibold text-slate-400">
              <span>◂ BEFORE</span>
              <input type="range" min="0" max="100" value={compare} onChange={(e) => setCompare(+e.target.value)} className="flex-1" aria-label="Compare before and after" />
              <span>AFTER ▸</span>
            </label>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button onClick={() => downloadBlob(result.blob, result.name)} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-400 px-6 py-3.5 font-extrabold text-[#032114] shadow-xl shadow-emerald-500/20 transition hover:bg-emerald-300">
              <Icon name="download" size={19} strokeWidth={2.1} /> Download HD image ({formatBytes(result.blob.size)})
            </button>
            <p className="text-xs text-slate-500">{result.name} — full resolution, no watermark. Not happy? Raise the input cap to 1280 / Original or try 4x and run it again.</p>
          </div>
        </div>
      )}
    </div>
  );
}
