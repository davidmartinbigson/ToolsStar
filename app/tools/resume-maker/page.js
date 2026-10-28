import ToolShell from "@/components/ToolShell";
import { ResumeMaker } from "@/components/tools/growthTools";
import { getTool } from "@/lib/tools";

export const metadata = {
  title: "Free Resume / CV Maker Online — 8 Templates, Photo & PDF Download",
  description:
    "Build a professional CV online free: 8 modern templates including an ATS-friendly one, optional photo with shape and size controls, 8 accent colours, live A4 preview and a print-ready PDF. No sign-up, no watermark, no download limits.",
  keywords: ["resume maker", "cv maker online", "free cv builder", "cv templates free", "resume templates", "ats resume builder", "cv maker with photo", "resume builder pdf", "cv maker free download"],
  alternates: { canonical: "/tools/resume-maker" },
  openGraph: {
    title: "Free CV Maker — 8 Templates, Photo & PDF | Tools Stars",
    description: "Live A4 preview, ATS-friendly template, auto-save. Download a print-ready PDF free.",
  },
};

export default function Page() {
  return (
    <ToolShell
      tool={getTool("resume-maker")}
      intro="Type your details on the left and watch a clean, professional A4 CV build itself on the right. Eight templates — from a bold two-column sidebar to a plain, parser-safe ATS layout — plus an optional photo you can crop, shape and size. Everything auto-saves in your own browser and downloads as a print-ready PDF with no watermark."
      steps={[
        { title: "Type your details", text: "Name, contact, profile summary, skills, languages, experience and education. Add as many jobs and qualifications as you like, one achievement per line. Everything auto-saves as you type." },
        { title: "Pick a template & photo", text: "Choose from 8 designs (two-column sidebars, single-column classics and an ATS-friendly plain layout), set an accent colour, and optionally add your photo — cropped to a square, in circle, rounded or square shape at three sizes." },
        { title: "Download the PDF", text: "Click Download PDF, then choose “Save as PDF” in the print window with A4 paper and 100% scale. Send that same file to job portals, LinkedIn and email." },
      ]}
      features={[
        "8 professionally designed templates — 3 two-column and 5 single-column layouts",
        "A dedicated ATS-Friendly template: plain black text, standard headings, no graphics",
        "Optional photo with square centre-crop, three shapes and three sizes",
        "Live full-A4 preview — what you see on screen is exactly what prints",
        "8 accent colours, unlimited jobs and qualifications, achievement bullets",
        "Auto-save in your browser: close the tab and your CV is still here next time",
        "Load-sample and clear-everything buttons so you can start over in one click",
        "No watermark, no “download credits”, no account — unlike most CV websites",
      ]}
      faqs={[
        { q: "Which template should I choose?", a: "For online applications through a company portal, use ATS-Friendly — it strips colour, columns and images so screening software can read every line. For emailing a person directly, printing, or handing over in person, the two-column templates (Modern Sidebar, Clean Sidebar, Elegant) look the most designed and hold a photo well. Classic, Professional and Minimal suit corporate and government roles, and Creative fits design, marketing and media jobs where personality is part of the pitch." },
        { q: "Should I put a photo on my CV?", a: "It depends on the market. In the Gulf, South Asia and much of Europe a professional photo is common and often expected; for US, UK, Canadian and Australian applications leave it off, because anti-discrimination norms mean many employers discard CVs with photos. If a job advert asks for a photo, add one — and use a plain-background headshot (our Passport Photo Maker produces exactly that). The ATS-Friendly template leaves the photo out on purpose, since parser software reads text rather than images." },
        { q: "Will my CV pass ATS (applicant tracking) software?", a: "Use the ATS-Friendly template and you are in good shape: it uses standard section names (Work Experience, Education, Skills), one column, plain black serif text and no tables, icons or graphics — the things parsers most often fail on. Beyond the template, mirror the exact keywords from the job advert, spell out job titles normally, and save as PDF rather than an image. No free tool can guarantee a specific company's parser, but this layout avoids every common mistake." },
        { q: "How do I get the PDF at exactly the right size?", a: "Click Download PDF; in the print dialog choose A4 paper, scale 100% (not “Fit to page”), and margins set to None or Default. The page is generated at true A4 dimensions (210 × 296 mm) with print-colour preservation enabled, so sidebars and colour bands come out exactly as the preview shows them. If your printer dialog offers “Background graphics”, tick it — otherwise coloured panels may be dropped." },
        { q: "Where is my CV data stored? Is it uploaded?", a: "Nowhere except your own browser. The builder saves your text to this device's localStorage so you can return to it, and your photo is resized on your device before it is stored. Nothing is sent to a server, there is no account, and clearing your browser data removes it — which is why the download button exists. Keep a copy of the PDF." },
        { q: "How long should my CV be?", a: "One page if you have under roughly five years of experience; two pages maximum after that. Recruiters spend 6–10 seconds on a first scan, so lead with a short profile summary, then recent roles with measurable achievements (numbers beat adjectives), and keep your strongest skills near the top. Remove anything that does not support the job you are applying for." },
        { q: "I filled everything by mistake — can I start again?", a: "Yes. “Clear everything” empties all fields while keeping your template and colour choice, and “Load sample CV” restores the example content so you can see how each section should read. Both take one click, and the preview updates instantly." },
      ]}
    >
      <ResumeMaker />
    </ToolShell>
  );
}
