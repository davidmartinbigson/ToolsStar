import ToolShell from "@/components/ToolShell";
import { WatermarkImage } from "@/components/tools/imageDevPack";
import { getTool } from "@/lib/tools";

export const metadata = {
  title: "Add Watermark to Image Online Free — Text or Logo, Bulk Photos",
  description: "Add a text or logo watermark to images online for free. Choose position, opacity, rotation or a repeated pattern and watermark many photos at once. No uploads.",
  keywords: ["add watermark to image", "watermark photo online", "image watermark", "logo watermark maker"],
  alternates: { canonical: "/tools/add-watermark-to-image" },
  openGraph: { title: "Free Image Watermark Tool | Tools Stars", description: "Brand and protect batches of photos privately in your browser." },
};

export default function Page() {
  return (
    <ToolShell
      tool={getTool("add-watermark-to-image")}
      intro="Add your name, shop, photography brand or logo to pictures before posting them. Preview on the first image, then apply the same relative watermark to the whole batch."
      steps={[
        { title: "Add one or more photos", text: "Drop the images you want to protect or brand. Thumbnails let you remove anything added by mistake." },
        { title: "Design the watermark", text: "Use text or a transparent logo. Place it in a corner, centre it, or repeat it diagonally across the full image." },
        { title: "Export the batch", text: "Download images individually or all together in a ZIP. Originals on your device are never overwritten." },
      ]}
      features={[
        "Text or transparent-logo watermarks",
        "Nine positions plus a repeated all-over pattern",
        "Opacity, size, rotation and edge-distance controls",
        "Bulk processing with relative sizing for mixed photo dimensions",
        "PNG, JPG or WebP output with ZIP download for batches",
      ]}
      faqs={[
        { q: "Where is the safest place for a watermark?", a: "A corner watermark is least distracting but easiest to crop away. A larger centre or repeated watermark offers stronger discouragement. For product photos, place it over a non-critical part of the product rather than empty background." },
        { q: "What opacity should I use?", a: "About 35–60% is readable without ruining the photo. Use higher opacity for a small corner logo and lower opacity for a large repeated pattern." },
        { q: "Can a watermark guarantee nobody steals my image?", a: "No visible watermark is absolute protection; determined people may crop or edit it. It still discourages casual reuse, proves branding, and makes unauthorized copies less useful." },
        { q: "Why does the watermark size look consistent on different photos?", a: "Sizes are relative to each image's dimensions rather than fixed pixels. A 7% watermark scales sensibly on both a phone photo and a smaller web image." },
      ]}
    >
      <WatermarkImage />
    </ToolShell>
  );
}
