import ToolShell from "@/components/ToolShell";
import { PdfToWord } from "@/components/tools/pdfEssentials";
import { getTool } from "@/lib/tools";
import { toolGuide } from "@/lib/toolGuides";

export const metadata = {
  title: "PDF to Word Online Free — Convert PDF to DOCX with Headings Kept",
  description: "Convert a digital PDF into a real editable Word .docx file online for free. Headings, bold, italics and page breaks survive the trip. No sign-up, no uploads — everything runs in your browser.",
  keywords: ["pdf to word", "convert pdf to docx", "pdf to word converter", "pdf to word free online"],
  alternates: { canonical: "/tools/pdf-to-word" },
  openGraph: { title: "Free PDF to Word Converter | Tools Stars", description: "Turn digital PDFs into editable Word documents privately in your browser, with structure kept." },
};

export default function Page() {
  return (
    <ToolShell
      tool={getTool("pdf-to-word")}
      intro="Need a PDF as an editable Word document — to revise a report, reuse a contract clause or reformat an assignment? This converter reads the PDF's real text layer, rebuilds its structure (headings, paragraphs, bold and italics) and writes a genuine .docx file that opens cleanly in Microsoft Word, Google Docs and LibreOffice."
      steps={[
        { title: "Upload a PDF (up to 40 MB)", text: "Drop the file or browse — it is parsed entirely in your browser and never leaves your device. Password-protected and corrupted files get a clear message instead of a silent failure." },
        { title: "Analyze the document", text: "Every page is classified as text, scanned or multi-column; tables, placed images, link annotations and repeating header/footer lines are detected, and you see the report before anything is converted. Choose a page range here if you only need part of the file." },
        { title: "Convert with the settings you want", text: "Scanned pages can be OCR'd with Tesseract, tables rebuilt as editable Word tables, images embedded in place, columns read in the right order — with colours, sizes, bullets and heading underlines preserved." },
        { title: "Preview, then download", text: "A structure preview shows exactly what the Word file contains, warnings flag anything approximated (table grids, low-confidence OCR), and the download is a genuine editable .docx." },
      ]}
      features={[
        "Real .docx output (not a renamed text file, not a wrapped PDF) via the open OOXML format",
        "Four-stage workflow: upload → analyze → convert → preview/download, with live progress",
        "Page-type detection: text pages, scanned pages (OCR with Tesseract) and multi-column layouts",
        "Tables rebuilt as editable Word tables from shared column gaps; placed images embedded in flow",
        "Repeating edge lines lifted into real Word headers and footers; link annotations stay clickable",
        "Page ranges (e.g. 1-3, 7), exact PDF page size and margins in the Word section setup",
        "Heading styles rebuilt from font sizes — H1 and H2, not just big bold text",
        "Bold and italic character formatting carried across — even when the PDF hides bold behind a font name",
        "Exact PDF type sizes and ink colours sampled from the rendered page, so the Word file looks like the PDF",
        "Centred and right-aligned lines keep their alignment; vertical rhythm becomes paragraph spacing",
        "Symbol-font bullet glyphs become real Word bullets — no more question marks in your lists",
        "Rules drawn under PDF headings become heading borders, with an Always-underline option for the classic CV look",
        "Optional page breaks so each PDF page starts a fresh Word page",
        "Line reflow: wrapped PDF lines merge back into proper paragraphs",
        "Live counts of pages, headings, paragraphs and words before you download",
        "Fully on-device: confidential documents never leave your browser",
      ]}
      faqs={[
        { q: "Is the output a real Word file?", a: "Yes. The converter writes genuine OOXML .docx structure — heading styles, paragraph spacing and character runs — so Word, Google Docs and LibreOffice all open it as a normal editable document, not as an imported oddity." },
        { q: "Why did conversion say no text was found?", a: "Your PDF is almost certainly a scan: pages are photographs, so there is no text layer inside. Convert the pages to images with PDF to JPG and run them through Image to Text (OCR) instead; OCR reads the pixels and produces editable text you can paste into Word." },
        { q: "Will tables and columns keep their exact layout?", a: "Not pixel-perfect. A PDF stores positioned fragments, not a table model, so multi-column layouts and tables arrive as reading-order paragraphs. Numbers in tables may need a quick tidy in Word — this is true of every PDF-to-Word converter, desktop suites included." },
        { q: "Does the file get uploaded to a server?", a: "No. The PDF is parsed and the .docx is assembled entirely in your browser using WebAssembly and JavaScript. Nothing is uploaded, which also means very large or confidential documents stay private." },
        { q: "What about password-protected PDFs?", a: "Unlock the PDF first in whatever app you have; encrypted files cannot be opened here because the browser engine is not given the password and never asks for one." },
        { q: "How are scanned pages handled?", a: "The analyzer flags pages that carry images but no text layer as scanned. With OCR switched on, each scanned page is rendered and read with the Tesseract engine in your browser, and the result warns you when a page's OCR confidence is low so you know where to proofread." },
        { q: "Why is there no upload server involved?", a: "By design. Documents are parsed, OCR'd and rebuilt entirely on your device, so there is no file to leak, no retention period to worry about and no size queue on a server — the 40 MB limit exists only to keep your own browser comfortable." },
      ]}
      deepDive={toolGuide("pdf-to-word")}
    >
      <PdfToWord />
    </ToolShell>
  );
}
