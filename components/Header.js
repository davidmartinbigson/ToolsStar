"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon, Logo } from "./icons";

const LINKS = [
  { href: "/tools", label: "All Tools" },
  { href: "/tools/video-compressor", label: "Video Compressor" },
  { href: "/tools/background-remover", label: "Background Remover" },
  { href: "/tools/image-compressor", label: "Image Compressor" },
  { href: "/tools/image-to-pdf", label: "Image to PDF" },
  { href: "/blog", label: "Guides" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.07] bg-[#05060f]/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 shrink-0" aria-label="Tools Stars home">
          <Logo size={36} />
          <span className="text-lg font-extrabold tracking-tight">
            Tools<span className="text-amber-400">Stars</span>
          </span>
          <span className="hidden lg:inline-flex ml-1 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
            100% Free
          </span>
        </Link>

        <nav className="ml-6 hidden items-center gap-1 md:flex" aria-label="Primary">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/[0.06] hover:text-white"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <span className="hidden xl:flex items-center gap-1.5 text-xs text-slate-400 mr-1">
            <Icon name="shield" size={15} className="text-emerald-400" />
            No sign-up · No uploads
          </span>
          <Link
            href="/tools"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-amber-400 px-4 py-2 text-sm font-bold text-[#241a00] shadow-lg shadow-amber-500/20 transition hover:bg-amber-300"
          >
            <Icon name="grid" size={16} />
            Explore Tools
          </Link>
          <button
            className="md:hidden rounded-lg p-2 text-slate-200 hover:bg-white/[0.07]"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            <Icon name={open ? "x" : "menu"} size={22} />
          </button>
        </div>
      </div>

      {open && (
        <nav className="md:hidden border-t border-white/[0.07] px-4 py-3 space-y-1 bg-[#07081a]" aria-label="Mobile">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-200 hover:bg-white/[0.06]"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
