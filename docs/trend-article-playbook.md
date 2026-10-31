# Trend-Article Playbook (news-hook evergreen strategy)

How Tools Stars rides technology trends for search traffic — without writing
disposable news, and without ever putting AdSense at risk.

**Status: PLANNED. No article from this playbook is published until AdSense
approval.** The site stays frozen during the review window.

---

## 1. The core rule: never publish raw news

- Trending news queries are owned by established news publishers (Google's
  "Top Stories"). A small tools site cannot rank for them inside a 1–2 week
  trend window — indexing + ranking alone takes weeks.
- Off-niche news dilutes the site's topical authority (file/image/PDF tools).
- Disposable articles create a delete-or-decay problem later.

## 2. The winning format: news-hook evergreen

Use the trend as a **hook**, write about the **permanent problem** behind it.
The article ranks for the lasting search demand, keeps working after the
trend dies, and never needs deletion.

Template for picking one:

1. A tech/news event spikes public attention.
2. Ask: what *lasting problem or fear* does this event surface?
   (privacy, file formats, size limits, quality, compatibility)
3. Does that problem connect to a Tools Stars tool or existing article?
4. Write/refresh a how-to or explainer around the problem. Mention the news
   in one opening paragraph as context — then solve the problem forever.

### Mapping examples

| Trend / news hook | Evergreen article | Linked tool |
|---|---|---|
| AI photo-app privacy scandal | Do AI photo tools upload your pictures? On-device processing explained | background-remover, image-enhancer |
| New iPhone / iOS release | HEIC photos won't upload anywhere — the clean fix | heic-to-jpg |
| Visa / job portal photo rule change | Passport photo size, DPI and background rules explained | compress-image-to-kb |
| Cloud photo policy change | Your photos carry GPS coordinates — EXIF guide | (EXIF article) |
| New AI image model launch | How AI background removal works (and what to expect) | background-remover |
| "PDF required" application season | How to merge/compress PDFs without uploading them | compress-pdf, pdf-to-word |

Several of these articles already exist in `lib/articles.js` — when a trend
hits, first check if an existing article can be **refreshed** (update + new
section + "Updated: Month Year" note). A refresh ranks faster than a new post.

## 3. Article spec (same bar as the existing 12)

- 800–1,400 words, plain helpful English, no filler.
- Self-generated images only (diagrams, tool screenshots, generated
  graphics). **Never** news photos, logos or copied graphics — copyright
  violation = AdSense policy violation.
- Original writing only. No copied paragraphs, no scraping, no AI-spam volume.
- Honest claims; no "100%", no clickbait promises the article doesn't keep.
- One clear CTA to the relevant tool with a natural sentence, not ad-style
  banners inside content.
- Schema/metadata handled by the existing blog pipeline.

## 4. Publish & index workflow (post-approval)

1. Merge article via PR (as always).
2. User: GSC → URL Inspection → new URL → **Request Indexing** (once per URL).
3. Share the article in the Facebook kit rotation (Post 7 format).
4. After 2–4 weeks: check GSC Performance for the article's queries; tune
   title/description to the queries that show impressions.

## 5. Keep, never delete

- Published URLs stay live forever. Deleting indexed pages creates 404s,
  wastes crawl budget and reads as a spammy churn pattern to Google.
- Outdated article = **update it** (add a dated section). Updates are a
  positive ranking signal.
- If an article truly never earns traffic after 6+ months, improve or merge
  its content into a stronger article with a redirect — never bare-delete.

## 6. AdSense safety checklist for every article

- [ ] Original text, no copied source material
- [ ] All images self-made or self-generated
- [ ] No trademark/logo misuse, no news photography
- [ ] No misleading claims or clickbait
- [ ] Adds real utility tied to the site's niche
- [ ] Will still make sense in 2 years (evergreen test)
- [ ] Published only after AdSense approval (while review pending: site frozen)
