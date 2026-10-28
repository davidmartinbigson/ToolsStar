import ToolShell from "@/components/ToolShell";
import { SignatureResizer } from "@/components/tools/pakistanPack2";
import { getTool } from "@/lib/tools";

export const metadata = {
  title: "Signature Resizer & Transparent Signature Maker Online Free",
  description: "Resize a signature and remove its white paper background online for free. Make a transparent PNG or white JPG in exact form dimensions without stretching. No uploads.",
  keywords: ["signature resizer", "transparent signature maker", "resize signature for form", "signature background remover"],
  alternates: { canonical: "/tools/signature-resizer" },
  openGraph: { title: "Signature Resizer | Tools Stars", description: "Clean transparent signatures for forms and documents, made privately on your device." },
};

export default function Page() {
  return (
    <ToolShell
      tool={getTool("signature-resizer")}
      intro="Sign once on white paper, take a straight photo, and this tool removes the paper, crops the empty space and resizes the ink for documents and online forms."
      steps={[
        { title: "Photograph your signature", text: "Use a dark pen on plain white paper. Fill most of the photo with the signature and avoid shadows across it." },
        { title: "Remove the paper", text: "Move the strength slider until the background is clean but thin pen strokes remain. Recolour the ink if you like." },
        { title: "Resize & download", text: "Choose transparent PNG for documents or white JPG for forms. Exact-size mode fits the signature inside the box without stretching it." },
      ]}
      features={[
        "White-paper removal tuned for black and blue pen ink",
        "Automatic tight crop with adjustable breathing space",
        "Transparent PNG, white PNG or white JPG output",
        "Original, black, blue or navy ink colours",
        "Exact pixel sizes for forms — proportions always preserved",
      ]}
      faqs={[
        { q: "Why is some grey paper still visible?", a: "Increase “Remove white paper” gradually. Shadows and grey paper need a stronger setting, while very light pen strokes need a weaker one. A evenly lit photo on a flat white sheet gives the cleanest result." },
        { q: "Why did part of my signature disappear?", a: "The removal strength is too high for that thin or light stroke. Lower it until the full signature returns, or sign again with a darker pen and slightly firmer pressure." },
        { q: "Transparent PNG or white JPG — which should I upload?", a: "Use transparent PNG when placing the signature on your own document. Many government and job portals expect a normal rectangular image; for those, white JPG in their requested pixel size is usually safest." },
        { q: "What does Exact form size do differently?", a: "It creates a canvas at exactly the requested width and height, then fits your whole signature inside it. There may be empty space at the sides or top, but the signature is never squeezed or stretched out of shape." },
      ]}
    >
      <SignatureResizer />
    </ToolShell>
  );
}
