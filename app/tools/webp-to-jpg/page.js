import ToolShell from "@/components/ToolShell";
import { WebpToJpg } from "@/components/tools/imageDevPack";
import { getTool } from "@/lib/tools";

export const metadata = {
  title: "WebP to JPG Converter Free — Bulk, No Upload, No Sign-Up",
  description:
    "Convert WebP images to JPG online free, in bulk. Choose the background colour for transparent areas, keep the original size or resize, and download everything as a ZIP. Files never leave your device.",
  keywords: ["webp to jpg", "convert webp to jpeg", "webp converter", "webp to jpg online free", "open webp file", "webp to png"],
  alternates: { canonical: "/tools/webp-to-jpg" },
  openGraph: {
    title: "Free WebP to JPG Converter | Tools Stars",
    description: "Bulk WebP → JPG with a background colour for transparent areas. 100% in-browser.",
  },
};

export default function Page() {
  return (
    <ToolShell
      tool={getTool("webp-to-jpg")}
      intro="WebP is what most modern websites serve, but plenty of software — older versions of Windows photo viewers, some form portals, printing shops and office tools — still expects a plain JPG. Drop your WebP files here and get universal JPGs back in seconds, with a sensible background colour wherever the original was transparent."
      steps={[
        { title: "Set the output once", text: "Choose JPG (or PNG to keep transparency), a quality level, and optionally a maximum size. These settings apply to every file you drop." },
        { title: "Drop your WebP images", text: "Add up to 50 files at once — conversion starts immediately, one card per image with its new dimensions and file size." },
        { title: "Download", text: "Save images individually with one tap, or take everything as a single ZIP." },
      ]}
      features={[
        "Bulk conversion of up to 50 WebP files in one go",
        "Transparent areas filled with white, grey, black, cream or any custom colour",
        "PNG output mode too, when you would rather keep transparency",
        "Optional resize — HD, email-friendly or thumbnail sizes",
        "Live before/after file sizes and the percentage change for each image",
        "Re-run the whole batch instantly after changing a setting",
        "Everything happens in your browser — your pictures are never uploaded",
      ]}
      faqs={[
        { q: "Why can't I open my WebP file?", a: "WebP was created by Google for the web and is now supported by all current browsers, but older desktop software, some printing services, many government and university upload portals, and a few chat apps still only accept JPG or PNG. Converting to JPG removes that problem everywhere." },
        { q: "My WebP logo turned into a white box — what happened?", a: "JPG has no transparency channel, so any see-through area must be filled with a real colour. Choose the colour that matches where the image will be used (white for documents, or your brand colour with the custom picker). If you need the transparency itself, switch the output to PNG and tick “Keep transparency”." },
        { q: "Does converting WebP to JPG reduce quality?", a: "Slightly, because JPG is a lossy format — but at 90–95% the difference is invisible for photographs, and the file often stays about the same size. WebP was already compressed, so you are not losing an uncompressed original. Choose PNG output if you want zero additional loss." },
        { q: "Can I convert an animated WebP?", a: "Only the first frame is exported, because the browser decodes an animated WebP as a still image in this workflow. If the animation matters, keep the original .webp file — or convert the frames from a video with our Video to GIF tool instead." },
        { q: "How do I convert WebP to JPG on my phone?", a: "Exactly the same way: open this page, drop the image from your gallery or Downloads folder, and tap the download button. On Android, saved files land in your Downloads folder; on iPhone, use Share → Save Image to put the JPG in your Photos app." },
      ]}
    >
      <WebpToJpg />
    </ToolShell>
  );
}
