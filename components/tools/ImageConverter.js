"use client";

import { useCallback, useRef, useState } from "react";
import Dropzone from "@/components/Dropzone";
import { Icon } from "@/components/icons";
import { formatBytes, downloadBlob, stripExt, loadImage, renderToBlob, uid, friendlyError } from "@/lib/utils";

const FORMATS = [
  { type: "image/jpeg", label: "JPG", ext: "jpg", desc: "Universal, smallest for photos. No transparency." },
  { type: "image/png", label: "PNG", ext: "png", desc: "Lossless + transparency. Larger files." },
  { type: "image/webp", label: "WebP", ext: "webp", desc: "Modern web format — tiny size, keeps transparency." },
];

export default function ImageConverter() {
  const [items, setItems] = useState([]);
  const [target, setTarget] = useState(FORMATS[0]);
  const [quality, setQuality] = useState(90);
  const [bgColor, setBgColor] = useState("#ffffff");
  const [busy, setBusy] = useState(false);
  const [zipping, setZipping] = useState(false);
  const ref = useRef([]);
  ref.current = items;

  const addFiles = useCallback(async (files) => {
    const fresh = await Promise.all(
      files.slice(0, 50).map(async (file) => {
        try {
          const loaded = await loadImage(file);
          return { id: uid(), file, ...loaded, status: "ready", result: null, resultUrl: null, outName: "", note: "" };
        } catch {
          return { id: uid(), file, img: null, url: null, status: "error", result: null, resultUrl: null, note: "Unreadable file" };
        }
      })
    );
    setItems((p) => [...p, ...fresh]);
  }, []);

  const convertAll = async () => {
    setBusy(true);
    for (const item of ref.current) {
      if (!item.img) continue;
      setItems((p) => p.map((it) => (it.id === item.id ? { ...it, status: "working" } : it)));
      try {
        const blob = await renderToBlob(item.img, {
          width: item.width, height: item.height, type: target.type,
          quality: quality / 100, background: target.type === "image/jpeg" ? bgColor : null,
        });
        setItems((p) => p.map((it) => (it.id === item.id
          ? { ...it, status: "done", result: blob, resultUrl: URL.createObjectURL(blob), outName: `${stripExt(item.file.name)}.${target.ext}` }
          : it)));
      } catch (e) {
        setItems((p) => p.map((it) => (it.id === item.id ? { ...it, status: "error", note: friendlyError(e, "Conversion failed for this image.") } : it)));
      }
    }
    setBusy(false);
  };

  const downloadAll = async () => {
    const done = items.filter((i) => i.status === "done");
    if (done.length === 1) return downloadBlob(done[0].result, done[0].outName);
    setZipping(true);
    try {
      const { default: JSZip } = await import("jszip");
      const zip = new JSZip();
      const used = new Set();
      done.forEach((i) => {
        let name = i.outName; let n = 2;
        while (used.has(name)) name = `${stripExt(i.outName)}-${n++}.${target.ext}`;
        used.add(name); zip.file(name, i.result);
      });
      downloadBlob(await zip.generateAsync({ type: "blob" }), `toolsstars-${target.ext}-images.zip`);
    } finally { setZipping(false); }
  };

  const doneCount = items.filter((i) => i.status === "done").length;

  return (
    <div>
      <Dropzone accept="image/*" multiple allowPaste compact={items.length > 0} onFiles={addFiles}
        title={items.length ? "Add more images" : "Drop images to convert"} hint="PNG, JPG, WebP, GIF, BMP, AVIF — convert in bulk" icon="convert" />

      {items.length > 0 && (
        <>
          <div className="mt-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">Convert to</h2>
            <div className="mt-2.5 grid gap-2 sm:grid-cols-3">
              {FORMATS.map((f) => (
                <button key={f.type} onClick={() => setTarget(f)}
                  className={`rounded-2xl border px-4 py-3.5 text-left transition ${target.type === f.type ? "border-amber-400 bg-amber-400/10" : "border-white/10 bg-white/[0.02] hover:border-amber-400/40"}`}>
                  <span className="text-lg font-extrabold text-white">.{f.label}</span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-slate-400">{f.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-x-8 gap-y-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
            {target.type !== "image/png" && (
              <label className="flex items-center gap-3 text-sm font-semibold text-white">
                Quality <span className="font-bold text-amber-300">{quality}%</span>
                <input type="range" min="10" max="100" value={quality} onChange={(e) => setQuality(+e.target.value)} className="w-36" />
              </label>
            )}
            {target.type === "image/jpeg" && (
              <label className="flex items-center gap-2.5 text-sm font-semibold text-white">
                Transparency fills with
                <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="h-8 w-10 cursor-pointer rounded-lg border border-white/15 bg-transparent" />
              </label>
            )}
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button onClick={convertAll} disabled={busy} className="inline-flex items-center gap-2 rounded-2xl bg-amber-400 px-6 py-3 font-extrabold text-[#241a00] shadow-xl shadow-amber-500/20 transition hover:bg-amber-300 disabled:opacity-60">
              <Icon name="convert" size={19} strokeWidth={2.1} /> {busy ? "Converting…" : `Convert to ${target.label}`}
            </button>
            {doneCount > 0 && (
              <button onClick={downloadAll} disabled={zipping} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-400 px-6 py-3 font-extrabold text-[#032114] shadow-xl shadow-emerald-500/20 transition hover:bg-emerald-300 disabled:opacity-60">
                <Icon name="download" size={19} strokeWidth={2.1} /> {zipping ? "Zipping…" : doneCount > 1 ? `Download all (${doneCount}) as ZIP` : "Download"}
              </button>
            )}
            <button onClick={() => setItems([])} className="inline-flex items-center gap-1.5 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-slate-300 hover:border-rose-400/40 hover:text-rose-300">
              <Icon name="trash" size={16} /> Clear all
            </button>
          </div>

          <ul className="mt-6 space-y-3">
            {items.map((item) => (
              <li key={item.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-3.5">
                {item.url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.url} alt={item.file.name} className="h-14 w-14 rounded-xl object-cover checker" />
                )}
                <div className="min-w-[160px] flex-1">
                  <p className="truncate text-sm font-semibold text-white">{item.file.name}</p>
                  <p className="text-xs text-slate-500">{item.width ? `${item.width} × ${item.height} · ` : ""}{formatBytes(item.file.size)}</p>
                  {item.status === "working" && <p className="text-xs font-semibold text-amber-300">Converting…</p>}
                  {item.status === "error" && <p className="text-xs font-semibold text-rose-300">{item.note}</p>}
                </div>
                <Icon name="arrow" size={16} className="text-slate-600" />
                <span className="rounded-lg bg-white/[0.06] border border-white/10 px-2.5 py-1 text-xs font-extrabold text-white">.{target.ext.toUpperCase()}</span>
                {item.status === "done" && (
                  <>
                    <span className="text-sm font-bold text-emerald-300">{formatBytes(item.result.size)}</span>
                    <button onClick={() => downloadBlob(item.result, item.outName)} className="inline-flex items-center gap-1.5 rounded-xl bg-white/[0.06] border border-white/10 px-3.5 py-2 text-sm font-semibold text-white hover:border-emerald-400/50 hover:text-emerald-300">
                      <Icon name="download" size={15} /> Download
                    </button>
                  </>
                )}
                <button onClick={() => setItems((p) => p.filter((i) => i.id !== item.id))} aria-label="Remove" className="rounded-lg p-2 text-slate-500 hover:bg-rose-400/10 hover:text-rose-300">
                  <Icon name="trash" size={16} />
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
