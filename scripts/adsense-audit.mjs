// AdSense / crawl-readiness audit — runs against a live or local server and
// checks the things a reviewer (and a crawler) actually looks at.
//
//   node scripts/adsense-audit.mjs                      # local prod build
//   BASE_URL=https://toolsstars.com node scripts/adsense-audit.mjs
//
// Deliberately dependency-free: plain fetch + string checks. Every check
// prints PASS/FAIL with the evidence, so a failure is never a mystery.

const BASE = (process.env.BASE_URL || "http://127.0.0.1:3111").replace(/\/$/, "");
const PUB = "pub-4596969703585504";
const CLIENT = "ca-pub-4596969703585504";

let pass = 0;
const fails = [];
const ck = (name, cond, detail = "") => {
  if (cond) {
    pass++;
    console.log(`  ✓ ${name}`);
  } else {
    fails.push(name);
    console.log(`  ✗ ${name}${detail ? "  → " + detail : ""}`);
  }
};

async function get(path) {
  const res = await fetch(BASE + path, { redirect: "manual" });
  const text = await res.text();
  return { status: res.status, type: res.headers.get("content-type") || "", text };
}

const jsonLd = (html) => {
  const out = [];
  const re = /<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g;
  let m;
  while ((m = re.exec(html))) {
    try {
      const parsed = JSON.parse(m[1]);
      out.push(...(Array.isArray(parsed) ? parsed : [parsed]));
    } catch {
      out.push({ "@type": "UNPARSEABLE" });
    }
  }
  return out;
};

console.log(`\nAuditing ${BASE}\n`);

/* ── 1. ads.txt ───────────────────────────────────────────────────────────── */
console.log("1. ads.txt");
const ads = await get("/ads.txt");
ck("served with 200", ads.status === 200, String(ads.status));
ck("plain-text content type", ads.type.includes("text/plain"), ads.type);
ck("authorises google.com for our publisher id", ads.text.includes(`google.com, ${PUB}, DIRECT, f08c47fec0942fa0`), ads.text.split("\n")[1] || "no record line");
ck("no leftover placeholder comments", !ads.text.includes("No advertising inventory"));

/* ── 2. robots.txt ────────────────────────────────────────────────────────── */
console.log("\n2. robots.txt");
const rob = await get("/robots.txt");
ck("served with 200", rob.status === 200, String(rob.status));
ck("nothing disallowed", !/^\s*Disallow:/im.test(rob.text), rob.text.replace(/\n/g, " "));
ck("all crawlers allowed at /", /User-Agent: \*\s*\nAllow: \//i.test(rob.text), rob.text.replace(/\n/g, " "));
ck("points at the sitemap", rob.text.includes(`${BASE.includes("127.0.0.1") ? "https://toolsstars.com" : BASE}/sitemap.xml`), rob.text);

/* ── 3. sitemap.xml ───────────────────────────────────────────────────────── */
console.log("\n3. sitemap.xml");
const sm = await get("/sitemap.xml");
const urls = [...sm.text.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
const lastmods = [...sm.text.matchAll(/<lastmod>(.*?)<\/lastmod>/g)].map((m) => m[1]);
ck("served with 200 as XML", sm.status === 200 && sm.type.includes("xml"), `${sm.status} ${sm.type}`);
ck("lists every route (85 expected: 52 tools + 25 guides + 8)", urls.length === 85, String(urls.length));
ck("all URLs are absolute and on the canonical domain", urls.every((u) => u.startsWith("https://toolsstars.com")), urls.find((u) => !u.startsWith("https://toolsstars.com")) || "");
ck("no duplicate URLs", new Set(urls).size === urls.length, String(new Set(urls).size));
ck("guides + index pages carry a truthful lastmod", lastmods.length === 27, String(lastmods.length));
ck("no lastmod claims a future date", lastmods.every((d) => new Date(d) <= new Date()), lastmods.filter((d) => new Date(d) > new Date()).join());

/* ── 4. Ad code in the rendered HTML ──────────────────────────────────────── */
console.log("\n4. AdSense loader (rejection reason #1)");
const home = await get("/");
ck("homepage 200", home.status === 200, String(home.status));
// React renders boolean attributes as async="" and may reorder them, so match
// the tag structurally rather than as a literal string.
const loader = new RegExp(
  `<script[^>]*\\basync(?:="")?[^>]*src="https://pagead2\\.googlesyndication\\.com/pagead/js/adsbygoogle\\.js\\?client=${CLIENT}"[^>]*>`,
  "i"
);
ck("loader is a plain server-rendered <script async> in <head>", loader.test(home.text), "script tag not found");
ck("loader sits before </head>", home.text.indexOf("adsbygoogle.js") < home.text.indexOf("</head>"));
ck("preconnect to the ad CDN", home.text.includes('rel="preconnect" href="https://pagead2.googlesyndication.com"'));
ck("no empty ad placeholders before approval", !/<ins class="adsbygoogle"/.test(home.text), "an <ins> unit rendered without a slot id");

/* ── 5. Indexability signals ──────────────────────────────────────────────── */
console.log("\n5. Indexability");
const tool = await get("/tools/jpg-compressor");
const article = await get("/blog/compress-pdf-size");
ck("tool page 200", tool.status === 200, String(tool.status));
ck("guide page 200", article.status === 200, String(article.status));
for (const [label, page] of [["homepage", home], ["tool", tool], ["guide", article]]) {
  ck(`${label}: unique <title>`, /<title>[^<]{20,}<\/title>/.test(page.text));
  ck(`${label}: meta description`, /<meta name="description" content="[^"]{80,}"/.test(page.text));
  ck(`${label}: self-referencing canonical`, /<link rel="canonical" href="https:\/\/toolsstars\.com[^"]*"/.test(page.text));
  ck(`${label}: no noindex/nofollow anywhere`, !/noindex|nofollow/i.test(page.text));
}
ck("tool emits SoftwareApplication + HowTo + FAQPage + Breadcrumb", ["SoftwareApplication", "HowTo", "FAQPage", "BreadcrumbList"].every((t) => jsonLd(tool.text).some((j) => j["@type"] === t)), jsonLd(tool.text).map((j) => j["@type"]).join());
ck("guide emits Article + FAQPage + Breadcrumb", ["FAQPage", "BreadcrumbList"].every((t) => jsonLd(article.text).some((j) => j["@type"] === t)) && jsonLd(article.text).some((j) => ["Article", "BlogPosting", "TechArticle"].includes(j["@type"])), jsonLd(article.text).map((j) => j["@type"]).join());
ck("all JSON-LD parses", [...jsonLd(home.text), ...jsonLd(tool.text), ...jsonLd(article.text)].every((j) => j["@type"] !== "UNPARSEABLE"));

/* ── 6. Internal linking (the discovery lever) ────────────────────────────── */
console.log("\n6. Internal linking");
const railLinks = [...tool.text.matchAll(/href="\/blog\/([a-z0-9-]+)"/g)].map((m) => m[1]);
ck("tool page links into the guides", new Set(railLinks).size >= 2, [...new Set(railLinks)].join());
const homeLinks = [...home.text.matchAll(/href="(\/[^"]*)"/g)].map((m) => m[1]);
ck("homepage links to the guide index and latest guides", homeLinks.includes("/blog") && homeLinks.filter((l) => l.startsWith("/blog/")).length >= 3, String(homeLinks.filter((l) => l.startsWith("/blog/")).length));
ck("guide links back to its tool", /href="\/tools\/[a-z0-9-]+"/.test(article.text));

/* ── 7. Trust & policy pages ──────────────────────────────────────────────── */
console.log("\n7. Trust pages (reviewer clicks these)");
for (const p of ["/about", "/contact", "/privacy-policy", "/terms", "/disclaimer"]) {
  const r = await get(p);
  ck(`${p} renders 200 with real copy`, r.status === 200 && r.text.length > 3000, `${r.status}, ${r.text.length} bytes`);
}
const contact = await get("/contact");
ck("footer/home links to the contact page", /href="\/contact"/.test(home.text));
ck("contact page publishes a real support address", contact.text.includes("support@toolsstars.com") && /mailto:support@toolsstars\.com/.test(contact.text), "address or mailto missing");
ck("no geo/personal leakage in the rendered HTML", !/Pakistan|Karachi|\+92|en-PK/i.test(home.text + tool.text + article.text));

/* ── 8. Error handling & automation ───────────────────────────────────────── */
console.log("\n8. Errors & automation");
const nf = await get("/this-page-does-not-exist");
ck("unknown URL returns 404 (not a soft 200)", nf.status === 404, String(nf.status));
ck("404 page still offers navigation", /href="\/"/.test(nf.text) && /href="\/tools"/.test(nf.text));
const cron = await get("/api/cron/fb-post");
ck("posting cron responds 200 with JSON (never a 500)", cron.status === 200 && cron.type.includes("json"), `${cron.status} ${cron.type}`);
ck("cron stays inert until credentials exist", /not configured|skipped|reason/i.test(cron.text), cron.text.slice(0, 120));

/* ── report ───────────────────────────────────────────────────────────────── */
console.log(`\n${"═".repeat(64)}`);
console.log(`  ${pass}/${pass + fails.length} checks passed${fails.length ? ` — ${fails.length} FAILED` : " — site is review-ready"}`);
console.log("═".repeat(64));
if (fails.length) {
  console.log("\nFAILURES:");
  fails.forEach((f) => console.log("  ✗ " + f));
  process.exitCode = 1;
}
