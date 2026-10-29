// Hitting an exact KB target — the form-upload problem.
export default [
  {
    p: "'Upload a photograph, maximum 100 KB.' One line in a job application, a visa form or a university portal — and suddenly a 4 MB phone photo is a problem. The request sounds trivial. The reality is awkward, because cameras do not produce 100 KB files and most image tools do not let you aim at a size.",
  },
  {
    p: "This guide explains what is actually happening when you shrink a photo to a target size, why naive approaches fail, and the order of operations that gets you under the limit with the least visible damage.",
  },
  { h2: "Why 'just compress it' rarely works" },
  {
    p: "JPEG quality is not a size. Quality 80 on a busy 4000×3000 photo might be 2.4 MB; quality 20 on the same photo might still be 600 KB, and by then it is visibly falling apart. Size is a function of both quality and pixel count, and quality alone has a floor well above most form limits.",
  },
  {
    p: "So the only reliable way to hit an exact kilobyte target is to search: try a combination of dimensions and quality, measure the result, and adjust. Doing that by hand with a slider and a file-size readout is slow and frustrating, which is exactly what a binary search is for.",
  },
  { h2: "How the search works" },
  {
    p: "Our Compress Image to KB tool runs a binary search over JPEG quality for a series of candidate dimensions. It starts at the original size, encodes, measures the byte length, and halves the search interval toward whichever side of the target it landed on — repeating until the output sits at or under your limit with the highest quality that achieves it.",
  },
  {
    note: {
      tone: "test",
      title: "Why it keeps the best quality, not the first fit",
      text: "A naive search stops at the first setting that fits, which often throws away quality you did not need to sacrifice. Ours keeps testing and remembers the best-quality result that still fits, so a 100 KB target gives you the nicest 100 KB version available — not the ugliest one that happens to be under the line.",
    },
  },
  { h2: "The order of operations that preserves quality" },
  {
    ol: [
      "Crop first. If the form wants a head-and-shoulders photo and your frame includes a wall and a doorway, those pixels are pure waste. Cropping is the only lossless size reduction there is.",
      "Resize second. Dimensions are the dominant term in file size. A passport-style photo displayed at 300 pixels wide does not need 4000 pixels of source.",
      "Let quality absorb what is left. Only after cropping and resizing should the quality dial do any work — and at that point it usually needs very little.",
    ],
  },
  {
    p: "Follow that order and a 100 KB target is typically reached with quality still in the 80s, which looks clean. Do it backwards — quality first, resize last — and you will land at quality 30 with a mushy result that still barely fits.",
  },
  { h2: "The traps that catch people" },
  {
    ul: [
      "Confusing KB with KiB. Some portals mean 100 KB as 100,000 bytes, others as 102,400. If your file is rejected at '99 KB', try aiming a few percent lower.",
      "Re-compressing an already-compressed JPEG. Each lossy pass adds artefacts. Always start from the original photo, not from last week's compressed copy.",
      "Uploading a PNG to beat the limit. For photographs PNG is the worst possible choice — in our own format tests a photographic image was 14× larger as lossless PNG than as JPEG q80.",
      "Ignoring aspect-ratio rules. Many ID-photo forms specify both a maximum size and a ratio (3.5:4.5, 1:1, 4:3). Crop to the ratio before you compress, or the portal will reject an otherwise perfect file.",
      "Forgetting that 'maximum 100 KB' usually pairs with a minimum. Portals that cap size often also require a minimum resolution, so do not shrink below the stated pixel dimensions just to win on bytes.",
    ],
  },
  { h2: "What to check before you submit" },
  {
    ul: [
      "Open the final file at 100% and look at the eyes and any text in frame — that is where compression damage shows first.",
      "Confirm the colour space is sRGB; exotic profiles occasionally make a portal reject an otherwise valid file.",
      "Check the file name requirements. Several government portals reject filenames with spaces or special characters.",
      "Keep the original. If the portal changes its rules — and they do — you want to re-derive the file rather than re-compress a compressed one.",
    ],
  },
  {
    note: {
      tone: "info",
      title: "Everything stays on your device",
      text: "Because the search runs in your browser, the photo never leaves your machine. For identity documents and application photos that is not a nicety, it is the point: there is no server copy to leak, and no upload time on a slow connection.",
    },
  },
  { cta: { tool: "compress-image-to-kb", label: "Compress Image to KB tool", text: "Set your exact target — 20, 50, 100, 200 KB or anything custom — and the tool searches for the highest quality that fits, entirely in your browser." } },
  {
    faq: [
      {
        q: "Can any photo be compressed to 20 KB?",
        a: "Physically yes, but at some point the result stops being a usable photograph. Below roughly 30–50 KB for a full-frame photo you are choosing heavy artefacts over detail. If a form demands 20 KB, it almost certainly also expects a small crop — a passport-style head shot — not a landscape.",
      },
      {
        q: "Does hitting a KB target reduce the resolution?",
        a: "Only if the search needs it to. The tool prefers quality reduction at full dimensions and only steps down dimensions when quality alone cannot reach the target, so you keep as many pixels as the limit allows.",
      },
      {
        q: "Why not just use an online compressor and pick a percentage?",
        a: "Percentages describe effort, not outcome. 'Compress 80%' tells you nothing about the resulting byte count, and form portals only care about bytes. A target-size search guarantees the one number the portal actually checks.",
      },
      {
        q: "Is WebP accepted by these portals?",
        a: "Rarely. Most government and application portals whitelist JPG and PNG only, which is why the KB-target workflow defaults to JPEG. Convert to WebP for your website; keep JPEG for the form.",
      },
    ],
  },
];
