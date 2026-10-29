import { notFound } from "next/navigation";
import ArticleShell from "@/components/ArticleShell";
import { ARTICLES, getArticle, relatedArticles } from "@/lib/articles";
import { getTool } from "@/lib/tools";
import { SITE_URL } from "@/lib/site";

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export function generateMetadata({ params }) {
  const a = getArticle(params.slug);
  if (!a) return { title: "Guide not found" };
  return {
    title: `${a.title} | Tools Stars`,
    description: a.description,
    keywords: a.tags,
    alternates: { canonical: `/blog/${a.slug}` },
    openGraph: {
      type: "article",
      title: a.title,
      description: a.description,
      url: `${SITE_URL}/blog/${a.slug}`,
      publishedTime: a.published,
      modifiedTime: a.updated,
      section: a.category,
      tags: a.tags,
      images: a.hero ? [{ url: `${SITE_URL}${a.hero}`, width: 1280, height: 714, alt: a.heroAlt || a.title }] : [],
    },
    twitter: { card: a.hero ? "summary_large_image" : "summary" },
  };
}

export default function Page({ params }) {
  const article = getArticle(params.slug);
  if (!article) notFound();
  return (
    <ArticleShell
      article={article}
      related={relatedArticles(article.slug)}
      tool={article.tool ? getTool(article.tool) : null}
    />
  );
}
