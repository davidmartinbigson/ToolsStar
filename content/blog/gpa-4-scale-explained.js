// The 4.0 scale: credit-weighted maths, weighted vs unweighted, honest conversions.
export default [
  {
    p: "Ask three people what a GPA is and you get three answers: a number out of four, a percentage in disguise, or a letter average. For students in the United States and Canada it is the currency of transcripts; for everyone else applying there, it is a code to crack. The good news: the maths is short, and almost all the confusion is terminology, not arithmetic.",
  },
  {
    p: "Here is the whole system — the scale, the credit-weighted formula, the weighted-versus-unweighted trap, and the honest truth about converting other grading systems into it.",
  },
  { h2: "The 4.0 scale, actually defined" },
  {
    p: "Each letter grade maps to a fixed point value; the most common North American scale runs like this:",
  },
  {
    table: {
      head: ["Grade", "Points", "Grade", "Points"],
      rows: [
        ["A", "4.0", "C+", "2.3"],
        ["A−", "3.7", "C", "2.0"],
        ["B+", "3.3", "C−", "1.7"],
        ["B", "3.0", "D+", "1.3"],
        ["B−", "2.7", "D / F", "1.0 / 0.0"],
      ],
    },
  },
  {
    p: "Some schools drop the plus/minus rows entirely (an A− is a 4.0 there); some cap an A+ at 4.0, others award 4.3. Always check which scale a transcript uses before comparing two GPAs — a 3.7 on a no-minus scale is a different animal than a 3.7 where minuses exist.",
  },
  { h2: "GPA maths: credit-weighted, never a simple average" },
  {
    p: "A GPA is not the average of your grades — it is the average of your grades weighted by credits. Multiply each course's points by its credits, add those products, divide by total credits. A 4-credit course with a B moves your GPA more than a 1-credit course with an A, and that is the entire formula:",
  },
  {
    ul: [
      "(4 cr × 3.0) + (3 cr × 4.0) + (2 cr × 3.7) = 12 + 12 + 7.4 = 31.4",
      "31.4 ÷ 9 credits = 3.49 GPA",
      "A plain average of the three grades (3.0, 4.0, 3.7) would say 3.57 — wrong, and the difference grows with uneven credits.",
    ],
  },
  { h2: "Weighted vs unweighted: the US high-school twist" },
  {
    p: "US high schools often 'weight' honours, AP or IB classes — an A in AP becoming 5.0 instead of 4.0 — so a transcript can show a GPA above 4.0. Universities know every school weights differently, so admissions offices frequently recalculate from raw grades on their own scale. Report what your transcript states; never inflate a weighted figure into a form that asked for unweighted.",
  },
  {
    note: {
      tone: "warn",
      title: "Conversions on official forms: follow the form",
      text: "Percentage-to-4.0 mappings are not universal — they differ by country, board and even department. On official applications to US and Canadian institutions, use the conversion the institution itself publishes, or a credential evaluator (WES, ECE and peers) when they ask for one. Self-invented conversions are how honest students get flagged for dishonest numbers.",
    },
  },
  { h2: "What other systems look like on the 4.0 scale" },
  {
    p: "Rough, unofficial bands circulate everywhere — 85 % and above often lands near 3.7–4.0, 70–84 % near 3.0–3.6, and so on — but treat them as conversation, not conversion. The United Kingdom does not issue GPAs at all: degrees carry classifications (First, 2:1, 2:2), and each university publishes its own mapping when it needs one. Canada mostly uses the 4.0 scale directly, with provincial variations in letter-to-point tables.",
  },
  {
    ul: [
      "Credential evaluators exist precisely because no single table is fair across systems — use them when a portal asks.",
      "Graduate committees often weigh the last two years (or last 60 credits) more heavily than the first — a strong finish reads well.",
      "Trend beats average: a rising curve tells a story a flat high number cannot.",
    ],
  },
  { h2: "A GPA is a summary, not a verdict" },
  {
    p: "Once computed, a GPA compresses years of uneven effort into one decimal — useful for filters, useless for nuance. Know your number, know which scale it lives on, and present it exactly as your transcript defines it. The maths takes a minute; the honesty is what institutions actually remember.",
  },
  {
    faq: [
      {
        q: "Is a 3.5 GPA good?",
        a: "Context decides: on the 4.0 scale a 3.5 sits around the B+/A− border — competitive for many universities and scholarships, below the median at a few highly selective ones. Compare against your institution's own distribution, not internet averages.",
      },
      {
        q: "Do plus and minus grades matter much?",
        a: "Yes, cumulatively: an A− (3.7) versus an A (4.0) is 0.3 per course, and across forty courses that gap moves a transcript by more than a tenth of a point. Check whether your school's scale even includes minuses before comparing GPAs across schools.",
      },
      {
        q: "Is CGPA the same as GPA?",
        a: "CGPA (cumulative GPA) is the all-terms version of the same weighted maths; some countries use 'CGPA' on a 10-point scale instead of 4.0, which is a different scale entirely — always confirm the denominator before converting or comparing.",
      },
      {
        q: "Can I convert my percentage to a 4.0 GPA myself for applications?",
        a: "For personal planning, sure — rough bands give a feel. For official submissions, no: use the institution's published conversion or the credential evaluator they name. Portals compare your number against their table, and mismatched tables read as errors at best.",
      },
    ],
  },
  {
    cta: {
      tool: "gpa-calculator",
      text: "Enter your courses, credits and grades — get the credit-weighted GPA on the 4.0 scale instantly.",
    },
  },
];
