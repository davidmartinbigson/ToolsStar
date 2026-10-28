import ToolShell from "@/components/ToolShell";
import { PdfToPng } from "@/components/tools/pdfTools";
import { getTool } from "@/lib/tools";

export const metadata = {
  title: "PDF to PNG Converter — High Quality, Free Online (72–300 DPI)",
  description:
    "Convert PDF pages to PNG images online, free and without uploading. Choose 72 to 300 DPI, get crisp lossless PNGs of every page, download one by one or as a single ZIP. Works on phone and desktop.",
  keywords: ["pdf to png", "convert pdf to png", "pdf to png high quality", "pdf to png online free", "pdf to png 300 dpi"],
  alternates: { canonical: "/tools/pdf-to-png" },
  openGraph: {
    title: "Free PDF to PNG Converter | Tools Stars",
    description: "Lossless PNG pages at up to 300 DPI — rendered on your own device.",
  },
};

export default function Page() {
  return (
    <ToolShell
      tool={getTool("pdf-to-png")}
      intro="PNG is the lossless choice when your PDF contains text, diagrams, screenshots, stamps or line art — every edge stays sharp and nothing is smeared by compression. Pick a resolution, convert, and download each page on its own or all of them in one ZIP."
      steps={[
        { title: "Drop your PDF", text: "Add the file and we show its page count. Nothing is uploaded — the pages are rendered on your own device." },
        { title: "Choose the resolution", text: "150 DPI is a good all-round default, 200–300 DPI is best for printing or reading fine text closely, and 72 DPI keeps files tiny for web use." },
        { title: "Convert & download", text: "Every page appears as a preview with its file size. Save individual PNGs or grab the whole document as one ZIP." },
      ]}
      features={[
        "True lossless PNG output — no JPEG artefacts around letters and thin lines",
        "Four resolution levels: 72, 150, 200 and 300 DPI",
        "Page previews with exact file sizes before you download anything",
        "Download a single page, or every page bundled into one ZIP",
        "Keeps the original PDF untouched — you always get a new set of images",
        "Runs entirely in your browser: private, unlimited and free",
      ]}
      faqs={[
        { q: "Should I use PNG or JPG for my PDF pages?", a: "Use PNG for text-heavy documents, forms, slides, diagrams, scans with stamps, and anything you may crop or edit — it is lossless, so edges stay razor sharp. Use JPG (our PDF to JPG tool) for photographs and image-heavy pages where a much smaller file matters more than perfect edges." },
        { q: "Which DPI should I pick?", a: "150 DPI suits screens and email. 300 DPI is the print standard and is what you want if the image will be printed or read closely on a phone. 72 DPI gives the smallest files and matches what you see on a computer screen. File size grows roughly with the square of the DPI, so 300 DPI is about four times heavier than 150 DPI." },
        { q: "Will the PNG have a transparent background?", a: "No — pages are rendered onto solid white, exactly as they look when printed. A PDF page is a printed sheet rather than a layered artwork file, so there is normally no transparency to preserve. If you need a cut-out object, convert first and then use the AI Background Remover." },
        { q: "My PDF has many pages and my phone slowed down. What now?", a: "Convert at a lower DPI first, and close other browser tabs. Rendering happens page by page in your device's memory, so a 200-page file at 300 DPI is genuinely heavy for a phone. On a desktop the same job is comfortable." },
        { q: "Can the text still be copied after conversion?", a: "No. Any PDF-to-image conversion produces a picture, so the text becomes visual rather than selectable. If you need editable text, use PDF to Text for digital PDFs, or Image to Text (OCR) after converting a scanned page." },
      ]}
    >
      <PdfToPng />
    </ToolShell>
  );
}
