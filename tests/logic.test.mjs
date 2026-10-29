// Regression suite for the pure logic behind the tools.
//
//   node tests/logic.test.mjs        (no framework, no extra dependencies)
//
// Everything here is executed against the REAL source files via
// tests/pureSource.mjs, so a test can never drift away from what ships.
// Browser-only tools (video, canvas, WebAssembly, MediaRecorder) are not
// covered — they need a real browser.

import { existsSync, readFileSync } from "node:fs";
import { calcPure, signPdfGeometry, wordCounter, utils, pngLogic, enhancePure, alphaPure, compressLadder, src } from "./pureSource.mjs";

let pass = 0;
const fails = [];
const ck = (name, cond, detail = "") => {
  if (cond) pass++;
  else fails.push(`${name}${detail ? " → " + detail : ""}`);
};
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const near = (a, b, e = 1e-6) => Math.abs(a - b) < e;

const calc = await calcPure();
const geo = await signPdfGeometry();
const { wcStats } = await wordCounter();
const u = await utils();
const png = await pngLogic();

/* ══════════════════════ 1. AGE CALCULATOR — date maths ══════════════════════
   Regression: diffYmd used to borrow only ONE month, so a birthday on the
   29th/30th/31st measured against 1 March produced negative days
   (e.g. 2023-01-31 → 2023-03-01 came out as "0y 1m -2d").               */

const D = (s) => calc.parseLocalDate(s);
const T = (s) => calc.toInputDate(D(s));

console.log("1. Age Calculator — parseLocalDate / toInputDate / longDate");
ck("parseLocalDate builds a LOCAL date (not UTC midnight)", D("2024-03-15").getHours() === 0 && D("2024-03-15").getDate() === 15);
ck("round-trips through the <input type=date> format", T("2024-03-15") === "2024-03-15" && T("2024-01-05") === "2024-01-05");
ck("empty / null → null", calc.parseLocalDate("") === null && calc.parseLocalDate(null) === null && calc.parseLocalDate(undefined) === null);
ck("garbage → null", calc.parseLocalDate("hello") === null && calc.parseLocalDate("2024-13") === null && calc.parseLocalDate("2024-03") === null);
ck("startOfDay zeroes the clock", calc.startOfDay(new Date(2024, 5, 15, 17, 33, 9)).getHours() === 0);
ck("longDate renders '15 March 2024'", calc.longDate(D("2024-03-15")) === "15 March 2024", calc.longDate(D("2024-03-15")));
ck("MONTHS has 12 entries", calc.MONTHS.length === 12 && calc.MONTHS[0] === "January");

console.log("2. Age Calculator — birthdayIn (leap-day and month-end clamping)");
ck("29 Feb stays 29 Feb in a leap year", T("2000-02-29") && calc.toInputDate(calc.birthdayIn(2024, D("2000-02-29"))) === "2024-02-29");
ck("29 Feb falls back to 28 Feb in a common year", calc.toInputDate(calc.birthdayIn(2023, D("2000-02-29"))) === "2023-02-28", calc.toInputDate(calc.birthdayIn(2023, D("2000-02-29"))));
ck("never yields an invalid date across many years", [2019, 2020, 2021, 2022, 2023, 2024, 2025, 2100].every((y) => !Number.isNaN(calc.birthdayIn(y, D("2000-02-29")).getTime())));

console.log("3. Age Calculator — diffYmd (THE regression)");
const KNOWN = [
  ["2000-01-01", "2000-01-01", [0, 0, 0]],
  ["2000-01-01", "2000-01-02", [0, 0, 1]],
  ["2000-06-15", "2024-06-15", [24, 0, 0]],
  ["2000-01-01", "2024-06-15", [24, 5, 14]],
  ["2000-12-31", "2024-06-15", [23, 5, 15]],
  ["2024-02-29", "2025-02-28", [1, 0, 0]],
  ["2023-01-31", "2023-03-01", [0, 1, 1]], // was "0y 1m -2d"
  ["2023-01-30", "2023-03-01", [0, 1, 1]], // was "0y 1m -1d"
  ["2024-01-31", "2024-03-01", [0, 1, 1]], // was "0y 1m -1d" (leap Feb)
];
for (const [a, b, want] of KNOWN) {
  const r = calc.diffYmd(D(a), D(b));
  ck(`diffYmd ${a} → ${b} = ${want[0]}y ${want[1]}m ${want[2]}d`, eq([r.years, r.months, r.days], want), `got ${r.years}y ${r.months}m ${r.days}d`);
}

// Independent oracle for clamped month addition (the standard convention).
function addMonthsClamped(date, months) {
  const first = new Date(date.getFullYear(), date.getMonth() + months, 1);
  const lastDay = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  return new Date(first.getFullYear(), first.getMonth(), Math.min(date.getDate(), lastDay));
}

console.log("   exhaustive sweep: range, reconstruction and minimality");
const DAYS = [1, 15, 28, 29, 30, 31];
let swept = 0;
const rangeBad = [], reconBad = [], minBad = [];
for (let y = 2021; y <= 2024; y++) {
  for (let m = 0; m < 12; m++) {
    for (const d1 of DAYS) {
      const from = new Date(y, m, d1);
      if (from.getDate() !== d1) continue;
      for (let y2 = y; y2 <= 2026; y2++) {
        for (let m2 = 0; m2 < 12; m2++) {
          for (const d2 of DAYS) {
            const to = new Date(y2, m2, d2);
            if (to.getDate() !== d2 || to < from) continue;
            const r = calc.diffYmd(from, to);
            swept++;
            const tag = `${calc.toInputDate(from)}→${calc.toInputDate(to)}=${r.years}y${r.months}m${r.days}d`;
            if (r.years < 0 || r.months < 0 || r.days < 0 || r.months > 11 || r.days > 31) {
              if (rangeBad.length < 5) rangeBad.push(tag);
            }
            // Clamped month-addition is NOT associative (29 Feb 2024 + 12m =
            // 28 Feb 2025, + 1m = 28 Mar 2025; but + 13m in one step = 29 Mar),
            // so the oracle walks the same way an age calculator does: whole
            // years first, then whole months from that anniversary.
            // Whole years are jumped in ONE step from the start date (so a
            // 29 Feb birthday lands back on 29 Feb in the next leap year),
            // then whole months are jumped in one step from that anniversary.
            const anniversary = addMonthsClamped(from, r.years * 12);
            const base = addMonthsClamped(anniversary, r.months);
            const rec = new Date(base.getFullYear(), base.getMonth(), base.getDate() + r.days);
            if (rec.getTime() !== to.getTime() && reconBad.length < 5) reconBad.push(tag);
            // Minimal: taking one more month from the anniversary overshoots.
            if (addMonthsClamped(anniversary, r.months + 1) <= to && minBad.length < 5) minBad.push(tag);
          }
        }
      }
    }
  }
}
console.log(`   swept ${swept.toLocaleString("en-US")} date pairs`);
ck(`all ${swept} pairs stay in range (no negative days/months)`, rangeBad.length === 0, rangeBad.join(", "));
ck("all pairs reconstruct exactly (from + years/months/days === to)", reconBad.length === 0, reconBad.join(", "));
ck("all pairs are minimal (one more month would overshoot the anniversary)", minBad.length === 0, minBad.join(", "));

/* ═════════════════ 4. PERCENTAGE / GPA / ZAKAT domain constants ═════════════ */

console.log("\n4. Percentage Calculator — grade bands");
for (const [pct, prefix] of [[100, "A+"], [80, "A+"], [79.99, "A /"], [70, "A /"], [69.9, "B"], [60, "B"],
                             [59, "C"], [50, "C"], [49, "D"], [40, "D"], [39, "E"], [33, "E"], [32.9, "F"], [0, "F"]]) {
  ck(`gradeFor(${pct}) starts with "${prefix}"`, calc.gradeFor(pct).startsWith(prefix), calc.gradeFor(pct));
}
ck("bands are ordered descending and reach 0", calc.GRADE_BANDS[0][0] === 80 && calc.GRADE_BANDS.at(-1)[0] === 0);
ck("five percentage modes exist", calc.PCT_MODES.length === 5 && calc.PCT_MODES.every((m) => m.length === 3));

console.log("5. GPA Calculator");
const GP = Object.fromEntries(calc.GRADE_POINTS);
ck("11 grade options A…F", calc.GRADE_POINTS.length === 11, String(calc.GRADE_POINTS.length));
ck("A=4.00, A-=3.67, B+=3.33, B=3.00, C=2.00, F=0", GP.A === 4 && GP["A-"] === 3.67 && GP["B+"] === 3.33 && GP.B === 3 && GP.C === 2 && GP.F === 0);
ck("grade points are monotonically non-increasing", calc.GRADE_POINTS.every((g, i, a) => i === 0 || g[1] <= a[i - 1][1]));
for (const [gpa, want] of [[4.0, "Perfect"], [3.99, "Perfect"], [3.98, "Excellent"], [3.7, "Excellent"],
                           [3.69, "Very good"], [3.3, "Very good"], [3.29, "Good"], [3.0, "Good"],
                           [2.99, "Satisfactory"], [2.5, "Satisfactory"], [2.49, "Pass"], [2.0, "Pass"], [1.99, "probation"]]) {
  ck(`standingFor(${gpa}) → "${want}"`, calc.standingFor(gpa).includes(want), calc.standingFor(gpa));
}
const weighted = (courses) => {
  const tc = courses.reduce((s, c) => s + c.credits, 0);
  return tc ? courses.reduce((s, c) => s + c.credits * (GP[c.grade] ?? 0), 0) / tc : 0;
};
ck("weighted GPA uses credits, not a plain average",
  near(weighted([{ credits: 3, grade: "A" }, { credits: 1, grade: "F" }]), 3.0, 1e-9),
  String(weighted([{ credits: 3, grade: "A" }, { credits: 1, grade: "F" }])));
ck("zero credits → 0, never NaN", weighted([]) === 0 && Number.isFinite(weighted([])));
ck("default sample courses are valid", calc.DEFAULT_COURSES.every((c) => c.credits > 0 && GP[c.grade] !== undefined));

console.log("6. Zakat Calculator");
ck("1 tola = 11.664 g", calc.TOLA_GRAMS === 11.664);
ck("silver nisab is exactly 52.5 tola", near(52.5 * calc.TOLA_GRAMS, calc.NISAB_SILVER_GRAMS, 1e-9), `${52.5 * calc.TOLA_GRAMS} vs ${calc.NISAB_SILVER_GRAMS}`);
ck("gold nisab is exactly 7.5 tola", near(7.5 * calc.TOLA_GRAMS, calc.NISAB_GOLD_GRAMS, 1e-9), `${7.5 * calc.TOLA_GRAMS} vs ${calc.NISAB_GOLD_GRAMS}`);
ck("gold nisab < silver nisab (correct ordering)", calc.NISAB_GOLD_GRAMS < calc.NISAB_SILVER_GRAMS);
ck("8 currencies offered", calc.CURRENCIES.length === 8, calc.CURRENCIES.join(","));
ck("2.5% rate arithmetic", 100000 * 0.025 === 2500);
ck("money() groups thousands", calc.money(250000, "USD").includes("250,000"), calc.money(250000, "USD"));
ck("money(NaN) degrades to a zero string, never 'NaN'", !calc.money(NaN, "USD").includes("NaN"), calc.money(NaN, "USD"));
ck("money() survives an unknown currency", typeof calc.money(5, "XYZ") === "string" && !calc.money(5, "XYZ").includes("NaN"));

console.log("7. num() / fmt() input coercion");
for (const [input, want] of [["12.5", 12.5], ["", 0], ["abc", 0], [undefined, 0], [null, 0], [NaN, 0], ["1e3", 1000], ["-5", -5], ["  7  ", 7], [Infinity, 0]]) {
  ck(`num(${JSON.stringify(input)}) = ${want}`, calc.num(input) === want, String(calc.num(input)));
}
ck("num never returns NaN/Infinity", [NaN, Infinity, -Infinity, "x", ""].every((v) => Number.isFinite(calc.num(v))));
ck("fmt groups and rounds", calc.fmt(1234.5678) === "1,234.57", calc.fmt(1234.5678));
ck("fmt honours a digits argument", calc.fmt(1000, 0) === "1,000", calc.fmt(1000, 0));
ck("fmt(Infinity/NaN) → '0'", calc.fmt(Infinity) === "0" && calc.fmt(NaN) === "0");

/* ═════════════ 8. SignPdf — visual ⇄ user-space coordinate transform ════════
   Regression: the R=180 branch returned `y: H - vy`, which mirrors the
   signature vertically — a mark placed at the visual top landed at the
   bottom of the page. Verified by an independent forward mapping.          */

console.log("\n8. Sign PDF — pageGeometry");
const mkPage = (W, H, angle) => ({ getSize: () => ({ width: W, height: H }), getRotation: () => ({ angle }) });
for (const [W, H, R, eVW, eVH] of [[595, 842, 0, 595, 842], [595, 842, 90, 842, 595], [595, 842, 180, 595, 842],
                                   [595, 842, 270, 842, 595], [800, 600, 90, 600, 800], [800, 600, 180, 800, 600]]) {
  const g = geo.pageGeometry(mkPage(W, H, R));
  ck(`pageGeometry ${W}x${H}@${R}° → VW=${eVW} VH=${eVH}`, g.VW === eVW && g.VH === eVH, `got ${g.VW}x${g.VH}`);
}
ck("pageGeometry normalises out-of-range rotation (-90 → 270)", geo.pageGeometry(mkPage(595, 842, -90)).R === 270);
ck("pageGeometry normalises 450 → 90", geo.pageGeometry(mkPage(595, 842, 450)).R === 90);

// Independent oracle: PDF user space (origin bottom-left, y up) → what the
// viewer shows (origin top-left, y down) after rotating the page R° clockwise.
function mediaToVisual(ux, uy, W, H, R) {
  const X = ux, Y = H - uy;
  if (R === 90) return { vx: H - Y, vy: X };
  if (R === 180) return { vx: W - X, vy: H - Y };
  if (R === 270) return { vx: Y, vy: W - X };
  return { vx: X, vy: Y };
}

console.log("9. Sign PDF — visualToUser round-trip (400 random points per rotation)");
for (const R of [0, 90, 180, 270]) {
  const W = 595.28, H = 841.89; // A4
  const g = geo.pageGeometry(mkPage(W, H, R));
  let worst = 0, at = null;
  for (let i = 0; i < 400; i++) {
    const vx = Math.random() * g.VW, vy = Math.random() * g.VH;
    const p = geo.visualToUser(vx, vy, g);
    const back = mediaToVisual(p.x, p.y, W, H, R);
    const err = Math.hypot(back.vx - vx, back.vy - vy);
    if (err > worst) { worst = err; at = { vx, vy, p, back }; }
  }
  ck(`visualToUser round-trips at R=${R}°`, worst < 1e-6,
     at ? `max error ${worst.toFixed(2)}pt at visual(${at.vx.toFixed(0)},${at.vy.toFixed(0)}) → user(${at.p.x.toFixed(0)},${at.p.y.toFixed(0)}) → visual(${at.back.vx.toFixed(0)},${at.back.vy.toFixed(0)})` : "");
}
console.log("   corners (where a signature box actually lands)");
for (const R of [0, 90, 180, 270]) {
  const W = 595.28, H = 841.89;
  const g = geo.pageGeometry(mkPage(W, H, R));
  for (const [label, vx, vy] of [["top-left", 0, 0], ["top-right", g.VW, 0], ["bottom-left", 0, g.VH], ["bottom-right", g.VW, g.VH]]) {
    const p = geo.visualToUser(vx, vy, g);
    const back = mediaToVisual(p.x, p.y, W, H, R);
    ck(`R=${R}° ${label} maps back onto itself`, near(back.vx, vx) && near(back.vy, vy),
       `visual(${vx.toFixed(0)},${vy.toFixed(0)}) → visual(${back.vx.toFixed(0)},${back.vy.toFixed(0)})`);
  }
}
ck("every rotation returns a legal rotate value", [0, 90, 180, 270].every((R) =>
  [-90, 0, 90, 180].includes(geo.visualToUser(10, 10, geo.pageGeometry(mkPage(595, 842, R))).rotate)));
ck("user-space output always stays inside the media box", [0, 90, 180, 270].every((R) => {
  const W = 595.28, H = 841.89, g = geo.pageGeometry(mkPage(W, H, R));
  for (let i = 0; i < 200; i++) {
    const p = geo.visualToUser(Math.random() * g.VW, Math.random() * g.VH, g);
    if (p.x < -1e-6 || p.x > W + 1e-6 || p.y < -1e-6 || p.y > H + 1e-6) return false;
  }
  return true;
}));

/* ══════════════════════ 10. lib/utils.js shared helpers ═════════════════════
   Regression: formatBytes(NaN) returned the literal string "NaN undefined"
   because Math.log(NaN) → NaN → sizes[NaN] → undefined.                   */

console.log("\n10. formatBytes");
ck("formatBytes(0) = '0 B'", u.formatBytes(0) === "0 B", u.formatBytes(0));
ck("formatBytes(null/undefined) = '0 B'", u.formatBytes(null) === "0 B" && u.formatBytes(undefined) === "0 B");
ck("formatBytes(NaN) never prints NaN or undefined", !/NaN|undefined/.test(u.formatBytes(NaN)), u.formatBytes(NaN));
ck("formatBytes(-1024) never prints NaN or undefined", !/NaN|undefined/.test(u.formatBytes(-1024)), u.formatBytes(-1024));
ck("formatBytes(Infinity) never prints undefined", !/undefined/.test(u.formatBytes(Infinity)), u.formatBytes(Infinity));
ck("formatBytes(1024) = '1.00 KB'", u.formatBytes(1024) === "1.00 KB", u.formatBytes(1024));
ck("formatBytes(1048576) = '1.00 MB'", u.formatBytes(1048576) === "1.00 MB", u.formatBytes(1048576));
ck("formatBytes(1073741824) = '1.00 GB'", u.formatBytes(1073741824) === "1.00 GB", u.formatBytes(1073741824));
ck("honours the decimals argument", u.formatBytes(1536, 1) === "1.5 KB", u.formatBytes(1536, 1));
ck("248 MB video reads sensibly", u.formatBytes(248 * 1024 * 1024).endsWith("MB"), u.formatBytes(248 * 1024 * 1024));
ck("never exceeds the GB unit for huge values", u.formatBytes(5 * 1024 ** 4).endsWith("GB"), u.formatBytes(5 * 1024 ** 4));

console.log("11. savedPct");
ck("savedPct(100,50) = 50", u.savedPct(100, 50) === 50);
ck("savedPct(100,100) = 0", u.savedPct(100, 100) === 0);
ck("clamps a LARGER output to 0 (never a negative saving)", u.savedPct(100, 150) === 0, String(u.savedPct(100, 150)));
ck("no divide-by-zero", u.savedPct(0, 10) === 0 && Number.isFinite(u.savedPct(0, 10)));
ck("null/undefined after → 0", u.savedPct(100, null) === 0 && u.savedPct(100, undefined) === 0);
ck("248 MB → 21 MB reads as 92%", u.savedPct(248 * 1024 * 1024, 21 * 1024 * 1024) === 92, String(u.savedPct(248 * 1024 * 1024, 21 * 1024 * 1024)));

console.log("12. stripExt / fitWithin / uid");
ck("stripExt('photo.png') = 'photo'", u.stripExt("photo.png") === "photo");
ck("stripExt keeps inner dots", u.stripExt("my.report.final.png") === "my.report.final", u.stripExt("my.report.final.png"));
ck("stripExt('noext') = 'noext'", u.stripExt("noext") === "noext");
ck("stripExt('') = ''", u.stripExt("") === "");
for (const [w, h, max, ew, eh] of [[1000, 500, 100, 100, 50], [500, 1000, 100, 50, 100], [1920, 1080, 1280, 1280, 720],
                                   [100, 100, 500, 100, 100], [800, 600, 0, 800, 600]]) {
  const r = u.fitWithin(w, h, max);
  ck(`fitWithin(${w},${h},${max}) = ${ew}x${eh}`, r.width === ew && r.height === eh, JSON.stringify(r));
}
ck("fitWithin respects the cap and preserves aspect", (() => {
  const r = u.fitWithin(4000, 3000, 800);
  return Math.max(r.width, r.height) <= 800 && near(r.width / r.height, 4 / 3, 0.01);
})());
ck("fitWithin never upscales", eq(u.fitWithin(50, 40, 1000), { width: 50, height: 40 }), JSON.stringify(u.fitWithin(50, 40, 1000)));
ck("uid is unique across 1000 calls", new Set(Array.from({ length: 1000 }, () => u.uid())).size === 1000);

/* ══════════════════════════ 13. Word Counter ═══════════════════════════════ */

console.log("\n13. Word Counter");
const t1 = "The quick brown fox jumps over the lazy dog. The fox runs fast!";
const s1 = wcStats(t1);
ck("counts words", s1.words === 13, String(s1.words));
ck("counts characters with spaces", s1.chars === t1.length);
ck("counts characters without spaces", s1.charsNoSpace === t1.replace(/\s/g, "").length);
ck("counts sentences", s1.sentences === 2, String(s1.sentences));
ck("counts paragraphs", s1.paragraphs === 1, String(s1.paragraphs));
ck("avg sentence = words/sentences", near(s1.avgSentence, 13 / 2, 1e-9));
ck("reading time = words/200", near(s1.readingMin, 13 / 200, 1e-9));
ck("speaking time = words/130", near(s1.speakingMin, 13 / 130, 1e-9));
ck("finds the longest word", s1.longest.length === 5);
ck("filters stop words out of the keyword list", !s1.top.some(([w]) => w === "the"), JSON.stringify(s1.top));
ck("counts keyword frequency", s1.top.some(([w, n]) => w === "fox" && n === 2), JSON.stringify(s1.top));
ck("caps the keyword list at 8", s1.top.length <= 8);
const e = wcStats("");
ck("empty text → zeros, no NaN/Infinity", e.words === 0 && e.chars === 0 && e.sentences === 0 && e.paragraphs === 0
  && e.avgSentence === 0 && Number.isFinite(e.readingMin) && Number.isFinite(e.speakingMin) && e.longest === "" && e.top.length === 0);
ck("whitespace-only → 0 words and 0 paragraphs", wcStats("   \n\n  \t ").words === 0 && wcStats("   \n\n  \t ").paragraphs === 0);
ck("collapses repeated spaces between words", wcStats("too    many     spaces   between   words").words === 5);
ck("counts multiple paragraphs", wcStats("One.\n\nTwo.\n\n\nThree.").paragraphs === 3, String(wcStats("One.\n\nTwo.\n\n\nThree.").paragraphs));
ck("counts unicode words", wcStats("زکات کیلکولیٹر مفت آن لائن").words === 5, String(wcStats("زکات کیلکولیٹر مفت آن لائن").words));

/* ═════════ 14. PNG engine — palette maths, colour census, honest copy ═══════
   The user-reported "PNG Compressor gives 0%" had two independent causes:
   (a) a genuine 0% on PNGs that are already palette-encoded, reported with the
       same vague wording as (b) the engine failing to load and the browser
       fallback producing a LARGER file. Both are now distinguishable.        */

console.log("\n14. PNG — pngColorsForQuality");
ck("quality 100 → 256 colours", png.pngColorsForQuality(100) === 256);
ck("quality 96 → 256 colours", png.pngColorsForQuality(96) === 256);
ck("quality 80 → 205 colours (the documented default)", png.pngColorsForQuality(80) === 205, String(png.pngColorsForQuality(80)));
ck("never drops below a 16-colour palette", [0, 1, 2, 5, 6, 7, 8, 10, 50].every((q) => png.pngColorsForQuality(q) >= 16));
ck("low quality floors at exactly 16 colours", [0, 1, 2, 5, 6].every((q) => png.pngColorsForQuality(q) === 16), [0, 1, 2, 5, 6].map((q) => png.pngColorsForQuality(q)).join(","));
ck("never exceeds 256", [100, 200, 1e6].every((q) => png.pngColorsForQuality(q) <= 256));
ck("monotonic in quality", Array.from({ length: 100 }, (_, i) => png.pngColorsForQuality(i + 1))
  .every((v, i, a) => i === 0 || v >= a[i - 1]));

console.log("15. PNG — countColours (the colour census behind the 0% message)");
const rgbaOf = (cols, repeats) => {
  const out = new Uint8ClampedArray(cols.length * repeats * 4);
  for (let r = 0; r < repeats; r++) cols.forEach(([R, G, B, A], i) => {
    const o = (r * cols.length + i) * 4;
    out[o] = R; out[o + 1] = G; out[o + 2] = B; out[o + 3] = A;
  });
  return out;
};
const four = png.countColours(rgbaOf([[0, 0, 0, 255], [255, 0, 0, 255], [0, 255, 0, 255], [0, 0, 255, 255]], 40));
ck("counts 4 distinct colours exactly", eq(four, { exact: true, count: 4 }), JSON.stringify(four));
const solid = png.countColours(rgbaOf([[12, 34, 56, 255]], 1000));
ck("a solid fill is 1 colour", eq(solid, { exact: true, count: 1 }), JSON.stringify(solid));
const alpha = png.countColours(rgbaOf([[10, 20, 30, 255], [10, 20, 30, 128]], 5));
ck("alpha is part of the key (transparency is not merged away)", eq(alpha, { exact: true, count: 2 }), JSON.stringify(alpha));
const distinct = (n) => {
  const out = new Uint8ClampedArray(n * 4);
  for (let i = 0; i < n; i++) { out[i * 4] = i & 255; out[i * 4 + 1] = (i >> 8) & 255; out[i * 4 + 2] = (i >> 4) & 255; out[i * 4 + 3] = 255; }
  return out;
};
const many = png.countColours(distinct(4000));
ck("bails out early instead of counting millions of photo colours", many.exact === false && many.count === 513, JSON.stringify(many));
ck("the census stops at the cap, not at the end of the image", png.countColours(distinct(100000)).count === 513);
ck("a 256-shade greyscale ramp is still counted exactly", eq(png.countColours(distinct(256)), { exact: true, count: 256 }), JSON.stringify(png.countColours(distinct(256))));
ck("the census cap is above 256 so real palette PNGs are reported exactly", png.countColours(rgbaOf(Array.from({ length: 256 }, (_, i) => [i, i, i, 255]), 3)).exact === true);
ck("empty data → 0 colours, exact", eq(png.countColours(new Uint8ClampedArray(0)), { exact: true, count: 0 }));

console.log("16. PNG — noSavingsNote (must never look like a broken tool)");
const NOTES = [
  ["jpg output", png.noSavingsNote({ type: "image/jpeg", strategy: "smart", colours: null })],
  ["png lossless", png.noSavingsNote({ type: "image/png", strategy: "lossless", colours: null })],
  ["png smart, 4 colours", png.noSavingsNote({ type: "image/png", strategy: "smart", colours: { exact: true, count: 4 } })],
  ["png smart, 1 colour", png.noSavingsNote({ type: "image/png", strategy: "smart", colours: { exact: true, count: 1 } })],
  ["png smart, 256 colours", png.noSavingsNote({ type: "image/png", strategy: "smart", colours: { exact: true, count: 256 } })],
  ["png smart, 300 colours", png.noSavingsNote({ type: "image/png", strategy: "smart", colours: { exact: true, count: 300 } })],
  ["png smart, census unavailable", png.noSavingsNote({ type: "image/png", strategy: "smart", colours: { exact: false, count: 513 } })],
  ["png smart, no census", png.noSavingsNote({ type: "image/png", strategy: "smart", colours: null })],
];
for (const [label, note] of NOTES) {
  ck(`${label}: is a non-empty sentence`, typeof note === "string" && note.length > 30, String(note));
  ck(`${label}: names an actionable lever`, /resize|dimension|webp|smart png/i.test(note), note);
  ck(`${label}: never claims a saving`, !/saved|\d+%|success/i.test(note), note);
  ck(`${label}: never leaks undefined/NaN`, !/undefined|NaN|\[object/.test(note), note);
}
ck("a 4-colour PNG says WHY: '4 distinct colours'", /4 distinct colours/.test(png.noSavingsNote({ type: "image/png", strategy: "smart", colours: { exact: true, count: 4 } })));
ck("1 colour is grammatically singular", /1 distinct colour[^s]/.test(png.noSavingsNote({ type: "image/png", strategy: "smart", colours: { exact: true, count: 1 } })));
ck("lossless mode points at Smart PNG", /smart png/i.test(png.noSavingsNote({ type: "image/png", strategy: "lossless", colours: null })));
ck("the two 0% causes read differently (lossless vs palette)",
  png.noSavingsNote({ type: "image/png", strategy: "lossless", colours: null }) !==
  png.noSavingsNote({ type: "image/png", strategy: "smart", colours: { exact: true, count: 4 } }));
ck("non-PNG output does not talk about palettes", !/palette|colours/.test(png.noSavingsNote({ type: "image/jpeg", strategy: "smart", colours: null })));

console.log("17. PNG — every engine lists a mirror on a different host");
for (const [name, sources] of [["PAKO_SRCS", png.PAKO_SRCS], ["UPNG_SRCS", png.UPNG_SRCS]]) {
  const hosts = new Set(sources.map((s) => new URL(s).host));
  ck(`${name} has ≥2 sources`, sources.length >= 2, sources.join(", "));
  ck(`${name} spans ≥2 distinct CDN hosts`, hosts.size >= 2, [...hosts].join(", "));
  ck(`${name} are all https`, sources.every((s) => s.startsWith("https://")));
  ck(`${name} pin an exact version`, sources.every((s) => /\d+\.\d+\.\d+/.test(s)));
}

/* ═══════════════ 18. friendlyError — no raw internals in the UI ═════════════ */

console.log("\n18. friendlyError");
const FE = [
  ["a password-protected PDF", "Error: InvalidPDFException: Password required to decrypt", /password-protected/i],
  ["a blocked CDN download", "A required library failed to download. Check your connection or ad-blocker.", /could not be downloaded/i],
  ["a network failure", "TypeError: Failed to fetch", /could not be downloaded/i],
  ["an oversized file", "QuotaExceededError: storage quota exceeded", /too large/i],
  ["a denied permission", "NotAllowedError: Permission denied by user", /browser blocked|permission/i],
  ["a tainted canvas", "SecurityError: The canvas has been tainted", /security reasons/i],
  ["a cancelled job", "AbortError: The operation was aborted", /cancelled/i],
  ["an un-drawable glyph", "WinAnsi cannot encode U+0627", /cannot draw/i],
];
for (const [label, message, want] of FE) {
  ck(`${label} → actionable text`, want.test(u.friendlyError(new Error(message))), u.friendlyError(new Error(message)));
}
ck("an empty error uses the fallback", u.friendlyError(new Error("")) === "Something went wrong. Please try again.");
ck("null/undefined use the fallback", u.friendlyError(null) === "Something went wrong. Please try again." && u.friendlyError(undefined) === "Something went wrong. Please try again.");
ck("a caller-supplied fallback wins over the default", u.friendlyError(new Error(""), "Resize failed.") === "Resize failed.");
ck("a short real message passes through verbatim", u.friendlyError(new Error("No pages matched")) === "No pages matched");
ck("a 300-char stack fragment is replaced, not shown", u.friendlyError(new Error("x".repeat(300))).length < 180, String(u.friendlyError(new Error("x".repeat(300))).length));
ck("a thrown string (not an Error) is handled", u.friendlyError("boom") === "boom");
ck("an object without a message does not render [object Object]", !/\[object Object\]/.test(u.friendlyError({})));
ck("never returns an empty string", ["", null, undefined, {}, new Error(""), 0, false].every((v) => u.friendlyError(v).length > 0));
ck("'unsupported image format' is NOT misreported as a font problem", !/font cannot draw/i.test(u.friendlyError(new Error("unsupported image format"))), u.friendlyError(new Error("unsupported image format")));

/* ══════ 19. Config guard: every CDN origin used in code must be preconnected ═
   Regression: components load pako/UPNG/lamejs/gif.js from cdnjs.cloudflare.com
   but CDN_ORIGINS only listed esm.sh and cdn.jsdelivr.net.                 */

console.log("\n19. CDN preconnect coverage");
const site = await import("data:text/javascript," + encodeURIComponent(src("lib/site.js")));
const hostsUsed = new Set();
for (const rel of ["components/tools/ImageCompressor.js", "components/tools/audioPack.js", "components/tools/videoPack.js",
                   "components/tools/imageDevPack.js", "components/tools/quickTools.js", "components/tools/pdfTools.js",
                   "components/tools/miscPack2.js", "components/tools/BackgroundRemover.js", "components/tools/ImageEnhancer.js",
                   "components/tools/growthTools.js", "components/tools/pdfEssentials.js", "components/tools/SignPdf.js"]) {
  for (const m of src(rel).matchAll(/https:\/\/([a-z0-9.-]+)\//g)) hostsUsed.add(m[1]);
}
const preconnected = new Set(site.CDN_ORIGINS.map((o) => new URL(o).host));
console.log(`   hosts used by tools: ${[...hostsUsed].sort().join(", ")}`);
console.log(`   preconnected       : ${[...preconnected].sort().join(", ")}`);
for (const host of hostsUsed) {
  ck(`${host} is preconnected`, preconnected.has(host), `add it to CDN_ORIGINS in lib/site.js`);
}
ck("CDN_ORIGINS are all https", site.CDN_ORIGINS.every((o) => o.startsWith("https://")));

/* ═════════ 20. Editorial layer — the AdSense "content depth" bar ════════════
   Tool-only sites are the category most often rejected for "low value
   content", so the guides are part of the product now. These assertions keep
   them honest: substantial length, real structure, a working link to the tool
   they cover, alt text on every image, and no forbidden geo wording.         */

console.log("\n20. Editorial layer (blog)");
const { ARTICLES, getArticle, relatedArticles } = await import("../lib/articles.js");
const { TOOLS } = await import("../lib/tools.js");
const toolSlugs = new Set(TOOLS.map((t) => t.slug));

ck("the blog has at least 10 guides", ARTICLES.length >= 10, String(ARTICLES.length));
for (const a of ARTICLES) {
  const t = `${a.slug}:`;
  const h2s = a.blocks.filter((b) => b.h2).length;
  const faqs = a.blocks.find((b) => b.faq)?.faq?.length || 0;
  ck(`${t} substantial (≥800 words)`, a.wordCount >= 800, String(a.wordCount));
  ck(`${t} reading time sane`, a.readingMins >= 3 && a.readingMins <= 15, String(a.readingMins));
  ck(`${t} ≥4 H2 sections`, h2s >= 4, String(h2s));
  ck(`${t} ≥3 FAQs`, faqs >= 3, String(faqs));
  ck(`${t} carries measured/tested evidence`, a.blocks.some((b) => b.note || b.table));
  ck(`${t} links to a real tool`, toolSlugs.has(a.tool), String(a.tool));
  ck(`${t} unique title`, ARTICLES.filter((x) => x.title === a.title).length === 1);
  ck(`${t} unique slug`, ARTICLES.filter((x) => x.slug === a.slug).length === 1);
  if (a.hero) ck(`${t} hero file exists on disk`, existsSync("public" + a.hero), a.hero);
  if (a.hero) ck(`${t} hero has alt text`, Boolean(a.heroAlt), "add heroAlt to lib/articles.js");
  ck(`${t} description is a real summary`, a.description.length > 80 && a.description.length < 230, String(a.description.length));
  ck(`${t} no geo wording in body`, !/Pakistan|Karachi|\+92\b|Rozee\.pk/i.test(JSON.stringify(a.blocks)));
}
ck("at most one guide per tool (the tool-page rail stays unambiguous)", (() => {
  const seen = new Set();
  return ARTICLES.every((a) => (seen.has(a.tool) ? false : (seen.add(a.tool), true)));
})());
ck("related reading never includes the article itself", ARTICLES.every((a) => !relatedArticles(a.slug).some((r) => r.slug === a.slug)));
ck("related reading offers 3", ARTICLES.every((a) => relatedArticles(a.slug).length === 3));
ck("getArticle resolves every slug", ARTICLES.every((a) => getArticle(a.slug)?.slug === a.slug));

/* ═════════ 21. Tool-page editorial layer — prose ON the tool pages ═════════
   The second half of the "content depth" fix: reviewers sample tool pages,
   so the thin ones now carry real prose (how it works under the hood, where
   the limits are, when to choose something else) from lib/toolGuides.js,
   rendered by ToolShell between the features list and the FAQ.
   These assertions keep that layer substantive, wired, and geo-clean, and
   lock a word floor so no tool page can regress to interface-only copy.  */

console.log("\n21. Tool-page editorial layer (deep dives)");
const { TOOL_GUIDES, toolGuide } = await import("../lib/toolGuides.js");
const wordsOf = (s) => (s.match(/[A-Za-z0-9'%-]+/g) || []).length;
const guideWords = (secs) =>
  secs.reduce(
    (n, s) =>
      n + wordsOf(s.h) + s.p.map(wordsOf).reduce((a, b) => a + b, 0) +
      (s.bullets || []).map(wordsOf).reduce((a, b) => a + b, 0),
    0
  );
const pageCopyWords = (slug) => {
  const body = src(`app/tools/${slug}/page.js`)
    .split("\n")
    .filter((l) => !l.startsWith("export const metadata")) // SEO copy, not page body
    .join("\n");
  return [...body.matchAll(/"([^"]*)"|`([^`]*)`/g)]
    .map((m) => m[1] ?? m[2] ?? "")
    .map(wordsOf)
    .reduce((a, b) => a + b, 0);
};

const guided = Object.keys(TOOL_GUIDES);
ck("at least 10 tool pages carry a deep dive", guided.length >= 10, String(guided.length));
for (const slug of guided) {
  const secs = TOOL_GUIDES[slug];
  const w = guideWords(secs);
  ck(`${slug}: 2-4 prose sections`, secs.length >= 2 && secs.length <= 4, String(secs.length));
  ck(`${slug}: >=240 words of real prose`, w >= 240, String(w));
  ck(`${slug}: every section has a heading + paragraphs`, secs.every((s) => s.h && s.p?.length >= 1));
  ck(`${slug}: no geo wording`, !/Pakistan|Karachi|\+92\b|Rozee\.pk/i.test(JSON.stringify(secs)));
  ck(`${slug}: maps to a real tool`, toolSlugs.has(slug), slug);
  ck(`${slug}: page wires its deep dive`, src(`app/tools/${slug}/page.js`).includes(`deepDive={toolGuide("${slug}")}`));
  ck(`${slug}: guided page copy >= 500 words`, pageCopyWords(slug) + w >= 500, String(pageCopyWords(slug) + w));
}
ck("toolGuide resolves every catalogue slug", guided.every((s) => toolGuide(s) === TOOL_GUIDES[s]));
ck("toolGuide is null-safe for unknown slugs", toolGuide("no-such-tool") === null);
ck("ToolShell renders the deepDive prop", src("components/ToolShell.js").includes("deepDive?.length > 0"));

// Regression floor: no tool page may slide back to interface-only copy.
// (296 was the thinnest page the day this floor was written — video-to-mp3.)
const COPY_FLOOR = 290;
let thinnest = ["", Infinity];
for (const t of TOOLS) {
  const combined = pageCopyWords(t.slug) + (TOOL_GUIDES[t.slug] ? guideWords(TOOL_GUIDES[t.slug]) : 0);
  if (combined < thinnest[1]) thinnest = [t.slug, combined];
  ck(`${t.slug}: page copy >= ${COPY_FLOOR} words`, combined >= COPY_FLOOR, String(combined));
}
console.log(`   thinnest tool page copy now: ${thinnest[0]} (${thinnest[1]} words)`);

/* ═════════ 22. Header layout guards — the bar must never crowd ═════════
   With six nav links the header used to shrink-wrap: labels and even the
   Explore button folded onto two lines. Guards: every nav label is nowrap,
   links stagger in by breakpoint (md → essentials, lg → busy tools,
   xl → long labels), and the mobile menu still lists everything.        */

console.log("\n22. Header layout guards");
const headerSrc = src("components/Header.js");
ck("nav labels cannot wrap (whitespace-nowrap)", (headerSrc.match(/whitespace-nowrap/g) || []).length >= 3, String((headerSrc.match(/whitespace-nowrap/g) || []).length));
ck("links stagger: two join at lg", headerSrc.includes("hidden lg:inline-block"));
ck("links stagger: two join at xl", headerSrc.includes("hidden xl:inline-block"));
ck("all six nav destinations kept", ["/tools", "/blog", "/tools/image-compressor", "/tools/video-compressor", "/tools/background-remover", "/tools/image-to-pdf"].every((h) => headerSrc.includes(`href: "${h}"`)));
ck("mobile menu still lists every link", headerSrc.includes('aria-label="Mobile"') && headerSrc.includes("LINKS.map"));
ck("Explore button cannot shrink-wrap", headerSrc.includes("whitespace-nowrap shrink-0 items-center gap-1.5 rounded-xl bg-amber-400"));

/* ═════════ 23. Favicon / brand-icon guards — Google shows these ═══════
   Google's favicon crawler fetches a STABLE, CRAWLABLE url from the home
   page (≥48×48, multiples of 48 preferred) and also probes /favicon.ico.
   A data: URI satisfies neither, which is why the old icon never appeared
   in search results. Guards: real files on disk, right dimensions, wired
   into the layout metadata, and no data: URI ever again.                */

console.log("\n23. Favicon / brand-icon guards");
const sharpMod = (await import("sharp")).default;
const layoutSrc = src("app/layout.js");
ck("favicon.ico exists with a valid ICO header", (() => {
  if (!existsSync("public/favicon.ico")) return false;
  const b = readFileSync("public/favicon.ico");
  return b.readUInt16LE(0) === 0 && b.readUInt16LE(2) === 1 && b.readUInt16LE(4) >= 1 && b[6] >= 48;
})());
for (const [file, px] of [["favicon-96.png", 96], ["favicon-192.png", 192], ["apple-touch-icon.png", 180]]) {
  ck(`${file} exists`, existsSync("public/" + file));
  if (existsSync("public/" + file)) {
    const m = await sharpMod("public/" + file).metadata();
    ck(`${file} is ${px}px square`, m.width === px && m.height === px, `${m.width}x${m.height}`);
  }
}
ck("google-facing sizes are multiples of 48", [96, 192].every((n) => n % 48 === 0));
ck("layout wires every favicon url", ["/favicon.ico", "/favicon-96.png", "/favicon-192.png", "/apple-touch-icon.png"].every((u) => layoutSrc.includes(`url: "${u}"`)));
ck("no data: URI favicon (uncrawlable by Google)", !layoutSrc.includes("data:image/svg+xml"));
ck("robots.txt leaves icons crawlable", src("app/robots.js").includes('allow: "/"'));

/* ═════════ 24. CV builder — photo alignment + uncut preview ═════════════
   Two user-reported bugs: sidebar templates hard-centred the photo with no
   way to move it, and the live A4 preview clipped the page's right side on
   narrow viewports (the 210mm page was never scaled to the iframe).      */

console.log("\n24. CV builder — photo alignment + preview scaling");
const cvSrc = src("components/tools/growthTools.js");
ck("photo carries an alignment class", cvSrc.includes("al-${d.photoAlign || \"center\"}"));
ck("all three alignment rules exist in the CV stylesheet", [".photo.al-left{", ".photo.al-center{", ".photo.al-right{"].every((c) => cvSrc.includes(c)));
ck("alignment overrides beat every template rule", (cvSrc.match(/\.photo\.al-(left|center|right)\{[^}]*!important/g) || []).length >= 3);
ck("Align control offers Left / Center / Right", cvSrc.includes('const PHOTO_ALIGNS = [["left", "Left"], ["center", "Center"], ["right", "Right"]];'));
ck("both presets carry photoAlign", (cvSrc.match(/photoAlign: "center",/g) || []).length === 2);
ck("preview wraps the page in a fitted scaler", cvSrc.includes('id="cvscaler"') && cvSrc.includes("transform-origin:top left"));
ck("scaler fits the iframe width and restores scroll height", cvSrc.includes("Math.min(1,vw/pw)") && cvSrc.includes("document.body.style.height=(el.scrollHeight*s)+'px'"));
ck("print + HTML download stay unscaled (pagination-safe)", cvSrc.includes("resumeHtml(d, true)") && cvSrc.includes("resumeHtml(d, false)") && cvSrc.includes("resumeHtml(d, false, true)"));

/* ═════════ 25. Compressors — a converted file may never come back heavier ═
   "2 MB JPG in, 5 MB PNG out" is now structurally impossible: cross-format
   results walk shrinkLadder() until they beat the source, and if nothing
   can (tiny already-optimal files) the original is kept with an honest note. */

console.log("\n25. Compressor never-heavier guards");
const ladder = await compressLadder();
const pngL = ladder.shrinkLadder("image/png", 80);
const jpgL = ladder.shrinkLadder("image/jpeg", 80);
ck("png ladder walks the palette down", eq(pngL.map((x) => x.colors), [128, 64, 32, 16]));
ck("jpeg ladder starts below the chosen quality", jpgL[0].quality === 65, String(jpgL[0].quality));
ck("ladders are strictly descending", [pngL.map((x) => x.colors), jpgL.map((x) => x.quality)].every((a) => a.every((v, i) => i === 0 || v < a[i - 1])));
ck("jpeg ladder never drops under 30", jpgL.every((x) => x.quality >= 30));
ck("low quality input still yields a sane ladder", eq(ladder.shrinkLadder("image/jpeg", 40).map((x) => x.quality), [60, 45, 32, 30]));
const compSrc = src("components/tools/ImageCompressor.js");
ck("cross-format guard wired before the result returns", compSrc.includes("blob.size >= item.file.size && type !== item.file.type"));
ck("final guard keeps the original instead of a heavier copy", compSrc.includes("if (blob.size >= item.file.size) {"));
ck("kept files are labelled honestly in the UI", compSrc.includes("original kept"));
ck("auto-tune notes explain what changed", compSrc.includes("Auto-tuned to a ${step.colors}-colour palette") && compSrc.includes("Auto-tuned quality to ${step.quality}%"));

/* ═════════ 26. Enhancer — real restoration maths, not just upscaling ═════
   The old "denoise" overlaid a blurred copy (i.e. blurred the picture).
   enhancePixels is now an edge-preserving pipeline: flat-region denoise,
   large-radius clarity, 1px unsharp, vibrance. Pinned on synthetic pixels. */

console.log("\n26. Enhancer restoration pipeline");
const enh = await enhancePure();
const rgba = (w, h, fn) => { const d = new Uint8ClampedArray(w * h * 4); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const [r, g, b, a] = fn(x, y); d[(y * w + x) * 4] = r; d[(y * w + x) * 4 + 1] = g; d[(y * w + x) * 4 + 2] = b; d[(y * w + x) * 4 + 3] = a; } return d; };
const spread = (d) => { const vals = []; for (let i = 0; i < d.length; i += 4) vals.push(d[i]); const m = vals.reduce((a, b) => a + b, 0) / vals.length; return Math.sqrt(vals.reduce((a, b) => a + (b - m) ** 2, 0) / vals.length); };
const noisy = rgba(24, 24, (x, y) => [128 + (((x + y) % 2) ? 8 : -8), 128 + (((x + y) % 2) ? 8 : -8), 128, 255]);
const denoised = enh.enhancePixels(noisy, 24, 24, { denoise: 100 });
ck("denoise collapses flat-region noise", spread(denoised) < spread(noisy) * 0.5, `${spread(denoised).toFixed(1)} vs ${spread(noisy).toFixed(1)}`);
const edge = rgba(24, 24, (x) => [x < 12 ? 0 : 255, x < 12 ? 0 : 255, x < 12 ? 0 : 255, 255]);
const edgeAfter = enh.enhancePixels(edge, 24, 24, { denoise: 100 });
ck("denoise leaves hard edges untouched", edgeAfter[(10 * 24 + 11) * 4] === 0 && edgeAfter[(10 * 24 + 12) * 4] === 255);
const softEdge = rgba(24, 24, (x) => { const v = x < 9 ? 100 : x > 14 ? 150 : 100 + (x - 9) * 10; return [v, v, v, 255]; });
const sharpened = enh.enhancePixels(softEdge, 24, 24, { sharpen: 100, clarity: 100 });
const energy = (d) => { let e = 0; for (let x = 1; x < 24; x++) e += Math.abs(d[(12 * 24 + x) * 4] - d[(12 * 24 + x - 1) * 4]); return e; };
const gradBefore = energy(softEdge);
const gradAfter = energy(sharpened);
ck("clarity+sharpen raise local contrast (deblur feel)", gradAfter > gradBefore, `${gradAfter} vs ${gradBefore}`);
const muted = rgba(4, 4, () => [160, 150, 140, 255]);
const vib = enh.enhancePixels(muted, 4, 4, { vibrance: 100 });
const sat = (d, i) => { const mx = Math.max(d[i], d[i + 1], d[i + 2]), mn = Math.min(d[i], d[i + 1], d[i + 2]); return mx === 0 ? 0 : (mx - mn) / mx; };
ck("vibrance wakes muted colours", sat(vib, 0) > sat(muted, 0), `${sat(vib, 0).toFixed(2)} vs ${sat(muted, 0).toFixed(2)}`);
const vivid = rgba(4, 4, () => [255, 0, 0, 255]);
const vividAfter = enh.enhancePixels(vivid, 4, 4, { vibrance: 100 });
ck("vibrance leaves saturated colours alone", vividAfter[0] === 255 && vividAfter[1] === 0 && vividAfter[2] === 0);
const flat = rgba(8, 8, () => [90, 90, 90, 255]);
const blurred = enh.boxBlur(flat, 8, 8, 2);
ck("boxBlur keeps a flat field flat", blurred[0] === 90 && blurred[(8 * 8 - 1) * 4] === 90 && blurred[3] === 255);
ck("alpha channel survives the pipeline", enh.enhancePixels(noisy, 24, 24, { denoise: 50, clarity: 50, sharpen: 50, vibrance: 50 })[3] === 255);
ck("enhancer UI exposes the clarity slider", src("components/tools/ImageEnhancer.js").includes("Clarity (deblur-style local contrast)"));
ck("old blur-overlay fake denoise is gone", !src("components/tools/ImageEnhancer.js").includes('ctx.filter = "blur(1.2px)"'));

/* ═════════ 27. Background remover — matte cleanup maths ════════════════
   Leftover haze and stray patches were the complaint. refineAlpha cleans
   the alpha channel only: soft threshold, despeckle by connected components
   on a 4x4 grid, then an edge feather. Pinned on synthetic mattes.        */

console.log("\n27. Background-remover matte cleanup");
const bg = await alphaPure();
const matte = (w, h, fn) => rgba(w, h, (x, y) => [200, 100, 50, fn(x, y)]);
const hazyM = matte(8, 8, () => 30);
const clearedM = bg.refineAlpha(hazyM, 8, 8, { strict: 35 });
ck("strictness deletes faint background haze", clearedM[3] === 0);
const solidM = matte(8, 8, () => 200);
ck("solid subject alpha survives strictness", bg.refineAlpha(solidM, 8, 8, { strict: 35 })[3] === 255);
const midM = matte(8, 8, () => 80);
const midvM = bg.refineAlpha(midM, 8, 8, { strict: 35 })[3];
ck("semi-transparent edge alpha is remapped, not deleted", midvM > 0 && midvM < 255, String(midvM));
const speckedM = matte(64, 64, (x, y) => (x < 40 && y < 40 ? 255 : x >= 56 && y >= 56 && x < 60 && y < 60 ? 255 : 0));
const cleanedM = bg.refineAlpha(speckedM, 64, 64, { strict: 0, soften: 0, despeckle: true });
ck("despeckle deletes isolated leftover patches", cleanedM[(58 * 64 + 58) * 4 + 3] === 0);
ck("despeckle keeps the main subject", cleanedM[(10 * 64 + 10) * 4 + 3] === 255);
const keptM = bg.refineAlpha(speckedM, 64, 64, { despeckle: false });
ck("despeckle off leaves the matte alone", keptM[(58 * 64 + 58) * 4 + 3] === 255);
const stepM = matte(16, 16, (x) => (x < 8 ? 0 : 255));
const featheredM = bg.refineAlpha(stepM, 16, 16, { soften: 100 });
ck("softening feathers the matte edge", featheredM[(8 * 16 + 8) * 4 + 3] < 255 && featheredM[(8 * 16 + 8) * 4 + 3] > 0);
ck("refine never touches RGB", cleanedM[0] === 200 && cleanedM[1] === 100 && cleanedM[2] === 50);
ck("matte cleanup panel is wired in the UI", src("components/tools/BackgroundRemover.js").includes("Leftover strictness") && src("components/tools/BackgroundRemover.js").includes("Remove stray leftover patches (despeckle)"));

/* ═════════ 28. Background remover — guided-filter edge matting ═════════
   The AI mask is only a prior now: a guided filter (guide = the photo's own
   luminance) snaps soft halos and stair-steps onto real colour edges, which
   is the difference between a sticker silhouette and remove.bg-style hair.
   Pinned on synthetic guides/masks.                                        */

console.log("\n28. Guided-filter edge matting");
ck("matting runs automatically on every run", src("components/tools/BackgroundRemover.js").includes("raw.matted = guidedAlpha(raw.data, raw.data, raw.width, raw.height)"));
ck("sliders re-run on the matted matte", src("components/tools/BackgroundRemover.js").includes("refineAlpha(raw.matted || raw.data"));
ck("memory-friendly best-quality tier is the default", src("components/tools/BackgroundRemover.js").includes('const [model, setModel] = useState("medium")'));
ck("three honest model tiers", src("components/tools/BackgroundRemover.js").includes("Hair/fur-grade edges, memory-friendly — recommended") && src("components/tools/BackgroundRemover.js").includes("fp32 detail for desktops with RAM to spare"));
const bgSrc = src("components/tools/BackgroundRemover.js");
ck("a failing tier auto-falls back down the chain", bgSrc.includes('const tiers = model === "large" ? ["large", "medium", "small"]') && bgSrc.includes("if (!blob) throw lastErr"));
ck("the user is told when a fallback produced the cut-out", bgSrc.includes("so the ${usedTier} model produced this cut-out"));
ck("matte post-processing is guarded (never loses a good cut-out)", bgSrc.includes("matte post-processing skipped:") && bgSrc.includes("setCutout({ blob, url: URL.createObjectURL(blob) });"));
ck("matting memory guard covers phones (4 MP)", bgSrc.includes("if (n > 4_000_000) return out;"));
const gm = (w, h, fn) => { const d = new Uint8ClampedArray(w * h * 4); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const [r, g, b, a] = fn(x, y); d[(y * w + x) * 4] = r; d[(y * w + x) * 4 + 1] = g; d[(y * w + x) * 4 + 2] = b; d[(y * w + x) * 4 + 3] = a; } return d; };
// flat grey photo, noisy mask → matting must smooth the mask
const flatGuide = gm(32, 32, (x, y) => [120, 120, 120, ((x + y) % 2 ? 235 : 205)]);
const smoothed = bg.guidedAlpha(flatGuide, flatGuide, 32, 32);
const sd = (d) => { const v = []; for (let i = 3; i < d.length; i += 4) v.push(d[i]); const m = v.reduce((a, b) => a + b, 0) / v.length; return Math.sqrt(v.reduce((a, b) => a + (b - m) ** 2, 0) / v.length); };
ck("matting smooths mask noise on flat colour", sd(smoothed) < sd(flatGuide) * 0.5, `${sd(smoothed).toFixed(1)} vs ${sd(flatGuide).toFixed(1)}`);
// sharp colour edge at x=16, mask edge blurred across 12..20 → must snap to 16
const edgeGuide = gm(32, 32, (x) => [x < 16 ? 30 : 220, x < 16 ? 30 : 220, x < 16 ? 30 : 220, 0]);
const blurMask = gm(32, 32, (x) => [0, 0, 0, x < 12 ? 255 : x > 20 ? 0 : Math.round(255 * (20 - x) / 8)]);
const snapped = bg.guidedAlpha(edgeGuide, blurMask, 32, 32);
const at = (d, x) => d[(16 * 32 + x) * 4 + 3];
ck("matting snaps a soft halo onto the real edge", at(snapped, 14) > at(blurMask, 14) && at(snapped, 18) < at(blurMask, 18), `${at(snapped, 14)}/${at(snapped, 18)} vs ${at(blurMask, 14)}/${at(blurMask, 18)}`);
ck("solid subject interior stays solid", at(snapped, 4) >= 250, String(at(snapped, 4)));
ck("clear background interior stays clear", at(snapped, 28) <= 5, String(at(snapped, 28)));
// memory guard: gigantic inputs skip matting instead of eating RAM
const big = new Uint8ClampedArray((4000 * 2500) * 4);
for (let i = 0; i < big.length; i += 4) { big[i] = big[i + 1] = big[i + 2] = 120; big[i + 3] = ((i / 4) % 2 ? 235 : 205); }
const bigOut = bg.guidedAlpha(big, big, 4000, 2500);
ck("giant images skip matting (memory guard)", bigOut[3] === 205 && bigOut[7] === 235, `${bigOut[3]}/${bigOut[7]}`);
ck("boxMean of a constant field is that constant", Math.abs(bg.boxMean(new Float32Array(64).fill(0.5), 8, 8, 2)[0] - 0.5) < 1e-6);

/* ══════════════════════════════ report ══════════════════════════════════════ */

const total = pass + fails.length;
console.log(`\n${"═".repeat(66)}`);
console.log(`  ${pass}/${total} assertions passed${fails.length ? `, ${fails.length} FAILED` : " — all green"}`);
console.log("═".repeat(66));
if (fails.length) {
  console.log("\nFAILURES:\n");
  fails.forEach((f) => console.log("  ✗ " + f));
  process.exitCode = 1;
}
