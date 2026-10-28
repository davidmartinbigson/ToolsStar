import ToolShell from "@/components/ToolShell";
import { RotatePdf } from "@/components/tools/pdfEssentials";
import { getTool } from "@/lib/tools";

export const metadata = {
  title: "Rotate PDF Online Free — Turn PDF Pages Left, Right or 180°",
  description: "Rotate PDF pages online for free. Fix sideways scans and upside-down pages by 90° or 180°, for all pages or selected pages only. No sign-up and no uploads.",
  keywords: ["rotate pdf", "rotate pdf pages", "turn pdf pages", "upside down pdf"],
  alternates: { canonical: "/tools/rotate-pdf" },
  openGraph: { title: "Free PDF Rotator | Tools Stars", description: "Fix sideways and upside-down PDF pages privately in your browser." },
};

export default function Page() {
  return (
    <ToolShell
      tool={getTool("rotate-pdf")}
      intro="A scanned form opened sideways? Choose the direction, decide whether it applies to every page or only a few, and download a corrected copy. The original file stays untouched."
      steps={[
        { title: "Add your PDF", text: "Drop the file above. We show its page count so selected-page rotation is easy to plan." },
        { title: "Pick right, left or 180°", text: "The little page preview turns with your choice, so there is no guessing about clockwise and anti-clockwise." },
        { title: "Rotate & download", text: "Apply the turn to all pages or type pages such as 2, 4-6, then save the corrected PDF." },
      ]}
      features={[
        "Rotate every page together or repair only selected pages",
        "Visual direction preview before you process the file",
        "Keeps the PDF's text, images and quality intact",
        "Perfect for sideways scans, forms, receipts and booklets",
        "Works in your browser — your document is never uploaded",
      ]}
      faqs={[
        { q: "Will rotating reduce my PDF quality?", a: "No. This tool changes each page's rotation setting inside the PDF instead of converting pages to pictures, so text remains selectable and images keep their original quality." },
        { q: "How do I rotate only one page?", a: "Choose “Only selected pages”, type that page number (for example 3), pick a direction and click Rotate PDF. You can also use ranges such as 2-5." },
        { q: "My page is upside down. Which option should I use?", a: "Choose 180°. Use Right 90° when the top of the page points left, and Left 90° when the top points right. If you pick the wrong one, simply run the opposite turn on the new copy." },
        { q: "Can I rotate a password-protected PDF?", a: "The password must be removed first. Browser PDF libraries cannot safely rewrite an encrypted file without its password." },
      ]}
    >
      <RotatePdf />
    </ToolShell>
  );
}
