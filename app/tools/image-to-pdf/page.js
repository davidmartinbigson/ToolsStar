import ToolShell from "@/components/ToolShell";
import ImageToPdf from "@/components/tools/ImageToPdf";
import { getTool } from "@/lib/tools";

export const metadata = {
  title: "Image to PDF — Convert JPG & PNG to PDF Online Free",
  description:
    "Convert JPG and PNG images to a single PDF online for free. Reorder pages, choose A4, US Letter or fit-to-image pages. No sign-up, no uploads — made in your browser.",
  keywords: ["image to pdf", "jpg to pdf", "png to pdf", "convert image to pdf", "photo to pdf"],
  alternates: { canonical: "/tools/image-to-pdf" },
  openGraph: { title: "Free Image to PDF Converter | Tools Stars", description: "Turn photos & scans into a tidy PDF right in your browser. No sign-up." },
};

export default function Page() {
  return (
    <ToolShell
      tool={getTool("image-to-pdf")}
      intro="Turn assignment scans, ID photos, receipts or a set of screenshots into one tidy PDF. Arrange the page order, choose A4 / Letter / fit-to-image pages with margins you control, and download."
      steps={[
        { title: "Add your images", text: "Drop JPG or PNG files (up to 60) — each image becomes one page of the PDF, in the order shown." },
        { title: "Arrange & set the page", text: "Use the arrows to reorder pages. Pick A4 or US Letter with margins, or 'Fit to image' for borderless full-bleed pages. Orientation is automatic per image." },
        { title: "Create your PDF", text: "Press Create PDF and save it — ready for email, printing, university portals and form uploads." },
      ]}
      features={[
        "Combine up to 60 images into a single, neatly ordered PDF",
        "A4, US Letter or fit-to-image pages, with adjustable margins",
        "Automatic portrait/landscape orientation matched to each image",
        "Drag-free reordering with simple arrows — works great on phones",
        "High-quality embedding keeps text in scans sharp and readable",
        "Your documents never leave your device — safe for IDs, certificates & private paperwork",
      ]}
      faqs={[
        { q: "How do I convert multiple JPGs into one PDF?", a: "Add all the images at once, arrange them with the arrow buttons until the page numbers look right, choose A4 (or your preferred page), then press Create PDF. You'll get a single multi-page PDF file." },
        { q: "Which page size should I choose?", a: "A4 for most of the world (including Pakistan, UK, EU), US Letter for American forms, and 'Fit to image' when you want edge-to-edge photos with no white borders." },
        { q: "Will my PDF be good enough quality for printing?", a: "Yes. Images are embedded at high JPEG quality and placed without being downscaled, so scans and photos stay sharp. For best results start with clear, well-lit originals." },
        { q: "Can I use this for documents like CNIC, certificates or assignments?", a: "Absolutely — and it's safer than most tools: your sensitive documents are combined into a PDF entirely on your own device and are never uploaded to anyone's server." },
        { q: "Is there a page limit?", a: "You can add up to 60 images per PDF here, with no daily limits and no watermarks." },
      ]}
    >
      <ImageToPdf />
    </ToolShell>
  );
}
