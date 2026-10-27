import ToolShell from "@/components/ToolShell";
import ImageCompressor from "@/components/tools/ImageCompressor";
import { getTool } from "@/lib/tools";

export const metadata = {
  title: "JPG Compressor — Compress JPG / JPEG Images Online Free",
  description:
    "Compress JPG and JPEG photos online for free. Reduce JPG file size by up to 90% with a smart quality slider — bulk mode, ZIP download, no sign-up and no uploads.",
  keywords: ["jpg compressor", "compress jpg", "jpeg compressor", "reduce jpg size", "jpg file size reducer"],
  alternates: { canonical: "/tools/jpg-compressor" },
  openGraph: { title: "Free JPG Compressor | Tools Stars", description: "Make JPEG photos up to 90% smaller right in your browser. Bulk + ZIP, no sign-up." },
};

export default function Page() {
  return (
    <ToolShell
      tool={getTool("jpg-compressor")}
      intro="Purpose-built for JPEG photos from phones and cameras. The quality slider re-encodes your JPGs at the perfect balance of clarity and size — most photos lose 70–90% of their weight with no visible difference."
      steps={[
        { title: "Add your JPGs", text: "Drop one photo or a whole folder's worth (up to 50). PNGs and other images dropped here are converted to JPG automatically." },
        { title: "Pick a quality level", text: "80% is the professional sweet spot. Lower it for email/WhatsApp, raise it for printing. Add a max dimension for even bigger savings." },
        { title: "Download", text: "Compare the before/after size of every photo, then download singly or all together as a ZIP." },
      ]}
      features={[
        "Tuned for real-world photos: phone shots, DSLR exports, scanned documents",
        "Fine-grained quality control from 5% (tiny) to 100% (maximum fidelity)",
        "Bulk mode with ZIP download — compress a whole shoot in one click",
        "Optional resize caps (1920 / 1280 / 800 px) for web and messaging",
        "Private & instant: re-encoding happens on your device, nothing is uploaded",
        "Also strips bulky EXIF metadata (camera info, GPS) for extra savings and privacy",
      ]}
      faqs={[
        { q: "What is the best quality setting for JPG compression?", a: "75–85% for general photos and websites (visually identical, 70%+ smaller). Use 60–70% for messaging apps, and 90%+ when you plan to print or heavily crop later." },
        { q: "How do I compress a JPG to a specific size, like under 200 KB?", a: "Start at 80% quality and check the result size. If it's still too big, lower quality a step at a time or set a max dimension (e.g. 1280px) — resizing is the most powerful lever for hitting strict upload limits on forms and job applications." },
        { q: "Does compressing a JPG remove its EXIF data?", a: "Yes. Re-encoding through the browser produces a clean image without camera model, timestamps or GPS location — a nice privacy bonus before sharing photos publicly." },
        { q: "Can I compress many JPGs at once?", a: "Yes, up to 50 per batch. After compression you can download them one by one or as a single ZIP file." },
        { q: "JPG vs JPEG — is there a difference?", a: "None at all: they are the same format. '.jpg' became popular because early Windows only allowed three-letter extensions. This tool handles both identically." },
      ]}
    >
      <ImageCompressor mode="jpg" />
    </ToolShell>
  );
}
