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
        { title: "Add a digital PDF", text: "Works on PDFs that contain a real text layer — the kind where you can select words with your cursor. Scanned, photo-only PDFs have no text to convert." },
        { title: "Choose the structure options", text: "Keep heading detection and line reflow on for articles and reports; switch reflow off for forms where every line break matters." },
        { title: "Convert and download", text: "Click Convert to Word, watch the page-by-page progress, then download the .docx and proofread it like any draft." },
      ]}
      features={[
        "Real .docx output (not a renamed text file) via the open OOXML format",
        "Heading styles rebuilt from font sizes — H1 and H2, not just big bold text",
        "Bold and italic character formatting carried across — even when the PDF hides bold behind a font name",
        "Exact PDF type sizes and ink colours sampled from the rendered page, so the Word file looks like the PDF",
        "Centred and right-aligned lines keep their alignment; vertical rhythm becomes paragraph spacing",
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
      ]}
      deepDive={toolGuide("pdf-to-word")}
    >
      <PdfToWord />
    </ToolShell>
  );
}
