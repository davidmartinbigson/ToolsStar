import ToolShell from "@/components/ToolShell";
import { RingtoneMaker } from "@/components/tools/audioPack";
import { getTool } from "@/lib/tools";

export const metadata = {
  title: "Ringtone Maker Online Free — Create MP3 Ringtones from Songs",
  description: "Make a ringtone online for free. Select 15, 30 or 40 seconds of a song, loop-preview it, add fades and volume polish, then download an MP3 ringtone. No uploads.",
  keywords: ["ringtone maker", "make ringtone from mp3", "mp3 ringtone cutter", "create ringtone"],
  alternates: { canonical: "/tools/ringtone-maker" },
  openGraph: { title: "Free Ringtone Maker | Tools Stars", description: "Turn a favourite chorus into a clean looping MP3 ringtone." },
};

export default function Page() {
  return (
    <ToolShell
      tool={getTool("ringtone-maker")}
      intro="Find the hook everyone will recognize in the first two seconds. Set a 15, 30 or 40-second selection, loop it until it feels right, and download a ringtone-ready MP3."
      steps={[
        { title: "Add your song", text: "Choose an MP3 or audio file you own. The first 30 seconds are selected automatically so you can start previewing immediately." },
        { title: "Move to the best part", text: "Click the waveform or use the player to find the chorus, then set start and end. Loop preview repeats the selection like a phone call would." },
        { title: "Fade, lift & download", text: "Gentle fades stop jarring starts and endings, volume polishing makes quiet songs clear, and the MP3 is ready for your phone." },
      ]}
      features={[
        "One-tap 15, 30 and 40-second ringtone lengths",
        "Looping selection preview to judge the repeat point",
        "Fade-in and fade-out controls for a smoother phone alert",
        "Volume normalization for quiet tracks",
        "High-quality MP3 output up to 320 kbps",
      ]}
      faqs={[
        { q: "How long should a ringtone be?", a: "Thirty seconds is the safest general choice. Some phones accept about 40 seconds, while notification sounds should be much shorter — often 2–5 seconds. Calls usually loop the file, so a clean musical loop matters more than maximum length." },
        { q: "How do I set this MP3 as an Android ringtone?", a: "Download it to the phone, open Settings → Sound & vibration → Phone ringtone, then choose the file. On some phones you may need to move it into the Ringtones folder or select it from a file picker." },
        { q: "Can I directly set it on iPhone?", a: "iPhone does not let a browser assign an MP3 as a ringtone directly. Download the MP3, then use GarageBand on the iPhone or Finder/iTunes on a computer to add it as a ringtone." },
        { q: "Should I use fades on a ringtone?", a: "A very short fade-in (about 0.2–0.5 seconds) can stop an abrupt click, and a one-second fade-out sounds polished if the call keeps ringing. If the loop point is musical and continuous, you can set both to zero." },
      ]}
    >
      <RingtoneMaker />
    </ToolShell>
  );
}
