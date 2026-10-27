import ToolShell from "@/components/ToolShell";
import PasswordGenerator from "@/components/tools/PasswordGenerator";
import { getTool } from "@/lib/tools";

export const metadata = {
  title: "Password Generator — Create Strong, Random Passwords Free",
  description:
    "Generate strong, truly random passwords with a live strength (entropy) meter. Created on your device with cryptographic randomness — never sent to a server. Free, no sign-up.",
  keywords: ["password generator", "strong password generator", "random password", "secure password generator"],
  alternates: { canonical: "/tools/password-generator" },
  openGraph: { title: "Strong Password Generator | Tools Stars", description: "Cryptographically random passwords with a strength meter. 100% on-device." },
};

export default function Page() {
  return (
    <ToolShell
      tool={getTool("password-generator")}
      intro="Stop reusing 'Name@123'. This generator uses your browser's cryptographic random number generator (the same source security software trusts) to create passwords nobody can guess — and it never leaves your device."
      steps={[
        { title: "Set the length", text: "16 characters is the sweet spot for most accounts; go 20–32 for banking, email and password managers. Length matters more than anything else." },
        { title: "Choose character types", text: "Mix lowercase, uppercase, numbers and symbols for maximum strength — or trim the set if a picky website forbids symbols. Optionally exclude look-alike characters like l, 1, O and 0." },
        { title: "Copy & save it safely", text: "Copy your new password straight into the site and your password manager. The strength meter confirms how many centuries a brute-force attack would need." },
      ]}
      features={[
        "True cryptographic randomness (crypto.getRandomValues) — not predictable Math.random",
        "Live entropy meter shows exactly how strong each password is, in bits",
        "Every chosen character type is guaranteed to appear at least once",
        "6–64 characters, with an option to avoid confusing look-alike characters",
        "Generated and stored only in this tab's memory — closing the tab erases everything",
        "No sign-up and nothing transmitted: safe to generate passwords for sensitive accounts",
      ]}
      faqs={[
        { q: "What makes a password 'strong'?", a: "Length and randomness. A 16-character password drawn randomly from ~90 symbols has about 100 bits of entropy — billions of times harder to brute-force than a clever 8-character one. Uniqueness matters too: never reuse a password across sites." },
        { q: "Is it safe to generate passwords in a browser like this?", a: "Yes — on this page the generation happens entirely on your device using the Web Crypto API, and nothing is sent to or stored on any server. You can verify by disconnecting from the internet: the tool keeps working." },
        { q: "How should I remember a random password?", a: "You shouldn't try — use a reputable password manager (Bitwarden is a great free one) to store a unique generated password for every account, protected by one strong master passphrase." },
        { q: "Why avoid characters like l, 1, I, O and 0?", a: "They look nearly identical in many fonts, which causes typos when a password must be read aloud or typed from paper. The tiny entropy cost is worth it in those situations — just add a couple of extra characters to compensate." },
        { q: "How often should I change my passwords?", a: "Modern guidance (including NIST) says: don't rotate on a schedule — change immediately if a site reports a breach or you suspect compromise. Strong, unique, manager-stored passwords + two-factor authentication beat frequent changes." },
      ]}
    >
      <PasswordGenerator />
    </ToolShell>
  );
}
