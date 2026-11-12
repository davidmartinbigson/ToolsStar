// Extracting audio from video: when "converting" is a lossless copy and when it is a second-generation re-encode.
export default [
  {
    p: "'Save the audio from this video' is one of the most common jobs on the internet — lectures, voice notes, a song clip, the soundtrack of your own wedding video. And here is the surprise most converters never tell you: usually there is no conversion to do. The audio is already a finished, compressed audio file, sitting inside the video like a letter inside an envelope.",
  },
  {
    p: "Understanding that single fact changes everything about what quality you should expect — and exposes the one mistake that quietly taxes it.",
  },
  { h2: "There is already an audio file inside your video" },
  {
    p: "A video file is a container: a box holding a video stream, an audio stream and a little metadata. The audio stream was compressed once, when the video was created, and it has been sitting there ever since — complete, playable, and independent of the pictures around it.",
  },
  {
    ul: [
      "MP4 files almost always carry AAC audio — the same family of compression your music library uses.",
      "WebM files carry Opus or Vorbis — modern, efficient codecs common in browser recordings.",
      "Older AVI files often carry plain MP3 streams, already in the format people think they are 'converting' to.",
      "The file extension tells you the box, not the audio inside: two .mp4 files can hold different audio codecs.",
    ],
  },
  { h2: "Two very different conversions: unwrapping versus re-cooking" },
  {
    p: "Getting that audio out happens in one of two ways, and the quality difference between them is the whole game. Demuxing (also called extracting or remuxing) copies the audio stream bit-for-bit into a new wrapper — no decoding, no re-encoding, zero quality change, done in a blink. Transcoding decodes the audio to raw samples and encodes it again — a second lossy generation, with the small but real loss that implies.",
  },
  {
    table: {
      head: ["If the source audio is…", "The sane move", "Quality result"],
      rows: [
        ["AAC, and AAC/M4A output is fine", "Demux (copy the stream)", "Bit-identical — zero loss"],
        ["AAC, but you specifically need .mp3", "Transcode AAC → MP3", "One extra lossy generation; usually inaudible at 160–192 kbps"],
        ["Opus (WebM), and you need MP3", "Transcode Opus → MP3", "One extra generation; fine at a decent bitrate"],
        ["Anything, and you want 'best quality'", "Demux to the native codec", "Re-encoding can never add detail back"],
      ],
    },
  },
  {
    note: {
      tone: "info",
      title: "The honest rule",
      text: "If a tool re-encodes when it could have copied, you paid a quality tax for nothing. A good extractor tells you what codec is inside and copies whenever the target format allows — transcode only when the destination device truly demands a different codec.",
    },
  },
  { h2: "Why '320 kbps' cannot add detail back" },
  {
    p: "Lossy compression works by discarding what the encoder judges inaudible. Those discards are gone — no later step can reconstruct them. So re-encoding a 128 kbps AAC stream into a 320 kbps MP3 produces a file two to three times larger that sounds exactly like the source, minus a hair more from the second encode. Bitrate is a budget for new detail; it is not a restore button for old detail.",
  },
  {
    ul: [
      "The source's bitrate caps yours: your output can never be better than the stream inside the video.",
      "'Bit-boosting' (low to high bitrate) only inflates files — the classic placebo setting in converter apps.",
      "Generation loss compounds: video → MP3 → MP3 of that MP3 is how voice recordings turn to mush.",
      "The only genuine quality upgrade is going back upstream: the original recording, not any copy of it.",
    ],
  },
  { h2: "Choosing format and bitrate without folklore" },
  {
    ul: [
      "MP3 when compatibility is king: old car decks, dictation hardware, ancient players — MP3 opens everywhere.",
      "AAC/M4A for modern phones and laptops: roughly the same perceived quality at about 30 % fewer bytes.",
      "Opus where it is supported (web platforms, newer Android): the best quality-per-bit of the three.",
      "Speech (lectures, meetings, voice notes): 64–96 kbps MP3 is already transparent for voices — bigger bitrates buy silence.",
      "Music: 160–192 kbps MP3 or 128–160 kbps AAC is the practical sweet spot for everyday listening.",
      "Archiving your own footage's audio: keep the demuxed native stream; never archive a transcode.",
    ],
  },
  { h2: "Rights, and a five-step extraction checklist" },
  {
    note: {
      tone: "warn",
      title: "Only extract what you have the right to",
      text: "A converter does not license content. Pulling audio from your own recordings, licensed or Creative-Commons material, and public-domain sources is fine; ripping audio out of copyrighted videos you do not own is not something any tool makes lawful. When in doubt, ask the owner first.",
    },
  },
  {
    ol: [
      "Pick the video and look at what audio codec it actually contains — a trustworthy tool shows you before it acts.",
      "Prefer copy/demux whenever your target format allows it; treat transcoding as the fallback, not the default.",
      "If you must transcode, choose the bitrate for the content: speech cheap, music mid-range, nothing 'max'.",
      "Name and store the output by source and date — future-you will not remember which lecture was which.",
      "Listen to ten seconds, including a quiet passage, before trusting a whole batch.",
    ],
  },
  {
    p: "'Convert video to MP3' is usually a misnomer: most of the time the right job is unwrapping, not re-cooking. Know which of the two your tool is doing, keep the copies lossless where you can, and spend bitrate only where ears can actually hear it — and the audio you save will still sound like the moment it came from.",
  },
  {
    faq: [
      {
        q: "Is extracting audio from a video lossless?",
        a: "Yes — when the tool copies (demuxes) the audio stream into a compatible wrapper, the output is bit-identical to the stream inside the video. When the codec must change (for example AAC to MP3), it becomes a re-encode: one extra lossy generation, typically inaudible at sensible bitrates like 160–192 kbps.",
      },
      {
        q: "Why is my extracted MP3 much smaller (or bigger) than the video?",
        a: "Audio size follows bitrate × duration, nothing else. Ten minutes of speech at 96 kbps is about 7 MB whether the source video was 40 MB or 400 MB — the video stream's size simply does not travel into the audio file.",
      },
      {
        q: "Does a 320 kbps MP3 sound better than the video's 128 kbps AAC audio?",
        a: "No. Re-encoding cannot restore detail the first encode discarded; you get the source's quality minus a small second-generation loss, at two to three times the bytes. Higher bitrate only helps when the source itself had more detail to preserve.",
      },
      {
        q: "MP3 or AAC/M4A for listening on a phone?",
        a: "AAC/M4A: every modern phone plays it, and it matches MP3's perceived quality at roughly 30 % lower bitrate. Choose MP3 only for stubborn old hardware — some car decks and dedicated players still refuse everything else.",
      },
    ],
  },
  {
    cta: {
      tool: "video-to-mp3",
      text: "Pull the audio out of your video in your browser — copy when possible, transcode only when you must.",
    },
  },
];
