import LegalShell from "@/components/LegalShell";
import { SITE_NAME, SITE_EMAIL } from "@/lib/site";

export const metadata = {
  title: "Privacy Policy",
  description:
    "How Tools Stars handles your data: files are processed inside your own browser and never uploaded to a server. Learn what little information is collected, which cookies are used, and how to control them.",
  keywords: ["privacy policy", "data protection", "cookies", "browser based tools privacy"],
  alternates: { canonical: "/privacy-policy" },
  openGraph: {
    title: "Privacy Policy — Tools Stars",
    description:
      "Your files never leave your device. Here is exactly what Tools Stars collects, why, and how to control it.",
    url: "/privacy-policy",
    type: "website",
  },
};

const UPDATED = "29 October 2026";

const sections = [
  {
    h: "1. The short version",
    p: [
      "Tools Stars is a collection of utilities that run entirely inside your web browser. When you compress a video, edit a photo, sign a PDF or build a CV, the file is read from your device, processed by JavaScript running on your device, and written back to your device. It is never transmitted to our servers, because we do not operate any file-processing server.",
      "That single design decision removes almost every privacy question a typical online-tool site has to answer: we cannot lose your files, cannot sell them, cannot be subpoenaed for them, and cannot look at them.",
    ],
    ul: [
      "No account, no sign-up, no email address required to use any tool.",
      "No file uploads — your videos, images, PDFs and audio stay on your device.",
      "No server-side storage, no processing queues, no temporary copies.",
      "No selling or renting of personal information, ever.",
      "Optional analytics and advertising cookies are only set if you accept them.",
    ],
  },
  {
    h: "2. Information we do not collect",
    p: [
      "We do not collect, receive or store the content you process. This includes the files themselves, anything visible inside them (faces, signatures, identity documents, medical or financial paperwork, personal messages) and the results you download.",
      "Because processing happens locally, we also have no way to associate a file with a person. There is no upload event, no job identifier and no server log entry containing your content.",
    ],
    note: "Please still use good judgement: some tools keep a working draft in your own browser (see section 5), so on a shared or public computer remember to clear it before you walk away.",
  },
  {
    h: "3. Information that may be collected automatically",
    p: [
      "Like nearly every website, a small amount of technical information can be recorded when your browser requests the pages and libraries that make Tools Stars work:",
    ],
    ul: [
      "Standard web server and CDN logs — your IP address, browser type, approximate region, referring page and requested URL. These are produced by the hosting and content-delivery infrastructure, not by our application code.",
      "Aggregated, non-identifying usage statistics — such as which tools are opened and how often — and only if you have accepted analytics cookies.",
      "Advertising identifiers and cookies used by our ad provider to keep advertising free of charge, and only if you have accepted advertising cookies.",
    ],
  },
  {
    h: "4. Third-party services",
    p: [
      "Tools Stars relies on a small number of reputable third parties. Each of them processes data under its own privacy policy, and none of them receives the files you edit:",
    ],
    ol: [
      "Hosting & delivery — the website is hosted and served through a modern edge platform, which handles TLS certificates and routes requests. It sees standard connection metadata such as IP address and requested URL.",
      "Open-source libraries — some tools download well-known libraries (for example PDF manipulation, image codecs or AI models) from public JavaScript CDNs at the moment you use them. The CDN sees a normal asset request; your file is never sent to it.",
      "Analytics (optional) — if enabled and if you consent, Google Analytics collects aggregated usage data with IP anonymisation. You can decline in the cookie banner or use a browser extension that blocks analytics.",
      "Advertising (optional) — if enabled and if you consent, Google AdSense may use cookies to serve ads based on your prior visits to this and other websites. You can opt out of personalised advertising at any time through Google's Ads Settings, or decline in the cookie banner.",
    ],
    note: "Until advertising and analytics are switched on, no third-party tracking scripts run on this site at all. The cookie banner itself only appears once there is something to consent to.",
  },
  {
    h: "5. Data stored in your own browser",
    p: [
      "A few tools save a draft locally so you do not lose work if you refresh the page or close a tab by accident. This uses your browser's localStorage and stays on your device:",
    ],
    ul: [
      "Resume / CV Maker — keeps the text you typed plus a downscaled copy of the photo you chose, so you can return to your draft later.",
      "Other tools may remember your last-used settings, such as a quality level or an output size.",
      "Your consent choice (accepted or essential-only) is stored locally so the banner does not reappear on every page.",
    ],
    note: "You are always in control: use a tool's own reset control (for example \"Clear everything\" in the CV Maker), or clear your browser's site data for this domain to remove everything at once. We cannot read this data — it never reaches us.",
  },
  {
    h: "6. Cookies and how to control them",
    p: [
      "Essential storage is limited to your consent choice and local tool drafts; these are strictly necessary and do not require permission. Everything else is optional and gated behind the consent banner.",
      "You can change or withdraw your decision at any time — clearing site data for this domain resets the choice, and the banner will ask you again. You can also block third-party cookies entirely in your browser settings, or use private browsing, and every tool will continue to work normally.",
    ],
  },
  {
    h: "7. Data retention",
    p: [
      "We retain no files and no personal content, so there is nothing of yours for us to delete on our side. Whatever a third-party provider keeps (for example aggregated analytics or ad-measurement data) is governed by that provider's own retention settings and policies.",
      "Local drafts in your browser remain until you clear them or until the browser clears storage on your behalf.",
    ],
  },
  {
    h: "8. Your rights",
    p: [
      "Depending on where you live, you may have rights to access, correct, delete or restrict the processing of your personal data, and to object to certain uses of it.",
      "In practice, the meaningful controls on Tools Stars are in your hands and take effect immediately: decline optional cookies, block trackers in your browser, clear site data, or use a private window. If you would like help exercising any right, or want a copy of what little information exists, contact us and we will respond.",
    ],
  },
  {
    h: "9. Children's privacy",
    p: [
      "Our tools are general-audience utilities and are not directed at children. We do not knowingly collect personal information from children. Because no account exists and no file is uploaded, a child using a tool does not create any record with us.",
      "If you believe a child has provided personal information to us, contact us and we will remove it promptly.",
    ],
  },
  {
    h: "10. Security",
    p: [
      "Every page is served over HTTPS, so traffic between your browser and the site is encrypted. More importantly, the sensitive material never travels at all: your documents are processed in the browser's own sandbox, which is why Tools Stars is a sensible choice for identity documents, signed contracts, medical paperwork or anything else you would rather not hand to a stranger's server.",
      "No system is perfectly secure, but the strongest protection here is architectural — there is no database of your files to breach.",
    ],
  },
  {
    h: "11. Changes to this policy",
    p: [
      `If the way ${SITE_NAME} works changes — for example if advertising or analytics is enabled, or if a new category of tool is added — this page will be updated and the "Last updated" date at the top will change. Material changes that affect your choices will also be announced in the cookie banner so you can decide again.`,
      "We encourage you to review this page occasionally. Continuing to use the site after a change means you accept the updated policy.",
    ],
  },
  {
    h: "12. Contact",
    p: [
      `Questions about privacy, a request to exercise your rights, or a concern about something you saw on the site? Write to ${SITE_EMAIL} and you will get a reply from a human — usually within two business days.`,
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalShell
      title="Privacy Policy"
      description={metadata.description}
      path="/privacy-policy"
      updated={UPDATED}
      intro={`This policy explains what ${SITE_NAME} does — and deliberately does not do — with your information. The most important fact is the simplest one: your files are processed on your own device and are never uploaded to us.`}
      sections={sections}
    />
  );
}
