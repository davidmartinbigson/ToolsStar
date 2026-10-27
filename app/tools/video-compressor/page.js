import ToolShell from "@/components/ToolShell";
import VideoCompressor from "@/components/tools/VideoCompressor";
import { getTool } from "@/lib/tools";

export const metadata = {
  title: "Video Compressor — Compress MP4 & Video Online Free, No Upload",
  description:
    "Compress videos online for free without uploading them. Reduce MP4, WebM & MOV file size by up to 90% for WhatsApp, email & YouTube. No sign-up, no watermark — runs 100% in your browser.",
  keywords: ["video compressor", "compress video online", "mp4 compressor", "reduce video size", "compress video for whatsapp"],
  alternates: { canonical: "/tools/video-compressor" },
  openGraph: { title: "Free Video Compressor — No Upload | Tools Stars", description: "Shrink videos by up to 90% right in your browser. No sign-up, no watermark." },
};

export default function Page() {
  return (
    <ToolShell
      tool={getTool("video-compressor")}
      intro="Make big videos small enough to share anywhere. Pick a preset for WhatsApp, email or the web — or fine-tune resolution and bitrate yourself. Your video is re-encoded privately on your device: it is never uploaded to any server."
      steps={[
        { title: "Add your video", text: "Drop an MP4, WebM or MOV file above. It opens locally in your browser — check its size, duration and resolution." },
        { title: "Choose quality vs. size", text: "Tap a preset (Balanced suits most people) or set resolution and bitrate manually. The estimated output size updates live." },
        { title: "Compress & download", text: "Press Compress and keep the tab visible while it re-encodes. Preview the result, compare sizes, then download — no watermark." },
      ]}
      features={[
        "Save 70–92% of file size with presets for WhatsApp, email and social media",
        "You control resolution (1080p → 360p) and bitrate, with a live size estimate",
        "Private by design — the video never leaves your device, so personal clips stay personal",
        "No upload wait and no server queue: compression starts the instant you press the button",
        "Keep or remove the audio track to save even more space",
        "Completely free: no sign-up, no watermark, no per-day limits",
      ]}
      faqs={[
        { q: "How can I compress a video for WhatsApp?", a: "Choose the 'WhatsApp / Email' preset (480p at 0.9 Mbps). A 1-minute clip lands around 7 MB — comfortably inside WhatsApp limits while still looking sharp on a phone screen." },
        { q: "Will compressing reduce my video's quality?", a: "Compression always trades a little data for size, but at Balanced settings (720p, 2.5 Mbps) most viewers cannot tell the difference on phones and laptops. For archiving, keep your original; for sharing, the compressed version is ideal." },
        { q: "Why does compression take about as long as the video itself?", a: "Because your browser re-encodes the video in real time on your device instead of uploading it to a powerful (and privacy-risky) server. You skip the upload, the queue and the download of the original — so for most clips the total time is still shorter." },
        { q: "What formats are supported?", a: "Any video your browser can play — MP4 (H.264) works everywhere, plus WebM and most MOV files. The compressed file downloads as MP4 where the browser supports it, otherwise WebM (which also plays on all modern phones and can be uploaded to YouTube/WhatsApp). " },
        { q: "Is there a maximum file size?", a: "We impose none. The practical limit is your device's memory and patience — for very long 4K recordings we recommend a desktop browser and the 720p or 1080p preset." },
      ]}
    >
      <VideoCompressor />
    </ToolShell>
  );
}
