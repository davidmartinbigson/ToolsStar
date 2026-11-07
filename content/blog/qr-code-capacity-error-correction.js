// QR codes: modules, versions, error correction — why damaged codes still scan.
export default [
  {
    p: "A QR code looks like random noise spilled into a square, which is exactly why most people never ask how it works. But there is no randomness in it: every black and white square is a deliberate bit of a carefully engineered structure that can survive mud, scratches and coffee — and still hand your phone a URL in half a second.",
  },
  {
    p: "Understanding that structure pays off the moment you make a code yourself, because the decisions you make — how long the payload is, how much error correction you buy, how big you print it — decide whether people scan your code or give up on it.",
  },
  { h2: "Anatomy of a QR code: a grid, not noise" },
  {
    p: "Zoom into any QR code and the 'noise' resolves into a grid of squares called modules. Around the edges sit three big squares — finder patterns — that let a camera lock on from any angle. Between them run alternating light/dark timing lines that define the grid spacing, and around the whole symbol sits an empty margin called the quiet zone, without which scanners cannot tell where the code ends.",
  },
  {
    ul: [
      "Finder patterns: the three corner squares that make orientation instant, even upside down.",
      "Timing patterns: the ruler lines that tell the reader how many modules wide the grid is.",
      "Data modules: everything else — your payload plus error-correction data, interleaved so damage spreads out instead of wiping one region.",
      "Quiet zone: the blank border, four modules wide by specification. Crop it off and many phones simply fail.",
    ],
  },
  { h2: "How much actually fits inside" },
  {
    p: "QR codes come in 40 standard sizes called versions, from 21×21 modules up to 177×177. Capacity grows with the version, but so does density — and density is what fights your camera. At the theoretical maximum (version 40, lowest error correction) a code holds about 2,953 bytes or roughly 4,296 alphanumeric characters. In practice nobody should print that.",
  },
  {
    table: {
      head: ["Payload", "Rough version band", "What it scans like"],
      rows: [
        ["Short URL, under ~100 characters", "Small (sparse grid)", "Instant, even from an angle or a moving phone"],
        ["Long URL with tracking parameters, 200–400 chars", "Mid-size", "Fine up close; fussy at distance or in low light"],
        ["vCard, Wi-Fi credentials, 400–800 chars", "Mid-to-large", "Needs a steady hand and good light"],
        ["Maximum payload (~2,953 bytes)", "Version 40, densest grid", "Technically scannable, practically hostile"],
      ],
    },
  },
  {
    note: {
      tone: "warn",
      title: "Shorter payload, better scan",
      text: "Every extra character buys more modules, and more modules means smaller squares at the same print size — which is exactly what cameras struggle with. If your URL is long, shorten it first; a clean short link scans better and looks cleaner on print than a 300-character monster.",
    },
  },
  { h2: "Error correction: why scratched codes still scan" },
  {
    p: "The quiet hero of the format is Reed–Solomon error correction. Alongside your data, the code stores redundant mathematical copies, so a reader can reconstruct missing pieces. Four levels exist — recovering roughly 7 %, 15 %, 25 % or 30 % of damaged modules — and the level you pick is a straight trade: more recovery means more modules means a denser code.",
  },
  {
    p: "This is also the trick behind branded codes with a logo punched through the middle. The logo simply destroys a patch of data modules; as long as the damage stays within the chosen recovery level and the finder patterns survive, the code reads perfectly. It is not decoration tolerating damage — it is mathematics expecting it.",
  },
  { h2: "Why some codes scan from across the room and others do not" },
  {
    p: "Distance scanning is a physics problem, not a luck problem. A phone camera resolves a fixed number of pixels; each module of your code needs several of them to be read confidently. So the scanning distance a code tolerates is set by how large its modules appear — which depends on print size, module count and contrast.",
  },
  {
    ul: [
      "Print size vs distance: a common planning rule is that the symbol should be at least one tenth of the intended scanning distance — a poster code meant for three metres wants to be thirty centimetres wide.",
      "Contrast beats cleverness: dark modules on a light ground, always. Inverted or pastel codes fail on a surprising number of phones.",
      "Light matters: the same code that scans instantly in daylight can fail under a dim restaurant bulb — dense codes fail first.",
      "Surface matters: curved, glossy or wrinkled surfaces distort the grid; flat and matte wins.",
    ],
  },
  { h2: "Making codes that actually scan: a short checklist" },
  {
    ol: [
      "Keep the payload as short as the job allows — shorten long URLs before encoding.",
      "Pick medium-or-higher error correction for anything printed on cups, boxes or outdoor posters that will get abused.",
      "Preserve the quiet zone: never let design elements crowd the border.",
      "Export as PNG at high resolution, or SVG for print — a blurry raster is damage you added yourself.",
      "Test at final size, in final lighting, on an ordinary mid-range phone — not just your own flagship.",
    ],
  },
  {
    p: "A QR code is a small, tough, thoroughly standardised machine: a grid with rulers, redundancy and margins. Respect those four things — payload size, error correction, quiet zone, contrast — and the code will keep working long after the poster it is printed on has faded.",
  },
  {
    faq: [
      {
        q: "How much text can a QR code hold?",
        a: "Up to about 4,296 alphanumeric characters or roughly 2,953 bytes at the largest version with the lowest error correction. Real-world codes stay far below that — a few hundred characters at most — because capacity and scannability pull in opposite directions.",
      },
      {
        q: "Why does a QR code with a logo in the middle still scan?",
        a: "Because of Reed–Solomon error correction: the code carries redundant data that lets a reader rebuild missing modules. A centred logo destroys a patch of modules within the recovery budget (up to about 30 % at the highest level), while the corner finder patterns stay untouched for orientation.",
      },
      {
        q: "Do QR codes expire?",
        a: "The printed code never expires — it is just encoded data with no battery and no server. What can die is the destination: a deleted page, a retired domain, or a URL-shortening service that shuts down. For something meant to last years, point the code at a stable URL you control.",
      },
      {
        q: "Can I invert the colours — light code on a dark background?",
        a: "Avoid it. Scanners are built around dark modules on a light ground, and inverted or low-contrast codes fail on many devices, especially in poor light. If the design demands a dark background, put the code on a light card or panel instead.",
      },
    ],
  },
  {
    cta: {
      tool: "qr-code-generator",
      text: "Generate a clean, high-contrast QR code in your browser — pick the payload, download print-ready output.",
    },
  },
];
