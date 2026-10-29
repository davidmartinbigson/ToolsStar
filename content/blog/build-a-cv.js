// CVs — the six-second scan and how to survive it.
export default [
  {
    p: "Recruiters spend a few seconds on a first pass over a CV. That number feels unfair until you have sat on the other side of three hundred applications for one role — at which point it feels inevitable. The practical consequence is that most CVs are not read, they are scanned: a fast vertical sweep looking for role title, employers, dates and a handful of keywords, before any sentence is actually read.",
  },
  {
    p: "This guide is about designing for that sweep without becoming a keyword-stuffed robot — and about the technical details (file format, page count, photo or no photo) that quietly decide whether your CV survives the first pass at all.",
  },
  { h2: "What the scan actually looks for" },
  {
    ol: [
      "Your most recent role and its title, near the top. If the first thing on the page is a paragraph about yourself, the scan has to hunt.",
      "Employer names and dates, in a column it can follow without zig-zagging.",
      "Evidence of impact — numbers, outcomes, shipped things — rather than lists of duties.",
      "The skills the posting asked for, in the words the posting used.",
    ],
  },
  {
    p: "Notice what is not on that list: hobbies, a personal mission statement, or a photo in most markets. Everything else on the page is competing with those four things for attention.",
  },
  { h2: "Structure that survives both humans and parsers" },
  {
    ul: [
      "One column, or a clean two-column with the essential facts in the main flow. Parsers and scanners both struggle when the reading order is ambiguous.",
      "Reverse-chronological experience. Functional or hybrid formats read like concealment to a recruiter who has seen the trick before.",
      "Consistent dates. '2021 – 2023' everywhere, or 'Mar 2021 – Jun 2023' everywhere; mixing formats makes gaps look intentional.",
      "Real section headings — Experience, Education, Skills. Clever headings ('My Journey') break both scanning and automated parsing.",
    ],
  },
  { h2: "The photo question, answered honestly" },
  {
    p: "It depends entirely on the market. In much of continental Europe, South Asia and the Middle East a professional photo is expected and its absence looks incomplete. In the UK, US, Canada and Australia it is actively discouraged, because it invites bias questions an employer does not want. Decide by destination, not by habit — and if you include one, make it a neutral, well-lit head shot, not a cropped holiday photo.",
  },
  {
    note: {
      tone: "info",
      title: "If you use a photo, control how it is presented",
      text: "A photo that is the wrong aspect ratio gets stretched or letterboxed by whatever renders your PDF. Crop and frame it deliberately — circle or rounded for modern templates, a clean rectangle for traditional ones — and keep the file small so the photo does not balloon your PDF.",
    },
  },
  { h2: "Length, and the two-page myth" },
  {
    p: "One page is right for students and early-career candidates; two pages is right once you have a decade of relevant history; three is a signal that you have not decided what matters. The rule that actually works: every line should earn its place against the question 'does this help someone decide to interview me?'.",
  },
  { h2: "File format: PDF, almost always" },
  {
    ul: [
      "PDF preserves your layout on every machine; a .docx rendered on the wrong Office version reflows and can break page one.",
      "Keep the PDF text-selectable. Some employers parse CVs automatically; a flattened image PDF reads as blank to them.",
      "Name the file properly — 'Firstname-Lastname-CV.pdf'. 'cv-final-v7.pdf' is a small signal of chaos.",
      "Check the size. A CV above a couple of megabytes is usually carrying an uncompressed photo; portals sometimes reject it outright.",
    ],
  },
  { h2: "Tailoring without lying" },
  {
    p: "Tailoring is not fabrication; it is emphasis. The same genuine experience can lead with the aspect the posting cares about. Read the posting, pick the three requirements you actually meet, and make sure the evidence for those three is visible in the first screenful. Everything else stays true — it just stops competing with the parts that matter.",
  },
  { cta: { tool: "resume-maker", label: "Resume / CV Maker", text: "Eight clean templates, photo shaping and sizing, and a text-selectable PDF export — built and tested in your browser." } },
  {
    faq: [
      {
        q: "Should I use a designed template or a plain one?",
        a: "Use a clean designed template for human-first applications and a plain single-column one when an automated system is likely to parse the file first. When in doubt, plain wins: a parser that mangles a beautiful CV costs you more than a modest CV costs you.",
      },
      {
        q: "Do ATS systems really reject CVs?",
        a: "They filter and rank; a CV that cannot be parsed loses its content to the process, which is functionally a rejection. Selectable text, standard headings and a simple structure are the insurance.",
      },
      {
        q: "How do I handle employment gaps?",
        a: "Briefly and without apology — a line naming what the period was (study, caregiving, freelance, health) removes the speculation that a blank space invites. Long defensive paragraphs do the opposite.",
      },
      {
        q: "Is a QR code or portfolio link worth including?",
        a: "A short plain-text URL, yes — it survives parsing and printing. A QR code is decorative on a document that will mostly be read on a screen that already has the link one tap away.",
      },
    ],
  },
];
