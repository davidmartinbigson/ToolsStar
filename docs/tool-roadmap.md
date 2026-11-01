# Tool Roadmap — AdSense-safe expansion plan

Vetting lens for EVERY candidate tool (why each is safe):

1. **100% client-side** — no uploads, no backend, no API keys (privacy brand + zero server cost)
2. **No copyrighted assets** — self-generated UI/graphics; no scraped databases, no brand logos,
   no Ishihara plate copies (color-vision test uses our own generated plates)
3. **No regulated claims** — health tools are *estimates* with visible disclaimers ("not medical
   advice"); no diagnosis, no financial advice, no gambling/adult adjacency
4. **No third-party ToS violations** — everything processes the user's OWN files (this is why
   video-to-mp3 is safe: local file in, local file out — never a YouTube URL)

Tools that fail any rule are NOT built (past examples: 7labs downloader = dropped,
translate widget = reverted).

Existing 52 tools already cover: PDF merge/split/rotate/sign/watermark/page-numbers,
pdf→word/jpg/png/text, image compress/resize/crop/convert/enhance/matting, EXIF *viewer*,
passport photo, QR gen/scan, screen/voice record, mp3/ringtone cut, video compress/trim/gif/mp3,
word counter, password gen, age/GPA/percentage/zakat/solar calculators, CV builder, OCR, etc.

---

## Phase A — file-niche depth (post-approval, highest search intent)

| Tool | Query intent | Implementation | Safety note |
|---|---|---|---|
| EXIF/metadata **remover** (images) | "remove location data from photo" | canvas re-encode strips all metadata | Privacy brand fit; viewer already exists |
| PDF metadata cleaner | "remove author name from PDF" | pdf-lib rewrite of info dict | Same privacy angle |
| PDF page delete/reorder | "delete page from pdf" | pdf-lib page copy in chosen order | Pure local manipulation |
| Magic-wand background remover (solid bg → transparent) | "make white background transparent" | canvas flood-fill color key | No AI claim; honest "solid backgrounds" copy |
| Image stitcher / collage (vertical long-screenshot, grid) | "combine images into one" | canvas composition | Own layout code |
| Bulk compress + ZIP download | "compress 50 photos at once" | existing ladder loop + JSZip (CDN) | Local only |
| Barcode generator (Code128/EAN) | "barcode generator free" | JsBarcode (CDN) | Standards-based, no copyright issue |
| Invoice generator → PDF | "free invoice generator no sign up" | form → pdf-lib layout | User's own data |

## Phase B — health & vision cluster (agreed earlier; YMYL guardrails)

| Tool | Guardrail |
|---|---|
| BMI calculator | estimate wording + "not medical advice" line |
| TDEE/BMR calculator | same |
| Water-intake calculator | same |
| Sleep-cycle calculator | same |
| Color-vision screening | **self-generated** pseudo-plates (never Ishihara copies) + "screening, not diagnosis" |
| 20-20-20 eye-strain timer | wellness utility, no claims |
| Eye-chart screening (credit-card calibration) | "rough screening, see an optometrist" disclaimer |

Every Phase B page links the disclaimer and cites public guidance (WHO/NHS) where relevant.

## Phase C — long-tail utility clusters (cheap, compounding)

- Unit converter (length/weight/temp/speed)
- Date-difference / duration calculator
- JSON formatter + CSV↔JSON (dev long-tail)
- Case converter / slug generator / duplicate-line remover (text cluster)
- Typing-speed test (shareable, engagement)
- Pomodoro/focus timer

## Sequencing rules

- **Review window:** nothing merges to `main` until AdSense approval (site frozen).
  Code MAY be prepared on a working branch meanwhile — merging is what deploys.
- Post-approval order: Phase A (2 tools/week cadence with tests + guide copy),
  then Phase B as one clustered release with its own blog category, Phase C drip.
- Every tool ships with: guide paragraph (lib/toolGuides), JSON-LD via ToolShell,
  honest warning copy, and at least one source-guard test.
