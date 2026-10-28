"use client";

import { useEffect } from "react";
import { GA_ID } from "@/lib/site";
import { subscribeConsent } from "@/lib/consent";

// Google Analytics 4 — loaded ONLY when NEXT_PUBLIC_GA_ID is set AND the
// visitor has accepted optional cookies. Nothing is requested before consent,
// so a "Essential only" choice means no analytics hit is ever sent.

export default function Analytics() {
  useEffect(() => {
    if (!GA_ID) return;

    let loaded = false;

    const boot = () => {
      if (loaded) return;
      loaded = true;

      window.dataLayer = window.dataLayer || [];
      function gtag() {
        window.dataLayer.push(arguments);
      }
      window.gtag = gtag;
      gtag("js", new Date());
      gtag("config", GA_ID, { anonymize_ip: true });

      const s = document.createElement("script");
      s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
      s.async = true;
      document.head.appendChild(s);
    };

    return subscribeConsent((consent) => {
      if (consent.analytics) boot();
    });
  }, []);

  return null;
}
