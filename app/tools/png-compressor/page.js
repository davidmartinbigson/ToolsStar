import ToolShell from "@/components/ToolShell";
import ImageCompressor from "@/components/tools/ImageCompressor";
import { getTool } from "@/lib/tools";

export const metadata = {
  title: "PNG Compressor — Compress PNG to PNG Online Free, Keep Transparency",
  description:
    "Compress PNG images online for free without losing transparency. Smart PNG reduces the colour palette, Lossless PNG keeps identical pixels, and WebP is available for the smallest files. Honest per-file savings, bulk mode, no sign-up, no uploads.",
  keywords: ["png compressor", "compress png", "compress png to png", "png optimizer", "reduce png size", "png minifier online"],
  alternates: { canonical: "/tools/png-compressor" },
  openGraph: { title: "Free PNG Compressor — Smart PNG | Tools Stars", description: "Smaller PNGs, transparency kept. Smart palette compression or true lossless PNG in your browser — no uploads." },
};

export default function Page() {
  return (
    <ToolShell
      tool={getTool("png-compressor")}
      intro="PNG is lossless, which is why it stays crisp — and why it can stay heavy. How much your file shrinks depends entirely on what is inside it: photographs, gradients and full-colour artwork compress a great deal, while an icon or logo that already uses a handful of colours may not shrink at all. This tool tells you which case you have and why, instead of inventing a number. Need pixel-identical output? Switch to Lossless PNG. Want the smallest transparent file? WebP is one click away."
      steps={[
        { title: "Add your PNGs", text: "Drop photos, illustrations, screenshots, icons or exported artwork — individually or in bulk (up to 50)." },
        { title: "Choose Smart or Lossless", text: "Keep Smart PNG (recommended) for the smallest true PNG output. Adjust Quality to control the palette size. Choose Lossless PNG only when every pixel must remain exactly the same. If a smaller file does not exist, you will be told plainly — with the reason." },
        { title: "Compress & download", text: "See the exact saving per file, then download one by one or as a single ZIP." },
      ]}
      features={[
        "Smart PNG: palette-based PNG→PNG compression — big savings on photos, gradients and artwork",
        "Honest reporting: when a file cannot shrink, you get the reason (including its exact colour count), not a fake percentage",
        "Transparency (alpha channel) preserved in Smart PNG, Lossless PNG and WebP",
        "Lossless option: optimized PNG encoding with identical pixels",
        "Quality slider controls the Smart PNG colour palette (about 205 colours at 80%)",
        "Resize by max dimension and WebP output — the two levers that still work on an already-optimal PNG",
        "PNG engine fetched from two CDNs (cdnjs and jsDelivr) so a blocked mirror cannot silently degrade results",
        "Bulk processing + ZIP download for icon sets and asset folders",
        "Everything runs in your browser — proprietary artwork never touches a server",
      ]}
      faqs={[
        { q: "Why can lossless PNG compression save 0%?", a: "Because lossless PNG cannot change any pixel. It can only rewrite the same RGBA data with better filters and DEFLATE. If the source PNG was already encoded efficiently, there is nothing left to save, so 0% is the correct lossless result. Smart PNG often still helps by reducing the image to an optimized palette — a standard PNG with alpha, usually far smaller." },
        { q: "Why does my PNG show 0% even with Smart PNG?", a: "Because it is already stored as a compact palette PNG. Smart PNG works by re-encoding the image with a reduced colour palette, so a file that already has only a few dozen distinct colours produces a byte-identical result — there is simply no palette left to squeeze. This is common for icons, flat logos and graphics exported by design tools such as Figma, and it is not a failure. The tool tells you the exact colour count it found. To shrink such a file, set a smaller Max dimension, or switch the output format to WebP." },
        { q: "So which PNGs actually shrink a lot?", a: "PNGs holding continuous tone or many colours: photographs saved as PNG, gradients, artwork with soft shadows, and screenshots that include photographic regions or anti-aliased text on complex backgrounds. The more distinct colours in the source, the more a reduced palette can save." },
        { q: "Is Smart PNG still a PNG? Will transparency survive?", a: "Yes. The output is a standard palette PNG and the alpha channel is preserved. Smart PNG is technically lossy because similar colours are merged, just like TinyPNG/pngquant. At 80–100% quality most web graphics and screenshots look virtually identical." },
        { q: "Smart PNG vs Lossless PNG — which should I pick?", a: "Pick Smart PNG for websites, screenshots, game/UI assets and sharing when smaller size matters. Pick Lossless PNG for masters, pixel art that must remain exact, scientific/medical imagery, or software tests that compare pixel values." },
        { q: "Why are PNG files so big?", a: "Ordinary PNG preserves every colour and shade. Photographic content has millions of subtly different pixels, so lossless PNG stays heavy. Smart PNG reduces that palette; JPG and WebP use photographic compression and can be smaller still. A small flat-colour PNG, on the other hand, is already near its floor." },
        { q: "How do I make a PNG small enough for email or a form upload?", a: "Use Smart PNG at 70–85% quality and add a max dimension if the image is displayed smaller than its original size. For a strict KB limit, our Compress Image to KB tool can target an exact size." },
        { q: "Can I compress PNG screenshots in bulk?", a: "Definitely — drop them all in, keep Smart PNG for true .png output, or choose WebP at 85% quality for even smaller website files, then download the ZIP." },
      ]}
    >
      <ImageCompressor mode="png" />
    </ToolShell>
  );
}
