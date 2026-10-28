import LegalShell from "@/components/LegalShell";
import { Icon } from "@/components/icons";
import { SITE_NAME, SITE_EMAIL, SITE_URL, SITE_TAGLINE, SITE_DESCRIPTION } from "@/lib/site";
import { CATEGORIES, TOOLS } from "@/lib/tools";

export const metadata = {
  title: "About Us — Free Browser-Based Tools",
  description:
    "Tools Stars is a free toolbox of 51 utilities that run entirely in your browser: video, image, PDF, audio, generator, text and calculator tools. No sign-up, no uploads, no watermarks.",
  keywords: ["about tools stars", "browser based tools", "free online tools", "no upload tools", "client side tools"],
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About Tools Stars — Free Tools That Never Upload Your Files",
    description: SITE_DESCRIPTION,
    url: "/about",
    type: "website",
  },
};

const UPDATED = "29 October 2026";

const sections = [
  {
    h: "Why browser-first?",
    p: [
      "The usual online-tool website asks you to upload a private file to somebody else's server, wait in a queue, and then offers the good result behind a paywall or a watermark. Along the way your document sits on a machine you will never see, owned by a company you have never met.",
      "We thought that was the wrong trade, so Tools Stars does the opposite. Every tool here is a small program that runs inside your own browser using standard web technology — Canvas, WebAssembly, MediaRecorder, the File System APIs and on-device AI models. Your file is read locally, transformed locally, and handed straight back to you as a download.",
    ],
    ul: [
      "Private — nothing leaves your device, so there is nothing for anyone else to see, keep or lose.",
      "Fast — no upload, no queue, no download of the result. On a good connection the work is already done before a server-based tool would have finished transferring.",
      "Unlimited — no daily caps, no file-size tiers, no \"3 free conversions left\" counters.",
      "Free — every tool, every feature, forever. No account and no credit card.",
      "Offline-friendly — once a tool has loaded, most of them keep working even if the connection drops.",
    ],
  },
  {
    h: "What you will find here",
    p: [
      `${SITE_NAME} currently ships ${TOOLS.length} tools across ${CATEGORIES.length - 1} categories. They are grouped by the job you are trying to do, not by the technology involved:`,
    ],
  },
  {
    h: "How we choose what to build",
    p: [
      "A tool earns its place here when it solves something people actually search for, when it can be done well inside a browser, and when it can be done without putting anyone at risk. That last test matters: we deliberately do not build things that download other people's copyrighted media, scrape platforms, or forge documents.",
      "We would rather have fifty genuinely useful, policy-clean utilities than five hundred that get somebody's account suspended or their content stolen.",
    ],
  },
  {
    h: "How the site stays free",
    p: [
      "Running a website costs money even when it never touches your files — there is hosting, delivery, domain registration and a great deal of development time. Tools Stars will eventually carry a small number of unobtrusive advertisements, and nothing else: no paywalls, no premium tier, no selling of data.",
      "Advertising is optional for you. A cookie banner lets you decline, and every single tool keeps working exactly the same whether you accept or not.",
    ],
    note: "Ad slots and analytics stay switched off until they are genuinely needed, and they never activate without your consent. See the Privacy Policy for the details.",
  },
  {
    h: "What we promise",
    p: [
      "We will not start uploading your files. We will not add a paywall to a tool that is free today. We will not sell, rent or trade your information, because we do not have any to sell. If any of that ever changes, it will be announced plainly on this page and in the Privacy Policy — not buried in a footnote.",
    ],
  },
  {
    h: "Get in touch",
    p: [
      `Tools Stars is maintained by a small team that reads its own mail. Bug reports, tool suggestions and privacy questions are all welcome at ${SITE_EMAIL}.`,
      "If a tool misbehaves, tell us your browser and what you were trying to do — that is usually enough for us to reproduce and fix it quickly.",
    ],
  },
];

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  slogan: SITE_TAGLINE,
  description: SITE_DESCRIPTION,
  email: SITE_EMAIL,
  knowsAbout: CATEGORIES.filter((c) => c !== "All"),
};

export default function AboutPage() {
  const counts = CATEGORIES.filter((c) => c !== "All").map((c) => ({
    name: c,
    n: TOOLS.filter((t) => t.category === c).length,
  }));

  return (
    <LegalShell
      title="About Tools Stars"
      description={metadata.description}
      path="/about"
      updated={UPDATED}
      intro={`${SITE_NAME} is a free toolbox of ${TOOLS.length} utilities that run entirely inside your web browser. No sign-up, no uploads, no watermarks, no daily limits — and no server anywhere that ever sees your files.`}
      sections={sections}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {[
          ["zap", `${TOOLS.length}`, "free tools"],
          ["shield", "0", "files uploaded"],
          ["infinity", "∞", "unlimited use"],
        ].map(([icon, big, label]) => (
          <div
            key={label}
            className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 text-center"
          >
            <Icon name={icon} size={18} className="mx-auto text-amber-400" />
            <p className="mt-2 text-2xl font-extrabold text-white">{big}</p>
            <p className="text-xs text-slate-400">{label}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {counts.map((c) => (
          <span
            key={c.name}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold text-slate-300"
          >
            {c.name}
            <span className="text-amber-400">{c.n}</span>
          </span>
        ))}
      </div>
    </LegalShell>
  );
}
