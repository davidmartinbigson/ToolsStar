"use client";

import { useCallback, useMemo, useState } from "react";
import Dropzone from "@/components/Dropzone";
import { Icon } from "@/components/icons";
import { formatBytes, downloadBlob, stripExt, loadImage, renderToBlob, friendlyError } from "@/lib/utils";

const PRESETS = [
  { name: "Instagram Post", w: 1080, h: 1080 },
  { name: "Instagram Story / Reels", w: 1080, h: 1920 },
  { name: "YouTube Thumbnail", w: 1280, h: 720 },
  { name: "Facebook Cover", w: 1640, h: 924 },
  { name: "X / Twitter Post", w: 1600, h: 900 },
  { name: "LinkedIn Post", w: 1200, h: 627 },
  { name: "WhatsApp DP", w: 640, h: 640 },
  { name: "Pinterest Pin", w: 1000, h: 1500 },
];

const FIT_MODES = [
  {
    id: "contain",
    title: "Fit whole image",
    badge: "Recommended",
    text: "Exact output size. No stretching and no cropping — any empty edges use the background below.",
  },
  {
    id: "cover",
    title: "Crop to frame",
    badge: "No stretch",
    text: "Exact output size with the frame completely filled. The center is kept and overflow edges are cropped.",
  },
  {
    id: "stretch",
    title: "Stretch",
    badge: "May distort",
    text: "Forces the image into the exact width and height. Use only when a form explicitly demands it.",
  },
];

const EXT = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
const selectClass = "mt-2 w-full rounded-xl border border-white/10 bg-[#12152e] px-3 py-2.5 text-sm text-white outline-none focus:border-amber-400/60";

export default function ImageResizer() {
  const [item, setItem] = useState(null); // {file,img,url,width,height}
  const [w, setW] = useState("");
  const [h, setH] = useState("");
  const [lock, setLock] = useState(true);
  const [fitMode, setFitMode] = useState("contain");
  const [bg, setBg] = useState("white");
  const [customBg, setCustomBg] = useState("#111827");
  const [pct, setPct] = useState(100);
  const [format, setFormat] = useState("keep");
  const [quality, setQuality] = useState(90);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const onFiles = useCallback(async (files) => {
    try {
      setError("");
      setResult(null);
      const loaded = await loadImage(files[0]);
      setItem({ file: files[0], ...loaded });
      setW(loaded.width);
      setH(loaded.height);
      setPct(100);
      setLock(true);
      setFitMode("contain");
    } catch (e) {
      setError(friendlyError(e, "Could not read that image."));
    }
  }, []);

  const setWidth = (val) => {
    setW(val);
    setResult(null);
    const num = parseInt(val, 10);
    if (lock && item && num > 0) {
      setH(Math.max(1, Math.round((num / item.width) * item.height)));
      setPct(Math.round((num / item.width) * 100));
    }
  };
  const setHeight = (val) => {
    setH(val);
    setResult(null);
    const num = parseInt(val, 10);
    if (lock && item && num > 0) {
      setW(Math.max(1, Math.round((num / item.height) * item.width)));
      setPct(Math.round((num / item.height) * 100));
    }
  };
  const applyPct = (val) => {
    setPct(val);
    setResult(null);
    if (item) {
      setW(Math.max(1, Math.round((item.width * val) / 100)));
      setH(Math.max(1, Math.round((item.height * val) / 100)));
    }
  };
  const applyPreset = (p) => {
    setResult(null);
    // A preset is an exact destination frame, not an instruction to distort
    // the photo. Keep the safe "fit whole image" behaviour by default; the
    // user can explicitly choose Crop or Stretch below.
    setFitMode("contain");
    setLock(false);
    setW(p.w);
    setH(p.h);
  };

  const targetWidth = parseInt(w, 10);
  const targetHeight = parseInt(h, 10);
  const hasTarget = item && targetWidth > 0 && targetHeight > 0;
  const outputType = item
    ? (format === "keep" ? (EXT[item.file.type] ? item.file.type : "image/png") : format)
    : "image/png";
  const effectiveBg = bg === "transparent"
    ? (outputType === "image/jpeg" ? "#ffffff" : null)
    : bg === "white" ? "#ffffff" : bg === "black" ? "#000000" : customBg;

  const placement = useMemo(() => {
    if (!hasTarget) return null;
    if (fitMode === "contain") {
      const scale = Math.min(targetWidth / item.width, targetHeight / item.height);
      const drawnWidth = Math.max(1, Math.round(item.width * scale));
      const drawnHeight = Math.max(1, Math.round(item.height * scale));
      return {
        drawnWidth,
        drawnHeight,
        hasPadding: drawnWidth < targetWidth - 1 || drawnHeight < targetHeight - 1,
      };
    }
    if (fitMode === "cover") {
      const scale = Math.max(targetWidth / item.width, targetHeight / item.height);
      const cropWidth = Math.min(item.width, Math.round(targetWidth / scale));
      const cropHeight = Math.min(item.height, Math.round(targetHeight / scale));
      const croppedSide = cropWidth < item.width ? "width" : cropHeight < item.height ? "height" : null;
      const croppedPct = croppedSide === "width"
        ? Math.round((1 - cropWidth / item.width) * 100)
        : croppedSide === "height" ? Math.round((1 - cropHeight / item.height) * 100) : 0;
      return { cropWidth, cropHeight, croppedSide, croppedPct };
    }
    return { drawnWidth: targetWidth, drawnHeight: targetHeight };
  }, [hasTarget, item, targetWidth, targetHeight, fitMode]);

  const resize = async () => {
    if (!hasTarget) {
      setError("Enter a valid width and height (in pixels).");
      return;
    }
    setError("");
    try {
      const type = outputType;
      const blob = await renderToBlob(item.img, {
        width: targetWidth,
        height: targetHeight,
        type,
        quality: quality / 100,
        background: fitMode === "contain" ? effectiveBg : (type === "image/jpeg" ? "#ffffff" : null),
        fit: fitMode,
      });
      if (result?.url) URL.revokeObjectURL(result.url);
      setResult({
        blob,
        url: URL.createObjectURL(blob),
        name: `${stripExt(item.file.name)}-${targetWidth}x${targetHeight}.${EXT[type]}`,
        width: targetWidth,
        height: targetHeight,
        fitMode,
        placement,
      });
    } catch (e) {
      setError(friendlyError(e, "Resize failed in this browser."));
    }
  };

  const reset = () => {
    if (result?.url) URL.revokeObjectURL(result.url);
    if (item?.url) URL.revokeObjectURL(item.url);
    setItem(null);
    setResult(null);
    setError("");
  };

  const previewRatio = hasTarget ? targetWidth / targetHeight : item ? item.width / item.height : 4 / 3;
  const previewBgClass = fitMode === "contain" && bg === "transparent" && outputType !== "image/jpeg" ? "checker" : "";
  const previewStyle = {
    aspectRatio: `${previewRatio}`,
    width: `min(100%, ${Math.round(420 * previewRatio)}px)`,
    maxHeight: 420,
    backgroundColor: previewBgClass ? undefined : (fitMode === "contain" ? (effectiveBg || "transparent") : "#000"),
  };

  return (
    <div>
      {!item && <Dropzone accept="image/*" allowPaste onFiles={onFiles} title="Drop an image to resize" hint="JPG, PNG, WebP — exact pixels, % scale, or no-stretch social presets" icon="resize" />}
      {error && <div className="mt-4 rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-200" role="alert">{error}</div>}

      {item && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <div className="mb-2.5 flex items-center justify-between gap-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">Live output preview</h2>
              <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-[11px] font-bold text-emerald-200">
                {FIT_MODES.find((m) => m.id === fitMode)?.title}
              </span>
            </div>
            <div className={`relative mx-auto overflow-hidden rounded-2xl border border-white/15 ${previewBgClass}`} style={previewStyle}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.url}
                alt="Preview of how your image will fit the selected size"
                className="absolute inset-0 h-full w-full"
                style={{ objectFit: fitMode === "contain" ? "contain" : fitMode === "cover" ? "cover" : "fill" }}
              />
            </div>
            <div className="mt-3 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-3.5 text-sm text-slate-400" role="status">
              <p>
                Original: <strong className="text-white">{item.width} × {item.height}px</strong> · {formatBytes(item.file.size)}
                {hasTarget && <> · Output: <strong className="text-white">{targetWidth} × {targetHeight}px</strong></>}
              </p>
              {placement && fitMode === "contain" && (
                <p className="mt-1.5 text-emerald-200">
                  {placement.hasPadding
                    ? `Whole image will be shown at ${placement.drawnWidth} × ${placement.drawnHeight}px, centered inside the exact ${targetWidth} × ${targetHeight}px frame. No stretching or cropping.`
                    : "Perfect ratio match — the whole image fills this frame naturally without stretching."}
                </p>
              )}
              {placement && fitMode === "cover" && (
                <p className="mt-1.5 text-cyan-200">
                  {placement.croppedSide
                    ? `The center ${placement.cropWidth} × ${placement.cropHeight}px area will be used; about ${placement.croppedPct}% of the ${placement.croppedSide} will be cropped. No stretching.`
                    : "Perfect ratio match — no cropping needed."}
                </p>
              )}
              {fitMode === "stretch" && (
                <p className="mt-1.5 font-semibold text-amber-200">Stretch is selected: the image will be forced to exact dimensions and may look distorted.</p>
              )}
              <span className="mt-1 block truncate text-xs text-slate-500">{item.file.name}</span>
            </div>
            <button onClick={reset} className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2 text-sm font-semibold text-slate-300 hover:text-rose-300 hover:border-rose-400/40">
              <Icon name="trash" size={15} /> Different image
            </button>
          </div>

          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">Social media presets</h2>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button key={p.name} onClick={() => applyPreset(p)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-bold transition ${+w === p.w && +h === p.h ? "border-amber-400 bg-amber-400/15 text-amber-200" : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-amber-400/40"}`}>
                  {p.name} · {p.w}×{p.h}
                </button>
              ))}
            </div>

            <h2 className="mt-6 text-sm font-bold uppercase tracking-wider text-slate-300">How should the image fit?</h2>
            <div className="mt-2.5 grid gap-2 sm:grid-cols-3" role="group" aria-label="Image fit mode">
              {FIT_MODES.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => { setFitMode(mode.id); setResult(null); }}
                  aria-pressed={fitMode === mode.id}
                  className={`rounded-2xl border p-3 text-left transition ${fitMode === mode.id ? "border-amber-400 bg-amber-400/10" : "border-white/10 bg-white/[0.02] hover:border-amber-400/40"}`}
                >
                  <span className="flex flex-wrap items-center justify-between gap-1">
                    <span className="text-sm font-extrabold text-white">{mode.title}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wide ${mode.id === "stretch" ? "bg-amber-400/15 text-amber-200" : "bg-emerald-400/15 text-emerald-200"}`}>{mode.badge}</span>
                  </span>
                  <span className="mt-1.5 block text-[11px] leading-relaxed text-slate-400">{mode.text}</span>
                </button>
              ))}
            </div>

            {fitMode === "contain" && (
              <div className="mt-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
                <label htmlFor="rbg" className="text-sm font-semibold text-white">Empty-edge background</label>
                <select id="rbg" value={bg} onChange={(e) => { setBg(e.target.value); setResult(null); }} className={selectClass}>
                  <option value="white">White</option>
                  <option value="black">Black</option>
                  <option value="transparent">Transparent (PNG / WebP)</option>
                  <option value="custom">Custom colour</option>
                </select>
                {bg === "custom" && (
                  <span className="mt-3 flex items-center gap-3">
                    <input type="color" value={customBg} onChange={(e) => { setCustomBg(e.target.value); setResult(null); }} className="h-10 w-14 cursor-pointer rounded-lg border border-white/15 bg-transparent" aria-label="Custom background colour" />
                    <span className="font-mono text-xs text-slate-400">{customBg}</span>
                  </span>
                )}
                {bg === "transparent" && outputType === "image/jpeg" && (
                  <p className="mt-2 text-xs text-amber-200">JPG cannot store transparency, so a white background will be used. Choose PNG or WebP for transparent edges.</p>
                )}
              </div>
            )}

            <div className="mt-6 grid grid-cols-[1fr_auto_1fr] items-end gap-3">
              <div>
                <label htmlFor="rw" className="text-sm font-semibold text-white">Width (px)</label>
                <input id="rw" type="number" min="1" value={w} onChange={(e) => setWidth(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-[#12152e] px-3 py-2.5 text-white outline-none focus:border-amber-400/60" />
              </div>
              <button onClick={() => { setLock(!lock); setResult(null); }} aria-pressed={lock} title="Lock aspect ratio"
                className={`mb-0.5 grid h-[42px] w-[42px] place-items-center rounded-xl border transition ${lock ? "border-amber-400 bg-amber-400/15 text-amber-300" : "border-white/10 bg-white/[0.03] text-slate-400"}`}>
                <Icon name="lock" size={18} />
              </button>
              <div>
                <label htmlFor="rh" className="text-sm font-semibold text-white">Height (px)</label>
                <input id="rh" type="number" min="1" value={h} onChange={(e) => setHeight(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-[#12152e] px-3 py-2.5 text-white outline-none focus:border-amber-400/60" />
              </div>
            </div>
            <p className="mt-1.5 text-xs text-slate-500">
              {lock
                ? "Padlock on — changing one field keeps the other in the original ratio."
                : "Padlock off — fields set the exact destination frame. The fit style above still prevents distortion unless Stretch is selected."}
            </p>

            <div className="mt-5">
              <label htmlFor="pct" className="flex justify-between text-sm font-semibold text-white">Scale <span className="rounded-md bg-amber-400/15 px-2 py-0.5 text-xs font-bold text-amber-300">{pct}%</span></label>
              <input id="pct" type="range" min="5" max="200" value={pct} onChange={(e) => applyPct(+e.target.value)} className="mt-2.5 w-full" />
              <div className="mt-1.5 flex gap-2">
                {[25, 50, 75, 100, 150].map((v) => (
                  <button key={v} onClick={() => applyPct(v)} className="rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs font-semibold text-slate-300 hover:border-amber-400/40">{v}%</button>
                ))}
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="rfmt" className="text-sm font-semibold text-white">Output format</label>
                <select id="rfmt" value={format} onChange={(e) => { setFormat(e.target.value); setResult(null); }} className={selectClass}>
                  <option value="keep">Same as original</option>
                  <option value="image/jpeg">JPG</option>
                  <option value="image/png">PNG</option>
                  <option value="image/webp">WebP</option>
                </select>
              </div>
              <div>
                <label htmlFor="rq" className="flex justify-between text-sm font-semibold text-white">Quality <span className="text-amber-300 font-bold">{quality}%</span></label>
                <input id="rq" type="range" min="10" max="100" value={quality} onChange={(e) => { setQuality(+e.target.value); setResult(null); }} className="mt-3.5 w-full" />
              </div>
            </div>

            <button onClick={resize} className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-amber-400 px-6 py-3 font-extrabold text-[#241a00] shadow-xl shadow-amber-500/20 transition hover:bg-amber-300">
              <Icon name="resize" size={19} strokeWidth={2.1} /> Resize image
            </button>

            {result && (
              <div className="mt-6 rounded-2xl border border-emerald-400/25 bg-emerald-400/[0.06] p-4" role="status">
                <p className="font-bold text-white">
                  {result.width} × {result.height}px · {formatBytes(result.blob.size)}
                  <span className="block text-sm font-semibold text-emerald-200">
                    {result.fitMode === "contain" && "Whole image fitted — no stretching or cropping."}
                    {result.fitMode === "cover" && "Center-cropped to frame — no stretching."}
                    {result.fitMode === "stretch" && "Stretched to the exact dimensions you selected."}
                  </span>
                </p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={result.url} alt="Resized result" className="checker mt-3 max-h-[320px] w-full rounded-xl object-contain ring-1 ring-emerald-400/30" />
                <button onClick={() => downloadBlob(result.blob, result.name)} className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-emerald-400 px-4 py-2 text-sm font-extrabold text-[#032114] hover:bg-emerald-300">
                  <Icon name="download" size={16} /> Download resized image
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
