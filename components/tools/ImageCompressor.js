"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Dropzone from "@/components/Dropzone";
import { Icon } from "@/components/icons";
import { formatBytes, savedPct, downloadBlob, stripExt, loadImage, loadScriptAny, renderToBlob, fitWithin, uid, friendlyError } from "@/lib/utils";

const EXT = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

/* Each engine lists a mirror. With only cdnjs, an ad-blocker or a CDN outage
   silently downgraded PNG compression to the browser's own encoder — which
   usually produces a LARGER file — and the tool then reported "0% saved" with
   no way to tell that apart from a genuinely optimal PNG. */
const PAKO_SRCS = [
  "https://cdnjs.cloudflare.com/ajax/libs/pako/2.1.0/pako.min.js",
  "https://cdn.jsdelivr.net/npm/pako@2.1.0/dist/pako.min.js",
];
const UPNG_SRCS = [
  "https://cdnjs.cloudflare.com/ajax/libs/upng-js/2.1.0/UPNG.min.js",
  "https://cdn.jsdelivr.net/npm/upng-js@2.1.0/UPNG.js",
];

const MODE_COPY = {
  all: { drop: "Drop images to compress", hint: "JPG, PNG or WebP — add up to 50 at once" },
  jpg: { drop: "Drop JPG photos to compress", hint: "JPEG files (other images are converted to JPG)" },
  png: { drop: "Drop PNG images to compress", hint: "Smart PNG compression — transparency is always preserved" },
};

let pngEnginePromise = null;
function loadPngEngine() {
  if (typeof window !== "undefined" && window.UPNG?.encode && window.pako?.deflate) {
    return Promise.resolve(window.UPNG);
  }
  if (pngEnginePromise) return pngEnginePromise;
  pngEnginePromise = (async () => {
    // pako first: UPNG reaches for window.pako.deflate when it encodes.
    const engines = [["pako", PAKO_SRCS, () => window.pako?.deflate], ["UPNG", UPNG_SRCS, () => window.UPNG?.encode]];
    const missing = [];
    for (const [name, sources, present] of engines) {
      try {
        await loadScriptAny(sources);
      } catch {
        // fall through — `present()` is the only result that matters
      }
      if (!present()) missing.push(name);
    }
    if (missing.length) {
      throw new Error(
        `The PNG compression engine (${missing.join(" + ")}) could not be loaded from any mirror. ` +
          "Allow cdnjs.cloudflare.com and cdn.jsdelivr.net — an ad-blocker, a strict firewall or being offline usually causes this — then try again."
      );
    }
    return window.UPNG;
  })().catch((e) => {
    pngEnginePromise = null;
    throw e;
  });
  return pngEnginePromise;
}

function pngColorsForQuality(quality) {
  if (quality >= 96) return 256;
  return Math.max(16, Math.min(256, Math.round((quality / 100) * 256)));
}

function drawImageCanvas(img, width, height) {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return { canvas, ctx };
}

function canvasPngBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("PNG export failed in this browser."))),
      "image/png"
    );
  });
}

const letUiPaint = () => new Promise((resolve) => setTimeout(resolve, 10));

/* Distinct colours in the rendered pixels, bailing out early once we know a
   smaller palette cannot help. Measured against the real UPNG build: when a PNG
   already has few colours, UPNG writes it as a palette PNG even with cnum = 0
   (lossless), so asking for fewer colours returns a byte-identical file. That
   is a genuine 0% — this census is what lets us say so specifically. */
function countColours(data, cap = 512) {
  const seen = new Set();
  for (let i = 0; i < data.length; i += 4) {
    seen.add((data[i] << 24) | (data[i + 1] << 16) | (data[i + 2] << 8) | data[i + 3]);
    if (seen.size > cap) return { exact: false, count: seen.size };
  }
  return { exact: true, count: seen.size };
}

/* Honest wording for "re-encoding did not produce a smaller file" — the vague
   "Already well optimized" made a genuine 0% indistinguishable from a broken
   engine, which is why PNG compression looked like it was doing nothing. */
function noSavingsNote({ type, strategy, colours }) {
  if (type !== "image/png") {
    return "Already well optimized — re-encoding did not produce a smaller file, so the original was kept. Lower the quality, set a smaller max dimension, or switch to WebP."
  }
  if (strategy === "lossless") {
    return "Already optimized — lossless PNG keeps identical pixels, so this file cannot shrink further. Try Smart PNG, a smaller max dimension, or WebP.";
  }
  if (colours?.exact && colours.count <= 256) {
    const c = colours.count;
    return `Already optimal — this PNG holds only ${c} distinct colour${c === 1 ? "" : "s"} and is already stored as a compact palette, so fewer colours cannot shrink it. Resize it or convert to WebP for a real reduction.`;
  }
  return "Already well optimized — the re-encoded file was not smaller, so the original was kept. Resize it or convert to WebP for a real reduction.";
}

async function encodePngBlob(item, width, height, { strategy, quality }) {
  const { canvas, ctx } = drawImageCanvas(item.img, width, height);
  // Without the palette encoder the browser's own PNG output is usually LARGER
  // than the source, so the fallback is only acceptable when it still does
  // useful work (a resize, or a conversion from another format).
  const resized = width !== item.width || height !== item.height;
  const converted = item.file.type !== "image/png";
  const browserFallback = async (note) => {
    const blob = await canvasPngBlob(canvas);
    if (resized || converted || blob.size < item.file.size) {
      return { blob, note, colours: null, degraded: true };
    }
    return null;
  };

  let UPNG;
  try {
    UPNG = await loadPngEngine();
  } catch (e) {
    const ok = await browserFallback("Compressed with the browser's PNG encoder — the faster engine could not load");
    if (ok) return ok;
    throw e; // surfaces the mirror/ad-blocker explanation on the file itself
  }

  try {
    await letUiPaint();
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const rgba = pixels.data.buffer;
    const candidates = [];
    const encodeWith = (colors, note) => {
      // UPNG may retain/use the supplied buffer during encoding, so each
      // candidate gets its own copy.
      const encoded = UPNG.encode([rgba.slice(0)], canvas.width, canvas.height, colors);
      return { blob: new Blob([encoded], { type: "image/png" }), note };
    };

    if (strategy === "lossless") {
      candidates.push(encodeWith(0, "Lossless PNG optimized"));
      // Chrome/Firefox/Safari each have their own PNG encoder; sometimes one
      // produces a slightly smaller lossless file than UPNG, so keep the best.
      candidates.push({ blob: await canvasPngBlob(canvas), note: "Lossless PNG optimized" });
    } else {
      const colors = pngColorsForQuality(quality);
      const smart = encodeWith(colors, `Smart PNG · ${colors} colours`);
      candidates.push(smart);

      // If palette compression did not help much (or this is a conversion to
      // PNG, where comparing with the source size is not meaningful), also
      // try a fully lossless UPNG candidate and keep whichever is smaller.
      const pixelCount = canvas.width * canvas.height;
      const shouldTryLossless = item.file.type === "image/png"
        ? smart.blob.size >= item.file.size * 0.9
        : pixelCount <= 4_000_000;
      if (shouldTryLossless) {
        await letUiPaint();
        candidates.push(encodeWith(0, "Lossless PNG optimized"));
      }
    }

    candidates.sort((a, b) => a.blob.size - b.blob.size);
    const best = candidates[0];
    // Pay for the colour census only when we are about to report no savings.
    const colours = !converted && best.blob.size >= item.file.size ? countColours(pixels.data) : null;
    return { blob: best.blob, note: best.note, colours, degraded: false };
  } catch (e) {
    console.warn("UPNG encode failed; trying the browser PNG encoder.", e);
    const ok = await browserFallback("Compressed with the browser's PNG encoder");
    if (ok) return ok;
    throw new Error(friendlyError(e, "PNG encoding failed — the image may be too large for this browser."));
  }
}

export default function ImageCompressor({ mode = "all" }) {
  const [items, setItems] = useState([]);
  const [quality, setQuality] = useState(80);
  const [maxDim, setMaxDim] = useState(0);
  const [format, setFormat] = useState(mode === "jpg" ? "image/jpeg" : mode === "png" ? "image/png" : "auto");
  const [pngStrategy, setPngStrategy] = useState("smart");
  const [busy, setBusy] = useState(false);
  const [zipping, setZipping] = useState(false);
  const itemsRef = useRef([]);
  itemsRef.current = items;

  const addFiles = useCallback(async (files) => {
    const images = files.filter((f) => f.type.startsWith("image/") || /\.(jpe?g|png|webp|gif|bmp|avif)$/i.test(f.name));
    const fresh = await Promise.all(
      images.slice(0, 50).map(async (file) => {
        try {
          const { img, url, width, height } = await loadImage(file);
          return { id: uid(), file, img, url, width, height, status: "ready", result: null, resultUrl: null, outName: "", note: "" };
        } catch {
          return { id: uid(), file, img: null, url: null, width: 0, height: 0, status: "error", result: null, resultUrl: null, outName: "", note: "Could not read this file" };
        }
      })
    );
    setItems((prev) => [...prev, ...fresh]);
  }, []);

  const resolveType = useCallback(
    (item) => {
      if (format !== "auto") return format;
      return EXT[item.file.type] ? item.file.type : "image/png";
    },
    [format]
  );

  const compressOne = useCallback(
    async (item) => {
      const type = resolveType(item);
      const { width, height } = fitWithin(item.width, item.height, maxDim);
      let blob;
      let note = "";
      let png = null;

      if (type === "image/png") {
        png = await encodePngBlob(item, width, height, { strategy: pngStrategy, quality });
        blob = png.blob;
        note = png.note;
      } else {
        blob = await renderToBlob(item.img, {
          width,
          height,
          type,
          quality: quality / 100,
          background: type === "image/jpeg" ? "#ffffff" : null,
        });
      }

      // Never hand back a bigger file when format & size are unchanged.
      const unchanged = type === item.file.type && width === item.width && height === item.height;
      if (unchanged && blob.size >= item.file.size) {
        return {
          result: item.file,
          outName: item.file.name,
          note: noSavingsNote({ type, strategy: pngStrategy, colours: png?.colours }),
          kept: true,
        };
      }
      return { result: blob, outName: `${stripExt(item.file.name)}-compressed.${EXT[type]}`, note };
    },
    [maxDim, pngStrategy, quality, resolveType]
  );

  const compressAll = async () => {
    setBusy(true);
    for (const item of itemsRef.current) {
      if (!item.img || item.status === "error") continue;
      setItems((prev) => prev.map((it) => (it.id === item.id ? { ...it, status: "working" } : it)));
      try {
        const { result, outName, note } = await compressOne(item);
        setItems((prev) =>
          prev.map((it) =>
            it.id === item.id
              ? { ...it, status: "done", result, outName, note, resultUrl: result === item.file ? it.url : URL.createObjectURL(result) }
              : it
          )
        );
      } catch (e) {
        const note = friendlyError(e, "Compression failed for this image.");
        setItems((prev) => prev.map((it) => (it.id === item.id ? { ...it, status: "error", note } : it)));
      }
    }
    setBusy(false);
  };

  const downloadAll = async () => {
    const done = items.filter((i) => i.status === "done" && i.result);
    if (done.length === 1) return downloadBlob(done[0].result, done[0].outName);
    setZipping(true);
    try {
      const { default: JSZip } = await import("jszip");
      const zip = new JSZip();
      const used = new Set();
      done.forEach((i) => {
        let name = i.outName;
        let n = 2;
        while (used.has(name)) name = `${stripExt(i.outName)}-${n++}.${i.outName.split(".").pop()}`;
        used.add(name);
        zip.file(name, i.result);
      });
      const blob = await zip.generateAsync({ type: "blob" });
      downloadBlob(blob, "toolsstars-compressed-images.zip");
    } finally {
      setZipping(false);
    }
  };

  const remove = (id) =>
    setItems((prev) => {
      const it = prev.find((i) => i.id === id);
      if (it?.resultUrl && it.resultUrl !== it.url) URL.revokeObjectURL(it.resultUrl);
      if (it?.url) URL.revokeObjectURL(it.url);
      return prev.filter((i) => i.id !== id);
    });

  const clearAll = () => {
    items.forEach((i) => { if (i.url) URL.revokeObjectURL(i.url); });
    setItems([]);
  };

  const totals = useMemo(() => {
    const done = items.filter((i) => i.status === "done" && i.result);
    const before = done.reduce((s, i) => s + i.file.size, 0);
    const after = done.reduce((s, i) => s + i.result.size, 0);
    // `kept` counts files where no smaller version existed, so the banner can
    // say "originals kept" instead of implying the tool achieved nothing.
    return { count: done.length, before, after, pct: savedPct(before, after), kept: done.filter((i) => i.result === i.file).length };
  }, [items]);

  const hasPngInput = items.some((i) => i.file.type === "image/png" || /\.png$/i.test(i.file.name));
  const pngOutputActive = format === "image/png" || (format === "auto" && hasPngInput);
  const pngColors = pngColorsForQuality(quality);
  const qualityDisabled = format === "image/png" && pngStrategy === "lossless";
  const qualityLabel = quality >= 90 ? "Best quality" : quality >= 70 ? "Balanced ★ recommended" : quality >= 45 ? "Small file" : "Smallest file";
  const qualityHelp = format === "image/png"
    ? (pngStrategy === "lossless"
      ? "Lossless PNG keeps identical pixels, so quality does not apply. Savings can be 0% if the PNG is already optimized."
      : `Smart PNG will use an optimized palette of about ${pngColors} colours — this is what makes PNG→PNG actually shrink.`)
    : pngOutputActive
      ? (pngStrategy === "lossless"
        ? `PNG files stay lossless; JPG/WebP use ${quality}% quality.`
        : `PNG files use Smart PNG (about ${pngColors} colours); JPG/WebP use ${quality}% quality.`)
      : qualityLabel;

  return (
    <div>
      <Dropzone
        accept="image/*"
        multiple
        allowPaste
        compact={items.length > 0}
        onFiles={addFiles}
        title={items.length ? "Add more images" : MODE_COPY[mode].drop}
        hint={MODE_COPY[mode].hint}
        icon="image"
      />

      {items.length > 0 && (
        <>
          {/* settings */}
          <div className="mt-6 grid gap-5 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 md:grid-cols-3">
            <div>
              <label htmlFor="q" className="flex items-center justify-between text-sm font-semibold text-white">
                Quality <span className="rounded-md bg-amber-400/15 px-2 py-0.5 text-xs font-bold text-amber-300">{quality}%</span>
              </label>
              <input
                id="q" type="range" min="5" max="100" value={quality}
                onChange={(e) => setQuality(+e.target.value)} disabled={qualityDisabled}
                className="mt-3 w-full disabled:opacity-40"
              />
              <p className="mt-1.5 text-xs text-slate-500">{qualityHelp}</p>
            </div>

            <div>
              <label htmlFor="maxdim" className="text-sm font-semibold text-white">Max dimension (resize)</label>
              <select
                id="maxdim" value={maxDim} onChange={(e) => setMaxDim(+e.target.value)}
                className="mt-2.5 w-full rounded-xl border border-white/10 bg-[#12152e] px-3 py-2.5 text-sm text-white outline-none focus:border-amber-400/60"
              >
                <option value={0}>Keep original size</option>
                <option value={2560}>Max 2560 px (QHD)</option>
                <option value={1920}>Max 1920 px (Full HD)</option>
                <option value={1600}>Max 1600 px</option>
                <option value={1280}>Max 1280 px (web)</option>
                <option value={1024}>Max 1024 px</option>
                <option value={800}>Max 800 px (email / WhatsApp)</option>
              </select>
              <p className="mt-1.5 text-xs text-slate-500">Resizing is the fastest way to slash file size.</p>
            </div>

            <div>
              <label htmlFor="fmt" className="text-sm font-semibold text-white">Output format</label>
              <select
                id="fmt" value={format} onChange={(e) => setFormat(e.target.value)}
                className="mt-2.5 w-full rounded-xl border border-white/10 bg-[#12152e] px-3 py-2.5 text-sm text-white outline-none focus:border-amber-400/60"
              >
                {mode === "all" && <option value="auto">Same as original</option>}
                <option value="image/jpeg">JPG — best for photos</option>
                <option value="image/webp">WebP — smallest, keeps transparency</option>
                <option value="image/png">PNG — Smart or lossless, keeps transparency</option>
              </select>
              <p className="mt-1.5 text-xs text-slate-500">
                {format === "image/png"
                  ? "For real PNG→PNG savings, keep Smart PNG selected below."
                  : mode === "png" ? "Tip: WebP keeps transparency and is often 70–90% smaller than PNG." : "JPG flattens transparency onto white."}
              </p>
            </div>

            {pngOutputActive && (
              <div className="rounded-2xl border border-emerald-400/25 bg-emerald-400/[0.05] p-4 md:col-span-3">
                <div className="grid gap-3 sm:grid-cols-[280px_1fr] sm:items-center">
                  <div>
                    <label htmlFor="png-strategy" className="text-sm font-semibold text-white">PNG compression</label>
                    <select
                      id="png-strategy" value={pngStrategy} onChange={(e) => setPngStrategy(e.target.value)}
                      className="mt-2 w-full rounded-xl border border-white/10 bg-[#12152e] px-3 py-2.5 text-sm text-white outline-none focus:border-emerald-400/70"
                    >
                      <option value="smart">Smart PNG — smaller file ★ recommended</option>
                      <option value="lossless">Lossless PNG — identical pixels</option>
                    </select>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-400">
                    {pngStrategy === "smart" ? (
                      <>Smart PNG is still a real PNG. It uses an optimized colour palette (the TinyPNG/pngquant approach), keeps transparency, and commonly makes PNG→PNG files <strong className="text-emerald-200">40–85% smaller</strong>. Lower the Quality slider for fewer colours and an even smaller file.</>
                    ) : (
                      <>Lossless PNG preserves every pixel exactly and only re-optimizes the PNG encoding. That is safest for pixel-perfect assets, but an already optimized PNG may legitimately stay the same size (<strong className="text-amber-200">0%</strong>).</>
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* actions */}
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={compressAll} disabled={busy}
              className="inline-flex items-center gap-2 rounded-2xl bg-amber-400 px-6 py-3 font-extrabold text-[#241a00] shadow-xl shadow-amber-500/20 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Icon name="compress" size={19} strokeWidth={2.1} />
              {busy ? "Compressing…" : `Compress ${items.filter((i) => i.status !== "error").length} image(s)`}
            </button>
            {totals.count > 0 && (
              <button
                onClick={downloadAll} disabled={zipping}
                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-400 px-6 py-3 font-extrabold text-[#032114] shadow-xl shadow-emerald-500/20 transition hover:bg-emerald-300 disabled:opacity-60"
              >
                <Icon name="download" size={19} strokeWidth={2.1} />
                {zipping ? "Zipping…" : totals.count > 1 ? `Download all (${totals.count}) as ZIP` : "Download image"}
              </button>
            )}
            <button onClick={clearAll} className="inline-flex items-center gap-1.5 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-slate-300 hover:border-rose-400/40 hover:text-rose-300">
              <Icon name="trash" size={16} /> Clear all
            </button>
          </div>

          {/* totals */}
          {totals.count > 0 && (
            <div
              className={`mt-5 rounded-2xl border p-4 ${totals.pct > 0 ? "border-emerald-400/25 bg-emerald-400/[0.06]" : "border-amber-400/25 bg-amber-400/[0.06]"}`}
              role="status"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="font-semibold text-white">
                  Total: <span className="text-rose-300 line-through decoration-rose-400/60">{formatBytes(totals.before)}</span>
                  {" → "}
                  <span className={totals.pct > 0 ? "text-emerald-300 font-extrabold" : "text-amber-300 font-extrabold"}>{formatBytes(totals.after)}</span>
                </span>
                {totals.pct > 0 ? (
                  <span className="rounded-full bg-emerald-400 px-3 py-1 text-xs font-extrabold text-[#032114]">You saved {totals.pct}%</span>
                ) : (
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-amber-200">
                    {totals.kept === totals.count ? "No smaller version exists — originals kept" : "No net saving on these files"}
                  </span>
                )}
              </div>
              {totals.pct > 0 && (
                <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/[0.08]">
                  <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-300 transition-all duration-700" style={{ width: `${Math.max(2, 100 - totals.pct)}%` }} />
                </div>
              )}
              {totals.pct === 0 && totals.kept === totals.count && (
                <p className="mt-2 text-xs text-slate-400">
                  These PNGs are already stored efficiently. To shrink them further, set a smaller <strong className="text-slate-200">Max dimension</strong> or switch the output format to <strong className="text-slate-200">WebP</strong>.
                </p>
              )}
            </div>
          )}

          {/* list */}
          <ul className="mt-6 space-y-3">
            {items.map((item) => (
              <li key={item.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-3.5">
                {item.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.url} alt={item.file.name} className="h-16 w-16 shrink-0 rounded-xl object-cover checker" />
                ) : (
                  <span className="grid h-16 w-16 shrink-0 place-items-center rounded-xl bg-white/[0.05] text-rose-300"><Icon name="x" /></span>
                )}
                <div className="min-w-[180px] flex-1">
                  <p className="truncate text-sm font-semibold text-white" title={item.file.name}>{item.file.name}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {item.width ? `${item.width} × ${item.height} · ` : ""}{formatBytes(item.file.size)}
                    {item.note && <span className="text-amber-300"> · {item.note}</span>}
                  </p>
                  {item.status === "working" && <p className="mt-1 text-xs font-semibold text-amber-300">Compressing…</p>}
                  {item.status === "error" && <p className="mt-1 text-xs font-semibold text-rose-300">{item.note || "Something went wrong"}</p>}
                </div>

                {item.status === "done" && item.result && (
                  <>
                    {item.resultUrl && item.result !== item.file && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.resultUrl} alt="Compressed preview" className="h-16 w-16 shrink-0 rounded-xl object-cover ring-2 ring-emerald-400/50 checker" />
                    )}
                    <div className="text-right">
                      <p className="text-sm font-extrabold text-emerald-300">{formatBytes(item.result.size)}</p>
                      <span className="mt-0.5 inline-block rounded-full bg-emerald-400/15 border border-emerald-400/30 px-2 py-0.5 text-[11px] font-bold text-emerald-300">
                        −{savedPct(item.file.size, item.result.size)}%
                      </span>
                    </div>
                    <button
                      onClick={() => downloadBlob(item.result, item.outName)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-white/[0.06] border border-white/10 px-3.5 py-2 text-sm font-semibold text-white hover:border-emerald-400/50 hover:text-emerald-300"
                    >
                      <Icon name="download" size={15} /> Download
                    </button>
                  </>
                )}
                <button onClick={() => remove(item.id)} aria-label={`Remove ${item.file.name}`} className="rounded-lg p-2 text-slate-500 hover:bg-rose-400/10 hover:text-rose-300">
                  <Icon name="trash" size={17} />
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
