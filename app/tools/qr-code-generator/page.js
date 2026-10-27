import ToolShell from "@/components/ToolShell";
import QrGenerator from "@/components/tools/QrGenerator";
import { getTool } from "@/lib/tools";

export const metadata = {
  title: "QR Code Generator — Create Free Custom QR Codes (PNG & SVG)",
  description:
    "Generate free QR codes for websites, Wi-Fi, text, email & phone numbers. Custom colours, high-resolution PNG up to 4K and print-ready SVG. No sign-up, codes never expire.",
  keywords: ["qr code generator", "free qr code", "qr code maker", "wifi qr code generator", "create qr code online"],
  alternates: { canonical: "/tools/qr-code-generator" },
  openGraph: { title: "Free QR Code Generator | Tools Stars", description: "Custom QR codes for links & Wi-Fi. PNG + SVG, no expiry, no sign-up." },
};

export default function Page() {
  return (
    <ToolShell
      tool={getTool("qr-code-generator")}
      intro="Make a QR code for your shop, menu, business card, Wi-Fi or social profiles in seconds. These are true static QR codes — they work forever, with no expiry, no scan limits and no middleman redirect."
      steps={[
        { title: "Choose the content type", text: "Website URL, plain text, Wi-Fi login, email or phone number — fill in the details and watch the code update live." },
        { title: "Make it yours", text: "Pick colours that match your brand (keep the code dark on a light background so cameras can read it), and an error-correction level." },
        { title: "Download & test", text: "Download a crisp PNG up to 4096px for print, or an infinitely scalable SVG. Always test-scan once with your own phone first." },
      ]}
      features={[
        "Static QR codes that never expire — no scan caps, no subscription traps",
        "Wi-Fi QR codes: guests join your network with one scan, no password typing",
        "Custom foreground/background colours to match your branding",
        "Print-ready downloads: PNG up to 4096×4096 plus vector SVG",
        "Adjustable error correction so codes still scan when partly damaged or dirty",
        "Generated locally — the content of your QR code (even Wi-Fi passwords) never leaves your device",
      ]}
      faqs={[
        { q: "Do these QR codes expire?", a: "No. These are static QR codes: the information is encoded directly in the pattern itself, so the code works forever with nothing to renew. (Some services sell 'dynamic' codes that route through their servers and stop working when you stop paying — ours don't.)" },
        { q: "How do I make a Wi-Fi QR code?", a: "Choose the Wi-Fi tab, type your network name (SSID) and password, then print the code. Anyone who scans it with a phone camera is offered to join that network instantly." },
        { q: "What size should I print my QR code?", a: "At least 2×2 cm (about 0.8 inch) for close-up scanning; bigger for posters scanned from farther away — a good rule is: scanning distance ≈ 10× the code's width. Use the 2048px or 4096px PNG (or SVG) for print so edges stay razor sharp." },
        { q: "Can I use coloured QR codes?", a: "Yes, as long as contrast stays strong: a dark code on a light background. Avoid inverted (light-on-dark) codes — many scanners struggle with them." },
        { q: "How much information can a QR code hold?", a: "Up to roughly 3,000 characters at low error correction, but denser codes scan less reliably. For links, shorter is better — that's why short, clean URLs make the most scannable codes." },
      ]}
    >
      <QrGenerator />
    </ToolShell>
  );
}
