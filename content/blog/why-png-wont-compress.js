// Why a PNG refuses to compress — with the measurement that explains it.
export default [
  {
    p: "You drop a PNG into a compressor, wait, and the tool hands you back the same file and tells you it saved 0%. It feels like the tool is broken. Usually it is not — and understanding why is the difference between wasting an hour and fixing the file in thirty seconds.",
  },
  {
    p: "We ran into this exact report on our own PNG Compressor, so we instrumented the encoder and measured what was happening. The answer was more interesting than a bug: for a whole class of images, a smaller PNG genuinely does not exist, and no amount of compression settings will create one.",
  },
  { h2: "The measurement that explains everything" },
  {
    p: "We built a 480×320 image containing exactly four flat colours — the kind of graphic a logo or a flat UI illustration is made of — and encoded it with a real PNG encoder (UPNG with pako's DEFLATE) five different ways:",
  },
  {
    table: {
      head: ["Encoding", "File size", "Saving"],
      rows: [
        ["Lossless PNG (no palette limit)", "574 B", "—"],
        ["Palette PNG, 205 colours", "574 B", "0.0%"],
        ["Palette PNG, 128 colours", "574 B", "0.0%"],
        ["Palette PNG, 64 colours", "574 B", "0.0%"],
        ["Same image resized to 240×160", "≈ 25% of the pixels", "large"],
      ],
    },
  },
  {
    p: "Every palette setting produced a byte-identical file. Not 'almost identical' — identical. The reason is that a modern PNG encoder does not wait for you to ask for a palette. When it sees that an image contains only a few distinct colours, it writes a palette (indexed-colour) PNG automatically, even in 'lossless' mode. Asking for 64 colours instead of 205 therefore changes nothing: the encoder was already using four.",
  },
  {
    note: {
      tone: "test",
      title: "We now tell you the exact colour count",
      text: "Because this is the single most common cause of a genuine 0%, our PNG Compressor counts the distinct colours in your image when a compression produces no saving, and tells you the number. If it reports that your PNG holds only a few dozen colours, you are looking at this exact case — the file is already at its floor, and the honest answer is 'nothing left to squeeze'.",
    },
  },
  { h2: "The two different 0%s — and why confusing them is dangerous" },
  {
    p: "There are two completely separate reasons a PNG compressor reports zero, and they look identical on screen unless the tool makes an effort to distinguish them.",
  },
  {
    p: "The first is the healthy one described above: the source PNG is already stored efficiently, so re-encoding cannot improve it. The second is a silent failure — the compression engine failed to load (an ad-blocker or a firewall blocking the CDN is the usual cause) and the tool quietly fell back to the browser's built-in PNG encoder. That fallback is dramatically worse: on a photographic 480×320 image we measured 381,935 bytes from the browser encoder against 198,929 bytes from a proper PNG library. Nearly double, for the same pixels.",
  },
  {
    p: "A tool that hides that difference will show you '0% saved, original kept' in both cases, and you will spend your evening blaming your image. We changed ours so the two cases read differently: a real zero explains the colour count; an engine failure names the blocked hosts and asks you to retry.",
  },
  { h2: "What actually makes a stubborn PNG smaller" },
  {
    p: "Once you accept that the palette is already optimal, three levers remain — in order of how much they typically help.",
  },
  {
    ol: [
      "Resize it. Pixels are the real cost. Halving both dimensions removes three quarters of the pixels, and for a flat graphic the palette PNG shrinks by roughly the same proportion. This is the lever that almost always works.",
      "Convert it to WebP. WebP encodes flat colour fields more compactly than PNG does, and it keeps transparency. On our flat-colour fixtures WebP q80 was 60–90% smaller than the lossless PNG.",
      "Reduce what is in the image, not how it is stored. Anti-aliased edges, soft drop shadows and subtle gradients each add dozens or hundreds of 'extra' colours. A hard-edged logo with no shadow can be a tenth of the size of the same logo with a soft glow.",
    ],
  },
  {
    p: "Notice what is not on that list: lowering the 'quality' or 'colours' slider. For an already-paletted PNG that slider has already done its job before you touched it. This is the single most common misconception about PNG compression, and it is why a good tool should say so plainly instead of letting you drag a slider that cannot work.",
  },
  { h2: "When a PNG really can be compressed a lot" },
  {
    p: "For balance: plenty of PNGs are genuinely bloated, and those compress spectacularly. The usual culprits are PNGs exported from design tools or saved by screenshot utilities as full 32-bit RGBA — every pixel carrying red, green, blue and alpha even though the image uses eighty colours. Our photographic-style 480×320 test image went from 181,974 bytes to 30,595 bytes, an 83% reduction, the moment a palette was applied. Transparency survives that process intact; a palette PNG still carries a full alpha channel.",
  },
  {
    p: "So the honest rule of thumb is: the more distinct colours your PNG contains, the more a palette-based compressor can do for it. A screenshot of a busy web page or a photo saved as PNG will shrink enormously. A flat icon exported by a modern design tool will not shrink at all — because the tool that made it already did the work.",
  },
  { h2: "A quick diagnostic you can run yourself" },
  {
    ul: [
      "Open the image and look at it at 100%. Count the rough number of colours. Under a few hundred? It is probably already paletted — resizing is your lever.",
      "Check whether it has transparency you actually need. If not, WebP or JPEG at q80 will be far smaller.",
      "Look for soft shadows, glows or gradients. Those are the hidden colour generators; removing them in the source document shrinks the PNG more than any compressor will.",
      "If a compressor reports 0% but you believe the image is colourful, suspect the tool, not the image — and check that nothing on your machine is blocking its compression engine.",
    ],
  },
  { cta: { tool: "png-compressor", label: "PNG Compressor", text: "Our PNG Compressor reports the exact colour count when a file cannot shrink, keeps transparency intact, and falls back honestly if its engine cannot load." } },
  {
    faq: [
      {
        q: "Is a 0% result ever a bug?",
        a: "It can be, and the two causes are different: a genuinely optimal source file, or a compression engine that failed to load. A trustworthy tool distinguishes them. Ours tells you the colour count in the first case and names the blocked hosts in the second, so you always know which one you are looking at.",
      },
      {
        q: "Does compressing a PNG reduce its quality?",
        a: "Palette reduction is technically lossy — similar colours are merged — but on graphics with few colours the merge is invisible, and on an already-paletted PNG nothing changes at all. Lossless PNG mode never alters a pixel; it can only rewrite the same data more efficiently, which is why it sometimes saves nothing.",
      },
      {
        q: "Why is my screenshot PNG so large?",
        a: "Screenshots mix flat UI colour with anti-aliased text edges and, increasingly, photographic content and blur effects. Anti-aliasing alone introduces hundreds of intermediate colours along every glyph edge, which defeats palette encoding. WebP handles that mixture far better than PNG does.",
      },
      {
        q: "Can I make a PNG smaller without resizing it?",
        a: "Sometimes: converting to WebP keeps the same dimensions and transparency while usually cutting the size substantially. If you must stay on PNG at the same dimensions and the file is already paletted, then no — the size you have is the size the format needs.",
      },
    ],
  },
];
