"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "./icons";
import { CONSENT_NEEDED } from "@/lib/site";
import { readConsent, writeConsent } from "@/lib/consent";

// Cookie consent banner. Renders nothing at all unless an optional processor
// (AdSense or Google Analytics) is actually configured, so there is no
// pointless banner on a site that sets no advertising/analytics cookies.

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!CONSENT_NEEDED) return;
    const stored = readConsent();
    if (stored.ts) {
      window.__toolsstarsConsent = stored;
      return;
    }
    const t = setTimeout(() => setVisible(true), 900);
    return () => clearTimeout(t);
  }, []);

  if (!CONSENT_NEEDED || !visible) return null;

  const decide = (allow) => {
    writeConsent({ ads: allow, analytics: allow });
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-[60] px-3 pb-3 sm:px-6 sm:pb-6"
    >
      <div className="mx-auto max-w-3xl rounded-2xl border border-white/[0.10] bg-[#0a0d20]/95 p-5 shadow-2xl backdrop-blur-xl">
        <div className="flex items-start gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-amber-400/15 text-amber-300">
            <Icon name="shield" size={18} />
          </span>
          <div>
            <h2 className="text-sm font-bold text-white">We value your privacy</h2>
            <p className="mt-1.5 text-[13px] leading-relaxed text-slate-400">
              Your files are processed on your own device and never uploaded — that never changes.
              With your permission we also use cookies to measure anonymous traffic and to show ads
              that keep Tools Stars free. You can decline and everything still works.
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={() => decide(true)}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-bold text-[#241a00] shadow-lg shadow-amber-500/20 transition hover:bg-amber-300"
          >
            <Icon name="check" size={15} strokeWidth={2.4} /> Accept all
          </button>
          <button
            type="button"
            onClick={() => decide(false)}
            className="inline-flex items-center justify-center rounded-xl border border-white/12 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.08]"
          >
            Essential only
          </button>
          <Link
            href="/privacy-policy"
            className="inline-flex items-center justify-center px-2 py-2.5 text-sm font-medium text-slate-400 underline-offset-4 transition hover:text-amber-300 hover:underline sm:ml-auto"
          >
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
}
