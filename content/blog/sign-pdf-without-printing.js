// Signing PDFs without the printer detour.
export default [
  {
    p: "Somewhere between a contract deadline and a printer that is always out of toner, most of us have done it: printed a PDF, signed it with a pen, photographed the page, and emailed the blurry result back. It works. It is also the slowest, lowest-quality and least private way to sign a document that already exists as a perfect digital file.",
  },
  {
    p: "The good news is that signing a PDF without printing it is now a thirty-second job in any browser — phone, laptop, anything with a screen you can draw on. This guide walks through the three signing methods, where each one fits, and the small details that decide whether the other side accepts your signed file the first time.",
  },
  { h2: "Why the print-sign-scan loop is worth retiring" },
  {
    p: "Beyond the obvious waste of paper and time, the printed route actively damages the document on its round trip through the physical world.",
  },
  {
    ul: [
      "Quality: a scanned page replaces crisp vector text with a photo of text. Fonts blur, edges jitter, and the file often ends up larger than the original.",
      "Privacy: emailing a signed contract to a random 'sign online' service hands a legal document to a company you have never heard of.",
      "Structure: scanning flattens the PDF into an image, which destroys text search, copy-paste and accessibility in one step.",
      "Versions: the paper copy becomes the 'original', and suddenly nobody is sure which of the four circulating files is the signed one.",
    ],
  },
  { h2: "The three ways to sign a PDF digitally" },
  {
    p: "Every serious e-signature flow — from a free browser tool to an enterprise platform — boils down to one of three ways of putting your mark on the page.",
  },
  {
    table: {
      head: ["Method", "How it works", "Best for"],
      rows: [
        ["Draw", "You trace your signature with a finger, stylus or mouse; the stroke is kept as a vector path", "Contracts and forms where your usual signature is expected"],
        ["Type", "You type your name and pick a handwriting-style rendering", "Quick internal approvals where a formal mark is not required"],
        ["Upload image", "You place a photo or scan of your wet-ink signature as a transparent cut-out", "When an organisation insists the mark must look exactly like your paper signature"],
      ],
    },
  },
  {
    p: "All three end in the same place: your mark is placed at exact coordinates on the page and flattened into the PDF, so it behaves like ink on the page rather than a floating sticker that can be dragged around later.",
  },
  { h2: "How to sign a PDF in your browser, step by step" },
  {
    ol: [
      "Open the signing tool and choose your file. In Tools Stars the file is read straight into your browser tab — nothing is uploaded to any server, which matters more for contracts than for almost any other file type.",
      "Pick a signing method: draw on the pad, type your name, or upload a signature image with a clean, light background.",
      "Place the signature by clicking the spot where the mark belongs. Most documents reserve a labelled box — 'Signature', 'Signed by', or a line beside the date.",
      "Add the supporting fields the document expects: printed name, date, and sometimes a title or witness line.",
      "Download the signed PDF and check the signature page once before sending it. Thirty seconds now saves an email chain later.",
    ],
  },
  {
    note: {
      tone: "info",
      title: "Your file never leaves the device",
      text: "Browser-based signing renders and re-saves the PDF locally with a library such as pdf-lib. There is no upload step to intercept, no storage policy to read, and no account keeping a copy of your contract. If a signing site asks you to upload the document first, that is a decision worth making consciously, not accidentally.",
    },
  },
  { h2: "Keeping an e-signature credible" },
  {
    p: "An electronic signature is generally as valid as ink in most jurisdictions when both parties agree to sign electronically — but credibility is practical, not legal. Reviewers accept signed PDFs that look deliberate.",
  },
  {
    ul: [
      "Sign inside the box, at a sane size. A signature covering half the page reads as careless; one the size of a comma reads as a joke.",
      "Date it. An undated signature invites the question 'signed when?', which is exactly the question you do not want on a contract.",
      "Keep the rest of the document untouched. Changing clauses is a revision conversation, not a signing-pass conversation.",
      "Send the flattened file. Once flattened, the signature is part of the page and cannot be moved or deleted by the recipient.",
    ],
  },
  {
    note: {
      tone: "warn",
      title: "This is practical guidance, not legal advice",
      text: "Signature law varies by country and by document type — property deeds, wills and some court forms still demand wet ink in places. For anything high-stakes, confirm the acceptable format with the organisation requesting the signature.",
    },
  },
  { h2: "Mistakes that get signed PDFs bounced back" },
  {
    ul: [
      "Signing the wrong page: appendices and cover pages are classic victims — jump to the signature block first.",
      "An upload with a grey box around it: a signature photo keeps its background unless the background is removed, and a grey rectangle over a contract looks tampered with.",
      "Missing required initials: many forms want initials on every page, not just a final signature.",
      "Re-compressing the signed PDF so hard that the signature turns to mush — sign last, compress never.",
    ],
  },
  {
    p: "Retiring the printer is not technology for its own sake. A digitally signed PDF is sharper, smaller, searchable and — when the signing happens inside your own browser — more private than the paper detour ever was. The printer can go back to printing boarding passes.",
  },
  {
    faq: [
      {
        q: "Is signing a PDF on my phone legally binding?",
        a: "In most countries an electronic signature carries the same weight as ink when both parties have agreed to sign electronically and the signed record is retained. Specific document types — wills, deeds, some court filings — can be exceptions, so for high-stakes documents check what the requesting organisation accepts.",
      },
      {
        q: "Does the other side know I signed in a browser?",
        a: "They see a normal signed PDF. Metadata may record the producing software, exactly as a scan records the scanner; nothing announces which tool you used, and nothing needs to.",
      },
      {
        q: "Can a signed PDF be edited afterwards?",
        a: "A flattened signature becomes part of the page graphics, so it cannot be moved or deleted like a sticker. The file itself can still be re-edited by a determined person with PDF software — which is why serious workflows add certificate-based digital signatures when tamper-evidence matters.",
      },
      {
        q: "Is my signature stored anywhere when I sign online?",
        a: "That depends entirely on the tool. Upload-first services keep a copy on their servers by design. Browser-based signing keeps everything in your own device's memory for the session; once you close the tab, nothing remains on anyone's infrastructure.",
      },
    ],
  },
];
