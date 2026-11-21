# AdSense resubmission gate

Single source of truth for **when** to press Request review again. The owner
asks (reasonably) every couple of days; this page answers with evidence rather
than mood, and it is updated each time a real number changes.

**Status as of 20 Nov 2026: HOLD. Target window 1–7 Dec 2026.**
The agent gives the GO; the owner presses the button. No resubmission before
the GO, whatever else is true.

## Where the account stands

| Cycle | Date | Outcome |
| --- | --- | --- |
| 1 | submitted after launch | Rejected — ad code/loader + env wiring. Fixed (plain async loader in `<head>`, gated by `ADS_ENABLED`). |
| 2 | resubmitted 9 Nov | Rejected 13 Nov — **generic** message, no specific policy named. |
| 3 | — | **Not yet submitted.** Gate below. |

Publisher: `ca-pub-4596969703585504`. One account only, forever.

## Why hold (the three reasons that actually matter)

1. **The reviewer sees numbers, not effort.** The last hard readings were 7-day
   2 clicks / 10 impressions and Page indexing **17 indexed / 58 not indexed**
   (56 of them "Discovered – currently not indexed", first detected 7 Nov).
   Resubmitting while those numbers are unchanged asks the same question and
   gets the same answer.
2. **Fresh work needs crawl time.** The internal-linking and sitemap-freshness
   changes shipped 19–20 Nov (156 tool→guide links, truthful `lastmod`,
   category normalisation). Google has to recrawl before any of it shows up in
   the indexing report — typically 7–14 days. Submitting now means the review
   runs against the old snapshot and the new work is wasted.
3. **A third rejection is expensive.** Rejections are not free retries: they
   confirm the "insufficient content" reading on record, and each one makes the
   next review start from a worse position. We have one clean shot per cycle —
   spend it from strength.

## GO conditions — all five must be true

| # | Condition | Owner |
| --- | --- | --- |
| 1 | Page indexing has **risen** from 17 (target 30+, ideally 35–40) in the GSC Page indexing report | Owner sends the screenshot; agent reads it |
| 2 | **26–27 guides** live (25 today), each ≥800 words, ≥4 `h2`, ≥3 FAQ, unique title/description | Agent writes and ships them |
| 3 | Owner's three recurring tasks done for the week: Request-Indexing batch of 10 older URLs, Bing Webmaster Tools added (yes/no decision), daily social posts going out | Owner |
| 4 | Optional accelerator: one external launch (Product Hunt / Hacker News / a relevant subreddit) so the domain has at least one non-social inbound signal | Owner + agent kit |
| 5 | Agent's **final audit** passes: `node scripts/adsense-audit.mjs` (run against a production-identical build, then against the live domain where reachable) — ads.txt record, robots, sitemap completeness, the loader script in `<head>`, no empty ad placeholders, titles/descriptions/canonicals, no noindex, JSON-LD on tools and guides, internal linking, trust pages, 404 behaviour, posting cron inert-until-configured | Agent |

## Evidence log

| Date | Evidence | Reading |
| --- | --- | --- |
| 13 Nov | Full crawl audit after cycle-2 rejection | Clean on every technical check — the gap is maturity/traffic, not compliance |
| 14 Nov | GSC sitemap re-read | 79 pages, Success |
| 15 Nov | GSC 7-day performance | 2 clicks / 10 impressions |
| 15 Nov | GSC Page indexing | 17 indexed, 58 not indexed (56 discovered-not-indexed, 1 crawled-not-indexed, 1 redirect) |
| 16 Nov | Guide #25 shipped (`phone-document-scan-pipeline`) | 25 guides live |
| 18 Nov | Ranking tracker + FB week-1 pack + posting automation (cron + queue) | Distribution machinery in place |
| 18 Nov | Owner published 2 posts manually; queue re-synced | First organic social signal |
| 19–20 Nov | Internal linking + sitemap freshness PR | 156 tool→guide links, all 25 guides reachable, truthful `lastmod` |
| 20 Nov | Vercel production verified at `24dee9c`; cron registered (`/api/cron/fb-post`, 15:30 UTC) | Live |
| 20 Nov | `scripts/adsense-audit.mjs` run against a production-identical local build (AdSense env set) | **51/51 checks pass** — no technical blocker |
| 20 Nov | Live domain spot-check: `/ads.txt`, `/robots.txt`, `/sitemap.xml` | Correct publisher record, allow-all robots, 85 URLs with truthful lastmod |
| ~22 Nov | GSC Page indexing screenshot #1 | pending |
| ~29 Nov | GSC Page indexing screenshot #2 | pending |
| ~30 Nov | Final audit | pending |

## Timing rules

- **Fast track:** if indexing reaches 35+ and clicks are clearly up by ~25 Nov,
  the GO can move forward to 28–30 Nov.
- **Slip:** if indexing is still flat at ~29 Nov, the window moves to 8–14 Dec
  and the missing lever gets diagnosed first (external links are usually it).
- **Never:** same-day resubmission after a rejection, a second AdSense account,
  bought traffic or engagement, clicking our own ads, resubmitting with no
  change on the site.

## How to submit when the GO arrives

1. AdSense → **Sites** → toolsstars.com
2. Confirm the ad code is present (it is — loader in `<head>`, gated by
   `ADS_ENABLED`; the site must be built with the env vars set)
3. Tick the policy checkbox
4. **Request review**
5. Then stop touching it. Review takes days to a couple of weeks; resubmitting
   during a review restarts nothing and helps nothing.

## What the owner does while waiting (≈10 min/day, no more)

1. One social post at the queued time (copy + images come from the queue/pack;
   automation takes over the moment `FB_PAGE_ID` and `FB_PAGE_TOKEN` are in
   Vercel env — see `docs/fb-automation-setup.md`)
2. Answer every comment within 24 h
3. Once a week: Request-Indexing batch of 10 older URLs + a GSC screenshot
4. Bing Webmaster Tools: decide and set up once (it is a second discovery path
   and it costs 10 minutes)
