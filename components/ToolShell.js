import Link from "next/link";
import { Icon } from "./icons";
import ToolCard from "./ToolCard";
import AdSlot from "./AdSlot";
import { ARTICLES } from "@/lib/articles";
import { relatedTools } from "@/lib/tools";
import { SITE_URL } from "@/lib/site";

// Shared SEO-rich layout for every tool page:
// breadcrumb → H1 → the tool → how-to steps → features → FAQ → related tools.
// Emits SoftwareApplication + HowTo + FAQPage JSON-LD for rich Google results.

export default function ToolShell({ tool, intro, steps, features, faqs, deepDive, children }) {
  const url = `${SITE_URL}/tools/${tool.slug}`;
  // Editorial cross-link: tools with a measured guide get a visible rail to it,
  // and the guide links back. Reviewers (and readers) should never hit a
  // tool page that is interface-only.
  const guide = ARTICLES.find((a) => a.tool === tool.slug);
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: `${tool.name} — Tools Stars`,
      url,
      applicationCategory: "WebApplication",
      operatingSystem: "Any (web browser)",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      description: tool.short,
    },
    {
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: `How to use the ${tool.name}`,
      step: steps.map((s, i) => ({
        "@type": "HowToStep",
        position: i + 1,
        name: s.title,
        text: s.text,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
    // Mirrors the visible breadcrumb below — required for the Breadcrumbs
    // rich result, which shows the path in search listings.
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: "All Tools", item: `${SITE_URL}/tools` },
        { "@type": "ListItem", position: 3, name: tool.name, item: url },
      ],
    },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 pt-10 sm:pt-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-[13px] text-slate-500">
        <Link href="/" className="hover:text-amber-300 transition">Home</Link>
        <Icon name="chevron" size={13} className="-rotate-90" />
        <Link href="/tools" className="hover:text-amber-300 transition">All Tools</Link>
        <Icon name="chevron" size={13} className="-rotate-90" />
        <span className="font-medium text-slate-300" aria-current="page">{tool.name}</span>
      </nav>

      {/* heading */}
      <div className="mt-6 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <span className={`grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${tool.gradient} text-white shadow-xl ${tool.glow}`}>
          <Icon name={tool.icon} size={32} strokeWidth={1.9} />
        </span>
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            {tool.name} <span className="text-amber-400">— Free Online</span>
          </h1>
          <p className="mt-2 max-w-3xl text-[15px] leading-relaxed text-slate-400">{intro}</p>
        </div>
      </div>

      {guide && (
        <Link
          href={`/blog/${guide.slug}`}
          className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl border border-violet-400/25 bg-violet-400/[0.06] px-4 py-3 transition hover:border-violet-400/50 hover:bg-violet-400/[0.1]"
        >
          <span className="rounded-full bg-violet-400/15 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-violet-300">
            Tested guide
          </span>
          <span className="text-sm font-semibold text-slate-200">{guide.title}</span>
          <span className="ml-auto text-sm font-bold text-violet-300">Read →</span>
        </Link>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        {[
          ["zap", "No sign-up"],
          ["shield", "Files never uploaded"],
          ["infinity", "Unlimited use"],
          ["star", "Free forever"],
        ].map(([icon, label]) => (
          <span key={label} className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold text-slate-300">
            <Icon name={icon} size={13} className="text-amber-400" /> {label}
          </span>
        ))}
      </div>

      {/* the tool itself */}
      <section aria-label={tool.name} className="mt-8 rounded-3xl border border-white/[0.09] bg-[#0a0d20]/80 p-4 sm:p-7 shadow-2xl">
        {children}
      </section>

      {/* Renders nothing until AdSense is configured and consented to. */}
      <AdSlot className="mt-8" label="Advertisement" />

      {/* how to */}
      <section className="mt-14" aria-labelledby="howto-h">
        <h2 id="howto-h" className="text-2xl font-extrabold tracking-tight text-white">
          How to use the {tool.name}
        </h2>
        <ol className="mt-6 grid gap-4 sm:grid-cols-3">
          {steps.map((s, i) => (
            <li key={s.title} className="relative rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-amber-400 text-sm font-extrabold text-[#241a00] shadow-lg shadow-amber-500/20">
                {i + 1}
              </span>
              <h3 className="mt-3.5 font-bold text-white">{s.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* features */}
      {features?.length > 0 && (
        <section className="mt-12" aria-labelledby="feat-h">
          <h2 id="feat-h" className="text-2xl font-extrabold tracking-tight text-white">
            Why use Tools Stars for this?
          </h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {features.map((f) => (
              <li key={f} className="flex items-start gap-2.5 rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3 text-sm text-slate-300">
                <Icon name="check" size={17} className="mt-0.5 shrink-0 text-emerald-400" strokeWidth={2.2} />
                {f}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Editorial deep-dive: real prose about how the tool works and where
          its limits are. Supplied per-tool from lib/toolGuides.js. */}
      {deepDive?.length > 0 && (
        <div className="mt-14 space-y-10">
          {deepDive.map((s) => (
            <section key={s.h} aria-label={s.h}>
              <h2 className="text-2xl font-extrabold tracking-tight text-white">{s.h}</h2>
              {s.p?.map((para, i) => (
                <p key={i} className="mt-4 max-w-4xl text-[15px] leading-relaxed text-slate-400">
                  {para}
                </p>
              ))}
              {s.bullets?.length > 0 && (
                <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
                  {s.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2.5 rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3 text-sm text-slate-300">
                      <Icon name="check" size={17} className="mt-0.5 shrink-0 text-cyan-400" strokeWidth={2.2} />
                      {b}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      )}

      {/* FAQ */}
      <section className="mt-12" aria-labelledby="faq-h">
        <h2 id="faq-h" className="text-2xl font-extrabold tracking-tight text-white">
          Frequently asked questions
        </h2>
        <div className="mt-6 space-y-3">
          {faqs.map((f) => (
            <details key={f.q} className="faq group rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-4 open:border-amber-400/30">
              <summary className="flex items-center justify-between gap-4 font-semibold text-white">
                {f.q}
                <Icon name="chevron" size={18} className="faq-chevron shrink-0 text-amber-400" />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* related */}
      <section className="mt-14" aria-labelledby="rel-h">
        <div className="flex items-end justify-between gap-4">
          <h2 id="rel-h" className="text-2xl font-extrabold tracking-tight text-white">You may also like</h2>
          <Link href="/tools" className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-amber-400 hover:text-amber-300">
            All tools <Icon name="arrow" size={15} />
          </Link>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {relatedTools(tool.slug).map((t) => (
            <ToolCard key={t.slug} tool={t} />
          ))}
        </div>
      </section>
    </div>
  );
}
