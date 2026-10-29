// What actually makes a PDF smaller.
export default [
  {
    p: "A 40 MB PDF that a portal will not accept is a specific kind of frustration: the document looks fine, prints fine, and yet the file behaves like a video. The reason is almost always the same — the PDF is carrying photographs at far more resolution than anyone will ever view them at — and the fix is more surgical than 'compress it harder'.",
  },
  { h2: "What is actually inside a big PDF" },
  {
    p: "Open the anatomy of a heavy PDF and you usually find three things: images embedded at print resolution (300 DPI or more, sometimes straight from a scanner at full size), images stored uncompressed or in a lossless format, and occasionally the same image embedded several times. Text and vector content, by contrast, is nearly free — a hundred pages of pure text is often under a megabyte.",
  },
  {
    p: "That asymmetry is the whole story of PDF compression. You are not compressing 'the PDF'; you are recompressing the images inside it and, optionally, lowering their resolution to something the document will actually be viewed at.",
  },
  { h2: "The two levers, in the right order" },
  {
    ol: [
      "Downsample the images. A page viewed on a screen needs roughly 96–150 DPI. A scanned A4 page at 300 DPI is 2480×3508 pixels — about four times the pixels a screen needs. Halving the linear resolution removes three quarters of the image data before quality settings even enter the picture.",
      "Re-encode the images. Scanners love lossless or lightly-compressed formats. Re-encoding those images as JPEG at quality 75–85 typically cuts them by 80–90% with no visible change at reading size.",
    ],
  },
  {
    note: {
      tone: "test",
      title: "Text-only PDFs barely move — and that is correct",
      text: "If a compression run reports almost no saving on a text-heavy PDF, that is not a failure. There is nothing expensive to remove: the text is already stored as compact font and layout instructions. The honest result for a 400 KB text document is roughly 400 KB.",
    },
  },
  { h2: "Choosing a target that does not hurt" },
  {
    p: "For documents that will be read on screens — the overwhelming majority — 150 DPI with JPEG quality around 80 is the sweet spot: text edges stay crisp and photographs look natural. Reserve 300 DPI for anything that will genuinely be printed, and accept that those files stay large.",
  },
  {
    p: "If a portal imposes a hard ceiling ('maximum 5 MB'), treat it like any exact-size problem: search downward. Reduce quality first, then resolution, stopping as soon as the file fits, so you keep the best-looking version that satisfies the limit.",
  },
  { h2: "What compression should never touch" },
  {
    ul: [
      "Selectability of text. A proper PDF compressor re-encodes images and leaves the text layer alone. If a tool returns a PDF whose text you can no longer select, it rasterised the pages — avoid it.",
      "Vector sharpness. Logos, charts and line art should remain vectors; compressing them into pixels is a permanent quality loss.",
      "The page geometry. Margins, links and page boxes should survive untouched.",
    ],
  },
  { h2: "Local versus uploaded compression" },
  {
    p: "Because a PDF's images are recompressed with standard algorithms, browser-based compression matches what a server would do — with two advantages: nothing is uploaded (relevant for contracts and records), and there is no per-file size ceiling imposed by someone else's infrastructure. The trade-off is that very large documents need a machine with enough memory to hold them while working.",
  },
  { cta: { tool: "compress-pdf", label: "Compress PDF tool", text: "Shrink the images inside your PDF while keeping text selectable and vectors sharp — in your browser, with no upload." } },
  { h2: "A worked expectation" },
  {
    p: "Concrete numbers beat adjectives here, so take a typical scanned A4 page at 300 DPI — roughly 2480×3508 pixels — stored the way scanners like to store it:",
  },
  {
    table: {
      head: ["Stage", "Typical page weight", "What changed"],
      rows: [
        ["As scanned (300 DPI, lossless-ish)", "1.5 – 3 MB", "the starting point"],
        ["Downsampled to 150 DPI", "≈ 25 – 35% of original", "three quarters of the pixels removed"],
        ["Then re-encoded JPEG q80", "≈ 8 – 15% of original", "the encoder doing the rest"],
        ["Text-only page, any setting", "≈ unchanged", "nothing expensive to remove"],
      ],
    },
  },
  {
    p: "Multiply by page count and you can predict the outcome before running anything: a 60-page scan at 2 MB per page is a 120 MB file that becomes roughly 10–18 MB at screen resolution, while a 60-page born-digital report barely moves at all. Knowing which of those two documents you have saves you from expecting a miracle on the wrong one.",
  },
  {
    faq: [
      {
        q: "Will compression blur my text?",
        a: "Not if the tool re-encodes only the images. Text stored as fonts is untouched by image compression. Blurry text after compression is the signature of a tool that rasterised whole pages; that is a different (and worse) operation.",
      },
      {
        q: "Why is my scanned PDF so enormous?",
        a: "Scanners capture at 300–600 DPI and often store each page as a large near-lossless image. That is ideal for archiving and wasteful for sharing — downsampling to 150 DPI typically removes 70–80% of the bytes on its own.",
      },
      {
        q: "Can I compress a PDF to an exact KB?",
        a: "Yes, with a search over quality and resolution the same way you would for a photo. We offer a dedicated exact-KB mode for portals with hard ceilings.",
      },
      {
        q: "Does compression remove passwords or metadata?",
        a: "Compression does not decrypt anything — a password-protected PDF must be unlocked first. Metadata is generally carried through unless a tool explicitly strips it.",
      },
    ],
  },
];
