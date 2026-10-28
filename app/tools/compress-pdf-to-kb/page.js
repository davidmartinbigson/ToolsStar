import ToolShell from "@/components/ToolShell";
import { CompressPdfToKb } from "@/components/tools/pakistanPack2";
import { getTool } from "@/lib/tools";

export const metadata = {
  title: "Compress PDF to 100KB, 200KB or Exact KB Online Free",
  description: "Compress PDF to an exact KB limit online for free: 100 KB, 200 KB, 300 KB, 500 KB or custom. Finds the best quality that fits strict upload portals. No uploads.",
  keywords: ["compress pdf to 200kb", "compress pdf to 100kb", "compress pdf to kb", "pdf under 200kb"],
  alternates: { canonical: "/tools/compress-pdf-to-kb" },
  openGraph: { title: "Compress PDF to Exact KB | Tools Stars", description: "Fit strict PDF upload limits while keeping the best readable quality." },
};

export default function Page() {
  return (
    <ToolShell
      tool={getTool("compress-pdf-to-kb")}
      intro="When a portal says “PDF must be under 200 KB”, guessing quality sliders wastes time. Enter the limit and this tool tests quality levels for you, keeping the best one that fits."
      steps={[
        { title: "Add your PDF", text: "Works best for application documents, certificates and scanned pages up to 30 pages." },
        { title: "Choose the portal's KB limit", text: "Tap 100, 200, 300 or 500 KB — or type any custom maximum exactly as the form states." },
        { title: "Compress & check the badge", text: "The result clearly shows the final size against your target before you download and upload it." },
      ]}
      features={[
        "One-tap targets for common 100–500 KB form limits",
        "Automatically tests several DPI and JPEG quality levels",
        "Keeps the original untouched if it already fits the limit",
        "Uses greyscale only as a last resort when you allow it",
        "Private on-device processing for certificates and personal documents",
      ]}
      faqs={[
        { q: "Why does the compressed PDF's text stop being selectable?", a: "To reach a strict byte limit reliably, pages are rebuilt as optimized page images inside a new PDF. This gives predictable sizes for scans and mixed PDFs. Keep your original as the master copy; if it already fits, this tool returns it unchanged with selectable text." },
        { q: "What if even the smallest version is above my target?", a: "That can happen with many detailed colour pages and an extremely small limit. Allow greyscale, remove unnecessary pages with Split PDF, or upload the document in parts if the portal permits. We still give you the smallest readable version we made." },
        { q: "Is 200 KB the same as 200 KiB here?", a: "This tool uses the common web-upload convention of 1 KB = 1,024 bytes and aims at or below that byte count. The final badge shows the actual file size so you can compare it with the portal message." },
        { q: "Why is there a 30-page limit?", a: "Testing several quality levels for many pages can exhaust phone memory. Thirty pages covers most form documents safely. For longer books, use the regular Compress PDF tool or split the file first." },
      ]}
    >
      <CompressPdfToKb />
    </ToolShell>
  );
}
