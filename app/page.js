import Link from "next/link";
import ToolsExplorer from "@/components/ToolsExplorer";
import ToolCard from "@/components/ToolCard";
import { Icon } from "@/components/icons";
import { FlowDiagram, VideoDiagram, BgDiagram, ImageDiagram, PrivacyDiagram } from "@/components/diagrams";
import { ARTICLES } from "@/lib/articles";
import { TOOLS } from "@/lib/tools";
import { SITE_URL } from "@/lib/site";

export const metadata = {
  title: "Tools Stars — Free Online Tools: Compress Video & Images, Remove Backgrounds",
  description:
    "Free online tools with no sign-up and no uploads: video compressor, image compressor, JPG & PNG compressor, AI background remover, image resizer, converter, image to PDF & more. Everything runs in your browser.",
  alternates: { canonical: "/" },
};

const HOME_FAQS = [
  {
    q: "Are the tools on Tools Stars really free?",
    a: "Yes — completely free, with no sign-up, no watermarks and no 'HD unlock' paywalls. Because every tool runs inside your own browser instead of on expensive servers, we can offer unlimited use at no cost.",
  },
  {
    q: "Are my files uploaded to a server?",
    a: "Never. When you pick a file it is opened locally by your browser and processed on your device using Canvas, WebAssembly and on-device AI. Nothing is uploaded, stored or shared. Close the tab and the file is gone.",
  },
  {
    q: "Why is Tools Stars faster than other online tools?",
    a: "Traditional tools make you upload a file, wait in a server queue, then download the result. Tools Stars skips all of that — processing starts instantly on your machine and the result is ready immediately, even on slow connections.",
  },
  {
    q: "How does the video compressor make files smaller?",
    a: "It re-encodes your video at a smarter bitrate and (optionally) a smaller resolution. Modern codecs store only the differences between frames instead of every full frame, which typically cuts size by 70–92% while looking virtually identical on phones and social media.",
  },
  {
    q: "How does the AI background remover work without uploading my photo?",
    a: "A compact AI segmentation model downloads once (then stays cached in your browser) and runs entirely on your device. It detects the main subject, builds a precise alpha mask around edges like hair and fur, and exports a transparent PNG.",
  },
  {
    q: "Is there a file size or usage limit?",
    a: "There are no artificial limits — no daily caps and no per-file charges. The only practical limit is your device's memory, so extremely large 4K videos compress best on a laptop or desktop browser like Chrome, Edge or Firefox.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: HOME_FAQS.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

function SectionHead({ eyebrow, title, text, id }) {
  return (
    <div className="mx-auto max-w-3xl text-center" id={id}>
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-[11px] font-extrabold uppercase tracking-widest text-amber-300">
        <Icon name="star" size={11} filled /> {eyebrow}
      </span>
      <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">{title}</h2>
      {text && <p className="mt-3 text-[15px] leading-relaxed text-slate-400">{text}</p>}
    </div>
  );
}

export default function HomePage() {
  const popular = ["video-compressor", "background-remover", "image-compressor"]
    .map((s) => TOOLS.find((t) => t.slug === s))
    .filter(Boolean);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="relative mx-auto max-w-7xl px-4 sm:px-6 pt-14 sm:pt-20 pb-10 text-center">
        {/* floating mini-cards (desktop decoration) */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden lg:block">
          <span className="anim-floaty absolute left-[2%] top-16 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-3.5 py-2.5 text-xs font-bold text-rose-300 backdrop-blur">
            <Icon name="video" size={16} /> 248 MB → 21 MB
          </span>
          <span className="anim-floaty absolute right-[2%] top-24 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-3.5 py-2.5 text-xs font-bold text-violet-300 backdrop-blur" style={{ animationDelay: "1.2s" }}>
            <Icon name="wand" size={16} /> Background removed ✓
          </span>
          <span className="anim-floaty absolute left-[5%] top-64 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-3.5 py-2.5 text-xs font-bold text-amber-300 backdrop-blur" style={{ animationDelay: "0.6s" }}>
            <Icon name="compress" size={16} /> Image −87%
          </span>
          <span className="anim-floaty absolute right-[5%] top-72 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-3.5 py-2.5 text-xs font-bold text-emerald-300 backdrop-blur" style={{ animationDelay: "1.8s" }}>
            <Icon name="shield" size={16} /> 0 files uploaded
          </span>
        </div>

        <div className="anim-rise relative">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.05] px-4 py-1.5 text-xs font-bold text-slate-200">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            100% FREE · NO SIGN-UP · NO UPLOADS · NO WATERMARKS
          </span>

          <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-black leading-[1.08] tracking-tight text-white sm:text-6xl">
            Every file tool you need.
            <span className="block bg-gradient-to-r from-amber-300 via-amber-400 to-orange-500 bg-clip-text text-transparent">
              Right in your browser.
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-400 sm:text-lg">
            Compress videos &amp; images, remove backgrounds with AI, resize, convert and create PDFs —
            instantly. Your files are processed <strong className="text-slate-200">on your own device</strong>, so
            there&apos;s nothing to upload, nothing to wait for, and nothing to pay.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a href="#tools" className="inline-flex items-center gap-2 rounded-2xl bg-amber-400 px-7 py-3.5 font-extrabold text-[#241a00] shadow-2xl shadow-amber-500/25 transition hover:bg-amber-300">
              <Icon name="sparkles" size={19} strokeWidth={2} /> Start using free tools
            </a>
            <a href="#how-it-works" className="inline-flex items-center gap-2 rounded-2xl border border-white/12 bg-white/[0.04] px-6 py-3.5 font-bold text-white transition hover:border-amber-400/50">
              See how it works <Icon name="chevron" size={16} />
            </a>
          </div>

          <dl className="mx-auto mt-10 grid max-w-2xl grid-cols-3 gap-3 text-center">
            {[
              [`${TOOLS.length}+`, "free tools"],
              ["0", "files ever uploaded"],
              ["∞", "unlimited usage"],
            ].map(([v, l]) => (
              <div key={l} className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-2 py-3.5">
                <dt className="order-2 mt-0.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">{l}</dt>
                <dd className="text-2xl font-black text-amber-300">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* marquee */}
      <div className="relative overflow-hidden border-y border-white/[0.07] bg-white/[0.02] py-3" aria-hidden="true">
        <div className="anim-marquee flex w-[200%] gap-10 whitespace-nowrap text-sm font-semibold text-slate-500">
          {[...TOOLS, ...TOOLS].map((t, i) => (
            <span key={i} className="inline-flex items-center gap-2">
              <Icon name="star" size={12} filled className="text-amber-400/70" /> {t.name}
            </span>
          ))}
        </div>
      </div>

      {/* ── TOOLS ────────────────────────────────────────────────────────────── */}
      <section id="tools" className="mx-auto max-w-7xl scroll-mt-24 px-4 sm:px-6 pt-16">
        <SectionHead
          eyebrow="The toolbox"
          title="Pick a tool. Done in seconds."
          text="No accounts, no queues, no 'premium' unlocks. Search or browse — every tool below runs entirely on your device."
        />
        <div className="mt-10">
          <ToolsExplorer tools={TOOLS} />
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 pt-24">
        <SectionHead
          id="how-it-works"
          eyebrow="How it works"
          title="Three steps. Zero uploads."
          text="Old tools upload your private files to a server, process them there, then send them back. Tools Stars flips that around — the tool comes to your file, not the other way."
        />
        <div className="mt-12">
          <FlowDiagram />
        </div>
      </section>

      {/* ── DIAGRAM 1: VIDEO ─────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 pt-24" id="how-compression-works">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-400/30 bg-rose-400/10 px-3 py-1 text-[11px] font-extrabold uppercase tracking-widest text-rose-300">
            <Icon name="video" size={12} /> Video compression, explained
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            How a 248 MB video becomes 21 MB
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-slate-400">
            Raw camera video stores almost every pixel of every frame — hugely wasteful, because consecutive
            frames are nearly identical. Our compressor re-encodes the video so only the <em>changes</em> between
            frames are kept, trims the bitrate to what screens actually need, and can downscale 4K to HD.
            The animated diagram below shows the journey:
          </p>
        </div>
        <div className="mt-8">
          <VideoDiagram />
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link href="/tools/video-compressor" className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 to-orange-400 px-6 py-3 font-extrabold text-white shadow-xl shadow-rose-500/20 transition hover:brightness-110">
            <Icon name="video" size={18} /> Compress a video now — free
          </Link>
          <p className="text-sm text-slate-500">Presets for WhatsApp, email, YouTube &amp; more. Typical saving: 70–92%.</p>
        </div>
      </section>

      {/* ── DIAGRAM 2: BACKGROUND REMOVAL ───────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 pt-24">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-400/30 bg-violet-400/10 px-3 py-1 text-[11px] font-extrabold uppercase tracking-widest text-violet-300">
            <Icon name="wand" size={12} /> AI background removal, explained
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Watch AI cut out the subject — instantly
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-slate-400">
            An on-device AI model scans your photo, works out which pixels belong to the subject and which belong
            to the background, then paints a precise transparency mask — refining tricky edges like hair and fur.
            No green screen, no manual tracing, no upload. Watch the wipe:
          </p>
        </div>
        <div className="mt-8">
          <BgDiagram />
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link href="/tools/background-remover" className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-6 py-3 font-extrabold text-white shadow-xl shadow-violet-500/20 transition hover:brightness-110">
            <Icon name="wand" size={18} /> Remove a background — free
          </Link>
          <p className="text-sm text-slate-500">Full-resolution transparent PNG. No “HD download” paywall, ever.</p>
        </div>
      </section>

      {/* ── DIAGRAM 3: IMAGE COMPRESSION ────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 pt-24">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-[11px] font-extrabold uppercase tracking-widest text-amber-300">
            <Icon name="image" size={12} /> Image compression, explained
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Same picture to your eyes. 87% smaller to your phone.
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-slate-400">
            Photos store millions of subtly different colour shades your eyes can&apos;t tell apart. Smart
            quantization merges those near-identical shades, strips bulky metadata, and — if you choose —
            resizes oversized dimensions. You control the quality slider and see the exact saving before downloading:
          </p>
        </div>
        <div className="mt-8">
          <ImageDiagram />
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {popular.slice(2).concat(TOOLS.filter((t) => ["jpg-compressor", "png-compressor"].includes(t.slug))).map((t) => (
            <ToolCard key={t.slug} tool={t} />
          ))}
        </div>
      </section>

      {/* ── PRIVACY ──────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 pt-24">
        <SectionHead
          eyebrow="Privacy by design"
          title="Your files never leave your device"
          text="This isn't a promise buried in a privacy policy — it's how the technology works. The processing power comes from the device in your hands, so there's simply no server in the middle."
        />
        <div className="mt-10">
          <PrivacyDiagram />
        </div>
      </section>

      {/* ── COMPARISON ───────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 pt-24">
        <SectionHead eyebrow="Why Tools Stars" title="Built different from typical “free” tool sites" />
        <div className="mt-10 overflow-hidden rounded-3xl border border-white/[0.09]">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-white/[0.05] text-slate-200">
                <th scope="col" className="px-5 py-4 font-bold">What matters</th>
                <th scope="col" className="px-5 py-4 font-bold text-amber-300">Tools Stars ★</th>
                <th scope="col" className="hidden px-5 py-4 font-bold sm:table-cell">Typical online tools</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06] bg-[#0a0d20]/80 text-slate-400">
              {[
                ["Your files", "Stay on your device", "Uploaded to their servers"],
                ["Sign-up", "Never required", "Often forced after 1–2 files"],
                ["Watermarks & HD locks", "None — full quality free", "HD results behind a paywall"],
                ["Wait time", "Starts instantly, no queue", "Upload + queue + download"],
                ["Usage limits", "Unlimited", "Daily caps & file-size limits"],
                ["Works on slow internet", "Yes — even offline once loaded", "No, everything needs uploading"],
              ].map(([k, us, them]) => (
                <tr key={k}>
                  <th scope="row" className="px-5 py-3.5 font-semibold text-slate-200">{k}</th>
                  <td className="px-5 py-3.5"><span className="inline-flex items-center gap-1.5 text-emerald-300"><Icon name="check" size={15} strokeWidth={2.3} /> {us}</span></td>
                  <td className="hidden px-5 py-3.5 sm:table-cell"><span className="inline-flex items-center gap-1.5 text-rose-300/80"><Icon name="x" size={14} /> {them}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 pt-24" id="faq">
        <SectionHead eyebrow="Questions" title="Frequently asked questions" />
        <div className="mt-10 space-y-3">
          {HOME_FAQS.map((f) => (
            <details key={f.q} className="faq rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-4 open:border-amber-400/30">
              <summary className="flex items-center justify-between gap-4 font-semibold text-white">
                {f.q}
                <Icon name="chevron" size={18} className="faq-chevron shrink-0 text-amber-400" />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ── GUIDES ───────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 pt-24" id="guides">
        <SectionHead
          eyebrow="Guides"
          title="Tested answers, not recycled advice"
          text="Every guide is written by the team that builds these tools, and every number in it comes from a test we ran on real files."
        />
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {ARTICLES.slice(0, 3).map((a) => (
            <Link
              key={a.slug}
              href={`/blog/${a.slug}`}
              className="flex h-full flex-col rounded-3xl border border-white/[0.08] bg-white/[0.02] p-6 transition hover:border-amber-400/40 hover:bg-white/[0.04]"
            >
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-violet-300">{a.category}</span>
              <h3 className="mt-2.5 text-lg font-extrabold leading-snug text-white">{a.title}</h3>
              <p className="mt-2.5 text-sm leading-6 text-slate-400">{a.description}</p>
              <span className="mt-auto pt-4 text-sm font-bold text-amber-300">Read the guide →</span>
            </Link>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link href="/blog" className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-3 font-bold text-slate-200 transition hover:border-amber-400/50 hover:text-amber-200">
            Browse all {ARTICLES.length} guides →
          </Link>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 pt-24">
        <div className="relative overflow-hidden rounded-[2rem] border border-amber-400/25 bg-gradient-to-br from-amber-400/[0.12] via-[#0d0a1e] to-violet-500/[0.12] px-6 py-14 text-center">
          <span aria-hidden="true" className="anim-twinkle absolute left-[12%] top-8 text-amber-400"><Icon name="star" size={18} filled /></span>
          <span aria-hidden="true" className="anim-twinkle absolute right-[14%] top-12 text-amber-300" style={{ animationDelay: ".8s" }}><Icon name="star" size={13} filled /></span>
          <span aria-hidden="true" className="anim-twinkle absolute bottom-10 left-[22%] text-violet-300" style={{ animationDelay: "1.6s" }}><Icon name="star" size={12} filled /></span>
          <span aria-hidden="true" className="anim-twinkle absolute bottom-14 right-[20%] text-amber-400" style={{ animationDelay: ".4s" }}><Icon name="star" size={16} filled /></span>

          <h2 className="relative mx-auto max-w-2xl text-3xl font-black tracking-tight text-white sm:text-4xl">
            Your next file could be 90% smaller in the next 30 seconds.
          </h2>
          <p className="relative mx-auto mt-3 max-w-xl text-[15px] text-slate-400">
            No installs. No accounts. No uploads. Just pick a tool and watch your browser do the heavy lifting.
          </p>
          <div className="relative mt-7 flex flex-wrap justify-center gap-3">
            {popular.map((t) => (
              <Link key={t.slug} href={`/tools/${t.slug}`} className="inline-flex items-center gap-2 rounded-2xl bg-white/[0.06] border border-white/12 px-5 py-3 font-bold text-white transition hover:border-amber-400/60 hover:text-amber-200">
                <Icon name={t.icon} size={17} /> {t.name}
              </Link>
            ))}
          </div>
          <p className="relative mt-6 text-xs text-slate-500">
            Bookmark <span className="font-semibold text-slate-300">{SITE_URL.replace("https://", "")}</span> — new free tools land every week.
          </p>
        </div>
      </section>
    </>
  );
}
