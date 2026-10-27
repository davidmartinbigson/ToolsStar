"use client";

import { useEffect, useMemo, useState } from "react";
import ToolCard from "./ToolCard";
import { Icon } from "./icons";
import { CATEGORIES } from "@/lib/tools";

export default function ToolsExplorer({ tools, initialQuery = "" }) {
  const [q, setQ] = useState(initialQuery);
  const [cat, setCat] = useState("All");

  // Support deep links like /tools?q=compress (used by Google sitelinks search).
  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("q");
    if (fromUrl) setQ(fromUrl);
  }, []);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return tools.filter((t) => {
      const inCat = cat === "All" || t.category === cat;
      if (!inCat) return false;
      if (!query) return true;
      const hay = [t.name, t.short, t.category, ...(t.keywords || [])].join(" ").toLowerCase();
      return hay.includes(query);
    });
  }, [q, cat, tools]);

  return (
    <div>
      <div className="mx-auto max-w-2xl">
        <label className="relative block">
          <span className="sr-only">Search tools</span>
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            <Icon name="search" size={20} />
          </span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            type="search"
            placeholder='Search tools… try "compress", "background", "pdf"'
            className="w-full rounded-2xl border border-white/10 bg-white/[0.05] py-3.5 pl-12 pr-4 text-[15px] text-white placeholder:text-slate-500 shadow-inner outline-none transition focus:border-amber-400/60 focus:bg-white/[0.07] focus:ring-4 focus:ring-amber-400/10"
          />
          {q && (
            <button
              onClick={() => setQ("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:text-white"
              aria-label="Clear search"
            >
              <Icon name="x" size={16} />
            </button>
          )}
        </label>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-2" role="tablist" aria-label="Tool categories">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            role="tab"
            aria-selected={cat === c}
            onClick={() => setCat(c)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
              cat === c
                ? "bg-amber-400 text-[#241a00] shadow-lg shadow-amber-500/20"
                : "border border-white/10 bg-white/[0.04] text-slate-300 hover:border-amber-400/40 hover:text-white"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((t) => (
            <ToolCard key={t.slug} tool={t} />
          ))}
        </div>
      ) : (
        <div className="mt-10 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-10 text-center">
          <p className="text-lg font-semibold text-white">No tool matches “{q}” — yet.</p>
          <p className="mt-1 text-sm text-slate-400">
            Try “compress”, “resize” or “remove background”. New tools land every week.
          </p>
          <button
            onClick={() => { setQ(""); setCat("All"); }}
            className="mt-4 rounded-xl bg-amber-400 px-4 py-2 text-sm font-bold text-[#241a00] hover:bg-amber-300"
          >
            Show all tools
          </button>
        </div>
      )}
    </div>
  );
}
