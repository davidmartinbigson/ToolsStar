"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/icons";
import { uid } from "@/lib/utils";

/* ═══════════════════════════════════════════════════════════════════════════
   Calculator pack — Age, Percentage, GPA and Zakat.
   Pure arithmetic in the browser: nothing is sent anywhere, results update as
   you type (useMemo), and every number shown also explains its own formula so
   the visitor can verify it.
   ═══════════════════════════════════════════════════════════════════════════ */

const btnPrimary = "inline-flex items-center gap-2 rounded-2xl bg-amber-400 px-6 py-3 font-extrabold text-[#241a00] shadow-xl shadow-amber-500/20 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60";
const btnSmall = "inline-flex items-center gap-1.5 rounded-xl border border-white/12 bg-white/[0.04] px-3 py-2 text-xs font-bold text-slate-200 transition hover:border-amber-400/50 disabled:opacity-50";
const inputCls = "mt-2 w-full rounded-xl border border-white/10 bg-[#12152e] px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-amber-400/60 disabled:opacity-50";
const selectCls = "mt-2 w-full rounded-xl border border-white/10 bg-[#12152e] px-3 py-2.5 text-sm text-white outline-none focus:border-amber-400/60 disabled:opacity-50";
const labelCls = "text-sm font-semibold text-white";
const cardCls = "rounded-3xl border border-amber-400/20 bg-gradient-to-br from-amber-400/[0.12] to-white/[0.02] p-5";
const panelCls = "rounded-3xl border border-white/[0.08] bg-white/[0.02] p-5";
const noteCls = "mt-6 rounded-2xl border border-amber-400/20 bg-amber-400/[0.05] px-4 py-3 text-xs leading-relaxed text-amber-100";

function Stat({ label, value, hint }) {
  return (
    <div className={cardCls}>
      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-black tracking-tight text-white">{value}</p>
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}

function Row({ children, className = "" }) {
  return <div className={`mt-4 grid gap-4 sm:grid-cols-2 ${className}`}>{children}</div>;
}

const num = (value) => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const fmt = (value, digits = 2) =>
  Number.isFinite(value)
    ? value.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: digits })
    : "0";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/* Parse an <input type="date"> value as a LOCAL date (new Date("YYYY-MM-DD")
   would be midnight UTC and can land on the wrong day in Pakistan). */
function parseLocalDate(value) {
  if (!value) return null;
  const [y, m, d] = String(value).split("-").map(Number);
  if (!y || !m || !d) return null;
  const date = new Date(y, m - 1, d);
  return Number.isNaN(date.getTime()) ? null : date;
}

const toInputDate = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const longDate = (date) => `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;

/* ═══════════════════════════ AGE CALCULATOR ═══════════════════════════ */
function diffYmd(from, to) {
  let years = to.getFullYear() - from.getFullYear();
  let months = to.getMonth() - from.getMonth();
  let days = to.getDate() - from.getDate();
  if (days < 0) {
    months -= 1;
    // days left in the month BEFORE `to`
    days += new Date(to.getFullYear(), to.getMonth(), 0).getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  return { years, months, days };
}

function birthdayIn(year, dob) {
  // 29 February falls back to 28 February in non-leap years.
  const day = dob.getDate();
  const lastDay = new Date(year, dob.getMonth() + 1, 0).getDate();
  return new Date(year, dob.getMonth(), Math.min(day, lastDay));
}

export function AgeCalculator() {
  const today = useMemo(() => startOfDay(new Date()), []);
  const [dob, setDob] = useState("");
  const [atValue, setAtValue] = useState(toInputDate(today));

  const birth = parseLocalDate(dob);
  const at = parseLocalDate(atValue) || today;

  const result = useMemo(() => {
    if (!birth) return null;
    if (birth > at) return { future: true };

    const exact = diffYmd(birth, at);
    const msPerDay = 86400000;
    const totalDays = Math.round((startOfDay(at) - startOfDay(birth)) / msPerDay);

    const birthdayThisYear = birthdayIn(at.getFullYear(), birth);
    const nextBirthday = birthdayThisYear < startOfDay(at) ? birthdayIn(at.getFullYear() + 1, birth) : birthdayThisYear;
    const daysToBirthday = Math.round((startOfDay(nextBirthday) - startOfDay(at)) / msPerDay);
    const turningAge = nextBirthday.getFullYear() - birth.getFullYear();

    const eighteenth = birthdayIn(birth.getFullYear() + 18, birth);
    const bornOn = birth.toLocaleDateString("en-US", { weekday: "long" });

    return {
      future: false,
      ...exact,
      totalDays,
      totalWeeks: Math.floor(totalDays / 7),
      totalMonths: exact.years * 12 + exact.months,
      totalHours: totalDays * 24,
      totalMinutes: totalDays * 1440,
      decimalYears: totalDays / 365.2425,
      nextBirthday,
      daysToBirthday,
      turningAge,
      eighteenth,
      isAdult: startOfDay(at) >= startOfDay(eighteenth),
      bornOn,
    };
  }, [birth, at]);

  const setNow = () => setAtValue(toInputDate(startOfDay(new Date())));

  return (
    <div>
      <div className={panelCls}>
        <Row className="mt-0">
          <label htmlFor="age-dob" className={labelCls}>
            Date of birth
            <input id="age-dob" type="date" value={dob} max={toInputDate(today)} onChange={(e) => setDob(e.target.value)} className={inputCls} />
          </label>
          <div>
            <label htmlFor="age-at" className={labelCls}>
              Calculate age at
              <input id="age-at" type="date" value={atValue} onChange={(e) => setAtValue(e.target.value)} className={inputCls} />
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              <button type="button" onClick={setNow} className={btnSmall}><Icon name="clock" size={13} /> Today</button>
              <button type="button" onClick={() => { setDob(""); setAtValue(toInputDate(today)); }} className={btnSmall}><Icon name="refresh" size={13} /> Clear</button>
            </div>
          </div>
        </Row>
        <p className="mt-3 text-xs text-slate-500">
          Tip: “Calculate age at” is useful for forms asking your age on a specific date — an admission form, a job application or the date of an exam.
        </p>
      </div>

      {!result && (
        <p className="mt-6 rounded-2xl border border-white/[0.08] bg-white/[0.02] px-4 py-6 text-center text-sm text-slate-400">
          Enter a date of birth above and the exact age appears instantly.
        </p>
      )}

      {result?.future && (
        <p className="mt-6 rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-200" role="alert">
          The date of birth is after the “age at” date. Please check the years.
        </p>
      )}

      {result && !result.future && (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-live="polite">
            <Stat label="Exact age" value={`${result.years} yrs`} hint={`${result.months} months · ${result.days} days`} />
            <Stat label="Next birthday" value={`${result.daysToBirthday} days`} hint={`${longDate(result.nextBirthday)} — turning ${result.turningAge}`} />
            <Stat label="Total days lived" value={fmt(result.totalDays, 0)} hint={`${fmt(result.totalWeeks, 0)} weeks`} />
            <Stat label="Total months" value={fmt(result.totalMonths, 0)} hint={`${fmt(result.decimalYears, 2)} years exactly`} />
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Full breakdown", `${result.years} years, ${result.months} months, ${result.days} days`],
              ["Born on a", result.bornOn],
              ["Total hours", `${fmt(result.totalHours, 0)} hours`],
              ["Total minutes", `${fmt(result.totalMinutes, 0)} minutes`],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-white/[0.08] bg-white/[0.02] px-4 py-3 text-sm text-slate-300">
                <span className="block text-xs font-bold uppercase tracking-wider text-slate-500">{label}</span>
                <span className="mt-1 block font-semibold text-white">{value}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-emerald-400/25 bg-emerald-400/[0.06] px-4 py-3 text-sm text-slate-200">
              <strong className="text-white">18+ check (CNIC / vote / licence):</strong>{" "}
              {result.isAdult
                ? `Yes — turned 18 on ${longDate(result.eighteenth)}.`
                : `Not yet — turns 18 on ${longDate(result.eighteenth)}.`}
            </div>
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] px-4 py-3 text-sm text-slate-300">
              <strong className="text-white">Age on the selected date:</strong> {result.years}.{String(result.months).padStart(2, "0")}.{String(result.days).padStart(2, "0")} (Y.M.D format used by many forms)
            </div>
          </div>

          <p className={noteCls}>
            Age is counted in calendar years, months and days, so the last partial month uses that month's real number of days. A person born on 1 March turns a full month older on 1 April, not after 30 days.
          </p>
        </>
      )}
    </div>
  );
}

/* ═══════════════════════ PERCENTAGE CALCULATOR ═══════════════════════ */
const PCT_MODES = [
  ["of", "X% of a number", "What is 15% of 4,800?"],
  ["isWhat", "Number is what % of another", "420 is what % of 4,800?"],
  ["change", "Increase / decrease %", "Price went 4,000 → 4,800"],
  ["marks", "Marks to percentage", "Obtained 742 out of 1,100"],
  ["cgpa", "Percentage ⇄ CGPA", "Convert either way"],
];

const GRADE_BANDS = [
  [80, "A+ / A1 — Excellent"],
  [70, "A / A2 — Very good"],
  [60, "B — Good"],
  [50, "C — Average"],
  [40, "D — Below average"],
  [33, "E — Weak pass"],
  [0, "F — Fail"],
];

const gradeFor = (pct) => GRADE_BANDS.find(([min]) => pct >= min)?.[1] || "—";

export function PercentageCalculator() {
  const [mode, setMode] = useState("of");
  const [first, setFirst] = useState("15");
  const [second, setSecond] = useState("4800");
  const [copied, setCopied] = useState(false);

  const x = num(first);
  const y = num(second);

  const result = useMemo(() => {
    switch (mode) {
      case "of":
        return { main: `${fmt((x / 100) * y)}`, unit: "", label: `${fmt(x)}% of ${fmt(y, 0)}`, formula: `${fmt(y, 0)} × ${fmt(x)} ÷ 100 = ${fmt((x / 100) * y)}` };
      case "isWhat": {
        const pct = y !== 0 ? (x / y) * 100 : NaN;
        return { main: `${fmt(pct)}%`, unit: "", label: `${fmt(x)} as a share of ${fmt(y, 0)}`, formula: `${fmt(x)} ÷ ${fmt(y, 0)} × 100 = ${fmt(pct)}%`, invalid: y === 0 };
      }
      case "change": {
        const diff = y - x;
        const pct = x !== 0 ? (diff / Math.abs(x)) * 100 : NaN;
        return {
          main: `${pct >= 0 ? "+" : "−"}${fmt(Math.abs(pct))}%`,
          label: diff >= 0 ? "Increase" : "Decrease",
          formula: `(${fmt(y, 0)} − ${fmt(x, 0)}) ÷ ${fmt(x, 0)} × 100 = ${fmt(pct)}%`,
          extra: `Difference: ${fmt(Math.abs(diff))}`,
          invalid: x === 0,
        };
      }
      case "marks": {
        const pct = y !== 0 ? (x / y) * 100 : NaN;
        return {
          main: `${fmt(pct)}%`,
          label: gradeFor(pct),
          formula: `${fmt(x)} ÷ ${fmt(y, 0)} × 100 = ${fmt(pct)}%`,
          extra: `Lost marks: ${fmt(Math.max(0, y - x))} · CGPA estimate: ${fmt(pct / 25, 2)}`,
          invalid: y === 0,
        };
      }
      case "cgpa": {
        const cgpa = x / 9.5;
        const back = x * 9.5;
        return {
          main: `${fmt(cgpa, 2)} CGPA`,
          label: `If ${fmt(x)} is a percentage (÷ 9.5)`,
          formula: `${fmt(x)} ÷ 9.5 = ${fmt(cgpa, 2)} CGPA — and the other way: ${fmt(x)} CGPA × 9.5 = ${fmt(back)}%`,
          extra: `Out of 4.0 scale: ${fmt((cgpa / 10) * 4, 2)} / 4.00`,
        };
      }
      default:
        return null;
    }
  }, [mode, x, y]);

  const labels = {
    of: ["Percentage (%)", "Of the number"],
    isWhat: ["This number", "Is part of this number"],
    change: ["From (old value)", "To (new value)"],
    marks: ["Marks obtained", "Total marks"],
    cgpa: ["Percentage or CGPA", ""],
  }[mode];

  const copy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(`${result.label}: ${result.main}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch { /* clipboard blocked — the number is still on screen */ }
  };

  return (
    <div>
      <div className={panelCls}>
        <p className={labelCls}>What do you want to calculate?</p>
        <div className="mt-3 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {PCT_MODES.map(([value, title, example]) => (
            <button
              key={value}
              type="button"
              onClick={() => setMode(value)}
              aria-pressed={mode === value}
              className={`rounded-2xl border px-4 py-3 text-left transition ${mode === value ? "border-amber-400 bg-amber-400/10 text-white" : "border-white/10 bg-white/[0.02] text-slate-300 hover:border-white/25"}`}
            >
              <span className="block font-bold">{title}</span>
              <span className="text-xs text-slate-500">{example}</span>
            </button>
          ))}
        </div>

        <Row>
          <label htmlFor="pct-a" className={labelCls}>
            {labels[0]}
            <input id="pct-a" type="number" inputMode="decimal" value={first} onChange={(e) => setFirst(e.target.value)} className={inputCls} />
          </label>
          {labels[1] ? (
            <label htmlFor="pct-b" className={labelCls}>
              {labels[1]}
              <input id="pct-b" type="number" inputMode="decimal" value={second} onChange={(e) => setSecond(e.target.value)} className={inputCls} />
            </label>
          ) : (
            <p className="self-end pb-2 text-xs leading-relaxed text-slate-500">
              Enter a percentage to see its CGPA, or a CGPA-style number to see it multiplied by 9.5. Both directions are shown in the result.
            </p>
          )}
        </Row>
      </div>

      {result && (
        <div className="mt-6 rounded-3xl border border-emerald-400/25 bg-emerald-400/[0.06] p-6" aria-live="polite">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-300">{result.label}</p>
          <p className="mt-2 text-4xl font-black tracking-tight text-white sm:text-5xl">{result.main}</p>
          <p className="mt-3 font-mono text-xs text-slate-300">{result.formula}</p>
          {result.extra ? <p className="mt-1.5 text-xs text-slate-400">{result.extra}</p> : null}
          {result.invalid ? <p className="mt-2 text-xs font-semibold text-rose-300">The second value cannot be 0 — division by zero has no percentage answer.</p> : null}
          <button type="button" onClick={copy} className={`${btnSmall} mt-4`}>
            <Icon name={copied ? "check" : "copy"} size={13} /> {copied ? "Copied" : "Copy result"}
          </button>
        </div>
      )}

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        <div className={panelCls}>
          <h2 className="font-extrabold text-white">Marks grading reference</h2>
          <ul className="mt-3 space-y-1.5 text-sm text-slate-300">
            {GRADE_BANDS.map(([min, label]) => (
              <li key={label} className="flex justify-between gap-3 border-b border-white/[0.06] pb-1.5 last:border-0">
                <span>{label}</span><span className="font-bold text-amber-300">{min}%+</span>
              </li>
            ))}
          </ul>
        </div>
        <div className={panelCls}>
          <h2 className="font-extrabold text-white">Formulas used</h2>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed text-slate-300">
            <li><strong className="text-white">X% of Y</strong> — Y × X ÷ 100</li>
            <li><strong className="text-white">X is what % of Y</strong> — X ÷ Y × 100</li>
            <li><strong className="text-white">% change</strong> — (new − old) ÷ old × 100</li>
            <li><strong className="text-white">Marks %</strong> — obtained ÷ total × 100</li>
            <li><strong className="text-white">CGPA ⇄ %</strong> — percentage ÷ 9.5 (universities differ: some use CGPA ÷ 4 × 100)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════ GPA CALCULATOR ═══════════════════════════ */
const GRADE_POINTS = [
  ["A", 4.0], ["A-", 3.67], ["B+", 3.33], ["B", 3.0], ["B-", 2.67],
  ["C+", 2.33], ["C", 2.0], ["C-", 1.67], ["D+", 1.33], ["D", 1.0], ["F", 0.0],
];

const DEFAULT_COURSES = [
  { id: "c1", name: "Course 1", credits: 3, grade: "A" },
  { id: "c2", name: "Course 2", credits: 3, grade: "B+" },
  { id: "c3", name: "Course 3", credits: 2, grade: "A-" },
  { id: "c4", name: "Lab / Tutorial", credits: 1, grade: "A" },
];

const standingFor = (gpa) => {
  if (gpa >= 3.99) return "Perfect 4.00";
  if (gpa >= 3.7) return "Excellent — Dean's / President's list range";
  if (gpa >= 3.3) return "Very good";
  if (gpa >= 3.0) return "Good standing";
  if (gpa >= 2.5) return "Satisfactory";
  if (gpa >= 2.0) return "Pass — minimum graduation requirement at most universities";
  return "Below 2.0 — academic probation risk";
};

export function GpaCalculator() {
  const [courses, setCourses] = useState(DEFAULT_COURSES);
  const [prevCgpa, setPrevCgpa] = useState("");
  const [prevCredits, setPrevCredits] = useState("");

  const update = (id, key, value) => setCourses((rows) => rows.map((row) => (row.id === id ? { ...row, [key]: value } : row)));
  const remove = (id) => setCourses((rows) => rows.filter((row) => row.id !== id));
  const add = () => setCourses((rows) => [...rows, { id: uid(), name: `Course ${rows.length + 1}`, credits: 3, grade: "B" }]);
  const reset = () => { setCourses(DEFAULT_COURSES); setPrevCgpa(""); setPrevCredits(""); };

  const result = useMemo(() => {
    const rows = courses.map((row) => {
      const credits = Math.max(0, num(row.credits));
      const points = GRADE_POINTS.find(([g]) => g === row.grade)?.[1] ?? 0;
      return { ...row, credits, points, quality: credits * points };
    });
    const totalCredits = rows.reduce((sum, row) => sum + row.credits, 0);
    const totalQuality = rows.reduce((sum, row) => sum + row.quality, 0);
    const gpa = totalCredits > 0 ? totalQuality / totalCredits : 0;

    const prevC = Math.max(0, num(prevCredits));
    const prevG = Math.max(0, num(prevCgpa));
    const combinedCredits = totalCredits + prevC;
    const cumulative = combinedCredits > 0 ? (totalQuality + prevG * prevC) / combinedCredits : 0;

    return { rows, totalCredits, totalQuality, gpa, cumulative, combinedCredits, hasPrevious: prevC > 0 && prevG > 0 };
  }, [courses, prevCgpa, prevCredits]);

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-live="polite">
        <Stat label="Semester GPA" value={fmt(result.gpa)} hint={`Out of 4.00 · ${fmt(result.totalCredits, 0)} credit hours`} />
        <Stat label="Percentage equivalent" value={`${fmt((result.gpa / 4) * 100, 1)}%`} hint="GPA ÷ 4 × 100 (check your university's own rule)" />
        <Stat label={result.hasPrevious ? "New cumulative CGPA" : "Quality points"} value={result.hasPrevious ? fmt(result.cumulative) : fmt(result.totalQuality, 1)} hint={result.hasPrevious ? `Across ${fmt(result.combinedCredits, 0)} credit hours` : "Credit hours × grade points"} />
        <Stat label="Standing" value={result.gpa >= 3.7 ? "Excellent" : result.gpa >= 3 ? "Good" : result.gpa >= 2 ? "Pass" : "At risk"} hint={standingFor(result.gpa)} />
      </div>

      <section className="mt-8" aria-label="Courses">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-extrabold text-white">1. Your subjects this semester</h2>
            <p className="mt-1 text-sm text-slate-500">Set the credit hours from your course outline and pick the grade you expect (or already got).</p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={add} className={btnSmall}><Icon name="check" size={13} /> Add subject</button>
            <button type="button" onClick={reset} className={btnSmall}><Icon name="refresh" size={13} /> Reset</button>
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-3xl border border-white/[0.08]">
          <div className="hidden grid-cols-[1.8fr_0.7fr_0.9fr_0.9fr_36px] gap-3 bg-white/[0.05] px-4 py-3 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 md:grid">
            <span>Subject</span><span>Credits</span><span>Grade</span><span>Points</span><span />
          </div>
          <div className="divide-y divide-white/[0.06] bg-white/[0.015]">
            {result.rows.map((row) => (
              <div key={row.id} className="grid gap-3 px-4 py-3 md:grid-cols-[1.8fr_0.7fr_0.9fr_0.9fr_36px] md:items-center">
                <label className="text-xs text-slate-500 md:text-sm">
                  Subject
                  <input aria-label="Subject name" value={row.name} onChange={(e) => update(row.id, "name", e.target.value)} className={inputCls} />
                </label>
                <label className="text-xs text-slate-500 md:text-sm">
                  Credits
                  <input aria-label={`${row.name} credit hours`} type="number" min="0" max="30" step="0.5" value={row.credits} onChange={(e) => update(row.id, "credits", e.target.value)} className={inputCls} />
                </label>
                <label className="text-xs text-slate-500 md:text-sm">
                  Grade
                  <select aria-label={`${row.name} grade`} value={row.grade} onChange={(e) => update(row.id, "grade", e.target.value)} className={selectCls}>
                    {GRADE_POINTS.map(([g, p]) => <option key={g} value={g}>{g} — {p.toFixed(2)}</option>)}
                  </select>
                </label>
                <span className="text-sm font-bold text-amber-200">{fmt(row.quality, 2)} pts</span>
                <button type="button" onClick={() => remove(row.id)} aria-label={`Remove ${row.name}`} className="justify-self-end rounded-lg p-2 text-slate-500 hover:bg-rose-400/10 hover:text-rose-300"><Icon name="trash" size={16} /></button>
              </div>
            ))}
          </div>
        </div>
        {result.rows.length === 0 && (
          <p className="mt-3 text-sm text-slate-500">No subjects yet — click “Add subject”.</p>
        )}
      </section>

      <section className="mt-8" aria-label="Cumulative CGPA">
        <h2 className="text-xl font-extrabold text-white">2. Turn it into a cumulative CGPA (optional)</h2>
        <p className="mt-1 text-sm text-slate-500">Add the CGPA and total credit hours you already have from previous semesters.</p>
        <Row>
          <label htmlFor="gpa-prev" className={labelCls}>
            Previous CGPA (out of 4)
            <input id="gpa-prev" type="number" min="0" max="4" step="0.01" value={prevCgpa} onChange={(e) => setPrevCgpa(e.target.value)} placeholder="e.g. 3.42" className={inputCls} />
          </label>
          <label htmlFor="gpa-credits" className={labelCls}>
            Credit hours already completed
            <input id="gpa-credits" type="number" min="0" max="400" step="0.5" value={prevCredits} onChange={(e) => setPrevCredits(e.target.value)} placeholder="e.g. 66" className={inputCls} />
          </label>
        </Row>
        {result.hasPrevious && (
          <div className="mt-4 rounded-2xl border border-emerald-400/25 bg-emerald-400/[0.06] px-4 py-3 text-sm text-slate-200">
            <strong className="text-white">New CGPA after this semester: {fmt(result.cumulative)}</strong>{" "}
            <span className="font-mono text-xs text-slate-400">
              ({fmt(prevCgpa === "" ? 0 : num(prevCgpa) * num(prevCredits), 2)} + {fmt(result.totalQuality, 2)}) ÷ {fmt(result.combinedCredits, 0)} credits
            </span>
          </div>
        )}
      </section>

      <section className="mt-8" aria-label="Grading scale">
        <h2 className="text-xl font-extrabold text-white">Grading scale used</h2>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {GRADE_POINTS.map(([g, p]) => (
            <div key={g} className="rounded-2xl border border-white/[0.08] bg-white/[0.02] px-3 py-2.5 text-center">
              <p className="text-lg font-black text-white">{g}</p>
              <p className="text-xs text-amber-300">{p.toFixed(2)}</p>
            </div>
          ))}
        </div>
      </section>

      <p className={noteCls}>
        <strong>Formula:</strong> GPA = (credit hours × grade points) summed for every subject, divided by total credit hours. A 3-credit A (4.00) counts three times as much as a 1-credit lab. Some universities in Pakistan use slightly different point values (for example B- = 2.5 instead of 2.67) — always follow your own institution's grading policy for official results.
      </p>
    </div>
  );
}

/* ═══════════════════════════ ZAKAT CALCULATOR ═══════════════════════════ */
const TOLA_GRAMS = 11.664;
const NISAB_SILVER_GRAMS = 612.36; // 52.5 tola
const NISAB_GOLD_GRAMS = 87.48;    // 7.5 tola

const CURRENCIES = ["PKR", "USD", "GBP", "EUR", "AED", "SAR", "INR", "BDT"];

function money(value, currency) {
  if (!Number.isFinite(value)) return `${currency} 0`;
  try {
    return new Intl.NumberFormat("en-PK", { style: "currency", currency, maximumFractionDigits: 0 }).format(value);
  } catch {
    return `${currency} ${fmt(value, 0)}`;
  }
}

export function ZakatCalculator() {
  const [currency, setCurrency] = useState("PKR");
  const [unit, setUnit] = useState("tola");
  const [goldAmount, setGoldAmount] = useState("");
  const [goldRate, setGoldRate] = useState("");       // per tola or per gram, matching `unit`
  const [silverAmount, setSilverAmount] = useState("");
  const [silverRate, setSilverRate] = useState("");
  const [cash, setCash] = useState("");
  const [bank, setBank] = useState("");
  const [investments, setInvestments] = useState("");
  const [business, setBusiness] = useState("");
  const [receivables, setReceivables] = useState("");
  const [debts, setDebts] = useState("");
  const [basis, setBasis] = useState("silver");

  const result = useMemo(() => {
    const perGramGold = unit === "tola" ? num(goldRate) / TOLA_GRAMS : num(goldRate);
    const perGramSilver = unit === "tola" ? num(silverRate) / TOLA_GRAMS : num(silverRate);
    const goldGrams = unit === "tola" ? num(goldAmount) * TOLA_GRAMS : num(goldAmount);
    const silverGrams = unit === "tola" ? num(silverAmount) * TOLA_GRAMS : num(silverAmount);

    const goldValue = goldGrams * perGramGold;
    const silverValue = silverGrams * perGramSilver;
    const assets = goldValue + silverValue + num(cash) + num(bank) + num(investments) + num(business) + num(receivables);
    const net = assets - num(debts);

    const nisabGrams = basis === "silver" ? NISAB_SILVER_GRAMS : NISAB_GOLD_GRAMS;
    const nisabValue = basis === "silver" ? NISAB_SILVER_GRAMS * perGramSilver : NISAB_GOLD_GRAMS * perGramGold;
    const eligible = net >= nisabValue && nisabValue > 0;

    return {
      goldGrams, silverGrams, goldValue, silverValue, assets, net,
      nisabValue, nisabGrams, eligible,
      zakat: eligible ? net * 0.025 : 0,
      hasRates: perGramGold > 0 || perGramSilver > 0 || num(cash) + num(bank) + num(investments) + num(business) + num(receivables) > 0,
    };
  }, [unit, goldAmount, goldRate, silverAmount, silverRate, cash, bank, investments, business, receivables, debts, basis]);

  const clearAll = () => {
    setGoldAmount(""); setGoldRate(""); setSilverAmount(""); setSilverRate("");
    setCash(""); setBank(""); setInvestments(""); setBusiness(""); setReceivables(""); setDebts("");
  };

  const amountFields = [
    ["Cash at home / in hand", cash, setCash, "Currency notes and coins you own today"],
    ["Bank balance", bank, setBank, "Current, savings and any money you can withdraw"],
    ["Shares, bonds & investment funds", investments, setInvestments, "Current market value, not the price you paid"],
    ["Business stock & trade goods", business, setBusiness, "Inventory value at today's selling price, plus business cash"],
    ["Money others owe you (expected back)", receivables, setReceivables, "Only include amounts you genuinely expect to receive"],
    ["Debts & bills you must pay", debts, setDebts, "Loans, credit card balance, unpaid bills — subtracted from your total"],
  ];

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-live="polite">
        <Stat label="Zakat due (2.5%)" value={money(result.zakat, currency)} hint={result.eligible ? "Payable once your zakat year completes" : "Not payable yet — below nisab"} />
        <Stat label="Net zakatable wealth" value={money(result.net, currency)} hint={`Assets ${money(result.assets, currency)} − debts`} />
        <Stat label={`Nisab (${basis})`} value={money(result.nisabValue, currency)} hint={`${fmt(result.nisabGrams)} grams of ${basis}`} />
        <Stat label="Eligible?" value={result.eligible ? "Yes" : "No"} hint={result.eligible ? "Wealth is above the nisab threshold" : "Wealth is below the nisab threshold"} />
      </div>

      <section className="mt-8" aria-label="Gold and silver">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-extrabold text-white">1. Gold & silver you own</h2>
            <p className="mt-1 text-sm text-slate-500">Jewellery, coins and bars — at today's rate, not the price you paid years ago.</p>
          </div>
          <button type="button" onClick={clearAll} className={btnSmall}><Icon name="refresh" size={13} /> Clear everything</button>
        </div>

        <div className={panelCls}>
          <Row className="mt-0 sm:grid-cols-4">
            <label htmlFor="z-currency" className={labelCls}>Currency
              <select id="z-currency" value={currency} onChange={(e) => setCurrency(e.target.value)} className={selectCls}>
                {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
            <label htmlFor="z-unit" className={labelCls}>Weight unit
              <select id="z-unit" value={unit} onChange={(e) => setUnit(e.target.value)} className={selectCls}>
                <option value="tola">Tola (1 tola = 11.664 g)</option>
                <option value="gram">Grams</option>
              </select>
            </label>
            <label htmlFor="z-basis" className={labelCls}>Nisab based on
              <select id="z-basis" value={basis} onChange={(e) => setBasis(e.target.value)} className={selectCls}>
                <option value="silver">Silver — 612.36 g ★ (more people qualify)</option>
                <option value="gold">Gold — 87.48 g</option>
              </select>
            </label>
            <div className="self-end pb-1 text-xs leading-relaxed text-slate-500">
              Rates change daily. Enter your local jeweller's rate for the unit you selected above.
            </div>
          </Row>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
              <p className="font-bold text-amber-300">Gold</p>
              <Row>
                <label htmlFor="z-gold-amount" className={labelCls}>Quantity ({unit === "tola" ? "tola" : "grams"})
                  <input id="z-gold-amount" type="number" min="0" step="0.01" value={goldAmount} onChange={(e) => setGoldAmount(e.target.value)} placeholder="e.g. 3" className={inputCls} />
                </label>
                <label htmlFor="z-gold-rate" className={labelCls}>Rate per {unit === "tola" ? "tola" : "gram"}
                  <input id="z-gold-rate" type="number" min="0" step="1" value={goldRate} onChange={(e) => setGoldRate(e.target.value)} placeholder="Today's rate" className={inputCls} />
                </label>
              </Row>
              <p className="mt-3 text-xs text-slate-400">
                {fmt(result.goldGrams, 2)} g · value {money(result.goldValue, currency)}
              </p>
            </div>
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
              <p className="font-bold text-slate-200">Silver</p>
              <Row>
                <label htmlFor="z-silver-amount" className={labelCls}>Quantity ({unit === "tola" ? "tola" : "grams"})
                  <input id="z-silver-amount" type="number" min="0" step="0.01" value={silverAmount} onChange={(e) => setSilverAmount(e.target.value)} placeholder="e.g. 10" className={inputCls} />
                </label>
                <label htmlFor="z-silver-rate" className={labelCls}>Rate per {unit === "tola" ? "tola" : "gram"}
                  <input id="z-silver-rate" type="number" min="0" step="1" value={silverRate} onChange={(e) => setSilverRate(e.target.value)} placeholder="Today's rate" className={inputCls} />
                </label>
              </Row>
              <p className="mt-3 text-xs text-slate-400">
                {fmt(result.silverGrams, 2)} g · value {money(result.silverValue, currency)}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8" aria-label="Cash, savings and business">
        <h2 className="text-xl font-extrabold text-white">2. Cash, savings, business & debts</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {amountFields.map(([label, value, setter, hint]) => (
            <label key={label} className={panelCls}>
              <span className={labelCls}>{label}</span>
              <input
                type="number" min="0" step="1" value={value}
                onChange={(e) => setter(e.target.value)}
                placeholder={`${currency} 0`}
                className={inputCls}
                aria-label={label}
              />
              <span className="mt-2 block text-xs text-slate-500">{hint}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="mt-8" aria-label="Breakdown">
        <h2 className="text-xl font-extrabold text-white">3. How your amount was calculated</h2>
        <div className="mt-4 overflow-hidden rounded-3xl border border-white/[0.08]">
          <div className="divide-y divide-white/[0.06] bg-white/[0.015] text-sm">
            {[
              ["Gold value", money(result.goldValue, currency)],
              ["Silver value", money(result.silverValue, currency)],
              ["Cash + bank + investments + business + receivables", money(num(cash) + num(bank) + num(investments) + num(business) + num(receivables), currency)],
              ["Total assets", money(result.assets, currency)],
              ["Minus debts & bills", `− ${money(num(debts), currency)}`],
              ["Net zakatable wealth", money(result.net, currency)],
              [`Nisab threshold (${fmt(result.nisabGrams)} g ${basis})`, money(result.nisabValue, currency)],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4 px-4 py-3">
                <span className="text-slate-300">{label}</span>
                <span className="font-bold text-white">{value}</span>
              </div>
            ))}
            <div className="flex items-center justify-between gap-4 bg-emerald-400/[0.08] px-4 py-4">
              <span className="font-extrabold text-white">Zakat @ 2.5% of net wealth</span>
              <span className="text-xl font-black text-emerald-300">{money(result.zakat, currency)}</span>
            </div>
          </div>
        </div>
      </section>

      {!result.hasRates && (
        <p className="mt-4 text-sm text-slate-500">
          Fill in your gold/silver quantity and today's rate, or any cash and savings amount, and the zakat figure updates instantly.
        </p>
      )}

      <p className={noteCls}>
        <strong>Note:</strong> this is a general-purpose estimator using the widely accepted 2.5% (1/40th) rate on wealth held for one full lunar year, with nisab set at 612.36 g of silver or 87.48 g of gold. Rulings differ between schools of thought on items such as personal jewellery, agricultural produce, property bought for resale, provident funds and long-term loans. For your actual payment, confirm the details with a scholar you trust — and pay before your zakat anniversary passes.
      </p>
    </div>
  );
}
