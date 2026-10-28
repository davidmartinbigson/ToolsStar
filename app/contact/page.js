import Link from "next/link";
import LegalShell from "@/components/LegalShell";
import ContactForm from "@/components/ContactForm";
import { Icon } from "@/components/icons";
import { SITE_EMAIL } from "@/lib/site";

export const metadata = {
  title: "Contact Us",
  description:
    "Get in touch with the Tools Stars team: report a broken tool, suggest a new one, ask a privacy question or reach us about advertising. Real people read every message.",
  keywords: ["contact tools stars", "support", "report a bug", "suggest a tool"],
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact Us — Tools Stars",
    description: "Report a bug, suggest a tool, or ask us anything about privacy and advertising.",
    url: "/contact",
    type: "website",
  },
};

const UPDATED = "29 October 2026";

const sections = [
  {
    h: "What to include in a bug report",
    p: [
      "We can usually fix a problem the same week if we can reproduce it. The three details that help most:",
    ],
    ol: [
      "Which tool you were using, and what you were trying to achieve (for example: \"compress a 400 MB MP4 down to under 100 MB\").",
      "Your browser and device (Chrome on Windows, Safari on iPhone, and so on), plus roughly how much memory the device has.",
      "What you expected to happen, and what actually happened — including any error message, exactly as written.",
    ],
    note: "Please never attach the file itself, and never send passwords, identity documents or other sensitive material. A description is enough — your files stay on your device, and that includes when you write to us.",
  },
  {
    h: "Suggesting a new tool",
    p: [
      "Tool suggestions are genuinely welcome, and several of the utilities on this site exist because a reader asked for them.",
      "We build a tool when it meets three tests: people actually search for it, it can be done well inside a browser, and it can be done safely and legally. That last one rules out downloaders for other people's hosted media, platform scrapers and document forgery — not because they are hard, but because they harm someone.",
      "If your idea fits, tell us what problem it solves and who it is for. That is more useful than a specification.",
    ],
  },
  {
    h: "Privacy, advertising and business",
    p: [
      `For anything about data handling, cookies or your rights, please read the Privacy Policy first and then write to ${SITE_EMAIL} with the specific question — you will get a straight answer rather than a link back to the policy.`,
      "For advertising partnerships, sponsorships, bulk or API enquiries, or anything else commercial, use the same address with \"Advertising / business\" as the topic.",
    ],
  },
  {
    h: "Response times",
    p: [
      "We are a small team, not a support department, but we do read everything. Expect a reply within two business days in most cases, and sooner for security or abuse reports.",
      "There is no live chat and no phone line — email is the only channel, which keeps the service free.",
    ],
  },
];

export default function ContactPage() {
  return (
    <LegalShell
      title="Contact Us"
      description={metadata.description}
      path="/contact"
      updated={UPDATED}
      intro="Found a bug, want a tool we do not have yet, or need an answer about privacy or advertising? Send us a message — a real person reads every one."
      sections={sections}
    >
      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <a
          href={`mailto:${SITE_EMAIL}`}
          className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 transition hover:border-amber-400/30 hover:bg-amber-400/[0.06]"
        >
          <Icon name="pen" size={18} className="text-amber-400" />
          <p className="mt-2 text-xs uppercase tracking-wider text-slate-500">Email</p>
          <p className="truncate text-sm font-semibold text-white">{SITE_EMAIL}</p>
        </a>
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
          <Icon name="clock" size={18} className="text-cyan-400" />
          <p className="mt-2 text-xs uppercase tracking-wider text-slate-500">Reply time</p>
          <p className="text-sm font-semibold text-white">Within 2 business days</p>
        </div>
        <Link
          href="/tools"
          className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 transition hover:border-amber-400/30 hover:bg-amber-400/[0.06]"
        >
          <Icon name="grid" size={18} className="text-emerald-400" />
          <p className="mt-2 text-xs uppercase tracking-wider text-slate-500">Looking for a tool?</p>
          <p className="text-sm font-semibold text-white">Browse all tools</p>
        </Link>
      </div>

      <ContactForm />
    </LegalShell>
  );
}
