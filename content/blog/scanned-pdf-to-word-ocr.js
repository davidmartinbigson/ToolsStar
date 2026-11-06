// Scanned PDFs, OCR and the road back to editable text.
export default [
  {
    p: "A scanned PDF is a small paradox: a document format famous for crisp text, filled with pages that contain no text at all. Each page is a photograph — of a contract, a mark sheet, a signed letter — wrapped in a PDF container. Nothing can be copied, searched or edited, because as far as the file is concerned, the words are just pixels.",
  },
  {
    p: "Turning that photograph back into editable words is the job of OCR — optical character recognition — and the pipeline from scan to a Word document is more interesting, and more fragile, than most people expect.",
  },
  { h2: "What is actually inside a scanned PDF" },
  {
    p: "Open the structure and you find one image per page (sometimes two, if a scanner saved a bitonal layer under a colour preview), plus a page box describing where the image sits. There is no text layer, no font list, no paragraph structure. Everything a Word document needs — characters, lines, headings — has to be inferred from pixels alone.",
  },
  {
    ul: [
      "One raster image per page, often 200–300 DPI from a flatbed scanner or a phone app.",
      "No selectable text: copying returns nothing and searching finds nothing.",
      "No structure: headings, tables and columns exist only as visual arrangements of ink.",
    ],
  },
  { h2: "The four stages between pixels and paragraphs" },
  {
    ol: [
      "Cleanup: the scan is de-skewed, de-noised and contrast-stretched. A wrinkled, shadowed page is the single biggest cause of garbage output, and cleanup is where good pipelines earn their keep.",
      "Layout analysis: the page is segmented into text blocks, columns, tables and images, usually by studying whitespace gaps and alignment.",
      "Recognition: each text line is read character by character with a confidence score per word. Low-confidence words are exactly the ones worth proofreading.",
      "Reconstruction: recognized text is re-flowed into a document model — headings by font size, tables by cell geometry, page breaks preserved — and written out as a real .docx file.",
    ],
  },
  {
    note: {
      tone: "info",
      title: "Confidence is your proofreading map",
      text: "Serious OCR pipelines expose per-word confidence. Words scoring under roughly sixty percent are where errors concentrate, so a quick pass over the flagged words catches most mistakes in a fraction of the time a full proofread would take.",
    },
  },
  { h2: "Why some scans convert beautifully and others produce garbage" },
  {
    table: {
      head: ["Input condition", "Typical result", "Fix before converting"],
      rows: [
        ["300 DPI, flat, even light", "Clean text, correct table borders", "None needed"],
        ["Phone photo with a shadow gradient", "Spotty characters across the shadow band", "Re-shoot near a window, avoid flash"],
        ["Skewed page from a feeder", "Lines merged across columns", "De-skew or rescan straight"],
        ["Faint pencil or fax-grey text", "Dropped words throughout", "Raise contrast at scan time"],
      ],
    },
  },
  {
    p: "The unglamorous truth of OCR is that input quality dominates model quality. The same engine that nails a clean scan will struggle with a crumpled one, which is precisely why the cleanup stage exists before recognition ever begins.",
  },
  { h2: "What OCR will not do for you (yet)" },
  {
    ul: [
      "Handwriting: cursive remains research-grade; expect isolated words, not flowing sentences.",
      "Perfect table semantics: merged cells and borderless tables become approximations, not guarantees.",
      "Legal fidelity: an OCR'd contract is a working copy, not a certified transcript — the scan remains the source of truth.",
    ],
  },
  {
    note: {
      tone: "warn",
      title: "Keep the original scan",
      text: "An OCR pass is an interpretation, not a replacement. For anything with legal or financial weight, archive the untouched scan beside the editable document so any discrepancy can always be resolved against the source.",
    },
  },
  { h2: "Converting a scanned PDF to Word in your browser" },
  {
    ol: [
      "Load the scanned PDF into a browser-based converter; pages are rendered locally and never uploaded anywhere.",
      "Choose a page range if you only need part of the document — OCR time scales with the number of pages you feed it.",
      "Enable OCR for image-only pages and let layout analysis detect headings, tables and columns automatically.",
      "Review the flagged low-confidence words in the preview before downloading anything.",
      "Download the .docx and open it in your editor: headings, tables and page breaks arrive as real Word objects, ready to edit.",
    ],
  },
  {
    p: "OCR turned the scanned PDF from a dead end into a starting point. Treat it as a very fast first draft produced by a tireless typist: verify the flagged words, keep the original scan, and enjoy having the text back on your side of the screen.",
  },
  {
    faq: [
      {
        q: "How accurate is OCR on a clean scan?",
        a: "On 300 DPI, well-lit, machine-printed pages, modern engines read the overwhelming majority of words correctly — commonly above 98 percent on printed text. Accuracy falls with shadows, skew, low contrast and handwriting, which is exactly why previews and confidence flags matter.",
      },
      {
        q: "Does OCR work on handwritten pages?",
        a: "Only partially. Neat print-style handwriting can come through word by word, but flowing cursive is still unreliable for everyday tools. For handwritten notes, expect a rough draft rather than a faithful transcript.",
      },
      {
        q: "Will my tables survive the conversion?",
        a: "Ruled tables with clear spacing usually reconstruct as real Word tables. Borderless layouts and merged cells are approximated, so check column alignment after conversion and adjust in your editor where needed.",
      },
      {
        q: "Is my scanned document uploaded anywhere during conversion?",
        a: "With browser-based conversion, no: pages are rendered and recognized inside your own device's memory. Upload-first converters keep a server copy by design, which is a real consideration for confidential scans.",
      },
    ],
  },
];
