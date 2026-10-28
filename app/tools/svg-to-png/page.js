import ToolShell from "@/components/ToolShell";
import { SvgToPng } from "@/components/tools/imageDevPack";
import { getTool } from "@/lib/tools";

export const metadata = {
  title: "SVG to PNG / JPG Converter Online Free — Any Size, Transparent",
  description: "Convert SVG to PNG, JPG or WebP online for free at 1x–4x or an exact pixel width. Keep transparency or add a background. No sign-up and no uploads.",
  keywords: ["svg to png", "svg to jpg", "convert svg", "svg to webp"],
  alternates: { canonical: "/tools/svg-to-png" },
  openGraph: { title: "Free SVG to PNG / JPG Converter | Tools Stars", description: "Rasterize vector logos and icons at exactly the size you need." },
};

export default function Page() {
  return (
    <ToolShell
      tool={getTool("svg-to-png")}
      intro="SVG files are perfect vectors, but many apps, forms and marketplaces still demand PNG or JPG. Choose the exact pixel width and get a crisp raster copy without guessing."
      steps={[
        { title: "Add your SVG", text: "Drop a logo, icon or illustration. The original vector size is detected from its width/height or viewBox." },
        { title: "Choose format & width", text: "Use 1x–4x shortcuts or type an exact width. Height follows automatically so the artwork never stretches." },
        { title: "Convert & download", text: "Keep a transparent PNG/WebP background, or fill white/custom colour for JPG and presentation use." },
      ]}
      features={[
        "True vector rasterization at the requested size — not a screenshot",
        "PNG transparency preserved by default",
        "Exact width control up to 8,000px",
        "White or custom background for JPG and slides",
        "Scripts stripped from the SVG before it is rendered",
      ]}
      faqs={[
        { q: "What size PNG should I export?", a: "Export at least the size it will be displayed. For a website logo shown at 200px on retina screens, 400–600px is sensible. Print work may need 2,000px or more depending on physical size and DPI." },
        { q: "Why does a font or linked image look different?", a: "For security and privacy, browsers render SVG files as isolated images and may block external fonts or linked pictures. Convert text to outlines and embed images in your design app before exporting the SVG for pixel-perfect results." },
        { q: "PNG, JPG or WebP — which is best?", a: "PNG is best for logos/icons and transparency. JPG has no transparency but opens everywhere and suits filled artwork. WebP usually makes the smallest file for websites while still supporting transparency." },
        { q: "Will converting to PNG make it scalable again later?", a: "No. PNG/JPG/WebP are pixel images, so enlarging them far beyond the exported size will soften edges. Keep the original SVG as your master file." },
      ]}
    >
      <SvgToPng />
    </ToolShell>
  );
}
