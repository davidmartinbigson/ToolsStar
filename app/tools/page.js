import ToolsExplorer from "@/components/ToolsExplorer";
import { TOOLS } from "@/lib/tools";

export const metadata = {
  title: "All Free Online Tools — No Sign-Up, No Uploads",
  description:
    "Browse every free tool on Tools Stars: video compressor, image compressor, JPG & PNG compressor, AI background remover, image resizer, converter, image to PDF, QR generator and more. All run in your browser.",
  alternates: { canonical: "/tools" },
};

export default function AllToolsPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 pt-12 sm:pt-16">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
          All free tools, <span className="text-amber-400">one toolbox</span>
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-slate-400">
          Every tool below is free forever — no sign-up, no watermarks, no daily limits.
          Your files are processed on your own device, so they&apos;re never uploaded to a server.
        </p>
      </div>
      <div className="mt-10">
        <ToolsExplorer tools={TOOLS} />
      </div>

      <section className="mx-auto mt-20 max-w-3xl text-[15px] leading-relaxed text-slate-400">
        <h2 className="text-2xl font-extrabold tracking-tight text-white">About Tools Stars tools</h2>
        <p className="mt-3">
          Most “free online tools” upload your personal files to remote servers, hold the full-quality result behind
          a paywall, or limit you to a couple of files a day. Tools Stars takes a different approach: each tool is a
          small program that runs entirely inside your web browser using modern technologies like Canvas,
          WebAssembly, MediaRecorder and on-device AI models.
        </p>
        <p className="mt-3">
          That means faster results (no upload or queue), total privacy (your videos, photos and documents never
          leave your device), and genuinely unlimited free use. Whether you need to compress a video for WhatsApp,
          shrink a JPG for your website, remove a photo background for your online store, or turn images into a PDF
          for an assignment — there&apos;s a star tool for it above.
        </p>
      </section>
    </div>
  );
}
