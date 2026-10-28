import ToolShell from "@/components/ToolShell";
import ImageResizer from "@/components/tools/ImageResizer";
import { getTool } from "@/lib/tools";

export const metadata = {
  title: "Image Resizer — Resize Images Online Free Without Stretching",
  description:
    "Resize JPG, PNG & WebP images online for free: exact pixels, percentage scale, or one-click presets for Instagram, YouTube thumbnails, Facebook & WhatsApp. Fit the whole image or crop to frame — no accidental stretching, no sign-up, no uploads.",
  keywords: ["image resizer", "resize image online", "resize photo without stretching", "image size changer", "resize image for instagram"],
  alternates: { canonical: "/tools/image-resizer" },
  openGraph: { title: "Free Image Resizer — No Stretching | Tools Stars", description: "Exact pixels or social media presets with fit, crop and stretch clearly separated — resize images right in your browser." },
};

export default function Page() {
  return (
    <ToolShell
      tool={getTool("image-resizer")}
      intro="Get the exact dimensions any platform demands without accidentally squashing your photo. Resize by pixels or percentage, or use Instagram, YouTube and Facebook presets — by default the whole image is fitted proportionally inside the exact frame."
      steps={[
        { title: "Add your image", text: "Drop a JPG, PNG or WebP (or paste with Ctrl+V). Your original dimensions and file size appear instantly." },
        { title: "Set size and fit style", text: "Type a width/height, drag the percentage slider, or choose a social media preset. Keep 'Fit whole image' for no stretching/cropping, or choose 'Crop to frame' when the exact frame must be completely filled." },
        { title: "Resize & download", text: "Check the live preview, then download in JPG, PNG or WebP at exactly the requested canvas size." },
      ]}
      features={[
        "One-tap presets: Instagram post & story, YouTube thumbnail, Facebook cover, X, LinkedIn, Pinterest, WhatsApp DP",
        "No-stretch by default: fit the whole image inside the exact preset size",
        "Crop to frame option for full-bleed social images — still no distortion",
        "Stretch is separated and clearly labelled, never applied accidentally by a preset",
        "White, black, transparent or custom backgrounds for empty fit edges",
        "Scale by percentage from 5% up to 200%, plus format and quality controls",
      ]}
      faqs={[
        { q: "Will an Instagram or YouTube preset stretch my image?", a: "No. Presets now use 'Fit whole image' by default: the output canvas is exactly the preset size, but your photo keeps its original proportions and is centered inside. If you want the frame completely filled, choose 'Crop to frame'; that center-crops the overflow instead of stretching it. Stretching happens only if you explicitly select 'Stretch'." },
        { q: "What is the difference between Fit whole image and Crop to frame?", a: "Fit whole image shows every pixel of the original and may leave empty edges, which you can make white, black, transparent or a custom colour. Crop to frame fills every corner of the destination size, but trims the parts that fall outside. Neither one distorts the image." },
        { q: "What size should Instagram / YouTube images be?", a: "Instagram post: 1080×1080. Story/Reels cover: 1080×1920. YouTube thumbnail: 1280×720. Facebook cover: 1640×924. All of these are one tap in the presets above." },
        { q: "Will resizing make my image blurry?", a: "Making an image smaller stays crisp (we use high-quality smoothing). Enlarging beyond ~150% will soften it, because no tool can invent real detail — modest upscales for print or thumbnails are fine though." },
        { q: "How do I resize an image for a passport / visa / application form?", a: "Enter the exact pixel size the form requests. Use Fit whole image or Crop to frame to preserve the person's proportions; choose Stretch only if the form truly requires the photo itself to be distorted to that exact rectangle. For official print sizes, our Passport Photo Maker is usually the better tool." },
        { q: "Does the resizer keep transparent backgrounds?", a: "Yes with PNG or WebP output, including transparent empty edges in Fit mode. JPG has no transparency, so JPG uses white when transparent is selected." },
      ]}
    >
      <ImageResizer />
    </ToolShell>
  );
}
