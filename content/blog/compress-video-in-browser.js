// Browser video compression — honest expectations.
export default [
  {
    p: "Compressing video in a web browser used to be a joke: browsers could play video but not re-encode it. That changed when WebAssembly made it practical to run real encoders inside a page. The result is genuinely useful — and it comes with one physical constraint you should understand before you start.",
  },
  {
    note: {
      tone: "warn",
      title: "The honest constraint: it is near real-time",
      text: "Re-encoding video means decoding every frame and encoding it again. In a browser that happens at roughly playback speed — a three-minute clip takes around three minutes. Any tool, ours included, that promises instant browser video compression is not telling you the truth about what encoding costs. The upside of that trade: nothing is uploaded, so a 500 MB file on a slow connection still 'travels' at your CPU's speed, not your upload speed's.",
    },
  },
  { h2: "What actually determines the output size" },
  {
    ol: [
      "Resolution. Halving width and height quarters the pixels per frame. This is the single biggest lever and the first one to pull.",
      "Bitrate. The encoder's budget per second of video. Lower bitrate means smaller file and, past a point, visible blocking in motion.",
      "Frame rate. 60 fps footage carries twice the frames of 30 fps. For talking-head or screen content, 30 fps is usually indistinguishable and halves the work.",
      "Codec. H.264 (MP4) is universally playable; WebM/VP9 is smaller at equal quality but not accepted everywhere.",
    ],
  },
  {
    p: "The order matters. People reach for bitrate first because it is a slider, but resolution and frame rate remove real information the eye will not miss, whereas bitrate reduction removes quality you will.",
  },
  { h2: "Sane settings for common cases" },
  {
    table: {
      head: ["Use case", "Resolution", "Frame rate", "Target"],
      rows: [
        ["WhatsApp / email share", "720p", "30 fps", "small and quick"],
        ["Social upload", "1080p", "30 fps", "balanced"],
        ["Screen recording / tutorial", "1080p or source", "30 fps", "crisp text, low motion"],
        ["Archive of original", "do not recompress", "—", "keep the master"],
      ],
    },
  },
  {
    p: "Screen recordings deserve a special mention: they are mostly static pixels with occasional motion, which encodes extremely efficiently. A 40-minute tutorial at 1080p30 can land at a fraction of the size of a camera video of the same length at the same settings.",
  },
  { h2: "Working well with a near-real-time encoder" },
  {
    ul: [
      "Keep the tab visible and the machine awake. Browsers throttle background tabs, and a throttled encoder slows to a crawl.",
      "Do the irreversible reductions once. Re-encoding an already-compressed clip compounds artefacts; always start from the best source you have.",
      "Trim before you compress. Cutting thirty seconds of dead air saves thirty seconds of encoding and its bytes — free.",
      "Watch the progress readout rather than the clock. A stall usually means the tab was throttled, not that the file is broken.",
    ],
  },
  { h2: "Privacy is the real reason to do this locally" },
  {
    p: "Video is the heaviest, most personal media most people produce: home footage, lectures, meetings, medical or legal recordings. Upload-based compressors ask you to push all of it through someone else's server, often with an undisclosed retention period. Browser encoding means the footage never leaves the device — the only thing that leaves is the finished file, when you choose to send it.",
  },
  { cta: { tool: "video-compressor", label: "Video Compressor", text: "Re-encode MP4/WebM in your browser with resolution, frame-rate and quality controls — and honest progress while it works." } },
  { h2: "Codec, container and audio — decided in one place" },
  {
    p: "Three names get conflated here, and separating them makes the settings screen legible. The codec is the maths that shrinks each frame; the container is the wrapper file that carries video, audio and timing; the bitrate is the budget both are given per second.",
  },
  {
    table: {
      head: ["Combination", "Plays on", "Best for"],
      rows: [
        ["H.264 in MP4", "essentially everything", "the default; portals, messaging, editors, TVs"],
        ["VP9 in WebM", "modern browsers", "web playback where size matters more than reach"],
        ["AV1", "newer hardware and browsers", "archival quality at low bitrate, when time allows"],
      ],
    },
  },
  {
    p: "Audio is the part people forget to budget. Speech is comprehensible at 96–128 kbps and music stays pleasant at 160–192 kbps; audio rarely needs more than a tenth of your total bitrate, so starving it to feed the video stream is usually a mistake you can hear.",
  },
  {
    faq: [
      {
        q: "Why is browser compression slower than a desktop app?",
        a: "Desktop tools can use dedicated hardware encoders on your graphics card. Browsers mostly use software encoders for portability, so they trade speed for working everywhere with no install. The compression quality itself is comparable.",
      },
      {
        q: "Will MP4 output play everywhere?",
        a: "H.264 in MP4 is the safest combination in existence — phones, TVs, editors, portals. If a destination accepts WebM you can usually save more, but MP4 is the compatibility default for a reason.",
      },
      {
        q: "Can I compress a video to an exact size?",
        a: "Approximately, by choosing a bitrate: size ≈ bitrate × duration. Compute the bitrate your target implies, set it, and accept a small margin. Exact-byte targeting is a photo problem, not a video one.",
      },
      {
        q: "Does compression remove audio?",
        a: "No — audio is re-encoded alongside the video, typically at a modest bitrate that is inaudible for speech and fine for most music. Mute the source if you want the audio bytes back.",
      },
    ],
  },
];
