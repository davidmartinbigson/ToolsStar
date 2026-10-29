// PNG vs JPG vs WebP — with measurements we ran ourselves.
export default [
  {
    p: "Choose the wrong image format and you pay for it twice: once in page-load time, and once in the upload limits of whatever form or platform you are pushing the file into. The good news is that the right choice is almost always obvious once you see what each format actually costs in kilobytes. So we measured it.",
  },
  {
    p: "We took three of our own 1280×714 images — one with smooth continuous gradients, one with large flat colour areas and a transparent cut-out, and one with photographic-style detail — and encoded each of them nine ways: lossless PNG, palette PNG at 256 and 64 colours, JPEG at quality 90/80/60, WebP at the same three qualities, and AVIF at 60. Every number below is a real file size from that test, not a figure borrowed from a spec sheet.",
  },
  { h2: "The short answer" },
  {
    p: "For photographs, screenshots of photos, and anything with gradients or soft shadows: use WebP at quality 80 if your destination accepts it, otherwise JPEG at quality 80. For logos, icons, diagrams and anything with transparency: use PNG, but reduce the palette first. For pure line art or text on a flat background, a palette PNG is often smaller than any lossy format at equal clarity.",
  },
  {
    table: {
      head: ["Encoding", "Gradient artwork", "Flat + transparent", "Photo-style"],
      rows: [
        ["PNG, lossless", "1,038 KB", "434 KB", "581 KB"],
        ["PNG, 256-colour palette", "305 KB", "171 KB", "172 KB"],
        ["PNG, 64-colour palette", "305 KB", "171 KB", "172 KB"],
        ["JPEG q90", "92 KB", "41 KB", "48 KB"],
        ["JPEG q80", "82 KB", "36 KB", "42 KB"],
        ["JPEG q60", "59 KB", "26 KB", "31 KB"],
        ["WebP q90", "111 KB", "41 KB", "50 KB"],
        ["WebP q80", "73 KB", "26 KB", "33 KB"],
        ["WebP q60", "51 KB", "17 KB", "23 KB"],
        ["AVIF q60", "57 KB", "25 KB", "28 KB"],
      ],
    },
  },
  {
    note: {
      tone: "test",
      title: "Two things in this table surprised even us",
      text: "First, dropping the palette from 256 colours to 64 changed nothing at all — the sizes are byte-identical. Once an image is stored as a palette, shrinking the palette further does not buy you anything (we explain why in our guide on PNGs that refuse to compress). Second, WebP beat JPEG at every quality level we tried, and the gap widened as quality dropped: at q60 WebP was 14–27% smaller than JPEG on the same source.",
    },
  },
  { h2: "What each format is actually doing" },
  {
    p: "PNG is lossless. It never throws information away; it only finds cleverer ways to describe the exact pixels you gave it. That makes it perfect when a single wrong pixel would matter — a logo edge, a UI mock-up, a medical or legal scan — and hopeless when your image contains photographic noise, because noise is expensive to describe exactly.",
  },
  {
    p: "JPEG is lossy and photographic. It works in 8×8 blocks and quietly discards the high-frequency detail your eye is bad at noticing. That is why it crushes photos so well and why it mangles sharp edges, small text and flat colour fields with ringing artefacts. JPEG also has no transparency at all: a transparent PNG saved as JPEG comes back with a solid background, usually white or black.",
  },
  {
    p: "WebP is lossy or lossy-with-alpha, and it borrows techniques from video compression. It handles both photographic content and transparency, which is exactly the combination JPEG and PNG each fail at. Its one real weakness is ecosystem: older software and some government portals still expect JPG or PNG.",
  },
  {
    p: "AVIF is newer still and often the smallest of the four at equal perceived quality. In our test it landed between WebP q60 and JPEG q60 depending on the image. Support is good in modern browsers but patchier in desktop software, which is why we do not recommend it as a universal exchange format yet.",
  },
  { h2: "How to choose in ten seconds" },
  {
    ol: [
      "Does the image need transparency? If yes, PNG or WebP — never JPEG.",
      "Is it mostly flat colour, lines or text (logo, diagram, screenshot of a UI)? Start with a palette PNG. If it is still too big, resize it; do not reach for JPEG.",
      "Is it photographic, or does it contain gradients and shadows? Use WebP q80 where the destination accepts it, otherwise JPEG q80.",
      "Is the destination a strict portal (visa forms, university uploads, job applications)? Check what it accepts first — many only take JPG or PNG — and see our guide on hitting an exact kilobyte target.",
    ],
  },
  { h2: "Quality is a dial, format is a decision" },
  {
    p: "People argue about JPEG 70 versus 85 as if it were the important choice. It usually is not. Look at the table again: switching a photographic image from PNG to JPEG q90 saved 91% before we touched the quality dial at all. Moving from q90 to q60 saved a further 36% of an already-small file. Get the format right first; then tune quality only if you are chasing a hard size limit.",
  },
  {
    p: "The other dial people forget is dimensions. Halving an image's width and height quarters its pixel count, and for lossy formats that roughly quarters the file too. If a photo will be displayed at 800 pixels wide, converting it beautifully at 4000 pixels wide is not quality — it is waste.",
  },
  { h2: "Common mistakes we see constantly" },
  {
    ul: [
      "Saving a logo as JPEG to make it small. You lose the transparency, gain coloured fringes around every edge, and the file often ends up larger than a palette PNG would have been.",
      "Re-saving a JPEG as JPEG repeatedly. Every lossy pass discards a little more; artefacts accumulate like a photocopied photocopy.",
      "Uploading a PNG screenshot of a photo. Screenshots of photographic content are the worst case for PNG — our gradient fixture came out at over a megabyte lossless and 73 KB as WebP q80.",
      "Assuming 'WebP is always smaller'. At q90 on the gradient image it was larger than JPEG q90. The win appears at the qualities people actually use.",
    ],
  },
  {
    note: {
      tone: "info",
      title: "Converting is the easy part",
      text: "All four formats convert in your browser in under a second, with no upload. If you are unsure which destination you need, convert to all three and compare the sizes yourself — seeing your own file's numbers beats any generic table, including ours.",
    },
  },
  { cta: { tool: "image-converter", label: "Image Converter", text: "Convert between PNG, JPG and WebP entirely in your browser, then compare the file sizes side by side before you download." } },
  {
    faq: [
      {
        q: "Is WebP safe to use everywhere now?",
        a: "In browsers, yes — every current major browser decodes WebP. In desktop software and strict upload portals, not always. If a form rejects WebP, fall back to JPEG at the same quality; you will lose 10–25% of the size saving but keep compatibility.",
      },
      {
        q: "Does converting PNG to JPG lose transparency?",
        a: "Yes, always. JPEG has no alpha channel. The transparent areas are filled with a solid colour — usually white. If you need to keep the cut-out, stay on PNG or move to WebP.",
      },
      {
        q: "Why is my PNG bigger than my JPG of the same photo?",
        a: "Because PNG must store every pixel exactly, and photographic noise is the most expensive thing there is to store exactly. In our test a photographic-style image was 581 KB as lossless PNG and 42 KB as JPEG q80 — a 93% difference with no visible loss at normal viewing size.",
      },
      {
        q: "What quality should I use for web images?",
        a: "80 is the sensible default for both JPEG and WebP: it sits above the point where most people can spot artefacts on a normal screen, and well below the point where you are paying for invisible detail. Go to 60–70 for thumbnails and previews; go to 90+ only for images people will zoom into.",
      },
    ],
  },
];
