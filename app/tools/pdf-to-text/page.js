import ToolShell from "@/components/ToolShell";
import { PdfToText } from "@/components/tools/pdfEssentials";
import { getTool } from "@/lib/tools";

export const metadata = {
  title: "PDF to Text Online Free — Extract Text from PDF to TXT",
  description: "Convert PDF to text online for free. Extract selectable PDF words page by page, edit them, copy instantly or download a TXT file. No sign-up and no uploads.",
  keywords: ["pdf to text", "extract text from pdf", "pdf to txt", "convert pdf to text"],
  alternates: { canonical: "/tools/pdf-to-text" },
  openGraph: { title: "Free PDF to Text Extractor | Tools Stars", description: "Pull editable text out of digital PDFs privately in your browser." },
};

export default function Page() {
  return (
    <ToolShell
      tool={getTool("pdf-to-text")}
      intro="Need the words inside a PDF for an assignment, quotation, notes or another document? Extract its selectable text page by page, tidy it in the editable box, then copy it or save a .txt file."
      steps={[
        { title: "Add a digital PDF", text: "This works best when you can already select words in the PDF with your mouse or finger." },
        { title: "Extract the pages", text: "Keep page headings if you want to know where each block came from, then click Extract text." },
        { title: "Copy or download", text: "Edit the result if needed, copy it to your clipboard, or download it as a plain text file." },
      ]}
      features={[
        "Page-by-page extraction with optional Page 1, Page 2 headings",
        "Word and character counts shown immediately",
        "Editable result box before copying or downloading",
        "Clear warning and OCR guidance for scanned, photo-only PDFs",
        "No upload: private documents are read locally in your browser",
      ]}
      faqs={[
        { q: "Why did it say no text was found?", a: "Your PDF probably contains scanned page images rather than real text. Use PDF to JPG to make page images, then run those images through our Image to Text (OCR) tool." },
        { q: "Will tables and columns stay perfectly formatted?", a: "Plain text extraction preserves the reading order as well as the PDF allows, but it cannot retain visual columns, fonts, colours or exact table grids. Multi-column documents may need small cleanup." },
        { q: "What is the difference between PDF to Text and OCR?", a: "PDF to Text reads actual text already stored in a digital PDF, which is fast and accurate. OCR looks at a picture of words and guesses the letters; use OCR only for scans and photos." },
        { q: "Can I edit the extracted text here?", a: "Yes. The result appears in an editable box, so you can fix headings or remove unwanted lines before copying or downloading." },
      ]}
    >
      <PdfToText />
    </ToolShell>
  );
}
