import ToolShell from "@/components/ToolShell";
import ImageEnhancer from "@/components/tools/ImageEnhancer";
import { getTool } from "@/lib/tools";

export const metadata = {
  title: "AI Image Enhancer — Upscale & Unpixelate Images to HD Free Online",
  description:
    "Enhance low-resolution and pixelated images to sharp HD with on-device AI (ESRGAN). Upscale 2x or 4x, sharpen, denoise and boost colours — free, no sign-up, no uploads, no watermark.",
  keywords: ["ai image enhancer", "image upscaler", "unpixelate image", "increase image resolution", "enhance photo quality online", "make image hd"],
  alternates: { canonical: "/tools/image-enhancer" },
  openGraph: { title: "Free AI Image Enhancer & Upscaler | Tools Stars", description: "Turn tiny pixelated pictures into sharp HD — AI runs in your browser. 2x/4x, no watermark." },
};

export default function Page() {
  return (
    <ToolShell
      tool={getTool("image-enhancer")}
      intro="Got a tiny, pixelated or blurry picture? Our ESRGAN neural network rebuilds it at 2x or 4x the resolution, reconstructing realistic detail instead of just stretching pixels — then sharpens, cleans noise and boosts colour for a crisp HD finish. All on your device: your photo never uploads anywhere."
      steps={[
        { title: "Add your low-res image", text: "Drop the pixelated, small or blurry picture above (or try the built-in 128×96 sample). Small images get the most dramatic makeovers." },
        { title: "Choose 2x or 4x AI upscale", text: "2x is fast and suits most photos; 4x turns tiny thumbnails into real HD. Balance speed with the input size cap, then fine-tune sharpening, denoise and colour." },
        { title: "Compare & download in HD", text: "Drag the before/after slider to inspect the recovered detail at pixel level, then download your HD PNG, JPG or WebP — full resolution, no watermark." },
      ]}
      features={[
        "Real AI upscaling (ESRGAN) that reconstructs detail — not a blurry stretch",
        "2x and 4x modes: a 360p picture can become crisp 720p or 1440p HD",
        "Before/after comparison slider so you can judge pixel-level quality yourself",
        "Enhance finish: sharpening, denoise smoothing and colour/contrast boost built in",
        "Fast Enhance fallback that works on any device with zero downloads",
        "100% private and free — the AI runs in your browser, so no uploads, credits or HD paywalls",
      ]}
      faqs={[
        { q: "How does AI turn a pixelated image into HD?", a: "The ESRGAN neural network was trained on millions of image pairs, so it has learned what edges, textures, hair, bricks, foliage and text usually look like at high resolution. When it upscales, it doesn't stretch your pixels — it re-draws the image bigger, plausibly reconstructing the fine detail that the small image hints at." },
        { q: "2x or 4x — which should I choose?", a: "Use 2x for photos that are already a few hundred pixels wide (fastest, most faithful). Use 4x for tiny images under ~300px — profile pictures, old thumbnails, game sprites — where you need serious size. 4x takes roughly four times longer than 2x." },
        { q: "Can it perfectly restore faces or readable text?", a: "It significantly improves them, but no AI can recover information that truly isn't in the file. A face that is 8 pixels wide will come back plausible, not provably identical to the real person. Results are best when the subject is at least ~64–128px in the source. Treat the output as an enhanced reconstruction, perfect for sharing, printing small, and design work." },
        { q: "Why does AI enhancement take time — and why is it free?", a: "The neural network runs entirely on your own GPU/CPU inside this browser tab, processing the image in small patches with live progress. No server is involved, which is exactly why we can offer unlimited free HD enhancement while server-based sites charge credits. Larger inputs take longer; lower the input cap (768px) on phones." },
        { q: "What's the difference between AI Upscale and Fast Enhance?", a: "AI Upscale (ESRGAN) invents realistic new detail — dramatically better for pixelated sources. Fast Enhance uses premium multi-step scaling plus sharpening: instant and reliable on any device, and great when your image is merely a bit small or soft rather than truly pixelated." },
        { q: "Does it work on screenshots and old scanned photos?", a: "Yes — screenshots, old family scans, WhatsApp-compressed photos and downloaded thumbnails are the most popular inputs. For badly compressed JPGs, add 20–40% denoise before sharpening to melt away blocky compression artefacts." },
      ]}
    >
      <ImageEnhancer />
    </ToolShell>
  );
}
