import ToolShell from "@/components/ToolShell";
import ImageConverter from "@/components/tools/ImageConverter";
import { getTool } from "@/lib/tools";

export const metadata = {
  title: "Image Converter — PNG to JPG, JPG to PNG & WebP Converter Free",
  description:
    "Convert images online for free in bulk: PNG to JPG, JPG to PNG, WebP to JPG and every combination. Keep transparency where supported. No sign-up, no uploads.",
  keywords: ["image converter", "png to jpg", "jpg to png", "webp to jpg", "convert image format online"],
  alternates: { canonical: "/tools/image-converter" },
  openGraph: { title: "Free Image Converter (PNG ↔ JPG ↔ WebP) | Tools Stars", description: "Bulk-convert images in your browser with ZIP download. No sign-up." },
};

export default function Page() {
  return (
    <ToolShell
      tool={getTool("image-converter")}
      intro="Whatever format a website, form or client is demanding — convert to it in bulk. PNG ⇄ JPG ⇄ WebP in a couple of clicks, with quality control and a one-click ZIP of all your converted files."
      steps={[
        { title: "Add your images", text: "Drop PNG, JPG, WebP, GIF or BMP files — a single image or up to 50 at once." },
        { title: "Pick the target format", text: "JPG for universal photos, PNG for lossless/transparency, WebP for the smallest web-ready files. Set quality (and the fill colour JPG uses for transparent areas)." },
        { title: "Convert & download", text: "Grab files individually or download the whole batch as a ZIP." },
      ]}
      features={[
        "Every useful direction: PNG→JPG, JPG→PNG, WebP→JPG/PNG, anything→WebP",
        "Bulk conversion (up to 50) with one-click ZIP download",
        "Transparency preserved into PNG/WebP; for JPG you choose the background colour",
        "Quality slider for JPG/WebP so converted files are also web-optimized",
        "Full original resolution is always maintained — conversion never resizes",
        "Private by design: conversion happens on your device, nothing is uploaded",
      ]}
      faqs={[
        { q: "How do I convert PNG to JPG without losing quality?", a: "Set quality to 95–100%. JPG is a lossy format, so a mathematically perfect copy isn't possible, but at 95%+ the result is visually indistinguishable — and usually far smaller than the PNG. Transparent areas are filled with the colour you pick (white by default)." },
        { q: "Why convert JPG to PNG?", a: "When software or a print workflow requires PNG, or when you plan to edit and re-save repeatedly (PNG won't degrade with each save like JPG does). Note the PNG will typically be larger, and converting can't restore detail JPG already discarded." },
        { q: "What is WebP and should I use it?", a: "WebP is Google's modern format: 25–35% smaller than JPG at the same quality, and it supports transparency like PNG. It's ideal for websites. Converting WebP back to JPG helps when older software refuses WebP files." },
        { q: "Can I convert a WebP image I saved from a website?", a: "Yes — that's one of the most common uses. Drop the .webp file here, choose JPG or PNG, and download a file every app understands." },
        { q: "Is there a limit on how many images I can convert?", a: "Up to 50 per batch — and as many batches as you like. There are no daily limits and no accounts." },
      ]}
    >
      <ImageConverter />
    </ToolShell>
  );
}
