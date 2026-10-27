"use client";

import { useCallback, useState } from "react";
import Dropzone from "@/components/Dropzone";
import { Icon } from "@/components/icons";
import { formatBytes, downloadBlob, stripExt, loadImage, renderToBlob } from "@/lib/utils";

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

const EXT = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

export default function ImageResizer() {
  const [item, setItem] = useState(null); // {file,img,url,width,height}
  const [w, setW] = useState("");
  const [h, setH] = useState("");
  const [lock, setLock] = useState(true);
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
    } catch (e) {
      setError(e.message);
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
    setLock(false);
    setW(p.w);
    setH(p.h);
  };

  const resize = async () => {
    const width = parseInt(w, 10);
    const height = parseInt(h, 10);
    if (!item || !width || !height || width < 1 || height < 1) {
      setError("Enter a valid width and height (in pixels).");
      return;
    }
    setError("");
    const type = format === "keep" ? (EXT[item.file.type] ? item.file.type : "image/png") : format;
    const blob = await renderToBlob(item.img, {
      width, height, type, quality: quality / 100,
      background: type === "image/jpeg" ? "#ffffff" : null,
    });
    setResult({ blob, url: URL.createObjectURL(blob), name: `${stripExt(item.file.name)}-${width}x${height}.${EXT[type]}`, width, height });
  };

  const reset = () => { setItem(null); setResult(null); setError(""); };

  return (
    <div>
      {!item && <Dropzone accept="image/*" allowPaste onFiles={onFiles} title="Drop an image to resize" hint="JPG, PNG, WebP — exact pixels, % scale, or social media presets" icon="resize" />}
      {error && <div className="mt-4 rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-200" role="alert">{error}</div>}

      {item && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/30">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.url} alt="Your upload" className="max-h-[420px] w-full object-contain" />
            </div>
            <p className="mt-2.5 text-sm text-slate-400">
              Original: <strong className="text-white">{item.width} × {item.height}px</strong> · {formatBytes(item.file.size)}
              <span className="block truncate text-xs text-slate-500">{item.file.name}</span>
            </p>
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

            <div className="mt-6 grid grid-cols-[1fr_auto_1fr] items-end gap-3">
              <div>
                <label htmlFor="rw" className="text-sm font-semibold text-white">Width (px)</label>
                <input id="rw" type="number" min="1" value={w} onChange={(e) => setWidth(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-[#12152e] px-3 py-2.5 text-white outline-none focus:border-amber-400/60" />
              </div>
              <button onClick={() => setLock(!lock)} aria-pressed={lock} title="Lock aspect ratio"
                className={`mb-0.5 grid h-[42px] w-[42px] place-items-center rounded-xl border transition ${lock ? "border-amber-400 bg-amber-400/15 text-amber-300" : "border-white/10 bg-white/[0.03] text-slate-400"}`}>
                <Icon name="lock" size={18} />
              </button>
              <div>
                <label htmlFor="rh" className="text-sm font-semibold text-white">Height (px)</label>
                <input id="rh" type="number" min="1" value={h} onChange={(e) => setHeight(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-[#12152e] px-3 py-2.5 text-white outline-none focus:border-amber-400/60" />
              </div>
            </div>
            <p className="mt-1.5 text-xs text-slate-500">{lock ? "Aspect ratio locked — no stretching." : "Free size — note the image will stretch to fit exactly (presets use this)."}</p>

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
                <select id="rfmt" value={format} onChange={(e) => { setFormat(e.target.value); setResult(null); }}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-[#12152e] px-3 py-2.5 text-sm text-white outline-none focus:border-amber-400/60">
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
                <div className="flex items-center gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={result.url} alt="Resized result" className="h-20 w-20 rounded-xl object-cover checker ring-2 ring-emerald-400/40" />
                  <div>
                    <p className="font-bold text-white">{result.width} × {result.height}px · {formatBytes(result.blob.size)}</p>
                    <button onClick={() => downloadBlob(result.blob, result.name)} className="mt-2 inline-flex items-center gap-1.5 rounded-xl bg-emerald-400 px-4 py-2 text-sm font-extrabold text-[#032114] hover:bg-emerald-300">
                      <Icon name="download" size={16} /> Download resized image
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
