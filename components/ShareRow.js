"use client";

// Native share row for guides: WhatsApp / Facebook / X intents + copy-link.
// Plain outbound intents, no tracking, no third-party SDKs — just makes it
// easy for a happy reader to send a guide to someone who needs it.
import { useState } from "react";

export default function ShareRow({ title, url }) {
  const [copied, setCopied] = useState(false);
  const enc = encodeURIComponent;
  const targets = [
    { name: "WhatsApp", href: `https://wa.me/?text=${enc(`${title} ${url}`)}` },
    { name: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}` },
    { name: "X", href: `https://twitter.com/intent/tweet?text=${enc(title)}&url=${enc(url)}` },
  ];
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable — the link is still selectable on the page */
    }
  };
  return (
    <div className="mt-10 flex flex-wrap items-center gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
      <span className="mr-1 text-sm font-bold text-slate-300">If this guide helped, pass it on:</span>
      {targets.map((t) => (
        <a
          key={t.name}
          href={t.href}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-bold text-slate-200 transition hover:border-amber-400/40 hover:text-amber-200"
        >
          {t.name}
        </a>
      ))}
      <button
        type="button"
        onClick={copy}
        className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-bold text-slate-200 transition hover:border-amber-400/40 hover:text-amber-200"
      >
        {copied ? "Copied ✓" : "Copy link"}
      </button>
    </div>
  );
}
