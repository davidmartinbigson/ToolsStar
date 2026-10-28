import ToolShell from "@/components/ToolShell";
import ImageCompressor from "@/components/tools/ImageCompressor";
import { getTool } from "@/lib/tools";

export const metadata = {
  title: "PNG Compressor — Compress PNG to PNG Online Free, Keep Transparency",
  description:
    "Compress PNG images online for free without losing transparency. Smart PNG makes PNG→PNG files genuinely smaller, Lossless PNG keeps identical pixels, and WebP is available for the smallest files. Bulk mode, no sign-up, no uploads.",
  keywords: ["png compressor", "compress png", "compress png to png", "png optimizer", "reduce png size", "png minifier online"],
  alternates: { canonical: "/tools/png-compressor" },
  openGraph: { title: "Free PNG Compressor — Smart PNG | Tools Stars", description: "Smaller PNGs, transparency kept. Smart palette compression or true lossless PNG in your browser — no uploads." },
};

export default function Page() {
  return (
    <ToolShell
      tool={getTool("png-compressor")}
      intro="PNGs are crisp and transparent — but heavy. Smart PNG now gives you real PNG→PNG savings using an optimized colour palette, while transparency stays intact. Need pixel-identical output? Switch to Lossless PNG. Want the absolute smallest transparent file? WebP is one click away."
      steps={[
        { title: "Add your PNGs", text: "Drop logos, screenshots, UI graphics or illustrations — individually or in bulk (up to 50)." },
        { title: "Choose Smart or Lossless", text: "Keep Smart PNG (recommended) for much smaller true PNG files. Adjust Quality to control the palette size. Choose Lossless PNG only when every pixel must remain exactly the same." },
        { title: "Compress & download", text: "See the exact saving per file, then download one by one or as a single ZIP." },
      ]}
      features={[
        "Smart PNG: real PNG→PNG compression, commonly 40–85% smaller",
        "Transparency (alpha channel) preserved in Smart PNG, Lossless PNG and WebP",
        "Lossless option: optimized PNG encoding with identical pixels",
        "Quality slider controls the Smart PNG colour palette (about 205 colours at 80%)",
        "Bulk processing + ZIP download for icon sets and asset folders",
        "Everything runs in your browser — proprietary artwork never touches a server",
      ]}
      faqs={[
        { q: "Why can lossless PNG compression save 0%?", a: "Because lossless PNG cannot change any pixel. It can only rewrite the same RGBA data with better filters/DEFLATE. If the source PNG was already encoded efficiently, there may be nothing left to save, so the correct lossless result is 0%. Smart PNG solves this by reducing the image to an optimized palette — still a standard PNG with alpha, but usually far smaller." },
        { q: "Is Smart PNG still a PNG? Will transparency survive?", a: "Yes. The output is a standard palette PNG and the alpha channel is preserved. Smart PNG is technically lossy because similar colours are merged, just like TinyPNG/pngquant. At 80–100% quality most web graphics and screenshots look virtually identical." },
        { q: "Smart PNG vs Lossless PNG — which should I pick?", a: "Pick Smart PNG for websites, screenshots, game/UI assets and sharing when smaller size matters. Pick Lossless PNG for masters, pixel art that must remain exact, scientific/medical imagery, or software tests that compare pixel values." },
        { q: "Why are PNG files so big?", a: "Ordinary PNG preserves every colour and shade. Photographic content has millions of subtly different pixels, so lossless PNG stays heavy. Smart PNG reduces that palette; JPG/WebP use photographic compression and can be smaller still." },
        { q: "How do I make a PNG small enough for email or a form upload?", a: "Use Smart PNG at 70–85% quality and add a max dimension if the image is displayed smaller than its original size. For a strict KB limit, our Compress Image to KB tool can target an exact size." },
        { q: "Can I compress PNG screenshots in bulk?", a: "Definitely — drop them all in, keep Smart PNG for true .png output, or choose WebP at 85% quality for even smaller website files, then download the ZIP." },
      ]}
    >
      <ImageCompressor mode="png" />
    </ToolShell>
  );
}
