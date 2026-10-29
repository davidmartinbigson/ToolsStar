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

export default function sitemap() {
  const now = new Date();
  return [
    { url: SITE_URL, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/tools`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    ...TOOLS.map((t) => ({
      url: `${SITE_URL}/tools/${t.slug}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.85,
    })),
    ...SITE_PAGES.map((p) => ({
      url: `${SITE_URL}${p.path}`,
      lastModified: now,
      changeFrequency: p.changeFrequency,
      priority: p.priority,
    })),
    { url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    ...ARTICLES.map((a) => ({
      url: `${SITE_URL}/blog/${a.slug}`,
      lastModified: new Date(a.published),
      changeFrequency: "monthly",
      priority: 0.65,
    })),
  ];
}
