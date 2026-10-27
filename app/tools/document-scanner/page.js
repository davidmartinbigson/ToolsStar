import ToolShell from "@/components/ToolShell";
import DocumentScanner from "@/components/tools/DocumentScanner";
import { getTool } from "@/lib/tools";

export const metadata = {
  title: "Document Scanner — Scan Papers to PDF Online Free (Auto Edge Detect)",
  description:
    "Free online document scanner: photograph any paper and get a flat, white, photocopy-clean scan. Automatic page corner detection, perspective correction, A4 sizes, multi-page PDF. No app, no sign-up, no uploads.",
  keywords: ["document scanner online", "scan document to pdf", "photo to scan converter", "camscanner free online", "scan paper with phone"],
  alternates: { canonical: "/tools/document-scanner" },
  openGraph: { title: "Free Document Scanner — Photo to Scanned PDF | Tools Stars", description: "Auto corners. Straightened. Whitened. PDF-ready — all in your browser." },
};

export default function Page() {
  return (
    <ToolShell
      tool={getTool("document-scanner")}
      intro="Point your phone at any receipt, note, form or book page. The scanner finds the page corners automatically, flattens the angle, removes shadows and desk colours, and gives you that clean white photocopy look — as JPG or a tidy multi-page PDF."
      steps={[
        { title: "Snap or drop the photo", text: "Use the camera button on your phone, drop an existing photo, or try our sample receipt. Fill most of the frame with the page and avoid your shadow." },
        { title: "Check the corners", text: "Computer vision outlines the page automatically. If it's a few millimetres off, just drag the four amber dots — ten seconds, pixel perfect." },
        { title: "Scan, then save as PDF", text: "Pick Photocopy B&W, Clean White or Magic Colour. Keep Auto size to match the captured page exactly, or force A4/Letter/ID-card. Add more pages and download one neat PDF." },
      ]}
      features={[
        "Automatic page-edge detection (OpenCV computer vision in your browser)",
        "Full manual control: drag every corner precisely when auto needs help",
        "True perspective flattening — tilted snaps become desk-flat documents",
        "Photocopy B&W mode with shadow-killing adaptive whitening",
        "Auto size from the captured page shape, plus true-size A4, Letter, A5, Legal & ID-card PDFs",
        "Private like every Tools Stars tool — documents never leave your device",
      ]}
      faqs={[
        { q: "Which scan look should I choose: B&W, Clean White or Magic Colour?", a: "Photocopy B&W is best for printed forms, receipts and anything you'll print or OCR — smallest files, sharpest text. Clean White keeps pencil and light handwriting that B&W can drop. Magic Colour preserves stamps, photos and coloured headings while still whitening the paper." },
        { q: "Auto-detect missed my page edges — now what?", a: "It happens when the paper blends into a similar-coloured desk or is heavily shadowed. Put the page on a darker/contrasting surface, retake, or simply drag the four corners yourself — that's exactly why they're adjustable." },
        { q: "How do I scan a multi-page document into one PDF?", a: "Scan page 1, press 'Add page & scan another', repeat for each page, then hit 'PDF (all pages)'. Delete any page with its × before exporting." },
        { q: "Will officials/portals accept scans made like this?", a: "Yes — the output is a flat, high-resolution page image in standard PDF/JPG, comparable to office-scanner output. If a portal also has a KB limit, our Compress PDF / Compress to KB tools finish the job." },
        { q: "Why does the first scan take longer?", a: "The OpenCV vision engine (~10 MB) downloads once and is cached by your browser afterwards. Your documents themselves are processed entirely on your device and never uploaded." },
      ]}
    >
      <DocumentScanner />
    </ToolShell>
  );
}
