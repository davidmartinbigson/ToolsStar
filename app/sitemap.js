import { SITE_URL } from "@/lib/site";
import { TOOLS } from "@/lib/tools";
import { ARTICLES } from "@/lib/articles";

// Informational / legal pages. Kept here (rather than hardcoded per page) so
// the sitemap can never drift out of sync when a new one is added.
export const SITE_PAGES = [
  { path: "/about", changeFrequency: "monthly", priority: 0.6 },
  { path: "/contact", changeFrequency: "yearly", priority: 0.5 },
  { path: "/privacy-policy", changeFrequency: "yearly", priority: 0.4 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.4 },
  { path: "/disclaimer", changeFrequency: "yearly", priority: 0.3 },
];

// Truthful freshness. The index pages really do change when a guide is
// published, so they carry the date of the newest edit in the catalog.
// A build timestamp instead changed on every deploy while the pages stayed
// identical — that is how a sitemap teaches a crawler to ignore lastmod.
// URLs whose content is not date-tracked (tools, legal pages) carry no
// lastmod at all, which is valid, rather than a date that means nothing.
export const CONTENT_DATE = ARTICLES.reduce(
  (max, a) => (a.updatedISO > max ? a.updatedISO : max),
  ARTICLES.length ? ARTICLES[0].updatedISO : "2026-11-01"
);

export default function sitemap() {
  return [
    { url: SITE_URL, lastModified: new Date(CONTENT_DATE), changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/tools`, changeFrequency: "weekly", priority: 0.9 },
    ...TOOLS.map((t) => ({
      url: `${SITE_URL}/tools/${t.slug}`,
      changeFrequency: "monthly",
      priority: 0.85,
    })),
    ...SITE_PAGES.map((p) => ({
      url: `${SITE_URL}${p.path}`,
      changeFrequency: p.changeFrequency,
      priority: p.priority,
    })),
    { url: `${SITE_URL}/blog`, lastModified: new Date(CONTENT_DATE), changeFrequency: "weekly", priority: 0.7 },
    ...ARTICLES.map((a) => ({
      url: `${SITE_URL}/blog/${a.slug}`,
      lastModified: new Date(a.updatedISO),
      changeFrequency: "monthly",
      priority: 0.65,
    })),
  ];
}
