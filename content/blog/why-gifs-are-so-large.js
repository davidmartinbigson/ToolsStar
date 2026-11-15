// GIF size maths: a 1987 format, three dials, and when a loop should just be a video.
export default [
  {
    p: "You trimmed a three-second clip, made a loop, and the file came out at 11 MB — bigger than the thirty-second video it came from. Nothing is broken. You have simply handed 2026 footage to a format designed in 1987, and the format has billed you accordingly.",
  },
  {
    p: "GIFs are not 'videos that failed to compress'. They are a different animal with different maths, and once you see the three dials that decide their size, every oversized loop you have ever made becomes obvious in hindsight.",
  },
  { h2: "A 1987 format sitting in a 2026 chat window" },
  {
    p: "A GIF stores a sequence of frames, and each frame is essentially a complete 256-colour image. There is no clever prediction between frames, no modern transform coding, no temporal residuals — the tricks that let H.264 or VP9 describe a second of video in a few hundred kilobytes simply do not exist in GIF89a. Every frame pays full price.",
  },
  {
    ul: [
      "256 colours per frame, maximum — a palette chosen for the whole frame or per frame, never more.",
      "Full-frame images stacked in time: ten frames means ten images, not one image plus nine diffs.",
      "Optional dithering to fake colours outside the palette — useful for photos, expensive in bytes.",
      "One-bit transparency and a loop counter: the entire animation toolkit of the format.",
    ],
  },
  { h2: "The three dials that decide GIF size" },
  {
    p: "Because each frame is an image, GIF size scales with brutally simple arithmetic: frames per second × number of seconds × frame area × cost per pixel. That gives you exactly three honest dials:",
  },
  {
    table: {
      head: ["Dial", "What it does to size", "Sane setting"],
      rows: [
        ["Frame rate", "Roughly linear: 24 fps ≈ double the frames of 12 fps", "10–15 fps for reactions and memes; 20+ only when smoothness is the point"],
        ["Frame area", "Roughly linear in pixels: halve width and height, quarter the size", "Crop to the face, the button, the ball — never the whole screen"],
        ["Palette & dithering", "256 → 128 → 64 colours shaves bytes; dithering off shaves more", "Full palette for photos, 64–128 for flat UI or cartoon art, dither off when colours are few"],
      ],
    },
  },
  {
    note: {
      tone: "info",
      title: "Length is the fourth, sneakiest dial",
      text: "Every extra second adds a full second of frames at whatever fps you chose. The joke usually lives in two to four seconds; the fifth second onwards is size you are paying for nostalgia.",
    },
  },
  { h2: "Why flat graphics shrink and footage explodes" },
  {
    p: "A screen recording of a button animation might use eleven colours total — a 64-colour palette holds it perfectly, dithering stays off, and the GIF comes out tiny. A clip of confetti at a wedding is the opposite: thousands of gradients and grain, a 256-colour palette straining, dithering sprinkling noise pixels everywhere, and every one of those noise pixels costing bytes in every frame.",
  },
  {
    p: "That single contrast explains most GIF folklore: 'GIFs of UI are small, GIFs of cameras are huge.' It is not folklore — it is palette maths.",
  },
  { h2: "Making a loop people actually send" },
  {
    ol: [
      "Find the two-to-four seconds that carry the moment; cut everything else, including the breath before it.",
      "Crop tight — the reaction, the goal, the typo. Area is the cheapest size you will ever save.",
      "Pick 12–15 fps unless the smoothness itself is the content; chat-sized viewers will not miss the frames.",
      "Drop the palette for flat art (64–128 colours) and switch dithering off; keep 256 + dither only for photographic loops you truly need as GIF.",
      "Preview at chat size on a phone, not full-screen on a monitor — that is where the loop will live.",
      "Watch the seam: last frame back to first. If it jumps, re-pick the in-point or let the tool ping-pong the playback.",
    ],
  },
  { h2: "When a GIF is simply the wrong tool" },
  {
    ul: [
      "Anything longer than ~5 seconds: a muted looping MP4 or WebM is typically 5–10× smaller and auto-plays in every modern chat and feed.",
      "Footage with grain, gradients or fast camera motion: the palette will dither it into noise-and-bytes.",
      "Anything with sound: GIF never had audio; people add it back with video anyway.",
      "Website heroes and product demos: animated WebP/AVIF or short video loops beat GIF on every axis except ancient email clients.",
      "When the destination is email HTML: here GIF still reigns — most email clients animate nothing else.",
    ],
  },
  {
    p: "The GIF survives not because it is good at video, but because it is universal: every client, every forum, every email from 2004 will play it. Respect that superpower, spend your bytes on the three dials — rate, area, palette — and keep the loops short enough that the format's age never shows.",
  },
  {
    faq: [
      {
        q: "Why is my 3-second GIF bigger than a 30-second video?",
        a: "Different maths: a GIF stores each frame as a full 256-colour image, while modern video codecs describe changes between frames with transforms and prediction. At chat sizes, muted looping video is commonly 5–10× smaller than the same moment as a GIF.",
      },
      {
        q: "What frame rate should a GIF be?",
        a: "10–15 fps reads perfectly for reactions, memes and UI moments — the classic 'cinemagraph' look. Go 20–30 fps only when motion smoothness is the entire point (sport, fluid simulations), and pay for it with cropped area elsewhere.",
      },
      {
        q: "Does reducing colours hurt quality?",
        a: "For flat graphics, cartoons and UI captures: barely — they use few colours anyway. For photos and gradients: yes, you get banding, and dithering adds noise pixels that cost bytes. That trade is exactly when the moment should be a video loop instead.",
      },
      {
        q: "Why does my loop jump at the seam?",
        a: "Because frame N snaps back to frame 1 with no transition. Pick in/out points where the scene nearly repeats (a stride, a bounce), or use a ping-pong/boomerang playback so the reversal hides the seam.",
      },
    ],
  },
  {
    cta: {
      tool: "video-to-gif",
      text: "Turn the best seconds of any video into a loop — crop, fps and palette under your control, in your browser.",
    },
  },
];
