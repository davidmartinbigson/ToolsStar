import ToolShell from "@/components/ToolShell";
import { FaviconGenerator } from "@/components/tools/imageDevPack";
import { getTool } from "@/lib/tools";

export const metadata = {
  title: "Favicon Generator Online Free — ICO, PNG, Apple & Android Icons",
  description: "Generate a complete favicon package online for free from a logo, letter or emoji: favicon.ico, 16–512px PNGs, Apple touch icon, web manifest and HTML code.",
  keywords: ["favicon generator", "favicon maker", "favicon ico", "website icon generator"],
  alternates: { canonical: "/tools/favicon-generator" },
  openGraph: { title: "Free Favicon Generator | Tools Stars", description: "A complete, ready-to-upload favicon package from one simple design." },
};

export default function Page() {
  return (
    <ToolShell
      tool={getTool("favicon-generator")}
      intro="A browser tab icon looks tiny, but a complete favicon setup needs several files. Design one bold 512px master and download every common size in one tidy ZIP."
      steps={[
        { title: "Start with a logo or letter", text: "Upload a simple logo, or type one character/initials. The 16px preview tells you immediately if it is recognizable." },
        { title: "Shape it for small screens", text: "Choose a rounded, square or circular icon, background colour and padding. Avoid thin lines and long words." },
        { title: "Download & add the HTML", text: "Put the ZIP files in your website's public/root folder and paste the supplied link tags inside your page head." },
      ]}
      features={[
        "Multi-resolution favicon.ico containing 16–256px icons",
        "16, 32, 48, 64, 128, 180, 192 and 512px PNG files",
        "Apple touch icon and Android/PWA web manifest included",
        "Ready-to-paste HTML snippet in the ZIP and on screen",
        "Live 48px, 32px and 16px recognizability previews",
      ]}
      faqs={[
        { q: "Where do I put favicon.ico?", a: "Place favicon.ico and the PNG/manifest files in your website's public/root directory so they are available at /favicon.ico, /favicon-32x32.png and so on. Then add the supplied HTML inside the <head> of your pages or global layout." },
        { q: "Why does my detailed logo look muddy at 16px?", a: "A 16×16 icon has only 256 pixels. Use the simplest symbol or first letter, increase padding slightly, and choose strong contrast. Many brands use a simplified favicon different from their full logo." },
        { q: "I replaced the favicon but the old one still shows. Why?", a: "Browsers cache favicons aggressively. Hard-refresh, open the favicon URL directly, or temporarily add a version such as /favicon.ico?v=2 to force a fresh download." },
        { q: "Do I need every file in the package?", a: "A single favicon.ico works for basic tabs, but PNG sizes look sharper on modern devices, Apple uses its touch icon for home-screen bookmarks, and Android/PWA installs use the manifest icons. The full package covers all of them." },
      ]}
    >
      <FaviconGenerator />
    </ToolShell>
  );
}
