import ToolShell from "@/components/ToolShell";
import { WatermarkPdf } from "@/components/tools/pdfEssentials";
import { getTool } from "@/lib/tools";

export const metadata = {
  title: "Watermark PDF Online Free — Add Text Watermark to PDF Pages",
  description: "Add a text watermark to PDF online for free: CONFIDENTIAL, DRAFT or your own words, diagonal, repeated or at the bottom. No sign-up, no uploads.",
  keywords: ["watermark pdf", "add watermark to pdf", "confidential pdf watermark", "draft watermark pdf"],
  alternates: { canonical: "/tools/watermark-pdf" },
  openGraph: { title: "Free PDF Watermark Tool | Tools Stars", description: "Stamp clear text watermarks across a PDF privately in your browser." },
};

export default function Page() {
  return (
    <ToolShell
      tool={getTool("watermark-pdf")}
      intro="Mark a quotation as DRAFT, a private report as CONFIDENTIAL, or stamp your business name across every page. The example page updates as you choose the layout, colour and visibility."
      steps={[
        { title: "Add your PDF", text: "Drop the document above. The tool creates a watermarked copy, so your original stays safe." },
        { title: "Write & style the watermark", text: "Type your words, then choose one diagonal stamp, a repeated pattern or a small bottom label." },
        { title: "Apply & download", text: "Pick all pages or only the first page, create the copy and check it in your normal PDF reader." },
      ]}
      features={[
        "Ready presets for CONFIDENTIAL, DRAFT, COPY and SAMPLE",
        "Diagonal, repeated-all-over and bottom-text layouts",
        "Visibility slider keeps documents readable while clearly marked",
        "Five quick colours plus a custom colour picker",
        "Watermark text is added on-device; the PDF never leaves your browser",
      ]}
      faqs={[
        { q: "What visibility should I choose?", a: "Around 15–25% is best for a large diagonal or repeated watermark: readers can see the mark without struggling to read the page. A small bottom label can be stronger because it sits in the margin." },
        { q: "Is this watermark impossible to remove?", a: "No watermark should be treated as absolute security. A drawn text watermark discourages casual reuse and clearly identifies a document, but a determined expert with PDF editing software may alter it. Use passwords and controlled sharing for highly sensitive files." },
        { q: "Can I use Urdu, Arabic or other non-English text?", a: "This lightweight tool uses a standard PDF font designed mainly for English/Latin letters, numbers and common punctuation. Urdu or Arabic watermarks may not render correctly, so English text is recommended." },
        { q: "Can I watermark only the cover?", a: "Yes. Set Pages to “First page only”. All later pages remain unchanged in the downloaded copy." },
      ]}
    >
      <WatermarkPdf />
    </ToolShell>
  );
}
