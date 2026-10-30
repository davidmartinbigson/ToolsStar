// Pulls the *pure* (non-JSX) logic straight out of the real source files and
// imports it as an ES module. Two reasons for doing it this way:
//
//   1. The tests run against the actual shipped code — never a copy that can
//      drift out of sync.
//   2. The tool components are "use client" files full of JSX, so they cannot
//      be imported by plain Node. Slicing between stable markers and importing
//      through a data: URL gives us the pure functions with no build step, no
//      test framework and no extra dependencies.
//
// Markers are code landmarks (declaration text), NOT line numbers, so editing
// elsewhere in a file does not break the tests.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

export function src(rel) {
  return readFileSync(join(ROOT, rel), "utf8");
}

/** Text between `from` and `to` (both exclusive of `to`). */
export function slice(rel, from, to) {
  const s = src(rel);
  const a = s.indexOf(from);
  if (a < 0) throw new Error(`${rel}: start marker not found → ${from.slice(0, 60)}`);
  const b = s.indexOf(to, a);
  if (b < 0) throw new Error(`${rel}: end marker not found → ${to.slice(0, 60)}`);
  return s.slice(a, b);
}

/** Import generated source as a module and return its namespace. */
export async function importSource(code, exports) {
  const module = code + "\nexport { " + exports.join(", ") + " };\n";
  return import("data:text/javascript," + encodeURIComponent(module));
}

// ── The slices the test-suite uses ──────────────────────────────────────────

export async function calcPure() {
  const rel = "components/tools/calcPack.js";
  const code = [
    slice(rel, "const num = (value) =>", "export function AgeCalculator()"),
    slice(rel, "const PCT_MODES = [", "export function PercentageCalculator()"),
    slice(rel, "const GRADE_POINTS = [", "export function GpaCalculator()"),
    slice(rel, "const TOLA_GRAMS = ", "export function ZakatCalculator()"),
  ].join("\n");
  return importSource(code, [
    "num", "fmt", "MONTHS", "parseLocalDate", "toInputDate", "startOfDay", "longDate",
    "diffYmd", "birthdayIn", "PCT_MODES", "GRADE_BANDS", "gradeFor",
    "GRADE_POINTS", "DEFAULT_COURSES", "standingFor",
    "TOLA_GRAMS", "NISAB_SILVER_GRAMS", "NISAB_GOLD_GRAMS", "CURRENCIES", "money",
  ]);
}

export async function signPdfGeometry() {
  const rel = "components/tools/SignPdf.js";
  // Plain function declarations — importSource() appends the export list.
  const code = slice(rel, "function pageGeometry(page) {", "export default function SignPdf()");
  return importSource(code, ["pageGeometry", "visualToUser"]);
}

export async function wordCounter() {
  const text = src("components/tools/WordCounter.js");
  const stop = text.slice(text.indexOf("const STOP = new Set("), text.indexOf("export default function WordCounter()"));
  const body = text.slice(
    text.indexOf("const stats = useMemo(() => {") + "const stats = useMemo(() => {".length,
    text.indexOf("  }, [text]);")
  );
  // Already `export function wcStats` below, so append no export list.
  return importSource(stop + "\nexport function wcStats(text) {" + body + "\n}\n", []);
}

export async function pngLogic() {
  const rel = "components/tools/ImageCompressor.js";
  const code = [
    slice(rel, "const PAKO_SRCS = [", "const MODE_COPY = {"),
    slice(rel, "function pngColorsForQuality(quality) {", "function drawImageCanvas("),
    slice(rel, "const letUiPaint = ", "async function encodePngBlob"),
  ].join("\n");
  return importSource(code, ["PAKO_SRCS", "UPNG_SRCS", "pngColorsForQuality", "countColours", "noSavingsNote"]);
}

export async function enhancePure() {
  const rel = "components/tools/ImageEnhancer.js";
  const code = slice(rel, "function boxBlur(src, w, h, r) {", "export default function ImageEnhancer()");
  return importSource(code, ["boxBlur", "enhancePixels"]);
}

export async function alphaPure() {
  const rel = "components/tools/BackgroundRemover.js";
  const code = slice(rel, "function refineAlpha(src, w, h", "export default function BackgroundRemover()");
  return importSource(code, ["refineAlpha", "boxMean", "guidedAlpha"]);
}

export async function compressLadder() {
  const rel = "components/tools/ImageCompressor.js";
  const code = slice(rel, "function shrinkLadder(type, quality) {", "function drawImageCanvas(");
  return importSource(code, ["shrinkLadder"]);
}

export async function ocrPure() {
  const rel = "components/tools/quickTools.js";
  const code = slice(rel, "function ocrHistogram(data, n) {", "export function ImageToText() {");
  return importSource(code, ["ocrHistogram", "otsuThreshold", "ocrPreprocessPixels", "ocrCleanText", "ocrFixDigits", "ocrRotateRect", "ocrRectPsm"]);
}

export async function pdfWordPure() {
  const rel = "components/tools/pdfEssentials.js";
  const code = slice(rel, "function pdfJoinParts(parts) {", "export function PdfToWord() {");
  return importSource(code, ["pdfStyledLines", "pdfDocumentStructure"]);
}

export async function utils() {
  // lib/utils.js is already plain ESM with no imports (browser APIs are only
  // touched inside function bodies), so it can be imported as-is.
  return importSource(src("lib/utils.js"), []);
}
