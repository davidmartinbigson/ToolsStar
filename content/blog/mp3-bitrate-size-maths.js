// MP3 size maths: one dial, one table, and what the format already gave away.
export default [
  {
    p: "You exported a three-minute song and the file manager says 7.2 MB. You expected 'about 3 MB', because somewhere on the internet MP3s are supposed to be small. Neither number is mysterious: an MP3's size is decided by exactly one dial before encoding even begins, and once you can read that dial, every surprise disappears.",
  },
  {
    p: "This guide is the audio companion to our image and GIF size guides: the arithmetic first, then the perceptual part — what the format throws away and when you will actually hear it — and finally a sixty-second workflow that hits any size limit, whether that is an email attachment, a portal upload or a chat cap, without a quality argument afterwards.",
  },
  { h2: "The one equation that decides MP3 size" },
  {
    p: "An MP3 is a stream of bits at a chosen rate (or a variable rate with a known average). Either way, the size is bitrate multiplied by duration, divided by eight to move from bits to bytes:",
  },
  {
    ul: [
      "320 kbps × 180 seconds = 57.6 million bits ≈ 7.2 MB",
      "128 kbps × 180 seconds ≈ 2.9 MB — the same song in 40% of the bytes",
      "64 kbps mono × 180 seconds ≈ 1.4 MB — and choosing mono already halved the bill once",
    ],
  },
  {
    p: "Add roughly one percent for the container: ID3 tags, frame headers, and a cover image if you embedded one. A 500 KB album cover sitting inside a 3 MB file is not a compression failure — it is a photograph living rent-free in your audio.",
  },
  {
    table: {
      head: ["Bitrate", "3-minute size", "Honest best use"],
      rows: [
        ["320 kbps", "≈ 7.2 MB", "Final music delivery when size is not the constraint — the ceiling of MP3's lossy ladder"],
        ["192 kbps", "≈ 4.3 MB", "Sharing music where 'sounds identical' matters on ordinary earphones"],
        ["128 kbps", "≈ 2.9 MB", "The old broadcast standard; fine for casual listening, soft on cymbals and reverb tails"],
        ["96 kbps", "≈ 2.2 MB", "Music on a tight limit, or voice with stereo ambience"],
        ["64 kbps mono", "≈ 1.4 MB", "Speech, lectures and podcasts — voice needs neither stereo nor high rates"],
      ],
    },
  },
  {
    note: {
      tone: "info",
      title: "Duration beats bitrate on long clips",
      text: "Halving the bitrate saves a fixed percentage; cutting dead air saves pure bytes. A ten-minute lecture containing ninety seconds of silence pays full bitrate for every silent second. Trim first, then choose the rate — the order matters more than the dial.",
    },
  },
  { h2: "What you actually lose at each step down" },
  {
    p: "MP3 is perceptual coding: it discards what your hearing is unlikely to notice — sounds masked by louder neighbours, detail above your audible ceiling, stereo information your brain cannot localise. At 192–320 kbps most listeners on most equipment cannot pick the MP3 out of a blind test against the source. That is the honest claim; anyone promising 'identical at 64 kbps' is selling something.",
  },
  {
    p: "Below about 128 kbps the discarded stops being invisible. The classic artefacts: cymbals and hi-hats turning to sand, reverb tails chopping off, a metallic pre-echo just before sharp transients, and bass that thins out because low-frequency resolution was spent elsewhere. Voice survives far lower rates than music, which is why a 64 kbps mono podcast can sound perfectly clean while a 64 kbps symphony sounds like a radio in another room.",
  },
  {
    ul: [
      "Music on earphones: 128 kbps is the floor of 'nobody will complain'; 192 kbps is the floor of 'nobody will notice'.",
      "Music on speakers or good headphones: 192–256 kbps; reserve 320 for when the file itself is the deliverable.",
      "Speech, one voice: 64 kbps mono is genuinely enough; 32–48 kbps remains intelligible for archival voice notes.",
      "Anything you may edit or re-encode later: keep the source untouched and compress a copy.",
    ],
  },
  { h2: "When smaller is free — and when it is a tax" },
  {
    p: "Free: ringtones and notification sounds (two seconds, replayed on a phone speaker), voice memos, podcast episodes, hold music, background loops on a website. In every one of these the listening context is smaller than the file's ambition, and the bytes you save are bytes you never miss.",
  },
  {
    p: "A tax: masters and stems, field recordings you might reuse, the only copy of a family voice, and anything that will travel into another encode. The tax is not audible today. It is audible in three months, when someone converts your already-compressed file one more time.",
  },
  {
    note: {
      tone: "warning",
      title: "The generation trap",
      text: "Every MP3-to-MP3 re-encode discards again from an already-discarded signal; losses stack like photocopies of photocopies. Keep one good original and compress copies from it. Our audio tools always work on a copy in your browser and never touch the source file on your disk.",
    },
  },
  { h2: "Why zipping an MP3 changes nothing" },
  {
    p: "A ZIP archive finds repetition and encodes it once. An MP3 bitstream is already the output of an entropy coder: there is almost no repetition left to find. Zipping a 7.2 MB MP3 typically saves zero to two percent, and occasionally adds bytes. When an MP3 must travel under a hard limit, the lever is bitrate — or duration — never the archive.",
  },
  { h2: "The 60-second workflow that hits any limit" },
  {
    ul: [
      "Read the limit and the clock: 25 MB email attachment, 10 MB portal upload, 16 MB chat cap. Write the number down.",
      "Compute the budget: limit ÷ seconds × 8 = the kbps you can afford. 2 MB over 180 seconds ≈ 89 kbps, so choose 64–96.",
      "Trim first: silence and room tone cost exactly the same bitrate as the melody.",
      "Pick the rate from the table above; for speech take the mono preset and halve the bill again.",
      "Listen to the first and last ten seconds of the result on the device that matters — a phone speaker, not studio monitors.",
    ],
  },
  {
    p: "That is the whole craft: one equation, one table, and the discipline to compress copies instead of originals. The bytes you save are arithmetic; the quality you keep is knowing precisely what the format already gave away.",
  },
  {
    faq: [
      {
        q: "Is a 320 kbps MP3 lossless?",
        a: "No. 320 kbps is the top rung of MP3's lossy ladder — perceptual coding still discards masked detail. Lossless means FLAC or ALAC, typically five to ten times larger. Choose 320 when you want the best MP3, not when you want lossless.",
      },
      {
        q: "What bitrate should a podcast be?",
        a: "One voice: 64 kbps mono is clean and roughly a quarter of the bytes of a stereo music encode. Two hosts plus music beds: 96–128 kbps. Publishing platforms re-encode anyway, so feeding them a huge master buys nothing.",
      },
      {
        q: "Does converting MP3 to MP3 lose quality?",
        a: "Yes, whenever the target bitrate is lower or the file is re-encoded repeatedly — the losses stack. One careful pass from the best source is the cheap path: keep the source, compress copies.",
      },
      {
        q: "Will compressing change the length of my audio?",
        a: "No. Bitrate changes bytes per second, not seconds. Only trimming — cutting silence or whole sections — changes duration, and that is usually the bigger saving anyway.",
      },
    ],
  },
  {
    cta: {
      tool: "audio-compressor",
      text: "Shrink any audio in your browser — speech, balanced and high-quality presets or a fully custom bitrate, with trim and fades. Your original file never leaves your device.",
    },
  },
];
