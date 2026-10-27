"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/icons";

const SETS = {
  lower: "abcdefghijklmnopqrstuvwxyz",
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  digits: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{};:,.<>?",
};
const AMBIGUOUS = /[l1IO0]/g;

function secureRandomInt(max) {
  const arr = new Uint32Array(1);
  const limit = Math.floor(0xffffffff / max) * max;
  let x;
  do {
    crypto.getRandomValues(arr);
    x = arr[0];
  } while (x >= limit);
  return x % max;
}

export default function PasswordGenerator() {
  const [length, setLength] = useState(16);
  const [opts, setOpts] = useState({ lower: true, upper: true, digits: true, symbols: true });
  const [avoidAmbiguous, setAvoidAmbiguous] = useState(false);
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState([]);

  const pool = useMemo(() => {
    let p = Object.entries(opts).filter(([, on]) => on).map(([k]) => SETS[k]).join("");
    if (avoidAmbiguous) p = p.replace(AMBIGUOUS, "");
    return p;
  }, [opts, avoidAmbiguous]);

  const generate = useCallback(() => {
    if (!pool) { setPassword(""); return; }
    const activeSets = Object.entries(opts).filter(([, on]) => on).map(([k]) => {
      const s = avoidAmbiguous ? SETS[k].replace(AMBIGUOUS, "") : SETS[k];
      return s;
    }).filter(Boolean);

    const chars = [];
    // guarantee at least one char from each selected set
    activeSets.forEach((s) => chars.push(s[secureRandomInt(s.length)]));
    while (chars.length < length) chars.push(pool[secureRandomInt(pool.length)]);
    // Fisher–Yates shuffle with secure randomness
    for (let i = chars.length - 1; i > 0; i--) {
      const j = secureRandomInt(i + 1);
      [chars[i], chars[j]] = [chars[j], chars[i]];
    }
    const pw = chars.slice(0, length).join("");
    setPassword(pw);
    setCopied(false);
    setHistory((h) => [pw, ...h].slice(0, 6));
  }, [pool, opts, avoidAmbiguous, length]);

  useEffect(() => { generate(); }, [generate]);

  const entropy = pool ? Math.round(length * Math.log2(pool.length)) : 0;
  const strength =
    entropy >= 100 ? { label: "Fort Knox", tone: "bg-emerald-400", text: "text-emerald-300", w: "100%", note: "Centuries to crack with current tech." }
    : entropy >= 75 ? { label: "Very strong", tone: "bg-emerald-400", text: "text-emerald-300", w: "80%", note: "Excellent for important accounts." }
    : entropy >= 55 ? { label: "Strong", tone: "bg-lime-400", text: "text-lime-300", w: "60%", note: "Good for everyday accounts." }
    : entropy >= 35 ? { label: "Fair", tone: "bg-amber-400", text: "text-amber-300", w: "40%", note: "Add length or symbols to strengthen it." }
    : { label: "Weak", tone: "bg-rose-400", text: "text-rose-300", w: "20%", note: "Too short/simple — increase the length." };

  const copy = async (text) => {
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1600); } catch {}
  };

  return (
    <div>
      <div className="flex items-stretch gap-2.5">
        <div className="min-w-0 flex-1 rounded-2xl border border-amber-400/30 bg-black/50 px-5 py-4">
          <p className="break-all font-mono text-lg font-bold tracking-wide text-amber-200 sm:text-xl" aria-live="polite">
            {password || "Select at least one character type"}
          </p>
        </div>
        <button onClick={() => copy(password)} disabled={!password} aria-label="Copy password"
          className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-amber-400 px-4 font-extrabold text-[#241a00] shadow-lg shadow-amber-500/20 transition hover:bg-amber-300 disabled:opacity-50">
          <Icon name={copied ? "check" : "copy"} size={18} strokeWidth={2.1} /> <span className="hidden sm:inline">{copied ? "Copied!" : "Copy"}</span>
        </button>
        <button onClick={generate} aria-label="Generate new password"
          className="inline-flex shrink-0 items-center gap-2 rounded-2xl border border-white/12 bg-white/[0.04] px-4 font-bold text-white transition hover:border-amber-400/50">
          <Icon name="refresh" size={18} /> <span className="hidden sm:inline">New</span>
        </button>
      </div>

      <div className="mt-4" role="status">
        <div className="flex items-center justify-between text-sm">
          <span className={`font-bold ${strength.text}`}>{strength.label} · {entropy} bits of entropy</span>
          <span className="text-xs text-slate-500">{strength.note}</span>
        </div>
        <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/[0.08]">
          <div className={`h-full rounded-full ${strength.tone} transition-all duration-500`} style={{ width: strength.w }} />
        </div>
      </div>

      <div className="mt-7 grid gap-6 lg:grid-cols-2">
        <div>
          <label htmlFor="plen" className="flex justify-between text-sm font-semibold text-white">
            Password length <span className="rounded-md bg-amber-400/15 px-2 py-0.5 font-bold text-amber-300">{length} characters</span>
          </label>
          <input id="plen" type="range" min="6" max="64" value={length} onChange={(e) => setLength(+e.target.value)} className="mt-3 w-full" />
          <div className="mt-2 flex gap-2">
            {[12, 16, 20, 32].map((v) => (
              <button key={v} onClick={() => setLength(v)} className={`rounded-md border px-2.5 py-1 text-xs font-semibold ${length === v ? "border-amber-400 bg-amber-400/15 text-amber-200" : "border-white/10 bg-white/[0.03] text-slate-300"}`}>{v}</button>
            ))}
          </div>
          <p className="mt-3 text-xs leading-relaxed text-slate-500">16+ characters is the sweet spot. Length beats complexity.</p>
        </div>

        <fieldset>
          <legend className="text-sm font-semibold text-white">Include</legend>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {[
              ["lower", "Lowercase", "a–z"],
              ["upper", "Uppercase", "A–Z"],
              ["digits", "Numbers", "0–9"],
              ["symbols", "Symbols", "!@#$%"],
            ].map(([k, label, sample]) => (
              <label key={k} className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-3.5 py-3 text-sm transition ${opts[k] ? "border-amber-400/50 bg-amber-400/[0.07] text-white" : "border-white/10 bg-white/[0.02] text-slate-400"}`}>
                <input type="checkbox" checked={opts[k]} onChange={(e) => setOpts((o) => ({ ...o, [k]: e.target.checked }))} className="h-4 w-4" />
                <span className="font-semibold">{label}</span> <span className="font-mono text-xs text-slate-500">{sample}</span>
              </label>
            ))}
          </div>
          <label className="mt-3 flex cursor-pointer items-center gap-2.5 text-sm text-slate-300">
            <input type="checkbox" checked={avoidAmbiguous} onChange={(e) => setAvoidAmbiguous(e.target.checked)} className="h-4 w-4" />
            Avoid confusing characters (l, 1, I, O, 0)
          </label>
        </fieldset>
      </div>

      {history.length > 1 && (
        <div className="mt-7">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Recent (this session only)</h2>
          <ul className="mt-2.5 space-y-1.5">
            {history.slice(1).map((pw, i) => (
              <li key={i} className="flex items-center gap-3 rounded-lg bg-white/[0.02] border border-white/[0.06] px-3.5 py-2">
                <code className="min-w-0 flex-1 truncate font-mono text-[13px] text-slate-300">{pw}</code>
                <button onClick={() => copy(pw)} className="shrink-0 rounded-md p-1.5 text-slate-400 hover:text-amber-300" aria-label="Copy this password"><Icon name="copy" size={15} /></button>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-slate-600">History lives only in this tab's memory and vanishes when you close it. Nothing is ever sent to a server.</p>
        </div>
      )}
    </div>
  );
}
