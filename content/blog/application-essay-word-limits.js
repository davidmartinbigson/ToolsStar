// Application-essay limits: Common App words, UCAS characters and lines, and why counters disagree.
export default [
  {
    p: "Every application portal guards its essay with a limit — and each guards a different unit. The Common App counts words (250 to 650). UCAS counts characters (4,000) and lines (47), whichever bites first. Graduate statements of purpose invent their own rules per department. Paste the same essay into three boxes and three counters will disagree with you, and with each other.",
  },
  {
    p: "None of them is broken. They are measuring different things with different tokenisers, and knowing which unit your portal uses — and which edge cases move it — is the difference between a clean submit and a truncated personal statement. And the fixes are mechanical once you know which counter you are feeding.",
  },
  { h2: "The three limit families" },
  {
    table: {
      head: ["Portal (example)", "Limit", "Unit that bites"],
      rows: [
        ["Common App essay (US)", "250–650", "Words — the box blocks you outside the range"],
        ["UCAS personal statement (UK)", "4,000 characters OR 47 lines", "Characters including spaces, or wrapped lines — whichever hits first"],
        ["US grad-school SoP", "Commonly 500–1,000 words, per programme", "Words, unless the programme says otherwise"],
        ["Canadian university statements", "Per institution (OUAC routes, schools set limits)", "Usually words; check each school's page"],
      ],
    },
  },
  {
    note: {
      tone: "info",
      title: "UCAS counts spaces — that is the trap",
      text: "A statement that reads '3,800 words? no — 3,900 characters without spaces' can still exceed 4,000 once spaces are counted, because UCAS counts them. Draft to the unit the portal states, never to the unit your word processor shows by default.",
    },
  },
  { h2: "Why your count changes between tools" },
  {
    p: "Word counting is tokenising, and tokenisers make choices. Hyphenated compounds ('part-time') are one word to most counters and two to some; em dashes glued to words split differently than spaced ones; apostrophes inside contractions are safe but quotes around phrases can merge or split tokens; URLs and email addresses are one word or five depending on the engine; and line-based limits depend on how the portal wraps your paragraphs in its own viewer, not in yours.",
  },
  {
    ul: [
      "Whitespace splitting is the common baseline: any run of spaces/newlines ends a word.",
      "Hyphens and slashes are where tools diverge — 'and/or' and '24/7' are classic mismatches.",
      "Character counts differ on spaces-included vs excluded; UCAS wants included.",
      "The portal's own counter is the only one that matters at submit time — treat every other number as a draft estimate.",
    ],
  },
  { h2: "Editing down without gutting the story" },
  {
    p: "Hitting 640 words from 900 is not deletion, it is distillation. The first paragraph's throat-clearing usually goes first; adverbs go next; then any sentence that repeats an earlier one in fresher clothes (keep the fresher one). Specifics survive — 'I debugged the greenhouse sensor at 2 a.m.' costs the same words as 'I worked hard' and says a thousand times more.",
  },
  {
    ol: [
      "Cut the opening until the essay starts where it gets interesting.",
      "Replace adjective stacks with one precise noun or verb.",
      "Merge two examples into the stronger one; mention the second in a clause.",
      "Read aloud once: anything you stumble over is three words too long.",
      "Re-count in the portal's own box before you believe any of it.",
    ],
  },
  { h2: "Pre-paste checklist" },
  {
    ul: [
      "Confirm the unit: words, characters-with-spaces, or lines.",
      "Leave headroom: land ~2 % under the cap so a different tokeniser cannot push you over.",
      "Plain text only: smart quotes and em dashes sometimes mangle in old form fields; straight punctuation travels safest.",
      "No headings inside the box unless the portal invites them — they count toward your limit.",
      "Paste, then read the pasted version once in the box — wrapping and spacing surprises live there.",
    ],
  },
  {
    p: "Limits are not bureaucracy; they are the first test of the skill the essay is meant to prove — saying exactly enough, exactly once. Learn your portal's unit, respect the tokeniser's quirks, and let the counter be the last reader, not the first. Draft in your own tool, verify in theirs, and submit with headroom — the three-step habit that keeps every portal's counter on your side.",
  },
  {
    faq: [
      {
        q: "Does the Common App count hyphenated words as one word?",
        a: "Its box splits on whitespace, so 'part-time' counts as one word there — but some draft tools count it as two. Keep a couple of words of headroom and trust the portal's live counter over any offline number.",
      },
      {
        q: "Which UCAS limit hits first — 4,000 characters or 47 lines?",
        a: "Whichever arrives first, and it depends on your paragraphing: many short paragraphs burn lines fast, while dense prose burns characters. Check both in the UCAS editor, not in your word processor.",
      },
      {
        q: "Do titles and headings count toward essay limits?",
        a: "Anything inside the submission box counts. If a programme wants a title, it will say so and usually excludes it; otherwise spend your budget on sentences, not signage.",
      },
      {
        q: "What happens if I paste something over the limit?",
        a: "Modern portals either block the submit (Common App) or truncate at the limit (some older forms) — silently cutting your closing paragraph. Never rely on the portal to protect your ending; arrive under the cap.",
      },
    ],
  },
  {
    cta: {
      tool: "word-counter",
      text: "Count words, characters with and without spaces, and reading time — the draft-side counter for limit-hunting.",
    },
  },
];
