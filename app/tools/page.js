import Link from "next/link";
import ToolsExplorer from "@/components/ToolsExplorer";
import { Icon } from "@/components/icons";
import { TOOLS, CATEGORIES } from "@/lib/tools";
import { SITE_URL, SITE_NAME } from "@/lib/site";

export const metadata = {
  title: "All Free Online Tools — No Sign-Up, No Uploads",
  description:
    "Browse every free tool on Tools Stars: video compressor, image compressor, JPG & PNG compressor, AI background remover, image resizer, converter, image to PDF, QR generator and more. All run in your browser.",
  alternates: { canonical: "/tools" },
  openGraph: {
    title: "All Free Online Tools — No Sign-Up, No Uploads",
    description:
      "Every tool on Tools Stars in one place. Free forever, no sign-up, no watermarks, and your files never leave your device.",
    url: "/tools",
    type: "website",
  },
};

const url = `${SITE_URL}/tools`;

// ItemList exposes the whole catalog to crawlers as one entity, and the
// BreadcrumbList mirrors the visible trail above the heading.
const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "All Tools", item: url },
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "All Free Online Tools",
    url,
    description: metadata.description,
    inLanguage: "en",
    isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
  },
  {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Tools Stars toolbox",
    description: `All ${TOOLS.length} free browser-based tools on ${SITE_NAME}.`,
    numberOfItems: TOOLS.length,
    itemListOrder: "https://schema.org/ItemListUnordered",
    itemListElement: TOOLS.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: t.name,
      url: `${SITE_URL}/tools/${t.slug}`,
    })),
  },
];

const CATEGORY_SUMMARIES = {
  Video: "Compress, trim, convert and record video — plus screen capture and GIF export.",
  Image: "Compress, resize, crop, convert, enhance and remove backgrounds from photos.",
  "PDF & Docs": "Merge, split, compress, convert, sign, watermark and page-number PDFs.",
  Audio: "Cut, compress, convert and record audio, voice notes and ringtones.",
  Generators: "QR codes, favicons, passwords and watermarks in a couple of clicks.",
  Text: "Count words and characters, and pull text out of images and PDFs.",
  Calculators: "Grades, percentages, ages, religious dues and solar system sizing.",
};

export default function AllToolsPage() {
  const categories = CATEGORIES.filter((c) => c !== "All");

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 pt-10 sm:pt-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-[13px] text-slate-500">
        <Link href="/" className="hover:text-amber-300 transition">Home</Link>
        <Icon name="chevron" size={13} className="-rotate-90" />
        <span className="font-medium text-slate-300" aria-current="page">All Tools</span>
      </nav>

      <div className="mx-auto mt-6 max-w-3xl text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
          All free tools, <span className="text-amber-400">one toolbox</span>
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-slate-400">
          Every tool below is free forever — no sign-up, no watermarks, no daily limits.
          Your files are processed on your own device, so they&apos;re never uploaded to a server.
        </p>
      </div>

      {/* Category overview: real, crawlable text links into the explorer below. */}
      <section aria-labelledby="cats-h" className="mx-auto mt-10 max-w-5xl">
        <h2 id="cats-h" className="sr-only">Tool categories</h2>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((c) => {
            const n = TOOLS.filter((t) => t.category === c).length;
            return (
              <li
                key={c}
                className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3.5"
              >
                <p className="flex items-center justify-between gap-2 text-sm font-bold text-white">
                  {c}
                  <span className="rounded-full bg-amber-400/15 px-2 py-0.5 text-[11px] font-extrabold text-amber-300">
                    {n}
                  </span>
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
                  {CATEGORY_SUMMARIES[c]}
                </p>
              </li>
            );
          })}
        </ul>
      </section>

      <div className="mt-10">
        <ToolsExplorer tools={TOOLS} />
      </div>

      <section className="mx-auto mt-20 max-w-3xl text-[15px] leading-relaxed text-slate-400">
        <h2 className="text-2xl font-extrabold tracking-tight text-white">About Tools Stars tools</h2>
        <p className="mt-3">
          Most “free online tools” upload your personal files to remote servers, hold the full-quality result behind
          a paywall, or limit you to a couple of files a day. Tools Stars takes a different approach: each tool is a
          small program that runs entirely inside your web browser using modern technologies like Canvas,
          WebAssembly, MediaRecorder and on-device AI models.
        </p>
        <p className="mt-3">
          That means faster results (no upload or queue), total privacy (your videos, photos and documents never
          leave your device), and genuinely unlimited free use. Whether you need to compress a video for WhatsApp,
          shrink a JPG for your website, remove a photo background for your online store, or turn images into a PDF
          for an assignment — there&apos;s a star tool for it above.
        </p>
        <p className="mt-3">
          Want to know how the privacy promise actually works, or how the site stays free? Read{" "}
          <Link href="/about" className="font-semibold text-amber-400 hover:text-amber-300">about Tools Stars</Link>{" "}
          or the{" "}
          <Link href="/privacy-policy" className="font-semibold text-amber-400 hover:text-amber-300">privacy policy</Link>.
        </p>
      </section>
    </div>
  );
}
