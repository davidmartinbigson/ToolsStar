import ToolShell from "@/components/ToolShell";
import SignPdf from "@/components/tools/SignPdf";
import { getTool } from "@/lib/tools";

export const metadata = {
  title: "Sign PDF Online Free — Draw, Type or Upload Your Signature",
  description:
    "Add a signature to any PDF free online: draw it with a finger or mouse, type your name, or upload a photo of your real signature. Drag it to the exact spot, sign one page or many, then download. No sign-up, no uploads.",
  keywords: ["sign pdf", "pdf signature online", "esign pdf free", "add signature to pdf", "sign pdf on phone", "signature on pdf free"],
  alternates: { canonical: "/tools/sign-pdf" },
  openGraph: {
    title: "Free PDF Signature — Draw, Type or Upload | Tools Stars",
    description: "Drag your signature onto the exact line of any PDF page. Private, free, no watermark.",
  },
};

export default function Page() {
  return (
    <ToolShell
      tool={getTool("sign-pdf")}
      intro="Open the form, make your signature once, then drag it onto the line that says “Signature”. The page you see below is the real page rendered from your own file, so what you place is exactly where the ink lands — and nothing is ever uploaded to a server."
      steps={[
        { title: "Add the PDF", text: "Drop the form, contract, application or fee challan. You get the page count plus a true preview of page 1, with next/previous buttons for the rest." },
        { title: "Make your signature", text: "Draw with a finger, stylus or mouse; type your name in a script font; or upload a photo of your signature and let the tool strip out the white paper background." },
        { title: "Place it & sign", text: "Drag the signature to the exact spot, set its size and ink colour, then sign this page, every page (initials style) or a list such as 1,4-6. Download the signed PDF." },
      ]}
      features={[
        "Three ways to sign: draw it, type it, or upload a photo of your real signature",
        "Drag-and-drop placement on a live preview of the actual page — no blind coordinates",
        "Sign one page, all pages, or selected pages with a list like 1,3-5",
        "Sideways scans handled correctly: page rotation is mapped so your signature still appears upright",
        "Optional printed name and today's date stamped neatly underneath",
        "Your document keeps its real text and quality — the signature is added as an overlay, pages are never re-rendered as pictures",
        "Private by design: the PDF is processed in your browser and never leaves your device",
      ]}
      faqs={[
        { q: "Is a signature added like this legally valid?", a: "For most everyday documents — job and admission forms, rent agreements, school consent slips, office approvals — an electronic signature image placed on a PDF is widely accepted. What matters legally in most countries is your intent to approve the document and proof of who sent it, not the ink. However, this tool creates an electronic signature, not a certified digital signature backed by a cryptographic certificate. Banks, courts, land records and some government portals specifically require that certified kind, which must be issued by an authorised certificate provider." },
        { q: "Is my signed PDF uploaded to your server?", a: "No. There is no upload at all. The PDF is read, the signature is drawn and the new file is written entirely inside your browser tab. Close the tab and nothing remains — no copies, no accounts, no queues." },
        { q: "Can I sign a PDF on my phone?", a: "Yes, and it usually works better than on a laptop. The drawing pad accepts finger and stylus input, and dragging the signature onto the page works with touch. Turn your phone sideways for a wider pad, or zoom the browser out slightly if your signature needs more room." },
        { q: "My signature photo has a grey or white background — will it show as a box?", a: "Tick “Remove the white paper background” after uploading. The tool deletes the paper pixels and re-inks the strokes in the colour you choose, so only the signature itself lands on the page with clean, transparent surroundings." },
        { q: "Can I use the same signature on several pages?", a: "Choose “All pages” to stamp it at the same position on every page (handy for initialling a contract), or “Selected pages” and type the numbers, for example 1,4-6. You can also sign page 1, move to page 2, drag it to a different spot and sign again." },
        { q: "What if my PDF is password-protected?", a: "Remove the password first. Browser PDF libraries cannot safely rewrite an encrypted file without its password, and this tool will never ask you for one." },
      ]}
    >
      <SignPdf />
    </ToolShell>
  );
}
