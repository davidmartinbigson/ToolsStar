"use client";

import { useCallback, useState } from "react";
import Dropzone from "@/components/Dropzone";
import { Icon } from "@/components/icons";
import { formatBytes, loadImage, uid } from "@/lib/utils";

const PAGE = {
  fit: { label: "Fit to image (no margins)" },
  a4: { label: "A4 — 210 × 297 mm", w: 210, h: 297 },
  letter: { label: "US Letter — 216 × 279 mm", w: 215.9, h: 279.4 },
};

export default function ImageToPdf() {
  const [items, setItems] = useState([]);
  const [pageSize, setPageSize] = useState("a4");
  const [margin, setMargin] = useState(10);
  const [busy, setBusy] = useState(false);
  const [doneInfo, setDoneInfo] = useState("");
  const [error, setError] = useState("");

  const addFiles = useCallback(async (files) => {
    setDoneInfo("");
    const fresh = await Promise.all(
      files.slice(0, 60).map(async (file) => {
        try {
          const loaded = await loadImage(file);
          return { id: uid(), file, ...loaded };
        } catch {
          return null;
        }
      })
    );
    setItems((p) => [...p, ...fresh.filter(Boolean)]);
  }, []);

  const move = (idx, dir) => {
    setItems((p) => {
      const next = [...p];
      const j = idx + dir;
      if (j < 0 || j >= next.length) return p;
      [next[idx], next[j]] = [next[j], next[idx]];
      return next;
    });
  };

  const build = async () => {
    if (!items.length) return;
    setBusy(true);
    setError("");
    setDoneInfo("");
    try {
      const { jsPDF } = await import("jspdf");
      let pdf = null;

      const toJpegDataUrl = (item) =>
        new Promise((resolve) => {
          const canvas = document.createElement("canvas");
          canvas.width = item.width;
          canvas.height = item.height;
          const ctx = canvas.getContext("2d");
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(item.img, 0, 0);
          resolve(canvas.toDataURL("image/jpeg", 0.92));
        });

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const dataUrl = await toJpegDataUrl(item);
        const landscape = item.width >= item.height;

        if (pageSize === "fit") {
          // Page matches the image's aspect ratio (at 96 dpi → mm).
          const wMm = (item.width / 96) * 25.4;
          const hMm = (item.height / 96) * 25.4;
          if (!pdf) pdf = new jsPDF({ orientation: landscape ? "landscape" : "portrait", unit: "mm", format: [wMm, hMm] });
          else pdf.addPage([wMm, hMm], landscape ? "landscape" : "portrait");
          pdf.addImage(dataUrl, "JPEG", 0, 0, wMm, hMm);
        } else {
          const spec = PAGE[pageSize];
          const pw = landscape ? spec.h : spec.w;
          const ph = landscape ? spec.w : spec.h;
          if (!pdf) pdf = new jsPDF({ orientation: landscape ? "landscape" : "portrait", unit: "mm", format: pageSize });
          else pdf.addPage(pageSize, landscape ? "landscape" : "portrait");
          const availW = pw - margin * 2;
          const availH = ph - margin * 2;
          const scale = Math.min(availW / item.width, availH / item.height);
          const w = item.width * scale;
          const h = item.height * scale;
          pdf.addImage(dataUrl, "JPEG", (pw - w) / 2, (ph - h) / 2, w, h);
        }
      }

      pdf.save("toolsstars-images.pdf");
      setDoneInfo(`PDF created with ${items.length} page(s) — check your downloads.`);
    } catch (e) {
      console.error(e);
      setError("Could not build the PDF — one of the images may be too large for this device. Try fewer / smaller images.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <Dropzone accept="image/*" multiple allowPaste compact={items.length > 0} onFiles={addFiles}
        title={items.length ? "Add more images" : "Drop images to make a PDF"} hint="Each image becomes a page — drag order with the arrows below" icon="pdf" />

      {error && <div className="mt-4 rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-200" role="alert">{error}</div>}
      {doneInfo && (
        <div className="mt-4 flex items-center gap-2.5 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm font-semibold text-emerald-200" role="status">
          <Icon name="check" size={17} /> {doneInfo}
        </div>
      )}

      {items.length > 0 && (
        <>
          <div className="mt-6 grid gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 sm:grid-cols-2">
            <div>
              <label htmlFor="ps" className="text-sm font-semibold text-white">Page size</label>
              <select id="ps" value={pageSize} onChange={(e) => setPageSize(e.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-[#12152e] px-3 py-2.5 text-sm text-white outline-none focus:border-amber-400/60">
                {Object.entries(PAGE).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
              <p className="mt-1.5 text-xs text-slate-500">Orientation (portrait/landscape) is chosen automatically per image.</p>
            </div>
            <div>
              <label htmlFor="mg" className="flex justify-between text-sm font-semibold text-white">Margin <span className="font-bold text-amber-300">{margin} mm</span></label>
              <input id="mg" type="range" min="0" max="30" value={margin} disabled={pageSize === "fit"} onChange={(e) => setMargin(+e.target.value)} className="mt-3.5 w-full disabled:opacity-40" />
            </div>
          </div>

          <ol className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((item, i) => (
              <li key={item.id} className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.url} alt={`Page ${i + 1}: ${item.file.name}`} className="h-36 w-full object-cover" />
                <span className="absolute left-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-black/70 text-[11px] font-extrabold text-amber-300">{i + 1}</span>
                <div className="flex items-center justify-between gap-1 px-2 py-2">
                  <span className="min-w-0 truncate text-[11px] text-slate-400" title={item.file.name}>{item.file.name} · {formatBytes(item.file.size)}</span>
                  <span className="flex shrink-0">
                    <button onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move earlier" className="rounded-md p-1.5 text-slate-300 hover:bg-white/[0.07] disabled:opacity-30"><Icon name="chevron" size={14} className="rotate-90" /></button>
                    <button onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label="Move later" className="rounded-md p-1.5 text-slate-300 hover:bg-white/[0.07] disabled:opacity-30"><Icon name="chevron" size={14} className="-rotate-90" /></button>
                    <button onClick={() => setItems((p) => p.filter((x) => x.id !== item.id))} aria-label="Remove page" className="rounded-md p-1.5 text-slate-400 hover:bg-rose-400/10 hover:text-rose-300"><Icon name="trash" size={14} /></button>
                  </span>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-6 flex flex-wrap gap-3">
            <button onClick={build} disabled={busy} className="inline-flex items-center gap-2 rounded-2xl bg-amber-400 px-6 py-3 font-extrabold text-[#241a00] shadow-xl shadow-amber-500/20 transition hover:bg-amber-300 disabled:opacity-60">
              <Icon name="pdf" size={19} strokeWidth={2} /> {busy ? "Building PDF…" : `Create PDF (${items.length} page${items.length > 1 ? "s" : ""})`}
            </button>
            <button onClick={() => { setItems([]); setDoneInfo(""); }} className="inline-flex items-center gap-1.5 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-slate-300 hover:border-rose-400/40 hover:text-rose-300">
              <Icon name="trash" size={16} /> Clear all
            </button>
          </div>
        </>
      )}
    </div>
  );
}
