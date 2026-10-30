"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/icons";
import { TRANSLATE_LANGS, googleTranslateUrl } from "@/lib/site";

/* Floating bottom-left language helper. Deliberately NOT Google's old
   in-page translator widget (unsupported since Oct 2026, rewrote the DOM and
   broke React apps): each language opens Google Translate in a new tab with
   the current URL, so our pages stay untouched, nothing third-party loads
   here, and no machine-translated copy of the site ever exists on our
   domain for search engines to index. */
export default function TranslatePill() {
  const [open, setOpen] = useState(false);
  const [href, setHref] = useState("");

  useEffect(() => { setHref(window.location.href); }, []);

  return (
    <div className="fixed bottom-4 left-4 z-40">
      {open && (
        <div className="mb-2 w-56 rounded-2xl border border-white/10 bg-[#12152e]/95 p-3 shadow-2xl shadow-black/50 backdrop-blur">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Read this page in</p>
          <div className="mt-2 grid max-h-64 grid-cols-1 gap-1 overflow-y-auto pr-1">
            {TRANSLATE_LANGS.map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => { window.open(googleTranslateUrl(href || "https://toolsstars.com/", l.code), "_blank", "noopener"); setOpen(false); }}
                className="rounded-lg px-2.5 py-1.5 text-left text-sm font-semibold text-slate-200 transition hover:bg-cyan-400/10 hover:text-cyan-200"
              >
                {l.label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
            Opens Google Translate in a new tab — this site stays exactly as it is.
          </p>
        </div>
      )}
      <button
        type="button"
        aria-expanded={open}
        aria-label="Translate this page"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-[#12152e]/95 px-4 py-2.5 text-sm font-bold text-slate-200 shadow-xl shadow-black/40 backdrop-blur transition hover:border-cyan-400/50 hover:text-cyan-200"
      >
        <Icon name="globe" size={16} /> Translate
      </button>
    </div>
  );
}
