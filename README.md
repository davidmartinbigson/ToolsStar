# ★ Tools Stars — Free Online Tools Platform

A complete, production-ready tools website (like Smallpdf / iLoveIMG style) where **every tool runs 100% inside the visitor's browser**. No file is ever uploaded to a server — so hosting costs ~zero, the site stays fast under any traffic, and users get total privacy.

---

## 1. Why Next.js (and not WordPress or plain React)?

| Option | Verdict |
|---|---|
| **WordPress** | Needs PHP hosting + database, plugins slow it down, constant security updates. Tool pages need custom code anyway. |
| **Plain React (SPA)** | Google struggles to index client-only pages; poor SEO = no organic traffic. |
| **Next.js (chosen ✅)** | Every page is pre-rendered as static HTML → perfect Google indexing, ~110 KB JS, loads in milliseconds, deploys free on Vercel/Cloudflare. Tools still run 100% client-side. Best of both worlds. |

## 2. Tools included (44 — all fully working, no placeholders)

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
| Resume / CV Maker | `/tools/resume-maker` | 3 templates, localStorage autosave, print-to-PDF output |
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
3. Add your custom domain in **Settings → Domains** (e.g. `toolsstars.com`).
4. In **Settings → Environment Variables** add:
   `NEXT_PUBLIC_SITE_URL=https://yourdomain.com`  ← this updates the sitemap, canonicals & OG tags automatically. Redeploy once.

Alternatives that also work free: **Cloudflare Pages** and **Netlify** (both auto-detect Next.js the same way). Any VPS: `npm run build && npm run start` behind nginx. **No database, no file storage, no backend needed — that's the whole point.**

## 5. After deploy: get indexed & grow traffic

1. **Google Search Console** → add your domain → submit `https://yourdomain.com/sitemap.xml`.
2. **Bing Webmaster Tools** → import from Search Console (Bing/DuckDuckGo traffic is free extra).
3. **Analytics:** add Google Analytics 4 or Plausible by pasting their script in `app/layout.js`.
4. **AdSense:** once approved, paste the AdSense script in `app/layout.js` and ad units in `components/ToolShell.js` (below the tool is the best-converting spot) — keep ads off the tool workspace itself so users stay happy.
5. **Content growth:** the money pages are individual tool pages targeting "compress X online free". Each new tool = a new keyword landing page (see §6). Strong next candidates: Sign PDF, dedicated PDF to PNG / WebP to JPG landing pages, Age / Percentage / GPA / Zakat calculators, and country-specific passport-photo pages.
6. Share each tool page (not just the homepage) on Reddit/Pinterest/WhatsApp groups — tool pages convert, homepages bounce.

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
  layout.js           Global SEO metadata, header/footer, starfield
  sitemap.js robots.js opengraph-image.js
components/
  diagrams.js         The animated homepage diagrams (pure CSS/SVG, 0 JS)
  ToolShell.js        SEO layout shared by every tool page
  Dropzone.js         Drag-drop / paste upload box
  tools/              Tool engines grouped by pack (pdfTools, pdfEssentials, growthTools, pakistanPack2, videoPack, audioPack, quickTools, imageDevPack…); heavy libraries load lazily per page
lib/
  tools.js            Tool catalog (single source of truth)
  site.js             Domain & site constants  ← change your domain here / via env
  utils.js            Shared helpers (sizes, canvas export, downloads)
```

## 8. Honest limitations to know

- **Video Compressor** re-encodes in near-real-time in the browser (a 3-minute video takes ~3 minutes; output is MP4 where supported, otherwise WebM). This is the trade-off for zero server costs and total privacy — and it still beats uploading a 500 MB file on slow connections. Keep the tab visible while it runs.
- **Background Remover** downloads its AI model once on first use (cached afterwards; the "small" model is the fast default). Works best in up-to-date Chrome/Edge/Firefox; very low-memory phones may struggle with huge photos.
- **Image Enhancer** downloads its ESRGAN model from a CDN on first use and infers in 64px patches (with cancel + progress). Large 4x jobs can take minutes on weak phones — the input cap (default 1024px) and the Fast Enhance fallback keep it usable everywhere. AI output is a plausible reconstruction of detail, not a perfect recovery of information that was never in the file.
- **Compress PDF to Exact KB** rebuilds pages as optimized images (text no longer selectable) and is capped at 30 pages to protect phone memory; if the original already fits the target it is returned unchanged.
- **PDF to Text** only reads text that is already stored in a digital PDF — scanned/photo PDFs need the OCR path (PDF to JPG → Image to Text).
- **Voice Recorder** needs microphone permission over HTTPS and saves in the browser's native format (WebM on Chrome, M4A on Safari); the built-in converter makes an MP3 copy on request.
- Huge files are limited only by the visitor's device memory — there are no server-imposed caps because there is no server processing at all.

## 9. Costs when traffic grows

Static pages + browser-side processing means **10 visitors or 1,000,000 visitors, your server bill barely changes** (Vercel/Cloudflare free tiers handle a lot; bandwidth is the website itself, ~100–300 KB per visit, cached at the edge). The heavy lifting — video encoding, AI inference, compression — happens on visitors' devices. That's the business model that lets this stay free and still earn from ads.
