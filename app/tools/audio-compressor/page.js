import ToolShell from "@/components/ToolShell";
import { AudioCompressor } from "@/components/tools/audioPack";
import { getTool } from "@/lib/tools";

export const metadata = {
  title: "Audio Compressor Online Free — Compress MP3, WAV & M4A Files",
  description: "Compress audio online for free. Reduce MP3, WAV and M4A file size with speech, balanced and high-quality MP3 presets plus a size estimate. No sign-up, no uploads.",
  keywords: ["audio compressor", "compress mp3", "reduce audio file size", "compress wav"],
  alternates: { canonical: "/tools/audio-compressor" },
  openGraph: { title: "Free Audio Compressor | Tools Stars", description: "Smaller MP3 files for WhatsApp, email and upload limits — processed on-device." },
};

export default function Page() {
  return (
    <ToolShell
      tool={getTool("audio-compressor")}
      intro="WAV recordings and high-bitrate songs can be painfully large to send. Pick a sensible preset, see the estimated MP3 size before you start, then listen and download."
      steps={[
        { title: "Add your audio file", text: "We show its duration and estimate its current average bitrate so you can choose a lower one confidently." },
        { title: "Pick speech, balanced or quality", text: "Speech uses compact mono; balanced 128 kbps suits most sharing; 192 kbps keeps more music detail. Custom settings are there if you need them." },
        { title: "Compress & compare", text: "The result player lets you check the sound, and the before/after sizes show exactly how much you saved." },
      ]}
      features={[
        "Huge savings when converting uncompressed WAV to MP3",
        "Speech preset for lectures, bayan, podcasts and voice notes",
        "Estimated output size before encoding begins",
        "Custom bitrate, mono/stereo and sample-rate controls",
        "Listen-before-download preview for every result",
      ]}
      faqs={[
        { q: "Which preset should I choose?", a: "Lectures and voice: Speech. Songs for WhatsApp or general sharing: Balanced 128 kbps. Music you care about: High-quality 192 kbps. Lower bitrate always means a smaller file but gradually less detail." },
        { q: "Why might my MP3 not get smaller?", a: "If the original is already a 64 kbps MP3, re-encoding it at 128 kbps cannot create missing quality and will make it larger. Choose a bitrate below the original estimate shown above the presets." },
        { q: "What is mono, and when is it better?", a: "Mono combines left and right channels into one. For a single voice recording there is usually no stereo information worth keeping, so mono can sound equally clear at a much lower bitrate. Keep stereo for music." },
        { q: "Can compression damage my original file?", a: "No. The compressor creates a separate MP3 and never changes the file on your device. Keep the original if it is an important recording." },
      ]}
    >
      <AudioCompressor />
    </ToolShell>
  );
}
