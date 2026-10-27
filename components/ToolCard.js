import Link from "next/link";
import { Icon } from "./icons";

export default function ToolCard({ tool }) {
  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="group relative flex flex-col rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 transition duration-300 hover:-translate-y-1 hover:border-amber-400/40 hover:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
    >
      {tool.badge && (
        <span className="absolute right-4 top-4 rounded-full bg-amber-400/15 border border-amber-400/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-300">
          {tool.badge}
        </span>
      )}
      <span
        className={`inline-grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br ${tool.gradient} text-white shadow-lg ${tool.glow} transition duration-300 group-hover:scale-110 group-hover:-rotate-3`}
      >
        <Icon name={tool.icon} size={24} strokeWidth={1.9} />
      </span>
      <h3 className="mt-4 text-[17px] font-bold text-white group-hover:text-amber-200 transition">
        {tool.name}
      </h3>
      <p className="mt-1.5 flex-1 text-sm leading-relaxed text-slate-400">{tool.short}</p>
      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-amber-400">
        Use tool
        <Icon name="arrow" size={15} className="transition duration-300 group-hover:translate-x-1" />
      </span>
      <span className="pointer-events-none absolute inset-x-5 bottom-0 h-px bg-gradient-to-r from-transparent via-amber-400/60 to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
    </Link>
  );
}
