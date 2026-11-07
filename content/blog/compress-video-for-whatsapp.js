// Video size caps on WhatsApp, email and forms — the four dials that decide file size.
export default [
  {
    p: "WhatsApp caps videos at roughly 16 MB for a direct send — about a minute of phone footage at chat quality. Email providers hover around 20–25 MB per message. Job portals and government forms routinely demand less. Meanwhile your phone happily records a single minute of a family gathering at 130 MB. Between those two numbers sits a compression decision, and most people make it with a random app that slaps a watermark on their memories.",
  },
  {
    p: "Video compression is neither magic nor mystery. It is four dials — resolution, frame rate, bitrate and codec — and the order in which you turn them decides whether the result still looks like your evening or like a potato. And before the dials there is a fifth move that costs nothing in quality: the scissors.",
  },
  { h2: "Trim first: the cheapest size reduction there is" },
  {
    p: "Every clip carries dead weight — the two seconds before someone hits record properly, the walk back to the phone, the third take of the same joke. Cutting that weight is the only size reduction that removes zero quality from the footage you keep, so it should always be move one.",
  },
  {
    ul: [
      "The maths is linear: two minutes at 2 Mbps is roughly 30 MB; cut forty seconds and you are under 20 MB before touching a single quality dial.",
      "Trim in the browser with a frame-accurate tool — you see the exact frames you are keeping, and the file never uploads anywhere.",
      "Cut at natural pauses, not mid-word: the clip feels shorter and sharper, not amputated.",
      "Only after trimming should you compress what remains — often the leftover overshoot is small enough that a gentle bitrate touch finishes the job.",
    ],
  },
  { h2: "The four dials that decide file size" },
  {
    p: "Every megabyte in a video file pays for one of four things. Turn these dials in order and quality survives; turn them randomly and nothing does.",
  },
  {
    ul: [
      "Resolution — the pixel dimensions of each frame. Halving both width and height quarters the pixel count, so this is the single biggest lever. For a clip destined for a phone screen, 720p (or even 540p) throws away detail the recipient could never see anyway.",
      "Bitrate — the budget of bits spent per second. This is the direct size dial: roughly half the bitrate means roughly half the file. The quality cost stays invisible for a while, then falls off a cliff; knowing where your cliff is beats any fixed formula.",
      "Frame rate — how many pictures per second. 60 fps doubles the temporal data of 30 fps. For chats, statuses and memories, 30 fps looks identical on a phone, so the extra frames are size you are paying for nothing.",
      "Codec — the maths that packs the frames. H.264 plays on practically everything; newer codecs pack the same footage 30–50 % smaller but can fail on older players and some forms. Know your recipient before you choose.",
    ],
  },
  { h2: "What each destination actually needs" },
  {
    p: "The target file size is not a preference — each destination has a hard wall, and the sane settings differ by what that destination will do with the clip.",
  },
  {
    table: {
      head: ["Destination", "Typical wall", "Sane settings", "Dial order"],
      rows: [
        ["WhatsApp direct send / status", "~16 MB", "720p, 30 fps, H.264", "Resolution first, then bitrate until it fits"],
        ["Email attachment", "20–25 MB", "720p or 1080p, 30 fps", "Bitrate first; drop resolution only if still heavy"],
        ["Job portal / online form", "5–10 MB (or whatever it states)", "540p–720p, 30 fps", "Resolution first — forms rarely play full-screen"],
        ["Your own archive", "None", "Do not compress", "Keep the camera original; compress copies only"],
      ],
    },
  },
  {
    note: {
      tone: "info",
      title: "Compress copies, never masters",
      text: "The camera original is your negative. Every re-encode loses a little more, so archive the untouched file and produce destination-sized copies. Re-compressing an already compressed clip — the file WhatsApp itself squeezed — is exactly where the blocky, potato look is born.",
    },
  },
  { h2: "How to compress a video in your browser, step by step" },
  {
    p: "Browser-based compressors run the same maths that desktop tools do, with one big advantage for private footage: the file never leaves your device. The workflow is short enough to remember:",
  },
  {
    ol: [
      "Load the clip into the compressor. Processing happens locally in your browser — nothing uploads to a server, which matters when the video is of people rather than landscapes.",
      "Pick the target resolution first: 720p for phone screens, 540p when a form is ruthless about size.",
      "Set 30 fps unless the motion itself is the point — sport, slow-motion sources, anything the recipient will study.",
      "Watch the estimated output size before committing. A good tool shows you the maths and updates the estimate as you move dials, instead of a mystery spinner.",
      "Download, then play the busiest ten seconds of the result. Motion and faces tell you immediately whether you pushed the bitrate too far — nobody judges a clip by its calmest moment.",
    ],
  },
  { h2: "Why the result can look worse than the number promises" },
  {
    p: "Two traps explain most disappointment with small files. The first is grain: dark, noisy footage — evening indoors, dim restaurants — forces the encoder to spend bitrate on sensor noise instead of detail, so identical settings look far worse at night than at noon. The second is where you look: faces and text reveal compression first, long before skies or walls do.",
  },
  {
    ul: [
      "Noisy sources need more bitrate, not less. If the clip was shot in low light, leave one notch above what the size table suggests.",
      "Faces, skin and subtitles are your quality canaries — judge on them, not on the background.",
      "Short clips hide sins; long clips accumulate them. A five-second test looks fine, but artefacts compound across minutes, so check the middle of long videos too.",
      "Motion is expensive: panning shots and busy scenes cost more bits than a static tripod frame. Trim a shaky pan and the whole clip gets cheaper.",
    ],
  },
  { h2: "When compression is the wrong tool" },
  {
    p: "Sometimes the size problem has a better answer than squeezing pixels harder:",
  },
  {
    ul: [
      "The clip misses the cap by seconds: trim the dead start and end instead. Cutting costs no quality; squeezing does.",
      "The recipient can accept a link: sharing preserves the master forever. Compression never gives back what it removed.",
      "The portal explicitly demands an original or unedited file — evidence, submissions, some visa or job forms. Re-encoded footage can be rejected outright.",
      "The video is already a WhatsApp-forwarded file: it has been compressed once (often twice). Squeezing it again multiplies artefacts; go back to the original if you can.",
    ],
  },
  {
    p: "File-size caps are arbitrary; your footage is not. Learn the four dials, turn them in order, compress copies rather than masters — and the 16 MB wall stops being a wall. It becomes just another destination with a sane setting attached.",
  },
  {
    faq: [
      {
        q: "How small can I compress a video before quality visibly dies?",
        a: "For 720p at 30 fps, bitrates around 1.5–2.5 Mbps usually stay clean for chat footage; below about 1 Mbps, blockiness creeps into motion and dark areas. The visible cliff depends on your source — noisy, low-light footage dies earlier — so judge on the busiest ten seconds rather than trusting a fixed number.",
      },
      {
        q: "Does compressing in the browser upload my video anywhere?",
        a: "With browser-based tools that decode and re-encode locally, no: the frames never leave your device, which is the safest option for private footage. Upload-first compressors keep a server copy by design — check where the processing happens before you load anything personal.",
      },
      {
        q: "Should I reduce frame rate or resolution first?",
        a: "Resolution first for anything destined for a phone: a small screen cannot show the detail you removed anyway, so 720p costs almost nothing there. Keep 30 fps unless the motion is the subject; dropping to 24 or 25 fps rarely saves enough to matter and can make movement look juddery.",
      },
      {
        q: "Why is my compressed file sometimes bigger than I expected?",
        a: "Because size follows content, not just settings. Noisy, dark or fast-moving footage resists compression — the encoder spends bits on grain and motion instead of detail. A clean, static, well-lit clip at identical settings can come out several times smaller.",
      },
    ],
  },
  {
    cta: {
      tool: "video-trimmer",
      text: "Trim the dead seconds first, frame-accurate and in your browser — then compress what is left.",
    },
  },
];
