import "./globals.css";
import Script from "next/script";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Analytics from "@/components/Analytics";
import CookieConsent from "@/components/CookieConsent";
import {
  SITE_URL,
  SITE_NAME,
  SITE_DESCRIPTION,
  CDN_ORIGINS,
  ADS_ENABLED,
  ADSENSE_CLIENT,
} from "@/lib/site";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Tools Stars — Free Online Tools: Compress Video & Images, Remove Backgrounds",
    template: "%s | Tools Stars",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "free online tools", "video compressor", "image compressor", "jpg compressor",
    "png compressor", "background remover", "ai image enhancer", "image upscaler", "image resizer", "image converter",
    "image to pdf", "qr code generator", "no sign up tools",
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: "Tools Stars — Free Online Tools That Run in Your Browser",
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tools Stars — Free Online Tools That Run in Your Browser",
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  icons: {
    // Real, crawlable files (NOT data: URIs — Google's favicon crawler can
    // only fetch stable URLs, and /favicon.ico is the legacy root fallback).
    // 96/192 are multiples of 48px as Google's favicon guidelines ask for.
    icon: [
      { url: "/favicon.ico", sizes: "48x48", type: "image/x-icon" },
      { url: "/favicon-96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport = {
  themeColor: "#05060f",
  width: "device-width",
  initialScale: 1,
};

// Deterministic starfield (rendered on the server — zero JS cost).
function Starfield() {
  const stars = Array.from({ length: 80 }, (_, i) => {
    const x = (i * 137.5) % 100;
    const y = (i * 89.3 + 7) % 100;
    const s = 1 + ((i * 31) % 3);
    const d = (i % 9) * 0.45;
    return { x, y, s, d, gold: i % 7 === 0 };
  });
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_-10%,rgba(124,92,255,.22),transparent),radial-gradient(ellipse_55%_40%_at_85%_10%,rgba(255,197,49,.10),transparent),radial-gradient(ellipse_60%_45%_at_10%_90%,rgba(34,211,238,.08),transparent)]" />
      {stars.map((st, i) => (
        <span
          key={i}
          className="anim-twinkle absolute rounded-full"
          style={{
            left: `${st.x}%`,
            top: `${st.y}%`,
            width: st.s,
            height: st.s,
            background: st.gold ? "#ffc531" : "#cdd5ff",
            animationDelay: `${st.d}s`,
            boxShadow: st.gold ? "0 0 6px 1px rgba(255,197,49,.7)" : "none",
          }}
        />
      ))}
    </div>
  );
}

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/tools?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* The tools pull open-source libraries (pdf-lib, pdf.js, AI models…)
            from these CDNs at runtime. Warming the connections up front saves
            a DNS lookup + TLS handshake on the critical path of every tool. */}
        {CDN_ORIGINS.map((o) => (
          <link key={`preconnect-${o}`} rel="preconnect" href={o} crossOrigin="anonymous" />
        ))}
        {CDN_ORIGINS.map((o) => (
          <link key={`dns-prefetch-${o}`} rel="dns-prefetch" href={o} />
        ))}
        {ADS_ENABLED && (
          <link rel="preconnect" href="https://pagead2.googlesyndication.com" crossOrigin="anonymous" />
        )}
      </head>
      <body className="min-h-screen flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        {/* Loaded only once an AdSense client id is configured; individual
            AdSlot components stay inert until the visitor consents. */}
        {ADS_ENABLED && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
        <Starfield />
        <Header />
        <main className="relative z-10 flex-1 w-full">{children}</main>
        <Footer />
        <Analytics />
        <CookieConsent />
      </body>
    </html>
  );
}
