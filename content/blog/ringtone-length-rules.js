// Ringtone maths: the 30-second wall, the seconds people recognise, loudness on tiny speakers.
export default [
  {
    p: "You found the perfect eight seconds of a song, exported it, set it as your ringtone — and your phone either refused the file, played the wrong part, or rang so quietly you missed the call. None of that is bad luck. Ringtones are the most constrained audio file most people ever make: a hard length wall, a tiny speaker, and a listener who gives you two seconds of attention.",
  },
  {
    p: "This guide covers the three things that decide whether a ringtone works: the length rules each platform actually enforces, how to pick seconds that are recognisable in one bar, and the loudness truth about phone speakers. The maths is small; the difference it makes is not.",
  },
  { h2: "The 30-second wall — and who enforces it" },
  {
    p: "iPhone ringtones are capped at 30 seconds. The limit is enforced when the file is installed: a longer clip is rejected or treated as a song rather than a tone. Android has no such wall — a five-minute MP3 will happily sit in your ringtone picker — but length beyond forty seconds buys nothing, because a ringing phone repeats or cuts the clip long before the bridge arrives.",
  },
  {
    table: {
      head: ["Platform / use", "Length that works", "Why"],
      rows: [
        ["iPhone ringtone", "Up to 30 s, sweet spot 20–30 s", "Hard platform cap at install time; shorter tones loop cleanly on repeat calls"],
        ["Android ringtone", "Any, sweet spot 20–40 s", "No cap, but the call UI repeats or stops the clip early"],
        ["Message / notification tone", "1–4 s", "Notifications fire in bursts; long tones overlap and smear"],
        ["Alarm tone", "20–60 s", "Needs to survive the snooze window and wake a sleeping person"],
      ],
    },
  },
  {
    note: {
      tone: "info",
      title: "iPhone wants .m4r, Android wants whatever you have",
      text: "Android accepts an MP3 directly from your files. iPhone installs ringtones as AAC in an .m4r container via Finder/iTunes or GarageBand — so cut and polish your MP3 first (that is the part that decides quality), then let the phone's own tooling do the one-step container conversion. Cutting a bad 30 seconds into a perfect .m4r still gives you a bad ringtone.",
    },
  },
  { h2: "Picking the seconds people actually recognise" },
  {
    p: "A ringtone is not a listening experience; it is an identification task performed in a noisy room. The part of the song you love is often not the part that works: slow intros, verses and breakdowns all fail the two-second test. What survives is the hook — the moment the melody repeats, usually the chorus entry or a signature riff.",
  },
  {
    ul: [
      "Start on a downbeat, not mid-phrase: the first transient is what cuts through a pocket and a pub.",
      "Prefer repetition: a looped two-bar hook reads the same on the third repeat as the first.",
      "Avoid pure bass openings: phone speakers reproduce almost no low end, so a bass intro arrives as silence.",
      "Set the end before a decay, not during one: a fade-out at the loop point stops the seam from clicking.",
    ],
  },
  { h2: "Loudness: why your ringtone sounds quiet on a phone" },
  {
    p: "Modern masters are loud but dense — heavy limiting leaves little peak headroom, and a tiny speaker with no low-end response throws away half the energy anyway. The fix is not 'more volume' in the picker; it is a file shaped for the speaker: gentle normalisation so the average level sits high without clipping, and fades of 50–150 ms so the start and stop are not jarring clicks.",
  },
  {
    p: "Test it the way it will be heard: put the phone face-down on a wooden desk in the next room. If you cannot name the song in two seconds from there, adjust the selection or the level — not the phone's volume slider, which you will forget to reset.",
  },
  { h2: "Sizes: a ringtone is the cheapest file you own" },
  {
    p: "At ringtone lengths the bitrate question almost disappears. Thirty seconds at 320 kbps is about 1.2 MB; at 192 kbps about 0.7 MB; at 128 kbps under half a megabyte. There is no reason to starve a ringtone — take the high rate, keep the fades, and spend your size budget on files that actually travel, like the ones in our MP3 size guide.",
  },
  { h2: "The 60-second workflow" },
  {
    ul: [
      "Load the song and jump straight to the chorus; set start and end inside the 30-second wall (20–30 s).",
      "Loop-preview the selection: if the repeat point annoys you on the fourth loop, it will annoy you forever.",
      "Add a short fade-in and fade-out so calls begin and end without clicks.",
      "Normalise the level if the source is a quiet live recording; leave loud masters alone.",
      "Export MP3 at 192–320 kbps; on iPhone, convert the result to .m4r as the final one-step install.",
    ],
  },
  {
    p: "That is the entire craft: respect the wall, pick the hook, shape the level, test it face-down in another room. A ringtone that passes those four checks will still be recognisable two years from now, in a coat pocket, in the rain.",
  },
  {
    faq: [
      {
        q: "Why won't my 45-second clip install as an iPhone ringtone?",
        a: "iPhone enforces a 30-second cap at install time. Trim to 30 seconds or less — the sweet spot is 20–30 seconds — then convert to .m4r and it installs cleanly.",
      },
      {
        q: "What format should a ringtone be?",
        a: "Android: MP3 or OGG straight from your files. iPhone: AAC in an .m4r container, installed via Finder/iTunes or GarageBand. Cut and polish first; the container conversion is a one-step formality.",
      },
      {
        q: "Why is my ringtone quieter than everything else?",
        a: "Usually a quiet source recording plus a speaker with no low end. Normalise the average level before export and avoid bass-heavy openings — the speaker cannot reproduce them, so they arrive as silence.",
      },
      {
        q: "Does a longer ringtone help me hear it in time?",
        a: "Rarely. Phones repeat or cut the clip during a call, and attention is decided in the first two seconds. A tight 20–30 second hook beats a minute of verse every time.",
      },
    ],
  },
  {
    cta: {
      tool: "ringtone-maker",
      text: "Cut the exact seconds with one-tap 15/30/40-second lengths, loop-preview the repeat point, add fades and loudness polish — MP3 out, in your browser.",
    },
  },
];
