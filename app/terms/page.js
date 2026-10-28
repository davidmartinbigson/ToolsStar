import LegalShell from "@/components/LegalShell";
import { SITE_NAME, SITE_EMAIL } from "@/lib/site";

export const metadata = {
  title: "Terms of Service",
  description:
    "The terms that apply when you use Tools Stars: a free, browser-based toolbox. Your files stay yours, the tools come with no warranty, and a short list of things not to do.",
  keywords: ["terms of service", "terms and conditions", "acceptable use", "free online tools terms"],
  alternates: { canonical: "/terms" },
  openGraph: {
    title: "Terms of Service — Tools Stars",
    description: "Short, readable terms for using the free browser-based tools on Tools Stars.",
    url: "/terms",
    type: "website",
  },
};

const UPDATED = "29 October 2026";

const sections = [
  {
    h: "1. Agreement to these terms",
    p: [
      `By opening ${SITE_NAME} or using any tool on this website, you agree to these Terms of Service and to our Privacy Policy. If you do not agree with them, please do not use the site.`,
      "These terms are written to be read, not to trap you. They are short because the service is simple: free utilities that run in your browser.",
    ],
  },
  {
    h: "2. What the service is",
    p: [
      "Tools Stars provides a collection of file and utility tools — compressors, converters, PDF utilities, image editors, audio tools, generators, calculators and document helpers — that execute entirely in your web browser.",
      "There is no account, no subscription, no usage quota and no paid tier. Every tool is free to use, as often as you like. We do not operate an upload service, a processing queue or a file store.",
    ],
  },
  {
    h: "3. Licence to use",
    p: [
      "We grant you a personal, non-exclusive, non-transferable and revocable licence to access and use the website and its tools for your own lawful purposes, whether personal, educational or commercial.",
      "You may not copy, mirror, resell or redistribute the website itself, or build a competing service by scraping our pages. Linking to us, embedding a link in your own content, and sharing the tools with colleagues are all welcome and encouraged.",
    ],
  },
  {
    h: "4. Your files and your content",
    p: [
      "Everything you load into a tool remains entirely yours. We claim no ownership, no licence and no rights in your files, your documents, your photos, your audio or the outputs you create.",
      "Because nothing is uploaded, we cannot and do not review, moderate, store or back up your material. You are solely responsible for the content you process and for making sure you have the right to use it — including copyright, confidentiality obligations and any consent required from people appearing in photos or videos.",
    ],
    note: "Please keep your own backup before performing any destructive or lossy operation. Compression and format conversion intentionally discard data, and the original cannot be reconstructed from the result.",
  },
  {
    h: "5. Acceptable use",
    p: ["You agree not to use Tools Stars to:"],
    ul: [
      "Create, process or distribute material that is unlawful, infringing, defamatory, hateful, harassing or sexually explicit involving any person without their consent.",
      "Forge identity documents, official certificates, signatures, financial records or any material intended to deceive a person, institution or automated system.",
      "Interfere with, overload, probe or attempt to gain unauthorised access to the website, its infrastructure or its third-party providers.",
      "Run automated scraping or bulk collection designed to replicate this service elsewhere.",
      "Circumvent any technical limitation, security measure or access control present on the site.",
      "Upload or distribute malware, or use the tools in a way that could harm another person's device or data.",
    ],
  },
  {
    h: "6. Third-party software and libraries",
    p: [
      "The tools are built on open-source software and standard browser APIs. Those libraries are licensed by their own authors under their own terms, and are provided without warranty of any kind. Nothing here limits or alters the licences that apply to those third-party components.",
      "Some tools fetch these libraries from public content-delivery networks at the moment of use. That is a request for program code — never for your files.",
    ],
  },
  {
    h: "7. Trademarks and brand names",
    p: [
      "Product, format and brand names mentioned anywhere on this site — for example names of file formats, operating systems, social platforms or office suites — are the property of their respective owners. Their use here is descriptive only, to explain what a tool works with.",
      `${SITE_NAME} is not affiliated with, endorsed by, or sponsored by any of those owners unless we say so explicitly.`,
    ],
  },
  {
    h: "8. Advertising and external links",
    p: [
      "The site may display advertising in order to remain free. Advertising is served by third-party providers under their own policies, and only with your consent as described in the Privacy Policy.",
      "Pages may also contain links to external websites. We are not responsible for the content, accuracy or practices of any third-party site, and a link is not an endorsement. Please review their terms and privacy policies before submitting any information to them.",
    ],
  },
  {
    h: "9. Tools are not professional advice",
    p: [
      "Calculators and generators on this site — for grade points, percentages, religious obligations, solar and electrical sizing, document layouts and similar — produce estimates based on the numbers and settings you enter. They are convenience tools, not advice.",
      "They do not constitute legal, financial, medical, engineering or religious guidance, and they cannot account for every local rule, institution policy or standard. Always confirm requirements with the relevant authority, professional or institution before relying on a result for something important.",
    ],
    note: "Document and photo specifications vary between issuers and change over time. A tool can produce the exact pixel and millimetre dimensions you ask for, but only the receiving authority can confirm that your submission is acceptable.",
  },
  {
    h: "10. No warranty",
    p: [
      'The website and its tools are provided "as is" and "as available", without warranties of any kind, whether express or implied, including implied warranties of merchantability, fitness for a particular purpose, and non-infringement.',
      "We do not warrant that the site will be uninterrupted, error-free or always available, that a tool will produce a specific result, or that output files will meet any external requirement. Browser support varies, and some tools require modern browser features or a reasonably capable device.",
    ],
  },
  {
    h: "11. Limitation of liability",
    p: [
      "To the maximum extent permitted by law, neither Tools Stars nor the people who build it shall be liable for any indirect, incidental, special, consequential or punitive damages, or for any loss of data, files, profits, revenue or goodwill, arising out of or in connection with your use of — or inability to use — the website or its tools.",
      "This includes situations where an output file is unusable, a conversion loses information, a calculation is inaccurate for your circumstances, or a third-party service behaves unexpectedly. Our total aggregate liability, in any event, is limited to the amount you paid us to use the service — which is nothing, because it is free.",
    ],
  },
  {
    h: "12. Changes to the service and to these terms",
    p: [
      "Tools are added, improved and occasionally retired. We may change, suspend or discontinue any part of the site at any time without notice, and we are not liable to you or to any third party for doing so.",
      "We may also update these terms. When we do, the \"Last updated\" date at the top of this page changes. Your continued use of the site after that point constitutes acceptance of the revised terms.",
    ],
  },
  {
    h: "13. Suspension",
    p: [
      "We may restrict or block access to anyone who violates these terms, who abuses the service or its infrastructure, or who uses the tools for unlawful purposes — without notice and at our sole discretion.",
    ],
  },
  {
    h: "14. General",
    p: [
      "These terms, together with the Privacy Policy, form the whole agreement between you and Tools Stars regarding use of the website.",
      "If any provision is found to be unenforceable, the remaining provisions stay in full effect. A failure to enforce any provision is not a waiver of it. These terms are governed by the laws applicable in your place of residence, and nothing here removes protections that local law grants you and that cannot be waived by agreement.",
    ],
  },
  {
    h: "15. Contact",
    p: [
      `Anything unclear, or a request we should consider? Write to ${SITE_EMAIL}. Reports of abuse or of content that violates these terms are taken seriously and answered quickly.`,
    ],
  },
];

export default function TermsPage() {
  return (
    <LegalShell
      title="Terms of Service"
      description={metadata.description}
      path="/terms"
      updated={UPDATED}
      intro="These are the terms that apply when you use Tools Stars. They cover what the service is, what remains yours, a short list of things not to do, and the honest limits of what free browser-based software can promise."
      sections={sections}
    />
  );
}
