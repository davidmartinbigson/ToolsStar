import ToolShell from "@/components/ToolShell";
import BackgroundRemover from "@/components/tools/BackgroundRemover";
import { getTool } from "@/lib/tools";

export const metadata = {
  title: "AI Background Remover — Remove Image Background Free Online",
  description:
    "Remove the background from any image in one click with on-device AI. Free full-resolution transparent PNG, no sign-up, no upload — your photo never leaves your browser.",
  keywords: ["background remover", "remove background from image", "bg remover", "transparent background maker", "remove bg free"],
  alternates: { canonical: "/tools/background-remover" },
  openGraph: { title: "Free AI Background Remover | Tools Stars", description: "One-click transparent PNGs. AI runs in your browser — no upload, no watermark, no HD paywall." },
};

export default function Page() {
  return (
    <ToolShell
      tool={getTool("background-remover")}
      intro="Get a clean transparent PNG of any person, product, pet or logo in seconds. The AI model runs entirely in your browser tab — your photo is never uploaded, and the full-resolution download is genuinely free."
      steps={[
        { title: "Add your image", text: "Drop a JPG, PNG or WebP photo above (or paste one with Ctrl+V). Portraits, product shots and pets work brilliantly." },
        { title: "Let the AI cut it out", text: "Press Remove Background. On first use the AI model downloads once and is cached; after that it works in seconds — even offline." },
        { title: "Style & download", text: "Download the transparent PNG, or place your subject on white, black, a custom colour or a gradient backdrop first." },
      ]}
      features={[
        "Full-resolution transparent PNG downloads — no 'HD unlock' or credits, ever",
        "On-device AI: your photos are processed in your browser and never uploaded",
        "Smart edge refinement for hair, fur and semi-transparent details",
        "Instant background swap: white, black, custom colours and gradients built in",
        "Perfect for product photos, profile pictures, thumbnails, stickers & presentations",
        "Two AI models: Fast for everyday shots, Best Quality for tricky edges",
      ]}
      faqs={[
        { q: "Is this background remover really free at full resolution?", a: "Yes. Many sites give you a tiny preview free and charge for the HD file. Because our AI runs on your device instead of costly servers, we can give you the full-resolution transparent PNG for free, unlimited." },
        { q: "Why does the first removal take longer?", a: "The first time, your browser downloads the AI model (a one-time download that is then cached). Every image after that is processed in seconds without downloading anything again." },
        { q: "What kinds of images work best?", a: "Clear subjects — people, products, pets, cars, furniture, logos — with a reasonably visible outline. The Best Quality model handles fine hair and fur better; very busy scenes with many overlapping people may need a retake." },
        { q: "Is my photo sent to an AI server?", a: "No. The AI model itself comes to your browser and runs locally with WebAssembly. Your image is never transmitted anywhere — you can even disconnect from the internet after the model has loaded once." },
        { q: "Can I put a new background behind my subject?", a: "Yes — after removal, choose white, black, any custom colour, or one of the gradient backdrops (Sunset, Ocean, Studio) and download the finished image." },
      ]}
    >
      <BackgroundRemover />
    </ToolShell>
  );
}
