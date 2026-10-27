import Link from "next/link";
import { Icon } from "@/components/icons";
import ToolCard from "@/components/ToolCard";
import { TOOLS } from "@/lib/tools";

export const metadata = { title: "Page Not Found" };

export default function NotFound() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 pt-20 text-center">
      <span className="anim-floaty mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-amber-400/15 text-amber-300">
        <Icon name="star" size={40} filled />
      </span>
      <h1 className="mt-6 text-5xl font-black text-white">404 — This star went supernova</h1>
      <p className="mx-auto mt-3 max-w-lg text-slate-400">
        The page you&apos;re looking for doesn&apos;t exist (yet). But there&apos;s a whole galaxy of free tools waiting for you:
      </p>
      <Link href="/tools" className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-amber-400 px-6 py-3 font-extrabold text-[#241a00] shadow-xl shadow-amber-500/20 hover:bg-amber-300">
        <Icon name="grid" size={18} /> Browse all tools
      </Link>
      <div className="mt-12 grid gap-4 text-left sm:grid-cols-3">
        {TOOLS.slice(0, 3).map((t) => <ToolCard key={t.slug} tool={t} />)}
      </div>
    </div>
  );
}
