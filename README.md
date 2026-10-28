# ★ Tools Stars — Free Online Tools Platform

A complete, production-ready tools website (like Smallpdf / iLoveIMG style) where **every tool runs 100% inside the visitor's browser**. No file is ever uploaded to a server — so hosting costs ~zero, the site stays fast under any traffic, and users get total privacy.

---

## 1. Why Next.js (and not WordPress or plain React)?

| Option | Verdict |
|---|---|
| **WordPress** | Needs PHP hosting + database, plugins slow it down, constant security updates. Tool pages need custom code anyway. |
| **Plain React (SPA)** | Google struggles to index client-only pages; poor SEO = no organic traffic. |
| **Next.js (chosen ✅)** | Every page is pre-rendered as static HTML → perfect Google indexing, ~110 KB JS, loads in milliseconds, deploys free on Vercel/Cloudflare. Tools still run 100% client-side. Best of both worlds. |

## 2. Tools included (51 — all fully working, no placeholders)

| Tool | URL | How it works |
|---|---|---|
| Video Compressor | `/tools/video-compressor` | Canvas + MediaRecorder re-encode (presets for WhatsApp/email) |
| AI Background Remover | `/tools/background-remover` | On-device AI (`@imgly/background-removal`, loaded from CDN at runtime) |
| AI Image Enhancer | `/tools/image-enhancer` | UpscalerJS ESRGAN-Slim 2x/4x via CDN + sharpen/denoise finish (Fast Enhance fallback) |
| Image Compressor | `/tools/image-compressor` | Canvas re-encode, bulk up to 50, ZIP download |
| JPG Compressor | `/tools/jpg-compressor` | Same engine, tuned + unique SEO page for "compress jpg" searches |
| PNG Compressor | `/tools/png-compressor` | Smart PNG palette compression (UPNG.js lazy-loaded) or pixel-identical Lossless PNG, transparency preserved |
| Image Resizer | `/tools/image-resizer` | Exact px / % / social-media presets |
| Image Converter | `/tools/image-converter` | PNG ⇄ JPG ⇄ WebP in bulk |
| Image to PDF | `/tools/image-to-pdf` | jsPDF: A4/Letter/fit, reorder pages |
| QR Code Generator | `/tools/qr-code-generator` | URL / text / Wi-Fi / email / phone, PNG + SVG |
| Password Generator | `/tools/password-generator` | Web Crypto randomness + entropy meter |
| Word Counter | `/tools/word-counter` | Words/chars/reading time/keyword density |
| Merge PDF / Split PDF | `/tools/merge-pdf`, `/tools/split-pdf` | pdf-lib (CDN) lossless page copy, reorder/extract/delete |
| Compress PDF | `/tools/compress-pdf` | PDF.js rebuild at 150/120/96 DPI or lossless structure optimize |
| PDF to JPG | `/tools/pdf-to-jpg` | PDF.js rendering 72–300 DPI, per-page/ZIP download |
| Compress Image to KB | `/tools/compress-image-to-kb` | Binary-search quality/size to hit an exact KB target |
| Passport Photo Maker | `/tools/passport-photo-maker` | 300-DPI official sizes, optional AI background, A4 print sheet |
| Resume / CV Maker | `/tools/resume-maker` | 8 templates (3 two-column, 5 single-column incl. parser-safe ATS), photo square-crop with 3 shapes/3 sizes, 8 accent colours, localStorage autosave, print-to-PDF |
| Video to GIF | `/tools/video-to-gif` | gif.js with seek-capture frames, blob-worker workaround |
| Video Trimmer | `/tools/video-trimmer` | Canvas + MediaRecorder segment recording |
| Screen Recorder | `/tools/screen-recorder` | getDisplayMedia + MediaRecorder, optional mic |
| Video to MP3 | `/tools/video-to-mp3` | WebAudio decode + lamejs MP3 encode (128–320 kbps) |
| Image Cropper | `/tools/image-cropper` | Draggable crop box, aspect locks, circle crop, rotate/flip |
| HEIC to JPG | `/tools/heic-to-jpg` | heic2any (CDN) bulk decode |
| Image to Text (OCR) | `/tools/image-to-text` | Tesseract.js (CDN), 8 languages incl. Urdu |
| QR Scanner | `/tools/qr-scanner` | jsQR (CDN) camera + image scanning, link preview |
| Document Scanner | `/tools/document-scanner` | OpenCV.js (CDN) auto page-corner detection + manual drag corners, homography flattening, adaptive photocopy cleanup, Auto/A4/Letter/A5/Legal/ID sizes, multi-page PDF/ZIP |
| Rotate PDF | `/tools/rotate-pdf` | pdf-lib page-rotation metadata for all or selected pages; text and quality preserved |
| Add Page Numbers to PDF | `/tools/add-page-numbers-to-pdf` | pdf-lib text stamping, 5 styles, 6 positions, custom start number, skip cover page |
| Watermark PDF | `/tools/watermark-pdf` | pdf-lib text watermark: diagonal, tiled or footer, opacity/size/colour, all pages or first only |
| PDF to Text | `/tools/pdf-to-text` | PDF.js selectable-text extraction with line reconstruction, editable output, TXT download |
| CNIC Front & Back PDF Maker | `/tools/cnic-pdf-maker` | Canvas rotate/clarity/fit per side, jsPDF A4 layout at actual 85.6×54mm card size or 125% |
| Signature Resizer | `/tools/signature-resizer` | Pixel-level white-paper removal with ink recolour, auto-crop, transparent PNG / white JPG, exact form sizes without stretching |
| Compress PDF to Exact KB | `/tools/compress-pdf-to-kb` | Renders each page once, pre-encodes 9 DPI/quality levels, assembles the best-quality PDF that fits the target bytes (≤30 pages) |
| Solar Load Calculator | `/tools/solar-load-calculator` | Appliance watts × qty × hours → running load, daily units, panel count, inverter kW, battery kWh/Ah |
| MP3 Cutter | `/tools/mp3-cutter` | WebAudio waveform editor, fades + normalize, lamejs MP3 export |
| Audio Compressor | `/tools/audio-compressor` | OfflineAudioContext resample/downmix + lamejs MP3 at speech/balanced/quality presets |
| Voice Recorder | `/tools/voice-recorder` | getUserMedia + MediaRecorder with pause/resume, live level meter, optional MP3 conversion |
| Ringtone Maker | `/tools/ringtone-maker` | MP3-cutter engine tuned for ringtones: 15/30/40s presets, loop preview, fades on by default |
| SVG to PNG / JPG | `/tools/svg-to-png` | Sanitized SVG (scripts stripped) rasterized at 1x–4x or exact width; PNG/JPG/WebP |
| Favicon Generator | `/tools/favicon-generator` | 512px canvas master from image or text → hand-built multi-size ICO + PNGs + manifest + HTML in a ZIP |
| Add Watermark to Image | `/tools/add-watermark-to-image` | Canvas text/logo watermark, 9 positions or tiled, bulk export as ZIP |
| EXIF Viewer & Metadata Remover | `/tools/exif-viewer` | exifr (CDN) reads EXIF/GPS/XMP; clean copy is redrawn pixel-only and re-verified |
| Sign PDF | `/tools/sign-pdf` | Draw/type/upload a signature, drag it onto a live PDF.js page preview, stamped with pdf-lib (handles /Rotate 90/180/270 so it stays upright) |
| PDF to PNG | `/tools/pdf-to-png` | Same PDF.js engine as PDF to JPG, locked to lossless PNG — its own keyword landing page |
| WebP to JPG | `/tools/webp-to-jpg` | Bulk canvas re-encode with a chosen fill colour for transparent areas (or PNG to keep them) |
| Age Calculator | `/tools/age-calculator` | Calendar-accurate Y/M/D age, age on any date, days lived, birthday countdown, 18+ check |
| Percentage Calculator | `/tools/percentage-calculator` | 5 modes in one: X% of Y, share-of, % change, marks→% + grade, percentage ⇄ CGPA |
| GPA / CGPA Calculator | `/tools/gpa-calculator` | Credit-weighted semester GPA + cumulative CGPA, 4.00 scale with ±grades, % equivalent |
| Zakat Calculator | `/tools/zakat-calculator` | Gold/silver by tola or gram, cash/savings/business stock minus debts, silver or gold nisab, 2.5% |

**Homepage highlights:** animated SVG/CSS diagrams that visually explain video compression, AI background removal, image compression and the "no upload" privacy model · live tool search + category filters · comparison table · FAQ with schema.

**SEO built in:** unique title/description/keywords per tool, canonical URLs, Open Graph + auto-generated OG image, `sitemap.xml`, `robots.txt`, JSON-LD (WebSite + SoftwareApplication + HowTo + FAQPage), semantic HTML, all pages static (SSG).

## 3. Run it locally

```bash
npm install
npm run dev        # development → http://localhost:3000
npm run build      # production build
npm run start      # production server
```

## 4. Deploy FREE (recommended: Vercel)

1. Push this folder to a GitHub repo.
2. Go to **vercel.com → New Project → Import** your repo. Framework auto-detects as Next.js. Click Deploy (no settings needed).
3. Add your custom domain in **Settings → Domains** (e.g. `toolsstars.com`). Set the **apex as Primary** and make `www` a **308 Redirect to Primary** — every canonical/sitemap/OG URL in this repo is non-www, so the two must agree. DNS: `A @ → 76.76.21.21`, `CNAME www → cname.vercel-dns.com`, and delete any parking records at the registrar first.
4. In **Settings → Environment Variables** add:
   `NEXT_PUBLIC_SITE_URL=https://yourdomain.com`  ← this updates the sitemap, canonicals & OG tags automatically. Redeploy once **with "Use existing Build Cache" unticked** (`NEXT_PUBLIC_*` values are inlined at build time, so a cached build keeps the old one).

Alternatives that also work free: **Cloudflare Pages** and **Netlify** (both auto-detect Next.js the same way). Any VPS: `npm run build && npm run start` behind nginx. **No database, no file storage, no backend needed — that's the whole point.**

## 5. After deploy: get indexed & grow traffic

1. **Google Search Console** → add your domain (use the **Domain** property so www + non-www + both protocols are covered) → submit `https://yourdomain.com/sitemap.xml`.
2. **Bing Webmaster Tools** → import from Search Console (Bing/DuckDuckGo traffic is free extra).
3. **Analytics — no code needed.** Set `NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX` and redeploy. `components/Analytics.js` then loads GA4 with `anonymize_ip`, **but only after the visitor accepts optional cookies**. Leave it unset and no analytics request is ever made.
4. **AdSense — no code needed.** After approval set:
   - `NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-XXXXXXXXXXXXXXXX` → loads the AdSense library in `app/layout.js`
   - `NEXT_PUBLIC_ADSENSE_SLOT=NNNNNNNNNN` → activates the responsive unit that `components/ToolShell.js` already renders below each tool (the best-converting spot, and deliberately outside the tool workspace)
   - `NEXT_PUBLIC_ADSENSE_PUBLISHER_ID=pub-XXXXXXXXXXXXXXXX` → `/ads.txt` starts publishing `google.com, pub-XXXX, DIRECT, f08c47fec0942fa0`

   Until those are set, **no ad markup, no ad script and no cookie banner is emitted at all** — so there is zero cumulative layout shift and nothing to consent to. The banner (`components/CookieConsent.js`) appears automatically the moment ads or analytics are switched on, and a visitor who picks "Essential only" gets no ad unit and no GA hit while every tool keeps working.
5. **Approval readiness.** The pages AdSense reviewers look for already exist and are linked from the footer on every page: `/privacy-policy`, `/terms`, `/disclaimer`, `/about`, `/contact`. All five are in the sitemap.
6. **Structured data** is emitted automatically: `WebSite`+`SearchAction` (layout), `SoftwareApplication` + `HowTo` + `FAQPage` + `BreadcrumbList` (every tool page), `CollectionPage` + `BreadcrumbList` + `ItemList` covering all 51 tools (`/tools`), and `WebPage`/`Organization` on the informational pages. Validate with Google's Rich Results Test.
7. **Content growth:** the money pages are individual tool pages targeting "compress X online free". Each new tool = a new keyword landing page (see §6). Strong next candidates: Protect/Unlock PDF, PDF to Word-style layouts, dedicated WebP to PNG and JPG to WebP pages, more everyday calculators (salary/income tax, EMI/loan, BMI, electricity bill), date-of-joining to service-length calculators, and category hub pages (`/tools/image`, `/tools/pdf`, …).
8. Share each tool page (not just the homepage) on Reddit/Pinterest/WhatsApp groups — tool pages convert, homepages bounce.

## 6. Add a new tool (5 minutes)

1. Create the interactive part in `components/tools/MyTool.js` (copy any existing tool as a template, mark it `"use client"`).
2. Add an entry to `lib/tools.js` (`TOOLS` array) — it automatically appears on the homepage grid, search, footer, `/tools` page and **sitemap**.
3. Create `app/tools/my-tool/page.js` (copy an existing page; change `metadata`, intro, steps, features, FAQs; render `<ToolShell>…<MyTool/></ToolShell>`).
4. `npm run build` → deploy. Done.

## 7. Project map

```
app/                  Pages + routing (App Router)
  page.js             Homepage (hero, animated diagrams, FAQ…)
  tools/              /tools index + one folder per tool page
  about/ contact/ privacy-policy/ terms/ disclaimer/
                      Informational & legal pages (AdSense approval requires them)
  ads.txt/route.js    Generates ads.txt from NEXT_PUBLIC_ADSENSE_PUBLISHER_ID
  layout.js           Global SEO metadata, CDN preconnect hints, header/footer,
                      starfield, conditional AdSense loader, Analytics + consent
  sitemap.js robots.js opengraph-image.js
components/
  diagrams.js         The animated homepage diagrams (pure CSS/SVG, 0 JS)
  ToolShell.js        SEO layout shared by every tool page (4 JSON-LD blocks + ad slot)
  LegalShell.js       Shared layout for the legal/informational pages
  Dropzone.js         Drag-drop / paste upload box
  CookieConsent.js    Consent banner — inert until ads or analytics are configured
  Analytics.js        GA4 loader, gated on consent
  AdSlot.js           Responsive AdSense unit, gated on config + consent
  ContactForm.js      Composes a mailto: (no backend, nothing is POSTed)
  tools/              Tool engines grouped by pack (pdfTools, pdfEssentials, growthTools, miscPack2, videoPack, audioPack, quickTools, imageDevPack, calcPack + standalone SignPdf…); heavy libraries load lazily per page
lib/
  tools.js            Tool catalog (single source of truth)
  site.js             Domain, contact, CDN & monetisation constants  ← env-driven
  consent.js          Consent read/write/subscribe helpers (client)
  utils.js            Shared helpers (sizes, canvas export, downloads)
```

## 8. Honest limitations to know

- **Video Compressor** re-encodes in near-real-time in the browser (a 3-minute video takes ~3 minutes; output is MP4 where supported, otherwise WebM). This is the trade-off for zero server costs and total privacy — and it still beats uploading a 500 MB file on slow connections. Keep the tab visible while it runs.
- **Background Remover** downloads its AI model once on first use (cached afterwards; the "small" model is the fast default). Works best in up-to-date Chrome/Edge/Firefox; very low-memory phones may struggle with huge photos.
- **Image Enhancer** downloads its ESRGAN model from a CDN on first use and infers in 64px patches (with cancel + progress). Large 4x jobs can take minutes on weak phones — the input cap (default 1024px) and the Fast Enhance fallback keep it usable everywhere. AI output is a plausible reconstruction of detail, not a perfect recovery of information that was never in the file.
- **Compress PDF to Exact KB** rebuilds pages as optimized images (text no longer selectable) and is capped at 30 pages to protect phone memory; if the original already fits the target it is returned unchanged.
- **PDF to Text** only reads text that is already stored in a digital PDF — scanned/photo PDFs need the OCR path (PDF to JPG → Image to Text).
- **Voice Recorder** needs microphone permission over HTTPS and saves in the browser's native format (WebM on Chrome, M4A on Safari); the built-in converter makes an MP3 copy on request.
- **Sign PDF** creates an *electronic* signature (your signature image placed into the PDF), not a certified *digital* signature with a cryptographic certificate. That is fine for forms, contracts and approvals, but banks, courts and some government portals demand the certified kind, which only an authorised certificate provider can issue. Animated WebP files convert as their first frame only.
- **Zakat Calculator** is arithmetic, not a fatwa. It uses the widely accepted 2.5% rate and standard nisab weights (612.36 g silver / 87.48 g gold), but rulings differ between schools of thought on jewellery, produce, resale property and provident funds — the page says so plainly.
- **GPA / Percentage** calculators follow the common 4.00 scale and the ÷9.5 CGPA rule; universities publish their own conversion tables, so official documents should use the institution's rule.
- Huge files are limited only by the visitor's device memory — there are no server-imposed caps because there is no server processing at all.

## 9. Costs when traffic grows

Static pages + browser-side processing means **10 visitors or 1,000,000 visitors, your server bill barely changes** (Vercel/Cloudflare free tiers handle a lot; bandwidth is the website itself, ~100–300 KB per visit, cached at the edge). The heavy lifting — video encoding, AI inference, compression — happens on visitors' devices. That's the business model that lets this stay free and still earn from ads.
