import Link from "next/link";
import { Icon, Logo } from "./icons";
import { TOOLS } from "@/lib/tools";

export default function Footer() {
  const year = new Date().getFullYear();
  const image = TOOLS.filter((t) => t.category === "Image");
  const others = TOOLS.filter((t) => t.category !== "Image");

  return (
    <footer className="relative z-10 border-t border-white/[0.07] bg-[#04050c]/90 mt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="flex items-center gap-2.5">
              <Logo size={34} />
              <span className="text-lg font-extrabold tracking-tight">
                Tools<span className="text-amber-400">Stars</span>
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
              Free online tools that run entirely in your browser. Your files are
              processed on your own device — they are never uploaded to a server,
              never stored, and never seen by anyone.
            </p>
            <div className="mt-5 flex flex-wrap gap-2 text-[11px] font-semibold">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/[0.05] border border-white/10 px-2.5 py-1 text-slate-300">
                <Icon name="shield" size={12} className="text-emerald-400" /> Private by design
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/[0.05] border border-white/10 px-2.5 py-1 text-slate-300">
                <Icon name="zap" size={12} className="text-amber-400" /> No upload wait
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/[0.05] border border-white/10 px-2.5 py-1 text-slate-300">
                <Icon name="infinity" size={12} className="text-cyan-400" /> Unlimited &amp; free
              </span>
            </div>
          </div>

          <nav aria-label="Image tools">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">Image Tools</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-400">
              {image.map((t) => (
                <li key={t.slug}>
                  <Link href={`/tools/${t.slug}`} className="hover:text-amber-300 transition">{t.name}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="More tools">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">More Tools</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-400">
              {others.map((t) => (
                <li key={t.slug}>
                  <Link href={`/tools/${t.slug}`} className="hover:text-amber-300 transition">{t.name}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Site">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">Tools Stars</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-400">
              <li><Link href="/tools" className="hover:text-amber-300 transition">All Tools</Link></li>
              <li><Link href="/#how-it-works" className="hover:text-amber-300 transition">How It Works</Link></li>
              <li><Link href="/#how-compression-works" className="hover:text-amber-300 transition">How Compression Works</Link></li>
              <li><Link href="/#faq" className="hover:text-amber-300 transition">FAQ</Link></li>
            </ul>
            <p className="mt-6 rounded-xl border border-white/[0.08] bg-white/[0.03] p-3 text-xs leading-relaxed text-slate-400">
              <strong className="text-slate-200">Tip:</strong> bookmark this page — new
              free tools are added every week.
            </p>
          </nav>
        </div>

        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/[0.07] pt-6 text-xs text-slate-500">
          <p>© {year} Tools Stars. Free forever — no sign-up, no watermarks, no uploads.</p>
          <p className="inline-flex items-center gap-1.5">
            Made with <Icon name="star" size={12} filled className="text-amber-400" /> for creators everywhere
          </p>
        </div>
      </div>
    </footer>
  );
}
