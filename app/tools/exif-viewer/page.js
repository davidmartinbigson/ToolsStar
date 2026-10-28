import ToolShell from "@/components/ToolShell";
import { ExifViewer } from "@/components/tools/imageDevPack";
import { getTool } from "@/lib/tools";

export const metadata = {
  title: "EXIF Viewer & Metadata Remover Online Free — Remove GPS from Photos",
  description: "View hidden EXIF camera, date and GPS metadata in a photo online for free, then download a clean copy with metadata removed. Private in-browser processing.",
  keywords: ["exif viewer", "remove exif", "photo metadata remover", "remove gps from photo"],
  alternates: { canonical: "/tools/exif-viewer" },
  openGraph: { title: "EXIF Viewer & Metadata Remover | Tools Stars", description: "Know what your photo reveals before you share it — and clean it in one click." },
};

export default function Page() {
  return (
    <ToolShell
      tool={getTool("exif-viewer")}
      intro="A photo can quietly carry its camera model, capture time and even GPS coordinates. Inspect those hidden fields first, then create a clean copy that is safer to post or send."
      steps={[
        { title: "Add the original photo", text: "Use the file directly from your camera or phone; screenshots and many social-media downloads already have little metadata." },
        { title: "Review the warning cards", text: "Camera, date, lens settings and GPS are summarized first. Search the full field table if you need a specific tag." },
        { title: "Create a clean copy", text: "The visible pixels are redrawn into a new JPG, PNG or WebP, leaving EXIF/GPS data behind. We re-check the clean file for sensitive fields." },
      ]}
      features={[
        "Plain-English summary before the technical field table",
        "Prominent warning when GPS coordinates are present",
        "Search every EXIF, XMP and IPTC field found",
        "One-click clean copy in JPG, PNG or WebP",
        "Verification pass on the cleaned download",
      ]}
      faqs={[
        { q: "Does WhatsApp or Facebook already remove EXIF?", a: "Many social platforms strip much metadata from displayed copies, but sending a photo as a document/file or by email often preserves the original. Check the exact file you plan to share rather than relying on a platform." },
        { q: "Will removing metadata change how the photo looks?", a: "The clean copy uses the same visible pixels and orientation. If you export as JPG/WebP it is re-encoded, so use high quality; PNG avoids compression artefacts but is usually much larger for photos." },
        { q: "Why can metadata still show image width or format?", a: "Width, height and file structure are necessary technical facts and are not the same as private EXIF. The remover targets camera identity, dates, GPS, software and descriptive tags." },
        { q: "My HEIC photo can be read but not cleaned. Why?", a: "The metadata reader can parse some formats that the browser cannot draw. Convert HEIC to JPG with our HEIC to JPG tool first — conversion through a canvas also generally drops the original EXIF — then inspect the JPG here to confirm." },
      ]}
    >
      <ExifViewer />
    </ToolShell>
  );
}
