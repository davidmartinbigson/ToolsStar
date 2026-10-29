import Image from "next/image";
import Link from "next/link";
import { SITE_URL, SITE_NAME } from "@/lib/site";

/* ── Rich-text blocks used by the blog content ────────────────────────────────
   Articles are data (content/blog/*.js), not JSX, so the reading experience is
   identical on every page and the table of contents / structured data can be
   derived automatically instead of drifting out of sync with the prose.       */

const PROSE = "text-[15.5px] leading-7 text-slate-300";

function Block({ b }) {
  if (b.h2)
    return (
      <h2 id={slugify(b.h2)} className="mt-12 scroll-mt-24 text-2xl font-extrabold tracking-tight text-white">
        {b.h2}
      </h2>
    );
  if (b.h3) return <h3 className="mt-8 text-lg font-bold text-slate-100">{b.h3}</h3>;
  if (b.p) return <p className={`mt-4 ${PROSE}`}>{b.p}</p>;
  if (b.ul)
    return (
      <ul className="mt-4 space-y-2">
        {b.ul.map((li, i) => (
          <li key={i} className={`flex gap-2.5 ${PROSE}`}>
            <span aria-hidden className="mt-[11px] h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
            <span>{li}</span>
          </li>
        ))}
      </ul>
    );
  if (b.ol)
    return (
      <ol className="mt-4 space-y-3">
        {b.ol.map((li, i) => (
          <li key={i} className={`flex gap-3 ${PROSE}`}>
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-amber-400/15 text-xs font-extrabold text-amber-300">
              {i + 1}
            </span>
            <span>{li}</span>
          </li>
        ))}
      </ol>
    );
  if (b.table)
    return (
      <div className="mt-6 overflow-x-auto rounded-2xl border border-white/[0.08]">
        <table className="w-full min-w-[520px] border-collapse text-left text-sm">
          <thead>
            <tr className="bg-white/[0.04]">
              {b.table.head.map((h) => (
                <th key={h} className="px-4 py-3 font-bold text-slate-100">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {b.table.rows.map((row, i) => (
              <tr key={i} className={i % 2 ? "bg-white/[0.02]" : ""}>
                {row.map((cell, j) => (
                  <td key={j} className={`px-4 py-2.5 ${j === 0 ? "font-semibold text-slate-100" : "text-slate-400"}`}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  if (b.note) {
    const tones = {
      info: "border-sky-400/25 bg-sky-400/[0.06]",
      warn: "border-amber-400/25 bg-amber-400/[0.06]",
      test: "border-emerald-400/25 bg-emerald-400/[0.06]",
    };
    const labels = { info: "Good to know", warn: "Watch out", test: "We tested this" };
    const label = b.note.label || labels[b.note.tone] || labels.info;
    const chip = {
      info: "bg-sky-400/15 text-sky-300",
      warn: "bg-amber-400/15 text-amber-300",
      test: "bg-emerald-400/15 text-emerald-300",
    };
    return (
      <aside className={`mt-6 rounded-2xl border p-4 sm:p-5 ${tones[b.note.tone] || tones.info}`}>
        <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wider ${chip[b.note.tone] || chip.info}`}>
          {label}
        </span>
        {b.note.title && <p className="mt-2.5 font-bold text-slate-100">{b.note.title}</p>}
        <p className={`mt-1.5 text-sm leading-6 ${PROSE.replace("text-[15.5px]", "text-sm")}`}>{b.note.text}</p>
      </aside>
    );
  }
  if (b.cta)
    return (
      <div className="mt-8 rounded-2xl border border-amber-400/25 bg-gradient-to-br from-amber-400/[0.08] to-violet-500/[0.06] p-5">
        <p className="text-sm font-semibold text-slate-200">{b.cta.text}</p>
        <Link
          href={`/tools/${b.cta.tool}`}
          className="mt-3 inline-flex items-center gap-2 rounded-xl bg-amber-400 px-5 py-2.5 text-sm font-extrabold text-[#241a00] transition hover:bg-amber-300"
        >
          Open the {b.cta.label || "tool"} →
        </Link>
      </div>
    );
  if (b.quote)
    return (
      <blockquote className="mt-6 border-l-2 border-violet-400/60 pl-4 text-[15.5px] italic leading-7 text-slate-300">
        {b.quote}
      </blockquote>
    );
  return null;
}

export function slugify(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function ArticleShell({ article, related, tool }) {
  const url = `${SITE_URL}/blog/${article.slug}`;
  const headings = article.blocks.filter((b) => b.h2).map((b) => b.h2);
  const faqs = article.blocks.filter((b) => b.faq).flatMap((b) => b.faq);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: article.title,
      description: article.description,
      image: article.hero ? `${SITE_URL}${article.hero}` : undefined,
      url,
      datePublished: article.published,
      dateModified: article.updated,
      wordCount: article.wordCount,
      articleSection: article.category,
      keywords: (article.tags || []).join(", "),
      inLanguage: "en",
      isPartOf: { "@type": "Blog", name: `${SITE_NAME} Guides`, url: `${SITE_URL}/blog` },
      author: { "@type": "Organization", name: `${SITE_NAME} Team`, url: `${SITE_URL}/about` },
      publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
      mainEntityOfPage: url,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: "Guides", item: `${SITE_URL}/blog` },
        { "@type": "ListItem", position: 3, name: article.title, item: url },
      ],
    },
  ];
  if (faqs.length)
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    });

  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 pt-8 sm:pt-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* breadcrumb */}
      <nav aria-label="Breadcrumb" className="text-xs text-slate-500">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li><Link href="/" className="hover:text-amber-300">Home</Link></li>
          <li aria-hidden>›</li>
          <li><Link href="/blog" className="hover:text-amber-300">Guides</Link></li>
          <li aria-hidden>›</li>
          <li className="text-slate-300">{article.category}</li>
        </ol>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px]">
        <article className="min-w-0">
          {/* hero */}
          {article.hero ? (
            <div className="overflow-hidden rounded-3xl border border-white/[0.08]">
              <Image
                src={article.hero}
                alt={article.heroAlt || article.title}
                width={1280}
                height={714}
                priority
                sizes="(max-width: 1024px) 100vw, 736px"
                className="h-auto w-full object-cover"
              />
            </div>
          ) : (
            <div className="h-44 rounded-3xl border border-white/[0.08] bg-gradient-to-br from-violet-600/25 via-[#141735] to-amber-500/15" />
          )}

          <div className="mt-6 flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-wider">
            <span className="rounded-full border border-violet-400/30 bg-violet-400/10 px-2.5 py-1 text-violet-300">{article.category}</span>
            <span className="rounded-full bg-white/[0.05] px-2.5 py-1 text-slate-400">{article.readingMins} min read</span>
            <span className="rounded-full bg-white/[0.05] px-2.5 py-1 text-slate-400">Updated {article.updated}</span>
          </div>

          <h1 className="mt-4 text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl">{article.title}</h1>
          <p className="mt-4 text-lg leading-8 text-slate-400">{article.description}</p>

          {/* body */}
          <div className="mt-2">
            {article.blocks.map((b, i) =>
              b.faq ? (
                <div key={i} className="mt-10 space-y-4">
                  <h2 id={slugify("Questions people ask")} className="text-2xl font-extrabold tracking-tight text-white">
                    Questions people ask
                  </h2>
                  {b.faq.map((f) => (
                    <details key={f.q} className="group rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 open:bg-white/[0.04]">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-bold text-slate-100">
                        {f.q}
                        <span aria-hidden className="faq-chevron text-amber-300 transition group-open:rotate-180">⌄</span>
                      </summary>
                      <p className={`mt-3 ${PROSE}`}>{f.a}</p>
                    </details>
                  ))}
                </div>
              ) : (
                <Block key={i} b={b} />
              )
            )}
          </div>

          {/* E-E-A-T: who wrote this, and why trust it */}
          <div className="mt-12 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
            <div className="flex flex-wrap items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-amber-400 text-lg font-black text-[#160b2e]">
                TS
              </div>
              <div className="min-w-0">
                <p className="font-bold text-white">Written by the {SITE_NAME} team</p>
                <p className="mt-1.5 text-sm leading-6 text-slate-400">
                  We build and maintain every tool on this site, and we test them on real files before we write about
                  them — the numbers in our guides come from those tests, not from other people&apos;s articles. If a
                  number here changes, we re-measure and update the page.{" "}
                  <Link href="/about" className="font-semibold text-amber-300 hover:underline">
                    More about how we work
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>

          {/* related */}
          {related.length > 0 && (
            <div className="mt-10">
              <h2 className="text-lg font-extrabold text-white">Keep reading</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {related.map((r) => (
                  <li key={r.slug}>
                    <Link
                      href={`/blog/${r.slug}`}
                      className="block h-full rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 transition hover:border-amber-400/40 hover:bg-white/[0.04]"
                    >
                      <span className="text-[11px] font-bold uppercase tracking-wider text-violet-300">{r.category}</span>
                      <span className="mt-1 block font-bold leading-snug text-slate-100">{r.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </article>

        {/* sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-6">
            {headings.length > 1 && (
              <nav aria-label="On this page" className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">On this page</p>
                <ul className="mt-3 space-y-2">
                  {headings.map((h) => (
                    <li key={h}>
                      <a href={`#${slugify(h)}`} className="block text-[13px] leading-5 text-slate-400 transition hover:text-amber-300">
                        {h}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            )}
            {tool && (
              <div className="rounded-2xl border border-amber-400/25 bg-amber-400/[0.06] p-4">
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-amber-300">The tool in this guide</p>
                <p className="mt-2 font-bold text-white">{tool.name}</p>
                <p className="mt-1 text-xs leading-5 text-slate-400">{tool.short}</p>
                <Link
                  href={`/tools/${tool.slug}`}
                  className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-amber-400 px-4 py-2 text-sm font-extrabold text-[#241a00] transition hover:bg-amber-300"
                >
                  Open it free →
                </Link>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
