import Link from "next/link";
import Image from "next/image";
import { ARTICLES } from "@/lib/articles";
import { SITE_URL, SITE_NAME } from "@/lib/site";

export const metadata = {
  title: "Guides & How-To Articles — Practical File, Image and PDF Help | Tools Stars",
  description:
    "Plain-English guides on image formats, file sizes, PDFs, privacy and documents — written by the team that builds the tools, with measurements from real tests. Free, no sign-up.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: `Guides & How-To Articles | ${SITE_NAME}`,
    description: "Practical, tested guides on images, PDFs, video and document files — from the team that builds the tools.",
  },
};

export default function BlogIndex() {
  const categories = [...new Set(ARTICLES.map((a) => a.category))];
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: `${SITE_NAME} Guides`,
      url: `${SITE_URL}/blog`,
      description: metadata.description,
      inLanguage: "en",
    },
    {
      "@context": "https://schema.org",
      "@type": "Blog",
      name: `${SITE_NAME} Guides`,
      url: `${SITE_URL}/blog`,
      publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
      blogPost: ARTICLES.map((a) => ({
        "@type": "BlogPosting",
        headline: a.title,
        url: `${SITE_URL}/blog/${a.slug}`,
        datePublished: a.published,
        dateModified: a.updated,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: "Guides", item: `${SITE_URL}/blog` },
      ],
    },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 pt-10 sm:pt-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav aria-label="Breadcrumb" className="text-xs text-slate-500">
        <ol className="flex items-center gap-1.5">
          <li><Link href="/" className="hover:text-amber-300">Home</Link></li>
          <li aria-hidden>›</li>
          <li className="text-slate-300">Guides</li>
        </ol>
      </nav>

      <header className="mt-6 max-w-3xl">
        <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-amber-300">Guides</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-5xl">
          Practical answers about your files — measured, not guessed.
        </h1>
        <p className="mt-5 text-lg leading-8 text-slate-400">
          Every guide here is written by the team that builds the tools behind it. Where a guide quotes a number —
          how much a PNG actually shrinks, what a format really costs in kilobytes — it comes from a test we ran on
          real files, and the page is updated when the numbers change.
        </p>
      </header>

      {/* category chips */}
      <div className="mt-8 flex flex-wrap gap-2">
        {categories.map((c) => (
          <a
            key={c}
            href={`#cat-${c.toLowerCase().replace(/[^a-z]+/g, "-")}`}
            className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-amber-400/40 hover:text-amber-300"
          >
            {c}
          </a>
        ))}
      </div>

      {/* featured */}
      {ARTICLES[0] && (
        <Link
          href={`/blog/${ARTICLES[0].slug}`}
          className="group mt-10 grid overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.02] transition hover:border-amber-400/30 md:grid-cols-2"
        >
          {ARTICLES[0].hero && (
            <Image
              src={ARTICLES[0].hero}
              alt={ARTICLES[0].heroAlt || ARTICLES[0].title}
              width={1280}
              height={714}
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="h-56 w-full object-cover md:h-full"
            />
          )}
          <div className="p-6 sm:p-8">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-300">Latest guide</span>
            <h2 className="mt-3 text-2xl font-extrabold leading-snug text-white group-hover:text-amber-200">
              {ARTICLES[0].title}
            </h2>
            <p className="mt-3 leading-7 text-slate-400">{ARTICLES[0].description}</p>
            <p className="mt-4 text-sm font-bold text-amber-300">Read the guide →</p>
          </div>
        </Link>
      )}

      {/* by category */}
      {categories.map((c) => (
        <section key={c} id={`cat-${c.toLowerCase().replace(/[^a-z]+/g, "-")}`} className="mt-14 scroll-mt-24">
          <h2 className="text-xl font-extrabold text-white">{c}</h2>
          <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ARTICLES.filter((a) => a.category === c).map((a) => (
              <li key={a.slug}>
                <Link
                  href={`/blog/${a.slug}`}
                  className="flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] transition hover:border-amber-400/30 hover:bg-white/[0.04]"
                >
                  {a.hero && (
                    <Image
                      src={a.hero}
                      alt={a.heroAlt || a.title}
                      width={1280}
                      height={714}
                      sizes="(max-width: 640px) 100vw, 33vw"
                      className="h-36 w-full object-cover"
                    />
                  )}
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="font-bold leading-snug text-slate-100">{a.title}</h3>
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-400">{a.description}</p>
                    <p className="mt-auto pt-4 text-xs font-bold text-slate-500">{a.readingMins} min read · {a.updated}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
