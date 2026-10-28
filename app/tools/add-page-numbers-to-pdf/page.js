import ToolShell from "@/components/ToolShell";
import { AddPageNumbersPdf } from "@/components/tools/pdfEssentials";
import { getTool } from "@/lib/tools";

export const metadata = {
  title: "Add Page Numbers to PDF Online Free — PDF Page Numbering Tool",
  description: "Add page numbers to PDF online for free. Choose Page 1 of 10, 1/10 or a plain number, set the position and starting number, and download instantly. No uploads.",
  keywords: ["add page numbers to pdf", "pdf page numbers", "number pdf pages", "insert page number in pdf"],
  alternates: { canonical: "/tools/add-page-numbers-to-pdf" },
  openGraph: { title: "Add Page Numbers to a PDF | Tools Stars", description: "Professional PDF page numbering with a simple preview — free and private." },
};

export default function Page() {
  return (
    <ToolShell
      tool={getTool("add-page-numbers-to-pdf")}
      intro="Make reports, assignments, invoices and e-books easier to follow. Pick a familiar style such as “Page 1 of 10”, choose where it sits, and optionally leave the cover page blank."
      steps={[
        { title: "Add your PDF", text: "Drop the document above. It remains on your device while the page count is checked." },
        { title: "Choose style & position", text: "Use the preview to pick the wording, corner or centre position, text size and first number." },
        { title: "Create the numbered PDF", text: "Download a new copy with clean numbers added to every selected page." },
      ]}
      features={[
        "Five clear styles, including Page 1 of 10 and 1 / 10",
        "Top or bottom placement at the left, centre or right",
        "Start from any number for appendices and multi-part documents",
        "Skip the first page when it is a cover or title page",
        "Adds numbers directly to the PDF without reducing page quality",
      ]}
      faqs={[
        { q: "Can the first page stay without a number?", a: "Yes. Tick “Do not number the first page”. The second physical page receives your chosen starting number, which is ideal when the first page is a title page." },
        { q: "What does “Start numbering at” mean?", a: "It is the first visible number. For example, if this PDF continues another document and should begin at 25, enter 25. Styles such as Page 25 of 40 adjust automatically." },
        { q: "Will the numbers cover my document text?", a: "Numbers are placed in the normal top or bottom margin area. If your document has very tight margins, choose the emptier edge or a smaller text size." },
        { q: "Can I number only some middle pages?", a: "This simple tool numbers the document from the first page (or second page when skipped) to the end. For a separate section, split that section first with our Split PDF tool, number it, then merge it back if needed." },
      ]}
    >
      <AddPageNumbersPdf />
    </ToolShell>
  );
}
