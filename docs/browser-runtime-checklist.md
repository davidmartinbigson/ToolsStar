# Owner browser runtime check (2 minutes)

The agent **cannot** see the owner's browser, tabs, console or device — there is
no bridge, and there should never be one. What the agent *can* verify is the
rendered HTML and every served file (`node scripts/adsense-audit.mjs`, 51
checks). What only a real browser can show is the **runtime**: JavaScript
errors, WebAssembly/codec failures, consent behaviour and how the AdSense
loader behaves on a live visit. This page is the 2-minute routine that closes
that gap, run by the owner, results pasted back in chat.

**Safety rule:** the snippet below is read-only and prints no secrets. Never
paste passwords, tokens or AdSense login details anywhere — including chat.
Console output from this snippet is safe to share.

## Step 1 — Console errors (60 seconds)

Open DevTools (F12 / Cmd+Option+I) → **Console** tab, then hard-reload
(Ctrl/Cmd+Shift+R) each of these four pages and note anything **red**:

1. `https://toolsstars.com/`
2. `https://toolsstars.com/tools/video-compressor`
3. `https://toolsstars.com/tools/background-remover` (heaviest: on-device AI)
4. `https://toolsstars.com/blog/mp3-bitrate-size-maths`

Ignore, they are normal: grey "Download the React DevTools" info lines,
yellow deprecation warnings from third-party libraries, and failed requests
**only** when an ad blocker or strict privacy mode is on (test once with the
blocker off). Screenshot anything red and send it.

## Step 2 — Read-only diagnostics snippet (60 seconds)

Paste this into the console on any page and press Enter. It changes nothing;
it only reads the page and prints a summary. Screenshot the printed object (or
wrap it in `copy(...)` and paste the text).

```js
console.log(JSON.stringify({
  url: location.href,
  h1: document.querySelectorAll("h1").length,
  adsLoader: document.querySelectorAll('script[src*="adsbygoogle"]').length,
  adUnits: document.querySelectorAll("ins.adsbygoogle").length,
  jsonLd: document.querySelectorAll('script[type="application/ld+json"]').length,
  canonical: (document.querySelector('link[rel="canonical"]') || {}).href || null,
  noindex: /noindex/i.test((document.querySelector('meta[name="robots"]') || {}).content || ""),
  imgsNoAlt: [...document.images].filter((i) => !i.alt).length,
  deadLinks: document.querySelectorAll('a[href="#"], a[href=""]').length,
  consentKeys: Object.keys(localStorage).filter((k) => /consent/i.test(k)),
}, null, 1));
```

## Step 3 — What "good" looks like

| Field | Expected | If different |
| --- | --- | --- |
| `h1` | exactly 1 | duplicate/missing H1 hurts SEO — report it |
| `adsLoader` | 1 on every page | 0 means the build lost the AdSense env var — report immediately |
| `adUnits` | **0 today** | correct until an ad slot id is configured post-approval; a non-zero number before approval would be the bug |
| `jsonLd` | 2 on home, 3 on tools and guides (arrays inside count as one tag) | lower means a schema block failed to render |
| `canonical` | same URL as the address bar | mismatch = duplicate-content risk |
| `noindex` | false | true on any public page = indexing blocked |
| `imgsNoAlt` | 0 | missing alt text hurts accessibility + image SEO |
| `deadLinks` | 0 | `#` placeholders look unfinished to reviewers |
| `consentKeys` | one key after a consent choice, none before | consent must be opt-in, never pre-set |

## Step 4 — AdSense-specific notes

- With the site **not yet approved and no slot id configured**, the correct
  behaviour is: loader present, zero ad units, zero layout shift, consent
  banner shown once. That is exactly what the audit asserts; the browser
  check just confirms it live.
- After approval, when a slot id is added, one `<ins class="adsbygoogle">`
  per AdSlot appears **only after** consent — and never clicks its own ads.

Send the screenshots/output in chat; the agent records the result in
`docs/adsense-resubmit-gate.md` (evidence log) and fixes anything red in the
repo the same day.
