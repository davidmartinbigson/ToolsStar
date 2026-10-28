"use client";

import { useEffect, useRef, useState } from "react";
import { ADSENSE_CLIENT, ADSENSE_SLOT } from "@/lib/site";
import { subscribeConsent } from "@/lib/consent";

// One responsive Google AdSense unit.
//
// Safety rules baked in:
//  • Renders NOTHING unless both NEXT_PUBLIC_ADSENSE_CLIENT and
//    NEXT_PUBLIC_ADSENSE_SLOT are configured — so before approval the layout
//    is identical and there is zero cumulative layout shift.
//  • Renders nothing if the visitor chose "Essential only". We simply show no
//    ad rather than guessing at a non-personalised request.
//  • Pushes to adsbygoogle exactly once per slot (StrictMode-safe).

export default function AdSlot({ slot, format = "auto", label = "Advertisement", className = "" }) {
  const ref = useRef(null);
  const pushed = useRef(false);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => subscribeConsent((c) => setAllowed(Boolean(c.ads))), []);

  useEffect(() => {
    if (!allowed || pushed.current) return;
    const el = ref.current;
    if (!el) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // Ad blocker or loader not ready — fail silently, never break the tool.
    }
  }, [allowed]);

  const activeSlot = slot || ADSENSE_SLOT;

  if (!ADSENSE_CLIENT || !activeSlot) return null;
  if (!allowed) return null;

  return (
    <div className={`w-full ${className}`} aria-label={label}>
      <p className="mb-1 text-center text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600">
        {label}
      </p>
      <ins
        ref={ref}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={activeSlot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
