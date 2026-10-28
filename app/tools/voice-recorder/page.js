import ToolShell from "@/components/ToolShell";
import { VoiceRecorder } from "@/components/tools/audioPack";
import { getTool } from "@/lib/tools";

export const metadata = {
  title: "Voice Recorder Online Free — Record Microphone Audio in Browser",
  description: "Record voice online for free with a live microphone level meter. Pause and resume, listen back, download the recording or convert it to MP3. No uploads.",
  keywords: ["voice recorder online", "online audio recorder", "record voice", "microphone recorder"],
  alternates: { canonical: "/tools/voice-recorder" },
  openGraph: { title: "Free Online Voice Recorder | Tools Stars", description: "Private browser voice recording with pause, playback and MP3 export." },
};

export default function Page() {
  return (
    <ToolShell
      tool={getTool("voice-recorder")}
      intro="Record a quick idea, practice a presentation, capture a lecture note or make a voice message. The live bars confirm your microphone is hearing you before you waste a take."
      steps={[
        { title: "Allow the microphone", text: "Click Start recording and allow microphone access when the browser asks. The site itself never receives your audio." },
        { title: "Record, pause if needed", text: "Watch the level bars move as you speak. Pause for a break, resume when ready, then stop to save the take in this tab." },
        { title: "Listen & download", text: "Play it back, download the browser's original format, or make a widely compatible MP3 copy." },
      ]}
      features={[
        "Live microphone level meter while recording",
        "Pause and resume without creating separate files",
        "Echo cancellation and noise suppression requested from the browser",
        "Instant playback before you download",
        "Optional MP3 conversion for easy sharing anywhere",
      ]}
      faqs={[
        { q: "Where is my recording stored?", a: "Only in this browser tab's memory until you download it. It is not uploaded to Tools Stars. Do not close or refresh the tab before downloading an important recording." },
        { q: "Why does the browser ask for microphone permission?", a: "Browsers require your explicit permission before any website can hear a microphone. You can revoke it later from the browser's site settings. The microphone indicator should disappear after you stop recording." },
        { q: "Why is the download WebM on Chrome but M4A on Safari?", a: "Each browser records in its preferred built-in format. Both are valid audio files. If a person or app cannot open it, use “Also make MP3” for the most compatible option." },
        { q: "How can I get a clearer recording?", a: "Record in a quiet room, keep the phone or microphone 15–30 cm from your mouth, avoid pointing it at a fan, and do a five-second test first. Headset microphones usually beat a laptop across the room." },
      ]}
    >
      <VoiceRecorder />
    </ToolShell>
  );
}
