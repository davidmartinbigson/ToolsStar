// Favicon maths: eight requests, one icon, and why 16 pixels forgives nothing.
export default [
  {
    p: "Your logo looks superb on the homepage and like a smear of mud in the browser tab. Nothing is broken: the tab is 16 pixels wide, and somewhere between your 2000-pixel brand mark and that tab, a browser scaled one image down by a factor of 125 and kept whatever survived. Favicons are the smallest design surface you own and the least forgiving one.",
  },
  {
    p: "This guide lists the sizes browsers and phones actually request, explains why a single large PNG goes blurry, and gives the design rules that keep an icon legible at 16 pixels — plus the cache trap that makes people think their fix 'did not work'.",
  },
  { h2: "Eight requests, one icon" },
  {
    p: "A modern site does not serve one favicon; it answers a family of requests. Tabs and bookmarks want 16 and 32 pixels, the Windows taskbar wants 48, high-DPI screens ask for 64 or 128, Apple devices request a 180-pixel touch icon, and Progressive Web App manifests declare 192 and 512 for home-screen icons and splash screens. Miss one and some device invents its own downscale of whatever it finds.",
  },
  {
    table: {
      head: ["Size", "Where it appears", "Notes"],
      rows: [
        ["16 × 16", "Browser tab, bookmark list", "The unforgiving one — design for this first"],
        ["32 × 32", "Taskbar, address bar on some browsers", "Windows default"],
        ["48 × 48", "Desktop icons, some bookmark views", "Often packed inside the .ico"],
        ["64 / 128", "High-DPI tabs and menus", "Cheap insurance against soft edges"],
        ["180 × 180", "Apple touch icon (home screen)", "Square, opaque background — no transparency"],
        ["192 × 192", "Android home screen, PWA manifest", "Declared in the web manifest"],
        ["512 × 512", "PWA splash screen", "The only size with room for detail"],
      ],
    },
  },
  { h2: "Why one big PNG goes blurry" },
  {
    p: "Scaling down is not averaging; it is discarding. A 512-pixel logo reduced to 16 pixels throws away 96% of the samples, and thin strokes — a one-pixel line at 512 is a hundredth of a pixel at 16 — simply vanish or alias into grey fuzz. Anti-aliasing then blends what remains into mush. The browser is not doing anything wrong; it is doing arithmetic on an image that was never designed for the target.",
  },
  {
    p: "The professional fix is not a better scaler. It is a **purpose-drawn small version**: the same idea redrawn with fewer, thicker shapes so that at 16 pixels every remaining pixel is intentional. Multi-resolution .ico files exist precisely for this — one container holding separately-tuned 16, 32 and 48-pixel icons, so each request gets the version drawn for it.",
  },
  { h2: "Designing for 16 pixels" },
  {
    ul: [
      "One shape, one idea: a letter, a mark, a silhouette. Logos with a symbol plus wordmark must lose the wordmark.",
      "No text below roughly 24 pixels rendered size — at 16 pixels a word is a smudge, and two words are noise.",
      "Thick strokes and generous negative space: anything thinner than about 8% of the width disappears.",
      "High contrast against the tab: tabs are grey or dark, so a mid-grey icon reads as nothing.",
      "Opaque background for touch icons: transparency behind an Apple home-screen icon becomes black.",
      "Test at real size, on a real tab, before shipping: zoomed previews lie.",
    ],
  },
  {
    note: {
      tone: "warning",
      title: "The cache trap",
      text: "Favicons are cached more aggressively than almost anything else on a site. After replacing files, a hard reload often still shows the old icon — which sends people back to 'fix' a fix that already worked. Bump the filename or a query string in the link tag, or check in a private window, before concluding nothing changed.",
    },
  },
  { h2: "Where the files live" },
  {
    p: "Browsers look in two places: the classic /favicon.ico at the site root (still requested by legacy clients even when your HTML says otherwise), and the link tags in your page head — the icon links for PNG sizes, the apple-touch-icon link, and the manifest link that declares 192 and 512 for PWA installs. Ship the root .ico **and** the tags; they are not alternatives, they are generations of browser overlapping.",
  },
  {
    p: "Sizes are tiny in bytes — a tuned 16-pixel PNG is commonly under a kilobyte, the 512-pixel splash icon a few tens of kilobytes — so the whole family costs less than one hero image. There is no performance excuse for skipping any of them.",
  },
  { h2: "Checklist before you ship" },
  {
    ul: [
      "Recognisable at 16 pixels in a real tab, light and dark browser themes both.",
      "Multi-resolution .ico (16/32/48) at the root, plus PNG link tags for 64/128.",
      "180-pixel opaque apple-touch-icon; 192 and 512 declared in the manifest.",
      "No text, no thin lines, no transparency in the touch icon.",
      "Cache-busted filename or query string so the new icon actually appears.",
    ],
  },
  {
    p: "A favicon is a brand mark compressed into the size of a grain of rice. Treat it as its own design artefact — drawn small, tested small, shipped in every size devices ask for — and your tab will look intentional on every screen your visitors own.",
  },
  {
    faq: [
      {
        q: "Why is my favicon blurry in the tab but sharp on the page?",
        a: "The tab renders at 16 pixels. If you only supply a large image, the browser downscales it and thin strokes alias into mush. Supply a purpose-drawn 16-pixel version (inside a multi-resolution .ico) and the tab gets pixels that were designed, not discarded.",
      },
      {
        q: "Do I still need favicon.ico in 2026?",
        a: "Yes. Legacy clients and some crawlers request /favicon.ico at the root regardless of your link tags. Keep a multi-resolution .ico there and use link tags for the modern sizes.",
      },
      {
        q: "Why did my new favicon not appear after uploading?",
        a: "Favicon caching is extremely sticky. Hard-reload, then verify in a private window; if still old, change the filename or add a query string to the link tag. The fix usually worked before you saw it.",
      },
      {
        q: "Can I put my full logo with text in the favicon?",
        a: "Not legibly. Text below ~24 rendered pixels is a smudge, and at 16 pixels it is noise. Use the symbol or a single letter; keep the wordmark for the header and Open Graph image.",
      },
    ],
  },
  {
    cta: {
      tool: "favicon-generator",
      text: "Generate the whole family — multi-resolution .ico, 16–512px PNGs, Apple touch icon and PWA manifest entries — with live 48/32/16px previews and ready-to-paste HTML.",
    },
  },
];
