import ToolShell from "@/components/ToolShell";
import ImageCompressor from "@/components/tools/ImageCompressor";
import { getTool } from "@/lib/tools";

export const metadata = {
  title: "Image Compressor — Compress JPG, PNG & WebP Online Free in Bulk",
  description:
    "Compress images online for free — JPG, PNG and WebP, up to 50 at a time. Control quality & size, preview savings, download as ZIP. No sign-up, no uploads: runs in your browser.",
  keywords: ["image compressor", "compress image online", "reduce image size", "bulk image compressor", "photo compressor"],
  alternates: { canonical: "/tools/image-compressor" },
  openGraph: { title: "Free Bulk Image Compressor | Tools Stars", description: "Shrink JPG, PNG & WebP images by up to 90% in your browser. ZIP download, no sign-up." },
};

export default function Page() {
  return (
    <ToolShell
      tool={getTool("image-compressor")}
      intro="Shrink photos and graphics for faster websites, easier sharing and smaller uploads. Add up to 50 images at once, dial in quality and dimensions, see exactly how much you saved — then download everything as one ZIP."
      steps={[
        { title: "Add your images", text: "Drop JPG, PNG or WebP files above — or paste screenshots with Ctrl+V. Bulk mode handles up to 50 at a time." },
        { title: "Set quality & size", text: "80% quality is the sweet spot for photos. Optionally cap the max dimension (1280px is plenty for the web) and pick an output format." },
        { title: "Compress & download", text: "Press Compress, compare before/after sizes per image, then download individually or grab them all as a ZIP." },
      ]}
      features={[
        "Bulk compression: up to 50 images in one go, one-click ZIP download",
        "Live before/after sizes and percentage saved on every single image",
        "Quality slider plus optional resizing for maximum savings (often 80–90%)",
        "Convert while you compress: output JPG, PNG or ultra-small WebP",
        "100% private — images are processed on your device, never uploaded",
        "Smart safeguard: if an image is already optimized, we keep your smaller original",
      ]}
      faqs={[
        { q: "How much smaller will my images get?", a: "Typical camera/phone photos shrink 70–90% at 80% quality, especially if you also cap dimensions at 1920px or below. Screenshots and PNGs often shrink most when output as WebP." },
        { q: "Will compressed images look worse?", a: "At 75–85% quality the difference is invisible to the eye in normal use — this is the same technique every major website uses. Drop below 50% only when tiny size matters more than detail (e.g. thumbnails)." },
        { q: "What's the best format: JPG, PNG or WebP?", a: "JPG for photos (small, universal). PNG when you need lossless quality or crisp text/logos. WebP gives the smallest files with transparency support and works in all modern browsers — ideal for websites." },
        { q: "Can I compress images for my website / WordPress / Shopify?", a: "Absolutely — that's the most popular use. Compress to ~80% quality, cap width at 1600–1920px, choose WebP, and your pages will load dramatically faster (which also helps SEO)." },
        { q: "Are my images uploaded anywhere?", a: "Never. Compression happens locally with your browser's built-in image engine. Your photos stay on your device from start to finish." },
      ]}
    >
      <ImageCompressor mode="all" />
    </ToolShell>
  );
}
