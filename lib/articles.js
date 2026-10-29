// ── Tools Stars editorial catalog ────────────────────────────────────────────
// One entry per guide. Content lives in content/blog/<slug>.js as an array of
// blocks (see components/ArticleShell.js for the block vocabulary) so the
// reading layout, the table of contents and the structured data are all
// derived from the same source and can never drift apart.
//
// Adding a guide: create content/blog/<slug>.js, add an entry below, and it
// appears on /blog, in the sitemap and in the related-reading rails.

import pngVs from "@/content/blog/png-vs-jpg-vs-webp";
import pngWont from "@/content/blog/why-png-wont-compress";
import exactKb from "@/content/blog/compress-photo-to-exact-kb";
import bgRemove from "@/content/blog/remove-image-background";
import mergePdf from "@/content/blog/merge-pdf-files";
import compressPdf from "@/content/blog/compress-pdf-size";
import heic from "@/content/blog/heic-to-jpg";
import video from "@/content/blog/compress-video-in-browser";
import ocr from "@/content/blog/image-to-text-ocr";
import cv from "@/content/blog/build-a-cv";
import passport from "@/content/blog/passport-photo-rules";
import exif from "@/content/blog/remove-exif-gps";

const PUBLISHED = "2026-10-29";
const UPDATED = "29 October 2026";

const RAW = [
  {
    slug: "png-vs-jpg-vs-webp",
    title: "PNG vs JPG vs WebP: Which Format Should You Use? (With Real Measurements)",
    description:
      "We encoded the same images nine ways and published every file size. Here is what PNG, JPG, WebP and AVIF actually cost in kilobytes, and how to choose in ten seconds.",
    category: "Images & formats",
    tool: "image-converter",
    hero: "/blog/png-vs-jpg-vs-webp.jpg",
    heroAlt: "Three glowing translucent format cards of decreasing size against a starfield",
    tags: ["png vs jpg", "webp vs jpeg", "image formats", "best image format for web", "image file size"],
    blocks: pngVs,
  },
  {
    slug: "why-png-wont-compress",
    title: "Why Your PNG Won't Compress — and What Actually Makes It Smaller",
    description:
      "A PNG compressor reporting 0% is usually not broken. We measured a 4-colour PNG at 574 bytes under every palette setting and explain exactly why, plus the three levers that do work.",
    category: "Images & formats",
    tool: "png-compressor",
    hero: "/blog/why-png-wont-compress.jpg",
    heroAlt: "A magnifying glass over a coarse four-colour pixel grid",
    tags: ["compress png", "png 0% compression", "png palette", "reduce png size", "png already optimized"],
    blocks: pngWont,
  },
  {
    slug: "compress-photo-to-exact-kb",
    title: "How to Compress a Photo to Exactly 100 KB (for Forms, Visas and Job Portals)",
    description:
      "Portals cap uploads in kilobytes, but cameras do not produce kilobyte photos. The order of operations that hits an exact target while keeping the best possible quality.",
    category: "Images & formats",
    tool: "compress-image-to-kb",
    hero: "/blog/compress-photo-to-exact-kb.jpg",
    heroAlt: "A glowing photo pressed between plates beside a precision gauge dial",
    tags: ["compress image to 100kb", "reduce photo size for upload", "photo kb limit", "compress photo for form"],
    blocks: exactKb,
  },
  {
    slug: "heic-to-jpg",
    title: "HEIC to JPG: Why iPhone Photos Break Everywhere Else, and the Clean Fix",
    description:
      "HEIC is smaller and better than JPEG — and a compatibility tax you pay at every form, portal and old PC. What the format really is, and how to convert without losing your master.",
    category: "Images & formats",
    tool: "heic-to-jpg",
    hero: "/blog/heic-to-jpg.jpg",
    heroAlt: "A phone photo passing through a glowing transformation portal into a compatible card",
    tags: ["heic to jpg", "convert iphone photo", "heic not opening", "heic converter online"],
    blocks: heic,
  },
  {
    slug: "merge-pdf-files",
    title: "How to Merge PDF Files in the Right Order — Without Uploading Them",
    description:
      "Merging is lossless page surgery, but order, partial ranges and page numbering are where people lose an evening. A practical guide, including the privacy case for doing it locally.",
    category: "PDFs & documents",
    tool: "merge-pdf",
    hero: "/blog/merge-pdf-files.jpg",
    heroAlt: "Glowing document sheets converging into a single bound stack",
    tags: ["merge pdf", "combine pdf files", "pdf page ranges", "merge pdf online free"],
    blocks: mergePdf,
  },
  {
    slug: "compress-pdf-size",
    title: "What Actually Makes a PDF Smaller (It Is Not the Text)",
    description:
      "A 40 MB PDF is almost always a pile of over-resolution images wearing a document's clothes. The two levers that shrink it, the targets that do not hurt, and what compression must never touch.",
    category: "PDFs & documents",
    tool: "compress-pdf",
    hero: "/blog/compress-pdf-size.jpg",
    heroAlt: "A thick stack of glowing pages compressed into one thin sheet",
    tags: ["compress pdf", "reduce pdf size", "pdf too large to upload", "shrink pdf mb"],
    blocks: compressPdf,
  },
  {
    slug: "image-to-text-ocr",
    title: "Image to Text: How OCR Reads Your Photo, and How to Feed It Well",
    description:
      "OCR accuracy is decided by the capture, not the engine. What the recognition pipeline actually does, why language selection changes the answer, and where the handwriting wall is.",
    category: "PDFs & documents",
    tool: "image-to-text",
    hero: "/blog/image-to-text-ocr.jpg",
    heroAlt: "Glowing lines of abstract text lifting off a scanned page",
    tags: ["image to text", "ocr online", "extract text from image", "urdu ocr", "photo to text"],
    blocks: ocr,
  },
  {
    slug: "remove-image-background",
    title: "Removing an Image Background With On-Device AI: What to Expect",
    description:
      "Background removal now runs inside your browser, so the photo never leaves your device. Which images cut out cleanly, which need help, and what to do with the transparent PNG after.",
    category: "Privacy & identity",
    tool: "background-remover",
    hero: "/blog/remove-image-background.jpg",
    heroAlt: "A cut-out silhouette lifted in front of a transparent checkerboard",
    tags: ["remove background", "transparent png", "bg remover free", "cut out image"],
    blocks: bgRemove,
  },
  {
    slug: "remove-exif-gps",
    title: "Your Photos Carry GPS Coordinates: What EXIF Leaks and How to Clean It",
    description:
      "Every phone photo records where and when it was taken, in fields nobody can see. What EXIF actually contains, when it genuinely matters, and the lossless way to remove it.",
    category: "Privacy & identity",
    tool: "exif-viewer",
    hero: "/blog/remove-exif-gps.jpg",
    heroAlt: "A glowing photo card shedding translucent metadata tags that dissolve into particles beside a shield",
    tags: ["remove exif", "remove gps from photo", "photo metadata privacy", "strip exif data"],
    blocks: exif,
  },
  {
    slug: "passport-photo-rules",
    title: "Passport Photo Rules Explained: Size, DPI, Background and the Silent Rejections",
    description:
      "Identity photo rejections are mechanical, which means they are avoidable. The four rules behind most rejections, the mm-to-pixel maths at 300 DPI, and the framing mistakes automated checks catch.",
    category: "Privacy & identity",
    tool: "passport-photo-maker",
    hero: "/blog/passport-photo-rules.jpg",
    heroAlt: "A luminous portrait frame around an abstract silhouette with dashed head-height and margin guides",
    tags: ["passport photo size", "passport photo dpi", "visa photo requirements", "id photo background"],
    blocks: passport,
  },
  {
    slug: "compress-video-in-browser",
    title: "Compressing Video in Your Browser: Honest Expectations and Sane Settings",
    description:
      "Browser video encoding is real now — and near real-time, because decoding and re-encoding every frame costs what it costs. The settings that matter, and why local beats uploaded for personal footage.",
    category: "Video & audio",
    tool: "video-compressor",
    hero: "/blog/compress-video-in-browser.jpg",
    heroAlt: "A glowing film strip drawn into a compact cube inside a browser outline",
    tags: ["compress video online", "reduce video size", "browser video compression", "mp4 compressor"],
    blocks: video,
  },
  {
    slug: "build-a-cv",
    title: "Build a CV That Survives the Six-Second Scan",
    description:
      "Recruiters scan before they read. What that scan looks for, the structure that survives both humans and parsers, the photo question answered by market, and why a text-selectable PDF matters.",
    category: "Career",
    tool: "resume-maker",
    hero: "/blog/build-a-cv.jpg",
    heroAlt: "A clean resume document built from abstract blocks with template ghosts behind it",
    tags: ["cv template", "resume format", "cv one page or two", "cv photo yes or no", "ats friendly cv"],
    blocks: cv,
  },
];

function countWords(blocks) {
  let n = 0;
  const add = (s) => {
    if (typeof s === "string") n += s.split(/\s+/).filter(Boolean).length;
  };
  for (const b of blocks) {
    add(b.p);
    add(b.h2);
    add(b.h3);
    add(b.quote);
    if (b.ul) b.ul.forEach(add);
    if (b.ol) b.ol.forEach(add);
    if (b.note) {
      add(b.note.title);
      add(b.note.text);
    }
    if (b.cta) add(b.cta.text);
    if (b.table) b.table.rows.forEach((r) => r.forEach(add)) || b.table.head.forEach(add);
    if (b.faq) b.faq.forEach((f) => {
      add(f.q);
      add(f.a);
    });
  }
  return n;
}

export const ARTICLES = RAW.map((a) => {
  const wordCount = countWords(a.blocks);
  return {
    ...a,
    published: PUBLISHED,
    updated: UPDATED,
    wordCount,
    readingMins: Math.max(3, Math.round(wordCount / 220)),
  };
}).sort((a, b) => (a.published < b.published ? 1 : -1));

export function getArticle(slug) {
  return ARTICLES.find((a) => a.slug === slug) || null;
}

/** Reading rail: same category first, then same tool category, then anything. */
export function relatedArticles(slug, count = 3) {
  const self = getArticle(slug);
  if (!self) return [];
  const rest = ARTICLES.filter((a) => a.slug !== slug);
  return [
    ...rest.filter((a) => a.category === self.category),
    ...rest.filter((a) => a.category !== self.category),
  ].slice(0, count);
}
