// Regenerates the Facebook brand assets (logo variants) as crisp PNGs.
// Usage: node docs/facebook-assets/generate.mjs
import sharp from "sharp";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const STAR =
  "256,72 303,207.3 446.2,210.2 332.1,296.7 373.6,433.8 256,352 138.4,433.8 179.9,296.7 65.8,210.2 209,207.3";

function logoSvg(bgStops, starStops) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0.3" y2="1">
      <stop offset="0" stop-color="${bgStops[0]}"/><stop offset="1" stop-color="${bgStops[1]}"/>
    </linearGradient>
    <linearGradient id="st" x1="0" y1="0" x2="0.2" y2="1">
      <stop offset="0" stop-color="${starStops[0]}"/><stop offset="1" stop-color="${starStops[1]}"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="118" fill="url(#bg)"/>
  <polygon points="${STAR}" fill="url(#st)" stroke="url(#st)" stroke-width="16" stroke-linejoin="round"/>
</svg>`;
}

const jobs = [
  ["logo-gold-1080.png", logoSvg(["#ffc531", "#ff9d2e"], ["#05060f", "#05060f"])],
  ["logo-dark-1080.png", logoSvg(["#12152b", "#05060f"], ["#ffc531", "#ff9d2e"])],
];
for (const [name, svg] of jobs) {
  await sharp(Buffer.from(svg)).resize(1080, 1080).png().toFile(path.join(here, name));
  console.log("wrote", name);
}

// ---- Facebook cover: composite brand text over the chosen AI background ----
const STAR2 = STAR;
const overlay = `<svg xmlns="http://www.w3.org/2000/svg" width="1640" height="856" viewBox="0 0 1640 856">
  <rect x="200" y="270" width="1240" height="360" rx="36" fill="#05060f" fill-opacity="0.52"/>
  <svg x="360" y="310" width="150" height="150" viewBox="0 0 512 512">
    <defs><linearGradient id="ig" x1="0" y1="0" x2="0.3" y2="1">
      <stop offset="0" stop-color="#ffc531"/><stop offset="1" stop-color="#ff9d2e"/></linearGradient></defs>
    <rect width="512" height="512" rx="118" fill="url(#ig)"/>
    <polygon points="${STAR2}" fill="#05060f" stroke="#05060f" stroke-width="16" stroke-linejoin="round"/>
  </svg>
  <text x="545" y="428" font-family="DejaVu Sans" font-weight="bold" font-size="112" fill="#ffffff">Tools Stars</text>
  <text x="820" y="548" text-anchor="middle" font-family="DejaVu Sans" font-size="44" fill="#ffffff" fill-opacity="0.88">50+ free tools. Nothing is ever uploaded.</text>
  <text x="820" y="604" text-anchor="middle" font-family="DejaVu Sans" font-size="36" fill="#ffc531">toolsstars.com</text>
</svg>`;

await sharp(path.join(here, "cover-bg.png"))
  .resize(1640, 856, { fit: "cover", position: "centre" })
  .composite([{ input: Buffer.from(overlay) }])
  .png()
  .toFile(path.join(here, "fb-cover-1640x856.png"));
console.log("wrote fb-cover-1640x856.png");
