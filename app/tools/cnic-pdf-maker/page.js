import ToolShell from "@/components/ToolShell";
import { CnicPdfMaker } from "@/components/tools/miscPack2";
import { getTool } from "@/lib/tools";

export const metadata = {
  title: "CNIC Front & Back PDF Maker Online Free — One A4 Page",
  description: "Make a print-ready CNIC front and back PDF online for free. Both sides on one A4 page at actual 85.6×54mm card size. Private in-browser processing, no uploads.",
  keywords: ["cnic front back pdf", "cnic pdf maker", "cnic copy on one page", "nic front back pdf"],
  alternates: { canonical: "/tools/cnic-pdf-maker" },
  openGraph: { title: "CNIC Front & Back PDF Maker | Tools Stars", description: "Neat A4 CNIC copies from two photos — without uploading sensitive documents." },
};

export default function Page() {
  return (
    <ToolShell
      tool={getTool("cnic-pdf-maker")}
      intro="Job, university and government forms often ask for both CNIC sides together. Add one clear photo of each side, rotate if needed, and get a tidy A4 PDF with the cards at their real size."
      steps={[
        { title: "Add the front photo", text: "Photograph the card straight-on in good light. Keep all corners visible and avoid flash reflecting on the plastic." },
        { title: "Add the back & check both previews", text: "Rotate a sideways photo, keep “Show full card” so nothing is cut, and use the clarity option if the photo looks dull." },
        { title: "Make & print the PDF", text: "Choose both sides on one A4 page, download, and print at 100% or “Actual size” — not Fit to Page." },
      ]}
      features={[
        "Front and back on one A4 page, or separate pages if a portal requires them",
        "Actual CNIC print size: 85.6 × 54 mm, plus a 125% easy-read option",
        "Full-card fitting never stretches the photo or hides its edges",
        "Rotate and clarity controls for ordinary phone photos",
        "Especially private: sensitive CNIC images never leave your device",
      ]}
      faqs={[
        { q: "How do I print the CNIC at its real size?", a: "Open the PDF, choose A4 paper and set scale to 100% or “Actual size”. Do not choose “Fit to printable area”, because the printer may make the card slightly smaller or larger." },
        { q: "Should I choose Show full card or Fill card box?", a: "Show full card is safest because no name, number or corner can be cropped. Fill card box looks neater only when your photo is already tightly cropped around the card; check the preview carefully before using it." },
        { q: "My photo includes the table around the CNIC. What should I do?", a: "Crop close to the card in your phone gallery first, or use our Document Scanner/Image Cropper. Then add the cropped image here. A close, straight photo produces a much clearer PDF." },
        { q: "Is it safe to use my CNIC here?", a: "The images are processed locally by your browser and are not uploaded to our server. Still handle the downloaded PDF carefully: send it only to the organization that requested it and avoid posting it publicly." },
      ]}
    >
      <CnicPdfMaker />
    </ToolShell>
  );
}
