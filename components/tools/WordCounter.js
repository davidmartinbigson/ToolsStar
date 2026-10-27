"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/icons";

const STOP = new Set("the be to of and a in that it was for on are as with his they i at be this have from or one had by word but not what all were we when your can said there use an each which she do how their if will up other about out many then them these so some her would make like him into time has look two more write go see number no way could people my than first water been call who oil its now find long down day did get come made may part is am are was were be been being have has had do does did will would shall should can could may might must i you he she it we they me him her us them my your his its our their this that these those".split(" "));

export default function WordCounter() {
  const [text, setText] = useState("");

  const stats = useMemo(() => {
    const trimmed = text.trim();
    const words = trimmed ? trimmed.split(/\s+/).filter(Boolean) : [];
    const sentences = trimmed ? trimmed.split(/[.!?]+/).map((s) => s.trim()).filter(Boolean).length : 0;
    const paragraphs = trimmed ? trimmed.split(/\n\s*\n/).filter(Boolean).length : 0;
    const readingMin = words.length / 200;
    const speakingMin = words.length / 130;

    const freq = {};
    words.forEach((w) => {
      const clean = w.toLowerCase().replace(/[^a-z0-9'-]/g, "");
      if (clean.length > 2 && !STOP.has(clean)) freq[clean] = (freq[clean] || 0) + 1;
    });
    const top = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 8);

    return {
      words: words.length,
      chars: text.length,
      charsNoSpace: text.replace(/\s/g, "").length,
      sentences,
      paragraphs,
      readingMin,
      speakingMin,
      avgSentence: sentences ? (words.length / sentences) : 0,
      longest: words.reduce((a, w) => (w.length > a.length ? w : a), ""),
      top,
    };
  }, [text]);

  const fmtTime = (min) => {
    if (!min) return "0 sec";
    if (min < 1) return `${Math.max(1, Math.round(min * 60))} sec`;
    const m = Math.floor(min);
    const s = Math.round((min - m) * 60);
    return s ? `${m} min ${s}s` : `${m} min`;
  };

  const cards = [
    ["Words", stats.words, "type"],
    ["Characters", stats.chars, "file"],
    ["No spaces", stats.charsNoSpace, "file"],
    ["Sentences", stats.sentences, "layers"],
    ["Paragraphs", stats.paragraphs, "grid"],
    ["Reading time", fmtTime(stats.readingMin), "clock"],
    ["Speaking time", fmtTime(stats.speakingMin), "zap"],
    ["Avg. sentence", stats.avgSentence ? `${stats.avgSentence.toFixed(1)} words` : "—", "gauge"],
  ];

  const goals = [
    ["Tweet / X post", 280, stats.chars, "chars"],
    ["Meta description", 160, stats.chars, "chars"],
    ["Blog post (SEO)", 1500, stats.words, "words"],
    ["College essay", 650, stats.words, "words"],
  ];

  return (
    <div>
      <label htmlFor="wc" className="sr-only">Text to analyze</label>
      <textarea
        id="wc" value={text} onChange={(e) => setText(e.target.value)} rows={9}
        placeholder="Start typing, or paste your essay, article, caption, assignment…"
        className="w-full rounded-2xl border border-white/10 bg-[#0d1025] px-5 py-4 text-[15px] leading-relaxed text-white placeholder:text-slate-500 outline-none transition focus:border-amber-400/60 focus:ring-4 focus:ring-amber-400/10"
      />
      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
        <span>Your text never leaves this tab — safe for confidential documents.</span>
        {text && (
          <button onClick={() => setText("")} className="inline-flex items-center gap-1 font-semibold text-slate-400 hover:text-rose-300">
            <Icon name="trash" size={13} /> Clear text
          </button>
        )}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4" role="status" aria-live="polite">
        {cards.map(([label, value, icon]) => (
          <div key={label} className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <Icon name={icon} size={13} className="text-cyan-400" /> {label}
            </span>
            <p className="mt-1.5 text-2xl font-extrabold text-white">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
          <h2 className="font-bold text-white">Length goals</h2>
          <div className="mt-4 space-y-4">
            {goals.map(([label, target, current, unit]) => {
              const pct = Math.min(100, Math.round((current / target) * 100));
              const over = current > target;
              return (
                <div key={label}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="font-semibold text-slate-300">{label}</span>
                    <span className={over ? "font-bold text-rose-300" : "text-slate-500"}>{current} / {target} {unit}{over ? " — over!" : ""}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/[0.08]">
                    <div className={`h-full rounded-full transition-all duration-500 ${over ? "bg-rose-400" : "bg-cyan-400"}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          {stats.longest && <p className="mt-4 text-xs text-slate-500">Longest word: <strong className="text-slate-300">{stats.longest}</strong> ({stats.longest.length} letters)</p>}
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
          <h2 className="font-bold text-white">Keyword density</h2>
          {stats.top.length ? (
            <ul className="mt-4 space-y-2.5">
              {stats.top.map(([word, count]) => (
                <li key={word} className="flex items-center gap-3 text-sm">
                  <span className="w-32 truncate font-semibold text-slate-200">{word}</span>
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-white/[0.08]">
                    <span className="block h-full rounded-full bg-amber-400" style={{ width: `${Math.min(100, (count / stats.top[0][1]) * 100)}%` }} />
                  </span>
                  <span className="w-20 text-right text-xs text-slate-400">{count}× · {stats.words ? ((count / stats.words) * 100).toFixed(1) : 0}%</span>
                </li>
              ))}
            </ul>
          ) : (
      <p className="mt-3 text-sm text-slate-500">Top keywords appear here once you add some text. For SEO, keep your main keyword around 1–2%.</p>
          )}
        </div>
      </div>
    </div>
  );
}
