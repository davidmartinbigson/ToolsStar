// Merging PDFs — order, page ranges and the privacy angle.
export default [
  {
    p: "Merging PDFs is one of those tasks that sounds like it needs software you do not have. In practice it is pure document surgery — taking complete pages from several files and stitching them into one — and it can be done entirely in your browser with no upload and no watermark.",
  },
  {
    p: "This guide covers the parts that actually trip people up: getting the page order right, pulling only some pages from a source, and understanding what merging does and does not preserve.",
  },
  { h2: "What merging preserves — and what it does not" },
  {
    p: "A PDF page is a self-contained description: its text, vectors, images and fonts travel with it. Merging copies those pages into a new document, so text stays selectable, vectors stay sharp and images keep their original encoding. Nothing is re-rendered or rasterised, which is why a merged PDF looks exactly like its sources.",
  },
  {
    ul: [
      "Preserved: selectable text, vector sharpness, embedded images at their original quality, hyperlinks inside pages.",
      "Usually preserved: form fields as static content, bookmarks from the source may or may not carry over depending on the tool.",
      "Not preserved by design: a single global page numbering — each source keeps its own printed numbers, which is why page-number tools exist separately.",
    ],
  },
  { h2: "Getting the order right the first time" },
  {
    ol: [
      "Decide the final sequence on paper before you start — cover page, then body, then appendices is the usual shape.",
      "Add the files in that order; a good tool lets you drag to reorder afterwards, but deciding first saves a pass.",
      "Check the page count of each source. A 'one-page' cover that is secretly three pages is the most common cause of a wrong-looking merge.",
      "Preview before downloading. Merging is lossless and reversible in the sense that your sources are untouched — but re-doing a twenty-file merge is a chore you want to avoid.",
    ],
  },
  { h2: "Pulling only the pages you need" },
  {
    p: "Very often you do not want a whole source file — you want pages 2–4 of a contract and page 1 of an ID scan. That is a split-then-merge job, and most tools let you do it in one flow by specifying a page range per source. The range syntax is the same one you will meet everywhere: 2,4-6 means pages 2, 4, 5 and 6.",
  },
  {
    note: {
      tone: "info",
      title: "Ranges are 1-based, like the printed page numbers",
      text: "Page ranges refer to the page positions in the file, counting from 1 — not to any number printed on the page itself. A document whose first printed page says '7' still has that sheet at position 1 as far as a range is concerned.",
    },
  },
  { h2: "The privacy reason to do this locally" },
  {
    p: "Merged documents are disproportionately sensitive: contracts, application packs, medical or financial paperwork. Uploading them to a free web service means trusting an unknown server with both the content and the copy it keeps. Browser-based merging removes that question entirely — the bytes never leave your machine, and there is nothing to delete afterwards because nothing was ever stored.",
  },
  {
    p: "It also removes the practical annoyances of upload-based tools: file-size ceilings, daily limits, and the slow round trip on a bad connection. A 200-page merge locally is seconds of work.",
  },
  { h2: "When merging is the wrong tool" },
  {
    ul: [
      "You want one continuous page numbering across sources — merge first, then add page numbers as a second step.",
      "You need to interleave pages from two documents (odd pages from one, even from the other) — that is an alternating merge, which most simple tools do not offer.",
      "You want to reduce the size of the result — merging does not compress; the output is roughly the sum of its inputs. Run a compression pass afterwards if size matters.",
    ],
  },
  { cta: { tool: "merge-pdf", label: "Merge PDF tool", text: "Combine PDFs in any order, entirely in your browser — reorder freely, keep every page pixel-perfect, and download one clean file." } },
  { h2: "After the merge: three checks worth thirty seconds" },
  {
    ol: [
      "Page count. It should equal the sum of the ranges you asked for. A mismatch means a source had hidden pages or a range was off by one.",
      "First and last page. Open both ends; they catch ordering mistakes that scrolling the middle will not.",
      "Text selectability on one page from each source. If text selects everywhere, nothing was rasterised in the process.",
    ],
  },
  {
    p: "If a check fails, redo the merge from the originals rather than editing the merged file. Merging is cheap and lossless; patching a merged document is where quality and structure quietly degrade.",
  },
  {
    faq: [
      {
        q: "Does merging reduce quality?",
        a: "No. Pages are copied, not re-encoded. Text remains text and vectors remain vectors, so the merged file is exactly as sharp as its sources.",
      },
      {
        q: "Is there a page or file limit?",
        a: "Not an artificial one. The practical limit is your device's memory, since the whole document is assembled locally. Hundreds of pages are comfortable on a normal laptop.",
      },
      {
        q: "Can I merge a password-protected PDF?",
        a: "Not until it is unlocked. Encryption prevents any tool — including ours — from reading the pages, which is the point of encryption. Remove the password first, then merge.",
      },
      {
        q: "Will the merged file be smaller than the originals?",
        a: "Usually slightly larger than the sum is avoided, but never meaningfully smaller: shared resources are deduplicated where possible, yet merging is not compression. If you need a smaller file, compress afterwards.",
      },
    ],
  },
];
