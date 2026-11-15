// Transparent signatures: alpha channels, clean keying, and what portals actually accept.
export default [
  {
    p: "Every online form that asks for a signature wants the same impossible-sounding thing: a picture of your ink with nothing around it. Upload a photo of paper and you get a white rectangle sitting on top of the document like a sticker. What forms actually want is a transparent signature — ink strokes floating on an alpha channel — and getting one is easier than it sounds, if you know what the cutter is doing.",
  },
  {
    p: "The job has three parts: a clean source photo, a cut that removes the paper without eating your strokes, and an export in a format that can carry transparency at all. Most failures happen at part one.",
  },
  { h2: "What 'transparent' actually means (and why JPG can never do it)" },
  {
    p: "An image file can carry a fourth channel beside red, green and blue: alpha, the per-pixel answer to 'how see-through is this point?'. PNG and WebP store alpha; JPEG has no alpha channel at all — every pixel is fully opaque, so the paper's white is baked in forever. This is why 'make my signature JPG transparent' is not a setting problem but a format impossibility.",
  },
  {
    ul: [
      "PNG: lossless, full alpha — the default for signatures and stamps.",
      "WebP: alpha plus smaller files, for places that accept it.",
      "JPEG: opaque only; fine for photos, useless for cut-outs.",
      "GIF: one-bit alpha (pixel is either see-through or not) — jagged edges, avoid for signatures.",
    ],
  },
  { h2: "The cut: removing paper without eating ink" },
  {
    p: "Cutting tools key on brightness: pixels above a tolerance become transparent, pixels below stay. Your ink is dark, paper is light — in theory one slider solves it. In practice the enemy is shadow: a sheet photographed under a ceiling lamp carries a grey gradient, and grey sits exactly between ink and paper, so the cutter either leaves a ghost of the sheet or starts nibbling thin strokes.",
  },
  {
    table: {
      head: ["If your source is…", "Expect", "Fix first"],
      rows: [
        ["White paper, even daylight", "Clean one-slider cut", "Nothing — this is the ideal source"],
        ["Shadowed or grey-tinted paper", "Ghost edges or eaten strokes", "Re-shoot near a window, no overhead lamp"],
        ["Ruled or printed paper", "Rules and text leak into the cut", "Sign a plain sheet, always"],
        ["Old scanned JPG with cream background", "Partial rescue at best", "Raise contrast first, then cut with care"],
      ],
    },
  },
  {
    note: {
      tone: "warn",
      title: "Transparency is presentation, not alteration",
      text: "Removing the paper is fine; reshaping the signature is not. Keep every stroke exactly as the pen made it — no thickening, no smoothing, no 'cleanup' of the loops. Portals accept a clean cut of your real signature, not a redrawn one. Keep the original signed paper too.",
    },
  },
  { h2: "Sizes, formats and what portals actually demand" },
  {
    p: "Forms rarely say 'transparent PNG'; they say things like 'signature, 300×100 pixels, under 50 KB, JPG or PNG'. Pixels and kilobytes are the two gates, and they interact: a 600-pixel-wide PNG of thin black strokes compresses astonishingly well, so hitting 50 KB usually means shrinking dimensions, not quality.",
  },
  {
    ul: [
      "Capture wider than you need and scale down — downsizing anti-aliases edges and hides cut imperfections.",
      "For screen-only forms, ignore DPI entirely; pixels are the whole story. DPI matters only when someone prints.",
      "If an upload rejects PNG, flatten your transparent signature onto pure white and export JPG — same look, opaque file.",
      "Keep one master PNG at full quality; produce sized copies per portal, never re-cut from a re-cut.",
    ],
  },
  { h2: "A five-minute browser workflow" },
  {
    ol: [
      "Photograph the signature on plain white paper in even light — phone parallel to the sheet, no shadow across it.",
      "Load it into a browser cutter that keys out the background locally; nudge tolerance until the paper vanishes but the thinnest stroke survives.",
      "Preview over a coloured background — alpha mistakes hide on white and scream on colour.",
      "Crop to the strokes' bounding box, then resize to the portal's pixel spec (or ~600 px wide if unspecified).",
      "Export PNG, drop it into the form, and also test-paste it into a Word document once — that is where most people will see it live.",
    ],
  },
  {
    p: "A transparent signature is not a design flourish; it is the difference between a document that looks signed and one that looks stamped by a sticker. Clean light, honest cut, right format — and your ink sits on the page exactly where it belongs.",
  },
  {
    faq: [
      {
        q: "Why does my signature show a white box when I paste it into Word or a PDF?",
        a: "Either the file is a JPEG (which cannot store transparency), or it is a PNG whose background was never actually cut. Export a true transparent PNG and the white box disappears; pasting a JPEG will always carry its paper.",
      },
      {
        q: "Can I draw the signature with a finger or mouse instead of photographing paper?",
        a: "Yes — drawing pads produce clean vector-smooth strokes with perfect alpha from the start. Draw slowly from the wrist, several attempts, keep the best. For legal documents some institutions still prefer a wet-ink scan; a drawn signature is fine for everyday forms.",
      },
      {
        q: "Will every portal accept a transparent PNG?",
        a: "Most do. A minority of old upload forms whitelist JPEG only — in that case flatten your PNG onto pure white and export JPG at the requested size. The signature looks identical; only the alpha channel is gone.",
      },
      {
        q: "Does cutting the background change my signature's validity?",
        a: "No — removing surrounding paper alters nothing about the strokes themselves. What matters is fidelity: keep the shape, thickness and flow exactly as signed, and retain the original document. Transparency is framing, not forgery.",
      },
    ],
  },
  {
    cta: {
      tool: "signature-resizer",
      text: "Cut, clean and resize your signature in your browser — transparent PNG out, sized for any form.",
    },
  },
];
