"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "./icons";

export default function Dropzone({
  accept = "image/*",
  multiple = false,
  onFiles,
  title = "Drop your files here",
  hint = "or click to browse — files never leave your device",
  icon = "upload",
  allowPaste = false,
  compact = false,
}) {
  const [drag, setDrag] = useState(false);
  const inputRef = useRef(null);

  const handle = useCallback(
    (fileList) => {
      const files = Array.from(fileList || []).filter(Boolean);
      if (files.length) onFiles(multiple ? files : files.slice(0, 1));
    },
    [onFiles, multiple]
  );

  useEffect(() => {
    if (!allowPaste) return;
    const onPaste = (e) => {
      const items = Array.from(e.clipboardData?.files || []);
      if (items.length) {
        e.preventDefault();
        handle(items);
      }
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [allowPaste, handle]);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={title}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => { e.preventDefault(); setDrag(false); handle(e.dataTransfer.files); }}
      className={`group cursor-pointer rounded-3xl border-2 border-dashed text-center transition duration-300 outline-none focus-visible:ring-4 focus-visible:ring-amber-400/20 ${
        compact ? "px-5 py-7" : "px-6 py-12"
      } ${
        drag
          ? "border-amber-400 bg-amber-400/[0.08] scale-[1.01]"
          : "border-white/15 bg-white/[0.02] hover:border-amber-400/50 hover:bg-white/[0.04]"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => { handle(e.target.files); e.target.value = ""; }}
      />
      <span className={`anim-bob mx-auto grid ${compact ? "h-12 w-12" : "h-16 w-16"} place-items-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-[#241a00] shadow-xl shadow-amber-500/25`}>
        <Icon name={icon} size={compact ? 24 : 30} strokeWidth={2} />
      </span>
      <p className={`mt-4 font-bold text-white ${compact ? "text-base" : "text-lg"}`}>{title}</p>
      <p className="mt-1.5 text-sm text-slate-400">{hint}</p>
      {allowPaste && (
        <p className="mt-2 text-xs text-slate-500">
          Tip: you can also press <kbd className="rounded border border-white/15 bg-white/[0.06] px-1.5 py-0.5 font-sans text-[10px] text-slate-300">Ctrl + V</kbd> to paste
        </p>
      )}
      <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-400/10 border border-emerald-400/25 px-3 py-1 text-[11px] font-semibold text-emerald-300">
        <Icon name="shield" size={12} /> 100% private — processed on your device
      </span>
    </div>
  );
}
