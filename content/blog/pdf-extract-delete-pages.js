// Page-level PDF surgery: extract, delete, split — without uploads.
export default [
  {
    p: "An 80-page contract where you only need the signature on page 62. A university handbook in which just Appendix B concerns you. A merged PDF where two pages came from the wrong version. The fix in each case is surgical: take the pages you need, or remove the pages you do not — without sending the document to anyone.",
  },
  {
    p: "Page-level editing is also one of the safest PDF jobs to do in your browser, because a PDF is already a collection of discrete page objects. Extracting or deleting pages is closer to rearranging index cards than re-encoding a video: nothing about the pages you keep needs to change at all.",
  },
  { h2: "What extract and delete actually do inside a PDF" },
  {
    p: "A PDF stores each page as an object with its own content stream, resources and media box. Extracting pages builds a new document that references copies of those objects; deleting pages builds a new document that omits them. The kept pages retain their vector text, embedded fonts and images — which is why extraction is lossless in a way that printing or screenshotting never is.",
  },
  {
    ul: [
      "Extract: copy the selected page objects into a fresh, smaller PDF.",
      "Delete: copy everything except the marked pages into a new document.",
      "Split-all: write every page out as its own one-page PDF, useful for re-assembly later.",
    ],
  },
  {
    note: {
      tone: "info",
      title: "Nothing is re-rendered, so nothing degrades",
      text: "Because kept pages are copied as objects rather than redrawn, text stays selectable and searchable after extraction. If a tool hands you back blurry 'extracted' pages, it rasterized them — that is a different operation wearing the same name.",
    },
  },
  { h2: "How to extract or delete pages in your browser" },
  {
    ol: [
      "Open the page tool and load the PDF. In Tools Stars the file is parsed in your browser tab; the document never reaches a server, which is the entire point when the pages are confidential.",
      "Read the page list first: numbers and sizes for every page, so you can spot the section you need before touching anything.",
      "Mark the range or the individual pages. For extraction, select what to keep; for deletion, select what to remove — and double-check the count against the original.",
      "Run the operation and download. The result is a normal PDF: same fonts, same per-page links, same print behaviour.",
      "Verify by opening the first and last kept pages once. Ten seconds of checking beats re-sending an amended contract.",
    ],
  },
  { h2: "Choosing the right operation" },
  {
    table: {
      head: ["Situation", "Use", "Why"],
      rows: [
        ["You need 3 pages of a 90-page handbook", "Extract", "Smallest file, cleanest share, original untouched"],
        ["Two wrong pages sit inside an otherwise final document", "Delete", "Avoids manual re-assembly and keeps the kept set contiguous"],
        ["Every page must go to a different reviewer", "Split-all", "One file per page removes version confusion in email chains"],
        ["Pages are in the wrong order, not wrong content", "Extract in a custom order", "Selecting 5, 3, 4 writes a corrected sequence in one pass"],
      ],
    },
  },
  { h2: "What survives page surgery — and what can disappear" },
  {
    p: "Page objects carry their own content, but a few document-level things live outside the pages. Knowing the list prevents surprises after the download.",
  },
  {
    ul: [
      "Survives: vector text, embedded fonts, images, and per-page links and most annotations on kept pages.",
      "Can disappear: document-level bookmarks and form-field dictionaries in some writers, because they reference pages by number.",
      "Changes: total file size, which drops roughly in proportion to the removed content streams and any images unique to removed pages.",
    ],
  },
  {
    note: {
      tone: "warn",
      title: "Forms and bookmarks deserve a second look",
      text: "If the source PDF is a fillable form or carries a bookmark tree, check the result before distributing it. Page tools keep page content faithfully, but interactive form wiring that spans deleted pages may be pruned by the writer for consistency.",
    },
  },
  { h2: "Mistakes that make page edits go wrong" },
  {
    ul: [
      "Off-by-one ranges: viewers label the first page 1, but printed folios often start later — trust the viewer's page count, not the printed number.",
      "Deleting a page that later pages reference ('see page 12'), leaving a dangling cross-reference inside a contract.",
      "Assuming rotation is lost when extracting a rotated scan — rotation is a page attribute and travels with the page.",
      "Re-compressing after surgery to 'save space'; the kept pages are already copied efficiently, and re-encoding is where quality dies.",
    ],
  },
  {
    p: "Page-level editing is the quiet workhorse of PDF life: smaller shares, cleaner contracts, and no third party reading documents that were never meant for them. Done in the browser, it is also the rare edit that is both lossless and private.",
  },
  {
    faq: [
      {
        q: "Does extracting pages reduce quality?",
        a: "No. Kept pages are copied as PDF objects, not re-rendered, so text stays vector-sharp and selectable. Quality loss only appears if a tool rasterizes pages, which a proper page tool does not do.",
      },
      {
        q: "Can I delete pages from a password-protected PDF?",
        a: "Only if you can open it. Editing restrictions set by the owner password must be respected by honest tools; if you hold the rights and the open password, decrypt first, then edit. Stripping protection you do not own is not something a compliant tool assists with.",
      },
      {
        q: "Will printed page numbers update after deletion?",
        a: "Printed folios are part of the page artwork and stay exactly as printed. Only the viewer's dynamic counter reflects the new order. If exact renumbering matters, the document needs a content editor, not a page tool.",
      },
      {
        q: "Is it safe to edit confidential PDFs online?",
        a: "With upload-first services you are trusting their storage and deletion policies with the document. With browser-based tools the file is parsed locally and never transmitted, so confidentiality does not depend on anyone's privacy policy.",
      },
    ],
  },
];
