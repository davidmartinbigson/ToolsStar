import ToolShell from "@/components/ToolShell";
import { AgeCalculator } from "@/components/tools/calcPack";
import { getTool } from "@/lib/tools";

export const metadata = {
  title: "Age Calculator — Exact Age in Years, Months & Days (Free)",
  description:
    "Calculate your exact age from a date of birth: years, months and days, total days, weeks, hours, your next birthday countdown and your age on any other date. Free, instant, no sign-up.",
  keywords: ["age calculator", "age calculator from date of birth", "calculate my age", "age in days calculator", "birthday countdown", "exact age calculator"],
  alternates: { canonical: "/tools/age-calculator" },
  openGraph: {
    title: "Free Age Calculator — Years, Months, Days | Tools Stars",
    description: "Exact age from any date of birth, plus days lived and birthday countdown.",
  },
};

export default function Page() {
  return (
    <ToolShell
      tool={getTool("age-calculator")}
      intro="Enter a date of birth and get the answer forms actually ask for: your age in years, months and days, the day of the week you were born, how many days you have lived, and how long until your next birthday. You can also calculate your age on any other date — the day of an exam, an interview or a past event."
      steps={[
        { title: "Enter the date of birth", text: "Pick the day, month and year from the calendar. Dates far in the past work fine, so this suits parents, grandparents and historical dates too." },
        { title: "Choose the reference date", text: "Leave it on today for your current age, or set a specific date to find out how old someone was on that day — useful for forms, records and school admissions." },
        { title: "Read the breakdown", text: "You get the exact Y/M/D age, the Y.M.D format many forms want, totals in months, weeks, days, hours and minutes, the 18+ check, and the birthday countdown." },
      ]}
      features={[
        "Calendar-accurate age — years, months and days, not just a division by 365",
        "Age on any date you choose, past or future",
        "Totals in months, weeks, days, hours and minutes",
        "Days until the next birthday, plus the age you will turn",
        "The day of the week you were born on",
        "Instant 18+ check with the exact date adulthood began (CNIC, vote, licence)",
        "Runs offline in your browser — your date of birth is never sent anywhere",
      ]}
      faqs={[
        { q: "How exactly is the age calculated?", a: "In calendar units, the way people actually count birthdays. We take whole years first, then whole months, then the leftover days. If the day of the month has not arrived yet, the days are borrowed from the previous month's real length — so 1 March to 1 April is exactly one month, whether it contains 31 or 30 days. That is why the result can differ by a day or two from a simple “divide total days by 365.25” answer." },
        { q: "What happens with a 29 February birthday?", a: "In a leap year you get the true 29 February birthday and countdown. In a normal year the birthday falls back to 28 February, which is the convention used in most official systems. The years, months and days count is still exact." },
        { q: "Why do I need my age on a past date?", a: "Plenty of official forms ask for it: school admission cut-off dates, a sports trial, the date of an incident in a report, a job's eligibility deadline, or inheritance and pension paperwork. Set “Calculate age at” to that date instead of today and the whole breakdown is recomputed for it." },
        { q: "Is the age the same in every country?", a: "The arithmetic is identical everywhere — this is the international way of counting age. The difference is only in the calendar and date format used on the form. Some East Asian traditions also count a nominal age that adds a year at the new year, which is a cultural convention rather than a calculation." },
        { q: "Do you store my date of birth?", a: "No. The calculation happens in your browser the moment you type. There is no account, no database and no request sent to any server, so closing the tab erases everything." },
      ]}
    >
      <AgeCalculator />
    </ToolShell>
  );
}
