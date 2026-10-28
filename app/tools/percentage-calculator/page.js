import ToolShell from "@/components/ToolShell";
import { PercentageCalculator } from "@/components/tools/calcPack";
import { getTool } from "@/lib/tools";

export const metadata = {
  title: "Percentage Calculator Online — Marks, % Change, X% of Y (Free)",
  description:
    "Free percentage calculator with five modes: marks to percentage with grade, percentage increase or decrease, X% of a number, a number as a share of another, and percentage ⇄ CGPA. Instant results, no sign-up.",
  keywords: ["percentage calculator", "marks percentage calculator", "percentage change calculator", "percent of a number", "percentage increase calculator", "cgpa to percentage"],
  alternates: { canonical: "/tools/percentage-calculator" },
  openGraph: {
    title: "Free Percentage Calculator — 5 Modes | Tools Stars",
    description: "Marks %, % change, X% of Y and CGPA conversion in one place.",
  },
};

export default function Page() {
  return (
    <ToolShell
      tool={getTool("percentage-calculator")}
      intro="One calculator for the five percentage questions people actually search for: converting marks to a percentage with the matching grade, working out a price or salary increase, finding X% of a number, seeing one figure as a share of another, and converting between percentage and CGPA. Every result shows the formula it used, so you can check the working."
      steps={[
        { title: "Pick the question", text: "Choose the mode that matches what you need — “X% of a number”, “is what %”, “increase / decrease”, “marks to percentage” or “percentage ⇄ CGPA”." },
        { title: "Type your two numbers", text: "The labels change with the mode, so it is always obvious which value goes where. Decimals, commas-free numbers and large figures all work." },
        { title: "Read the answer & the formula", text: "The result appears instantly with the arithmetic spelled out, plus extras like the grade band, the mark difference or the conversion in the other direction." },
      ]}
      features={[
        "Five calculators in one page — no hunting for the right tool",
        "Marks mode adds the grade band and an estimated CGPA",
        "Increase / decrease mode shows the direction and the raw difference",
        "Both CGPA directions at once: percentage ÷ 9.5 and CGPA × 9.5",
        "The exact formula is printed under every answer so you can verify it",
        "One-tap copy of the result for forms, WhatsApp and emails",
        "Built-in grading reference table for boards and universities",
      ]}
      faqs={[
        { q: "How do I calculate my marks percentage?", a: "Divide the marks you obtained by the total marks, then multiply by 100. For example 742 out of 1,100 is 742 ÷ 1100 × 100 = 67.45%. Choose the “Marks to percentage” mode and it also tells you the grade band, how many marks you lost, and the rough CGPA equivalent." },
        { q: "What is the formula for percentage increase or decrease?", a: "(new value − old value) ÷ old value × 100. A positive result is an increase, a negative one is a decrease. Going from 4,000 to 4,800 is +20%; going from 4,800 back to 4,000 is −16.67%, which is why the two directions of the same change are not mirror images." },
        { q: "How do I convert a percentage to CGPA?", a: "The most widely used rule in Pakistan and India is percentage ÷ 9.5, so 85% ≈ 8.95 CGPA on a 10-point scale. Reversed, CGPA × 9.5 gives the percentage. Note that many universities publish their own conversion — some use CGPA ÷ 4 × 100 on a 4.0 scale, others use a fixed lookup table — so always confirm with your institution for official transcripts." },
        { q: "What is 15% of 4,800?", a: "672. The rule is: multiply the number by the percentage and divide by 100 (4,800 × 15 ÷ 100). A quick mental shortcut is to find 10% (480), then half of that for 5% (240), and add them together." },
        { q: "Why does my division by zero show an error?", a: "A percentage is always a share of something, so the second value cannot be zero — 5 out of 0 has no meaning. The calculator says so instead of showing “Infinity” or “NaN”, which is what a plain calculator would print." },
      ]}
    >
      <PercentageCalculator />
    </ToolShell>
  );
}
