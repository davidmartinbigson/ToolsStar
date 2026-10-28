import ToolShell from "@/components/ToolShell";
import ImageCompressor from "@/components/tools/ImageCompressor";
import { getTool } from "@/lib/tools";

export const metadata = {
  title: "Image Compressor — Compress JPG, PNG & WebP Online Free in Bulk",
  description:
    "Compress images online for free — JPG, PNG and WebP, up to 50 at a time. Smart PNG compression makes PNG→PNG files genuinely smaller; lossless PNG is also available. No sign-up, no uploads: runs in your browser.",
  keywords: ["image compressor", "compress image online", "compress png to png", "reduce image size", "bulk image compressor", "photo compressor"],
  alternates: { canonical: "/tools/image-compressor" },
  openGraph: { title: "Free Bulk Image Compressor | Tools Stars", description: "Shrink JPG, PNG & WebP images in your browser — including real Smart PNG compression. ZIP download, no sign-up." },
};

export default function Page() {
  return (
    <ToolShell
      tool={getTool("image-compressor")}
      intro="Shrink photos and graphics for faster websites, easier sharing and smaller uploads. Add up to 50 images at once, dial in quality and dimensions, see exactly how much you saved — then download everything as one ZIP."
      steps={[
        { title: "Add your images", text: "Drop JPG, PNG or WebP files above — or paste screenshots with Ctrl+V. Bulk mode handles up to 50 at a time." },
        { title: "Set quality & format", text: "80% quality is the sweet spot for JPG/WebP photos. For PNG output, Smart PNG is selected by default so PNG→PNG can actually shrink; choose Lossless PNG only when every pixel must remain identical." },
        { title: "Compress & download", text: "Press Compress, compare before/after sizes per image, then download individually or grab them all as a ZIP." },
      ]}
      features={[
        "Bulk compression: up to 50 images in one go, one-click ZIP download",
        "Real PNG→PNG compression with Smart PNG — optimized palette, transparency preserved",
        "Lossless PNG option when pixels must stay identical",
        "Live before/after sizes and percentage saved on every single image",
        "Quality slider plus optional resizing for maximum savings",
        "100% private — images are processed on your device, never uploaded",
      ]}
      faqs={[
        { q: "Why did a PNG compressed as PNG used to save 0%?", a: "A normal browser Canvas PNG export is lossless and ignores the quality setting, so an already optimized PNG often came back the same size or larger. This compressor now defaults PNG output to Smart PNG: it builds an optimized colour palette (the TinyPNG/pngquant approach), keeps transparency, and commonly reduces PNG→PNG files by 40–85%. If you manually choose Lossless PNG, 0% can still be correct for a file that was already perfectly optimized." },
        { q: "How much smaller will my images get?", a: "Typical camera/phone JPGs shrink 70–90% at 80% quality, especially with a dimension cap. PNG photos and colourful screenshots often shrink 40–85% with Smart PNG; tiny already-quantized logos may shrink less. WebP frequently gives the smallest result." },
        { q: "Will Smart PNG change my image?", a: "Smart PNG reduces the number of colours to an optimized palette, so it is technically lossy — similar to TinyPNG. At the default 80% setting (about 205 colours) most screenshots, graphics and web photos look virtually identical. Use Lossless PNG for pixel-perfect masters, medical/scientific images, or any file where exact pixel values matter." },
        { q: "What's the best format: JPG, PNG or WebP?", a: "JPG for ordinary photos (small, universal). Smart PNG when the result must remain PNG with transparency. Lossless PNG for pixel-perfect assets. WebP usually gives the smallest website files with transparency support." },
        { q: "Can I compress images for my website / WordPress / Shopify?", a: "Absolutely — that's the most popular use. Compress to ~80% quality, cap width at 1600–1920px, and choose WebP for the smallest pages, or Smart PNG where PNG is required." },
        { q: "Are my images uploaded anywhere?", a: "Never. Compression happens locally in your browser. The small PNG engine is downloaded once from a CDN, but your image data itself is never sent to a server." },
      ]}
    >
      <ImageCompressor mode="all" />
    </ToolShell>
  );
}
