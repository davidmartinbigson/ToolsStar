import ToolShell from "@/components/ToolShell";
import { GpaCalculator } from "@/components/tools/calcPack";
import { getTool } from "@/lib/tools";

export const metadata = {
  title: "GPA Calculator — Semester GPA & Cumulative CGPA (4.0 Scale)",
  description:
    "Free GPA calculator: enter your subjects, credit hours and grades to get your semester GPA, cumulative CGPA, total credit hours, quality points and percentage equivalent. Works on phone, no sign-up.",
  keywords: ["gpa calculator", "cgpa calculator", "semester gpa calculator", "gpa to percentage", "4.0 gpa scale", "cumulative gpa calculator"],
  alternates: { canonical: "/tools/gpa-calculator" },
  openGraph: {
    title: "Free GPA / CGPA Calculator | Tools Stars",
    description: "Credit-weighted semester GPA plus cumulative CGPA and % equivalent.",
  },
};

export default function Page() {
  return (
    <ToolShell
      tool={getTool("gpa-calculator")}
      intro="Add each subject with its credit hours and the grade you expect (or already received), and the GPA updates as you type. Add your previous CGPA and completed credit hours to see the new cumulative figure — the one that actually matters for scholarships, degree classification and job applications."
      steps={[
        { title: "List your subjects", text: "Start from the sample rows, rename them, and set each one's credit hours from your course outline. Labs and tutorials count too — they are usually 1 credit hour." },
        { title: "Pick a grade for each", text: "Use the 4.00 scale with the plus/minus grades most universities follow: A = 4.00, A- = 3.67, B+ = 3.33 down to F = 0.00." },
        { title: "Read your GPA & CGPA", text: "You get the semester GPA, quality points, total credit hours, the percentage equivalent and your academic standing. Add previous CGPA and credits for the cumulative result." },
      ]}
      features={[
        "Credit-weighted GPA — a 3-credit subject counts three times a 1-credit lab",
        "Full 4.00 scale with plus/minus grades (A to F)",
        "Cumulative CGPA from your previous semesters in two extra boxes",
        "Percentage equivalent and total credit hours shown alongside",
        "Academic standing label — Dean's list range, good standing, probation risk",
        "Add and remove subjects freely; reset returns the sample semester",
        "Quality points printed per subject so you can follow the maths",
      ]}
      faqs={[
        { q: "How is a GPA actually calculated?", a: "Multiply each subject's credit hours by its grade points, add all of those quality points together, then divide by the total credit hours. Example: (3 × 4.00) + (3 × 3.33) + (2 × 3.67) + (1 × 4.00) = 35.33 quality points ÷ 9 credit hours = 3.93 GPA. Adding up grade points without the credit weighting is the most common mistake." },
        { q: "How do I calculate my cumulative CGPA?", a: "Multiply your existing CGPA by the credit hours you have already completed, add this semester's quality points, then divide by the combined credit hours. Enter both figures in section 2 and the calculator shows the new CGPA with the working underneath." },
        { q: "How do I convert GPA to a percentage?", a: "The simple, widely used conversion is GPA ÷ 4 × 100, so 3.50 becomes 87.5%. Some universities in South Asia instead use a 10-point scale and divide the percentage by 9.5. Because the rules differ, always use your own institution's published conversion for official documents." },
        { q: "Do F grades and repeated courses affect the GPA?", a: "An F contributes its credit hours to the total but zero quality points, so it drags the average down — including it in this calculator shows the honest picture. When a course is repeated, most universities keep the better grade in the CGPA but still count both attempts in the transcript; follow your own university's repeat policy." },
        { q: "Are the grade points the same at every university?", a: "No. This tool uses the common scale where A = 4.00, A- = 3.67, B+ = 3.33, B = 3.00, B- = 2.67, C+ = 2.33, C = 2.00, C- = 1.67, D+ = 1.33, D = 1.00 and F = 0. Some institutions use B- = 2.50 or drop the D grades entirely. Check your student handbook for the official table before relying on the number for a scholarship or degree classification." },
      ]}
    >
      <GpaCalculator />
    </ToolShell>
  );
}
