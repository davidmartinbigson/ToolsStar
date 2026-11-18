# Facebook auto-posting — one-time owner setup (~15 min)

Architecture: `content/social-queue.json` (one post per date, refilled
weekly by the agent) → Vercel Cron (daily 15:30 UTC = 20:30 PK) →
`/api/cron/fb-post` → Graph API posts to the Tools Stars page.
After this setup, posting is fully automatic. Credentials live ONLY in
Vercel env vars that the owner pastes personally — never in chat/repo.

## 1) Create the Facebook app (2 min)
1. developers.facebook.com → **Create App** → type **Business** (or
   "Other → Business") → name: `ToolsStars Publisher`.
2. You stay in **Development mode** — that is fine and required:
   dev-mode apps can post to pages whose admins are app admins (you).

## 2) Generate a long-lived PAGE token (8 min, your own login)
1. App dashboard → **Graph API Explorer** → pick your app →
   **Get Token → User Token**, tick permissions:
   `pages_show_list`, `pages_read_engagement`, `pages_manage_posts`.
2. Exchange it for a long-lived user token (paste your APP_ID,
   APP_SECRET from App Settings → Basic, and the SHORT token):
   `https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&client_id=APP_ID&client_secret=APP_SECRET&fb_exchange_token=SHORT_TOKEN`
3. With the long-lived user token, list your pages:
   `https://graph.facebook.com/v21.0/me/accounts?access_token=LONG_USER_TOKEN`
   → find **Tools Stars** → copy its `id` (page id) and its
   `access_token` (this page token is long-lived).

## 3) Vercel env vars (2 min, your Vercel login)
Project → Settings → Environment Variables → add for **Production**:
- `FB_PAGE_ID` = the page id
- `FB_PAGE_TOKEN` = the page access token
Optionally `CRON_SECRET` = any long random string (guards manual
triggers; scheduled Vercel Cron calls send it automatically).
Then **Deployments → ⋯ → Redeploy (cache untick)** — env is build-time.

## 4) Verify
- Wait for the daily cron (20:30 PK), or trigger manually:
  `curl -H "Authorization: Bearer $CRON_SECRET" "https://toolsstars.com/api/cron/fb-post?date=2026-11-18"`
  (omit the header if CRON_SECRET is unset). Response JSON says
  `posted: true` with a postId, or a clear `skipped`/`error` reason.
- Check the page: the post should be live.

## Troubleshooting: "device you don't usually use" checkpoint
Meta blocks developer registration from unrecognised devices/locations
for a cooling-off period. Not a ban; do not retry repeatedly (retries
extend it). Fix order: turn VPN off; use the device where the Facebook
app is normally logged in (its browser counts); use Facebook normally
on that device for 24–72 h so it becomes trusted; keep 2FA on; then try
once. If it persists beyond a week, complete any identity-confirmation
prompt Meta offers. Meanwhile the weekly pack can go out via Meta
Business Suite's own scheduler — no developer app needed for that.

## Maintenance notes
- **Weekly:** the agent appends the next 7 dated posts to
  `content/social-queue.json` via PR — no owner action.
- Missed days are skipped, never burst-posted (spam protection).
- If a post ever fails with Graph error **190 / token invalid**:
  regenerate the page token (step 2) and update `FB_PAGE_TOKEN`.
  Page tokens can need refresh every couple of months.
- Rules baked into the queue format: ≤1 post/day, no bought boosts,
  no superlative claims, real links only.
