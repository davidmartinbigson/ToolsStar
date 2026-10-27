import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/site";

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
    icon: [
      {
        url:
          "data:image/svg+xml," +
          encodeURIComponent(
            `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><rect width='64' height='64' rx='14' fill='#ffc531'/><path d='M32 10l6.7 14.4 15.8 1.8-11.6 10.7 3.1 15.6L32 44.4l-14 8.1 3.1-15.6-11.6-10.7 15.8-1.8z' fill='#241a00'/></svg>`
          ),
        type: "image/svg+xml",
      },
    ],
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
      <body className="min-h-screen flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <Starfield />
        <Header />
        <main className="relative z-10 flex-1 w-full">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
