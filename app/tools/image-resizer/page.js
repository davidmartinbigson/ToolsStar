import ToolShell from "@/components/ToolShell";
import ImageResizer from "@/components/tools/ImageResizer";
import { getTool } from "@/lib/tools";

export const metadata = {
  title: "Image Resizer — Resize Images Online Free to Any Size in Pixels",
  description:
    "Resize JPG, PNG & WebP images online for free: exact pixels, percentage scale, or one-click presets for Instagram, YouTube thumbnails, Facebook & WhatsApp. No sign-up, no uploads.",
  keywords: ["image resizer", "resize image online", "resize photo", "image size changer", "resize image for instagram"],
  alternates: { canonical: "/tools/image-resizer" },
  openGraph: { title: "Free Image Resizer | Tools Stars", description: "Exact pixels or social media presets — resize images right in your browser." },
};

export default function Page() {
  return (
    <ToolShell
      tool={getTool("image-resizer")}
      intro="Get the exact dimensions any platform demands. Resize by pixels with the aspect ratio safely locked, scale by percentage, or tap a ready-made preset for Instagram, YouTube, Facebook and more."
      steps={[
        { title: "Add your image", text: "Drop a JPG, PNG or WebP (or paste with Ctrl+V). Your original dimensions and file size appear instantly." },
        { title: "Set the new size", text: "Type a width/height, drag the percentage slider, or choose a social media preset. Keep the padlock on to avoid stretching." },
        { title: "Resize & download", text: "Preview the result and download it in JPG, PNG or WebP — exactly the size you asked for." },
      ]}
      features={[
        "One-tap presets: Instagram post & story, YouTube thumbnail, Facebook cover, X, LinkedIn, Pinterest, WhatsApp DP",
        "Aspect-ratio lock prevents squished or stretched images",
        "Scale by percentage from 5% up to 200% (upscaling included)",
        "Choose output format and quality while you resize — two jobs in one",
        "High-quality smoothing keeps downsized images crisp, not crunchy",
        "Runs fully in your browser: private, instant and free",
      ]}
      faqs={[
        { q: "What size should Instagram / YouTube images be?", a: "Instagram post: 1080×1080. Story/Reels cover: 1080×1920. YouTube thumbnail: 1280×720. Facebook cover: 1640×924. All of these are one tap in the presets above." },
        { q: "Will resizing make my image blurry?", a: "Making an image smaller stays crisp (we use high-quality smoothing). Enlarging beyond ~150% will soften it, because no tool can invent real detail — modest upscales for print or thumbnails are fine though." },
        { q: "What's the difference between resizing and compressing?", a: "Resizing changes the pixel dimensions; compressing keeps dimensions but encodes the data more efficiently. For the smallest files do both — this tool lets you set quality too, and our Image Compressor adds bulk mode." },
        { q: "How do I resize an image for a passport / visa / application form?", a: "Unlock nothing: enter the exact pixel size the form requests (turn OFF the aspect lock only if the form demands an exact rectangle that differs from your photo's shape), choose JPG at 90% quality, and download." },
        { q: "Does the resizer keep transparent backgrounds?", a: "Yes with PNG or WebP output. JPG output fills transparency with white, since the JPG format has no transparency support." },
      ]}
    >
      <ImageResizer />
    </ToolShell>
  );
}
