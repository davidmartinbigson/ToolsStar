import Link from "next/link";
import { Icon } from "./icons";
import { SITE_URL, SITE_NAME } from "@/lib/site";

// Shared layout for the informational / legal pages (privacy, terms, about,
// contact, disclaimer). Keeps typography consistent, adds a breadcrumb with
// matching BreadcrumbList JSON-LD and a WebPage entity, and lets each page
// declare its content as plain data so nothing has to be hand-styled.
//
// sections: [{ h, p: [..], ul: [..], ol: [..], note }]

function Block({ s }) {
  return (
    <section className="mt-9">
      <h2 className="text-xl font-extrabold tracking-tight text-white sm:text-2xl">{s.h}</h2>

      {s.p?.map((para, i) => (
        <p key={i} className="mt-3 text-[15px] leading-relaxed text-slate-400">
          {para}
        </p>
      ))}

      {s.ul?.length > 0 && (
        <ul className="mt-4 space-y-2">
          {s.ul.map((li, i) => (
            <li
              key={i}
              className="flex items-start gap-2.5 rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-2.5 text-sm leading-relaxed text-slate-300"
            >
              <Icon name="check" size={16} className="mt-0.5 shrink-0 text-emerald-400" strokeWidth={2.2} />
              <span>{li}</span>
            </li>
          ))}
        </ul>
      )}

      {s.ol?.length > 0 && (
        <ol className="mt-4 space-y-2">
          {s.ol.map((li, i) => (
            <li key={i} className="flex items-start gap-3 text-sm leading-relaxed text-slate-300">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-amber-400 text-[11px] font-extrabold text-[#241a00]">
                {i + 1}
              </span>
              <span className="pt-0.5">{li}</span>
            </li>
          ))}
        </ol>
      )}

      {s.note && (
        <p className="mt-4 rounded-xl border border-amber-400/20 bg-amber-400/[0.07] px-4 py-3 text-sm leading-relaxed text-amber-100/90">
          <strong className="font-bold text-amber-300">Note:</strong> {s.note}
        </p>
      )}
    </section>
  );
}

export default function LegalShell({ title, description, path, updated, intro, sections, children }) {
  const url = `${SITE_URL}${path}`;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: title,
      url,
      description,
      inLanguage: "en",
      isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
      ...(updated ? { dateModified: updated } : {}),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: title, item: url },
      ],
    },
  ];

  return (
    <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 pt-10 sm:pt-14 pb-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-[13px] text-slate-500">
        <Link href="/" className="hover:text-amber-300 transition">Home</Link>
        <Icon name="chevron" size={13} className="-rotate-90" />
        <span className="font-medium text-slate-300" aria-current="page">
          {title.replace(/ — .*/, "")}
        </span>
      </nav>

      <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">{title}</h1>

      {updated && (
        <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-slate-500">
          <Icon name="clock" size={13} /> Last updated: {updated}
        </p>
      )}

      {intro && <p className="mt-5 text-[15px] leading-relaxed text-slate-400">{intro}</p>}

      {children}

      {sections?.map((s) => <Block key={s.h} s={s} />)}

      <div className="mt-12 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
        <h2 className="font-bold text-white">Questions?</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-400">
          If anything on this page is unclear, write to us — a real person reads every message.
        </p>
        <Link
          href="/contact"
          className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-amber-400 px-4 py-2 text-sm font-bold text-[#241a00] shadow-lg shadow-amber-500/20 transition hover:bg-amber-300"
        >
          Contact us <Icon name="arrow" size={15} />
        </Link>
      </div>
    </div>
  );
}
