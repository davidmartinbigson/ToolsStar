import LegalShell from "@/components/LegalShell";
import { SITE_NAME, SITE_EMAIL } from "@/lib/site";

export const metadata = {
  title: "Disclaimer",
  description:
    "Important limitations of the free tools on Tools Stars: results are estimates, formats are not guaranteed to satisfy any authority, and tools are provided as-is without warranty.",
  keywords: ["disclaimer", "no warranty", "tool limitations", "estimate disclaimer"],
  alternates: { canonical: "/disclaimer" },
  openGraph: {
    title: "Disclaimer — Tools Stars",
    description: "What Tools Stars can and cannot promise about the results its tools produce.",
    url: "/disclaimer",
    type: "website",
  },
};

const UPDATED = "29 October 2026";

const sections = [
  {
    h: "1. General information only",
    p: [
      `Everything published on ${SITE_NAME} — including tool outputs, on-page guidance, sample data, figures and explanations — is provided for general information and convenience. It is not professional advice of any kind.`,
      "We work hard to make each tool accurate and well documented, but no website can guarantee that its content is complete, current, or correct for your particular circumstances.",
    ],
  },
  {
    h: "2. No guarantee that output meets external requirements",
    p: [
      "Many tools produce files intended for submission somewhere else: an application portal, a university, an employer, a government agency, a visa authority or a printing service. Those organisations set their own rules, and those rules change without notice.",
      "A tool can produce exactly the dimensions, file size, format or layout you ask for. It cannot verify that the receiving institution will accept your file. Always check the official specification published by the institution itself before you submit.",
    ],
    ul: [
      "Passport, visa and identity photo sizes differ between countries and are updated periodically — confirm current dimensions with the issuing authority.",
      "Recruitment portals, examination boards and government systems often impose their own maximum file size, format and naming rules.",
      "Printed output depends on your printer, paper and driver settings as much as on the file itself.",
    ],
    note: "When an institution offers an official online checker or a published specification sheet, use it as the final authority — not a third-party website, including ours.",
  },
  {
    h: "3. Calculators produce estimates",
    p: [
      "Grade point, percentage, age, financial, religious-obligation, electrical and solar-sizing calculators return results based on the values and assumptions you enter, using common formulas and typical constants.",
      "Real-world requirements vary: grading scales differ between institutions, currency and metal prices move constantly, and an electrical or solar design must account for local conditions, wiring, efficiency losses, safety margins and applicable codes.",
    ],
  },
  {
    h: "4. Not professional advice",
    p: [
      "Nothing on this site constitutes legal, financial, tax, medical, engineering, or religious advice. Our calculators are arithmetic helpers, not scholarly or professional opinions.",
      "For matters with real consequences, consult a qualified professional — a licensed engineer or electrician for electrical and solar work, a financial adviser for money decisions, a recognised religious authority for questions of religious obligation, and a qualified lawyer or doctor where relevant.",
    ],
  },
  {
    h: "5. File conversion is lossy and irreversible",
    p: [
      "Compression reduces file size by discarding information. Format conversion can drop layers, transparency, metadata, colour profiles, embedded fonts, annotations or editability. Cropping and resizing remove pixels permanently.",
      "None of these operations can be undone after you have saved the result. Keep your original file, and treat the output as a copy rather than a replacement.",
    ],
  },
  {
    h: "6. Browser and device limitations",
    p: [
      "Because tools run inside your browser, their behaviour depends on your device, browser version, available memory and installed codecs. Very large files may be slow or may fail on limited hardware. Some features require a modern browser with support for the relevant web standards.",
      "Nothing is uploaded while you work, which is excellent for privacy — but it also means the entire job depends on your own machine's resources.",
    ],
  },
  {
    h: "7. Third-party links and libraries",
    p: [
      "The site may link to external websites and may load open-source libraries from public content-delivery networks. We do not control those third parties, and we are not responsible for their content, availability, licensing or practices.",
      "Inclusion of a link does not imply endorsement. Review the terms and privacy policy of any external site before providing information to it.",
    ],
  },
  {
    h: "8. No warranty and limitation of liability",
    p: [
      'The website and every tool on it are provided "as is" and "as available", without any warranty, express or implied. Use them at your own discretion and risk.',
      "To the fullest extent permitted by law, we accept no liability for any loss or damage — including lost data, lost files, inaccurate results, missed deadlines, or a rejected submission — arising from the use of, or reliance on, anything provided on this site.",
    ],
  },
  {
    h: "9. Changes and contact",
    p: [
      `This disclaimer may be updated as tools and policies change; the "Last updated" date above will reflect the most recent revision.`,
      `If you spot an error, a broken tool, or a place where our documentation misleads, please tell us at ${SITE_EMAIL} — corrections are genuinely appreciated and are usually shipped the same week.`,
    ],
  },
];

export default function DisclaimerPage() {
  return (
    <LegalShell
      title="Disclaimer"
      description={metadata.description}
      path="/disclaimer"
      updated={UPDATED}
      intro="Tools Stars is free, private and useful — and it is honest about its limits. This page sets out what our tools can promise and what they cannot, so you can rely on them appropriately."
      sections={sections}
    />
  );
}
