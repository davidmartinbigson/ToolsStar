// ── Central site config ──────────────────────────────────────────────────────
// Change SITE_URL to your real domain after deployment (used for SEO,
// canonical URLs, sitemap.xml and Open Graph tags).
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://toolsstars.com";
export const SITE_NAME = "Tools Stars";
export const SITE_TAGLINE = "Free Online Tools That Run in Your Browser";
export const SITE_DESCRIPTION =
  "Tools Stars offers free online tools — video compressor, image compressor, JPG & PNG compressor, AI background remover, AI image enhancer & upscaler, image resizer, converter and more. No sign-up, no uploads: everything runs 100% in your browser.";

// Public support address shown on the Contact page and in the footer.
export const SITE_EMAIL = process.env.NEXT_PUBLIC_SITE_EMAIL || "support@toolsstars.com";

// ── Monetisation & analytics (all optional, all env-driven) ─────────────────
// Nothing renders until the matching variable is set at build time, so the
// site keeps working (and stays free of layout shift) before approval.
export const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT || ""; // ca-pub-XXXXXXXXXXXXXXXX
export const ADSENSE_PUBLISHER_ID = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID || ""; // pub-XXXXXXXXXXXXXXXX
export const ADSENSE_SLOT = process.env.NEXT_PUBLIC_ADSENSE_SLOT || ""; // responsive unit slot id
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID || ""; // G-XXXXXXXXXX

export const ADS_ENABLED = Boolean(ADSENSE_CLIENT);
export const ANALYTICS_ENABLED = Boolean(GA_ID);
// True when any optional (non-essential) processing exists that needs consent.
export const CONSENT_NEEDED = ADS_ENABLED || ANALYTICS_ENABLED;

// Languages offered by the floating translate pill. Google's old in-page
// Website Translator widget is unsupported (ended Oct 1, 2026) and rewrote the
// DOM in place, which breaks React apps — so the pill opens Google Translate
// in a NEW TAB instead: no third-party script on our pages, no translated
// copies ever indexed on our domain (the only auto-translation setup that
// could trip Google's scaled-content spam policy), and ads keep running here.
export const TRANSLATE_LANGS = [
  { code: "ur", label: "Urdu — اردو" },
  { code: "ar", label: "Arabic — العربية" },
  { code: "hi", label: "Hindi — हिन्दी" },
  { code: "bn", label: "Bengali — বাংলা" },
  { code: "tr", label: "Turkish — Türkçe" },
  { code: "id", label: "Indonesian — Indonesia" },
  { code: "es", label: "Spanish — Español" },
  { code: "pt", label: "Portuguese — Português" },
  { code: "fr", label: "French — Français" },
  { code: "de", label: "German — Deutsch" },
  { code: "ru", label: "Russian — Русский" },
  { code: "zh-CN", label: "Chinese — 中文" },
];

export function googleTranslateUrl(pageUrl, code) {
  return `https://translate.google.com/translate?sl=auto&tl=${encodeURIComponent(code)}&u=${encodeURIComponent(pageUrl)}`;
}

// Third-party origins the tools fetch libraries from at runtime.
export const CDN_ORIGINS = ["https://esm.sh", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"];
