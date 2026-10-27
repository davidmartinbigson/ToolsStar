import ToolShell from "@/components/ToolShell";
import ImageCompressor from "@/components/tools/ImageCompressor";
import { getTool } from "@/lib/tools";

export const metadata = {
  title: "PNG Compressor — Compress PNG Images Online Free, Keep Transparency",
  description:
    "Compress PNG images online for free without losing transparency. Lossless PNG optimization or WebP output for up to 90% smaller files. Bulk mode, no sign-up, no uploads.",
  keywords: ["png compressor", "compress png", "png optimizer", "reduce png size", "png minifier online"],
  alternates: { canonical: "/tools/png-compressor" },
  openGraph: { title: "Free PNG Compressor | Tools Stars", description: "Smaller PNGs, transparency kept. Bulk compress in your browser — no uploads." },
};

export default function Page() {
  return (
    <ToolShell
      tool={getTool("png-compressor")}
      intro="PNGs are crisp and transparent — but heavy. This tool squeezes them down two ways: lossless PNG re-optimization (pixel-perfect, transparency intact) or a switch to WebP when you want the absolute smallest transparent file."
      steps={[
        { title: "Add your PNGs", text: "Drop logos, screenshots, UI graphics or illustrations — individually or in bulk (up to 50)." },
        { title: "Choose your strategy", text: "Keep output as PNG for lossless results, add a max dimension if the graphic is oversized, or switch to WebP for 70–90% savings with transparency preserved." },
        { title: "Compress & download", text: "See the exact saving per file, then download one by one or as a single ZIP." },
      ]}
      features={[
        "Transparency (alpha channel) is always preserved — in PNG and WebP output",
        "Lossless mode: smaller PNGs with literally identical pixels",
        "WebP mode for when PNG just won't go small enough (screenshots love it)",
        "Bulk processing + ZIP download for icon sets and asset folders",
        "If a PNG is already perfectly optimized, your smaller original is kept automatically",
        "Everything runs in your browser — proprietary artwork never touches a server",
      ]}
      faqs={[
        { q: "Why are PNG files so big?", a: "PNG compression is lossless, so photographic content with millions of shades stays heavy. PNG shines for flat graphics, text and logos. If your PNG is actually a photo, JPG or WebP output will usually be 80%+ smaller." },
        { q: "Will my transparent background survive compression?", a: "Yes — in both PNG and WebP modes the alpha channel is preserved perfectly. (Only JPG output would flatten transparency, which is why this tool defaults to PNG.)" },
        { q: "Lossless PNG vs WebP — which should I pick?", a: "Pick PNG when the file must stay PNG (software requirement, pixel-perfect assets). Pick WebP for websites and sharing: same transparency, typically 70–90% smaller, supported by every modern browser." },
        { q: "How do I make a PNG small enough for email or a form upload?", a: "Add a max dimension: most PNGs are far larger than their display size. Resizing a 3000px-wide screenshot to 1280px often cuts 80% of the weight by itself, before any format tricks." },
        { q: "Can I compress PNG screenshots in bulk?", a: "Definitely — that's a favourite use case. Drop them all in, choose WebP at 85% quality with a 1600px cap, and download the ZIP." },
      ]}
    >
      <ImageCompressor mode="png" />
    </ToolShell>
  );
}
