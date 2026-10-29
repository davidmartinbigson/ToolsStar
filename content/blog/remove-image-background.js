// Background removal — what on-device AI can and cannot do.
export default [
  {
    p: "Removing a background used to mean either paying for software or uploading your photo to a website that keeps a copy of it. Neither is necessary any more: modern segmentation models now run entirely inside your browser, which means the cut-out happens on your own device and the image never travels anywhere.",
  },
  {
    p: "That is how our AI Background Remover works. This guide covers what to expect from it, which images it handles beautifully, and the cases where you should give it a helping hand.",
  },
  { h2: "What 'on-device' actually changes" },
  {
    p: "A segmentation model is a neural network trained to answer one question per pixel: subject or background? Running it in the browser means the first visit downloads the model once (a few megabytes, cached afterwards), and every image after that is processed locally using your machine's own compute.",
  },
  {
    ul: [
      "Privacy: the photo is never uploaded, so there is no server copy of your face, your product shot or your document.",
      "No queue: there is no shared server doing everyone's work, so speed depends on your device, not on how busy a service is.",
      "No account and no watermark: nothing to gate behind a subscription, because there is no per-image server cost.",
    ],
  },
  { h2: "Which images cut out cleanly" },
  {
    p: "The model is at its best when the subject has a clear silhouette against a reasonably distinct background: a person against a wall, a product on a plain surface, a pet on grass, a car in a street. Fine hair and fur are the classic hard case, and the higher-quality model option handles them noticeably better than the fast one.",
  },
  {
    ul: [
      "Good: single subject, visible outline, background that differs in colour or brightness.",
      "Usually good: groups of two or three people, objects with defined edges like bottles or boxes.",
      "Hard: busy scenes with many overlapping subjects, subjects the same colour as the background, translucent materials like glass or smoke.",
    ],
  },
  { h2: "Getting a better cut-out without any skill" },
  {
    ol: [
      "Give the subject an edge. If you can choose the photo, pick one where the outline separates from the background — even slightly.",
      "Use the Best Quality model for hair, fur or fabric edges; use the fast model for products and graphics.",
      "Work at a sensible resolution. A 12-megapixel original is not better input here — it is slower input. A 2000-pixel-wide version cuts out identically and far quicker.",
      "Check the edges at 100% zoom on a chequered background before you trust it. Halos and chewed edges show up there first.",
    ],
  },
  { h2: "What to do with the transparent PNG afterwards" },
  {
    p: "The output is a PNG with a real alpha channel, which means you can drop it onto any colour, slide or listing without a white box around it. Two practical notes: transparent PNGs of photographic subjects are heavier than people expect, because alpha is stored per pixel — if the file is for the web, run it through a palette-based PNG compression or convert it to WebP. And if a destination does not accept transparency, composite it onto a solid colour first rather than letting the platform guess.",
  },
  {
    note: {
      tone: "warn",
      title: "Know the limits before a deadline",
      text: "On-device AI needs your browser to have enough memory for the model. Very large images on low-memory phones can fail. If that happens, resize the input down and try again — the cut-out quality is essentially unchanged.",
    },
  },
  { cta: { tool: "background-remover", label: "AI Background Remover", text: "Cut out any subject in one click with the model running on your own device — the photo never leaves your machine." } },
  { h2: "Choosing what goes behind the cut-out" },
  {
    p: "A transparent PNG is a starting point, not a destination — somewhere downstream something has to decide what sits behind the subject. Matching that decision to the destination avoids the two classic mistakes: a white box appearing where transparency was expected, and a subject floating unreadably over a busy background.",
  },
  {
    ul: [
      "Marketplace listings that mandate a pure white background: composite onto white at the exact pixel dimensions the platform asks for.",
      "Slides and marketing layouts: keep the alpha and let the design supply the colour, so the subject inherits your palette.",
      "Thumbnails over photography: add a subtle outline or drop shadow; a raw cut-out over a busy image reads as a sticker.",
      "Print: transparency does not survive most print pipelines — flatten onto the intended paper colour first.",
    ],
  },
  {
    p: "If you need several variants, generate the transparent master once and derive the rest from it. Re-running the cut-out per destination accumulates small edge differences that show when the variants sit side by side.",
  },
  {
    faq: [
      {
        q: "Is the result really transparent, or is it white?",
        a: "Really transparent. The output PNG carries an alpha channel, so it composites correctly over any background. If you see white, the viewer or destination you opened it in does not support transparency — try a checkerboard preview or a design tool.",
      },
      {
        q: "Does it work on product photos for listings?",
        a: "Yes, and that is one of the strongest uses. A plain-surface product shot cuts out very cleanly, and marketplaces that require a pure white background then become trivial: composite the cut-out onto white at any size.",
      },
      {
        q: "Why did it eat part of my subject?",
        a: "Usually because part of the subject resembles the background in colour and texture — a white shirt against a white wall, for example. Try the Best Quality model, or a photo with more separation.",
      },
      {
        q: "How is this different from magic-wand selection?",
        a: "A magic wand selects by colour similarity from a point you click; it fails on gradients and soft edges. A segmentation model understands the image as a scene, which is why it can follow hair strands and curved outlines that colour-based selection cannot.",
      },
    ],
  },
];
