import ToolShell from "@/components/ToolShell";
import { Mp3Cutter } from "@/components/tools/audioPack";
import { getTool } from "@/lib/tools";

export const metadata = {
  title: "MP3 Cutter & Audio Trimmer Online Free — Cut Songs Precisely",
  description: "Cut MP3 and audio online for free with a visual waveform. Trim songs, lectures and voice notes, add fades, normalize volume and download MP3. No uploads.",
  keywords: ["mp3 cutter", "audio trimmer", "cut mp3 online", "trim audio"],
  alternates: { canonical: "/tools/mp3-cutter" },
  openGraph: { title: "Free MP3 Cutter | Tools Stars", description: "Precise audio trimming with waveform preview, privately in your browser." },
};

export default function Page() {
  return (
    <ToolShell
      tool={getTool("mp3-cutter")}
      intro="Only need the chorus, one answer from a lecture, or the useful part of a voice note? Select it on the waveform, preview exactly what will be exported, and save a clean MP3."
      steps={[
        { title: "Add your audio", text: "MP3, WAV, M4A and most audio your browser can play are decoded locally and drawn as a waveform." },
        { title: "Set start & end", text: "Drag the sliders or play the file and tap “set at current player position” at the exact moment. The bright waveform is your clip." },
        { title: "Polish & download", text: "Add gentle fades, make quiet audio louder, choose MP3 quality, then listen to the finished cut before downloading." },
      ]}
      features={[
        "Visual waveform with the selected section clearly highlighted",
        "Set cut points from the live player position for accurate trims",
        "Fade-in and fade-out up to three seconds",
        "Optional volume normalization for quiet recordings",
        "Preview-selection playback with optional looping",
      ]}
      faqs={[
        { q: "Will cutting an MP3 reduce its quality?", a: "The selected section is re-encoded as a new MP3, so use a bitrate close to the original for the least change. At 192–320 kbps most listeners hear no practical difference. Keep the original file as your master copy." },
        { q: "How do I make a very precise cut?", a: "Play the audio, pause at the exact word or beat, then use “Set start/end at current player position”. Fine-adjust with the slider; the preview button plays only the selected section so you can check it." },
        { q: "Can I cut several clips from the same file?", a: "Yes. Export and download one selection, then move the start and end sliders and export again. Your original remains loaded until you choose a different file." },
        { q: "Why won't my file decode?", a: "Some phone voice recorders use AMR or unusual codecs that browsers cannot decode. Export or share that recording as MP3, WAV or M4A first, or try Chrome/Edge, which supports the widest range of common formats." },
      ]}
    >
      <Mp3Cutter />
    </ToolShell>
  );
}
