// Why phone photos of paper look grey, and the four-fix pipeline that turns them into scans.
export default [
  {
    p: "Photograph a paper form and the result reads like a memory of the document: grey where the paper was white, a trapezoid where the page was a rectangle, a shadow of your own hand across paragraph three. Yet tap 'scan' in any decent app and the same sheet comes out crisp, square and bright. Nothing magical happened — four very ordinary corrections did, in order.",
  },
  {
    p: "Knowing what a scan pipeline actually fixes tells you how to shoot the source photo so the pipeline has something worth saving — and which damage no pipeline can undo.",
  },
  { h2: "What your camera sees versus what a document is" },
  {
    p: "A camera meters light for the whole scene, and a sheet of paper on a dark desk is mostly desk: the exposure lands for the room, so the paper comes out under-lit and grey. Mixed lighting adds a colour cast — window daylight on one half, ceiling bulb on the other. Hold the phone at an angle and perspective turns the rectangle into a trapezoid. None of this is a bad camera; it is a camera doing exactly what cameras do to reflective flat objects.",
  },
  { h2: "The four fixes a real scan pipeline applies" },
  {
    ul: [
      "Perspective (keystone) correction: corner detection finds the page's four corners and warps the trapezoid back into a true rectangle — the reason scanned pages look flat-on even when you shot at an angle.",
      "Illumination flattening: the pipeline estimates the uneven background light (your hand's shadow, the lamp's hotspot) and divides it out, so white becomes uniformly white.",
      "White-point and contrast stretch: the paper's brightest tone is pushed to true white and ink is deepened, which is what turns 'grey wash' into readable text.",
      "Resolution normalising: the corrected page is resampled to a sane output size — typically A4 or Letter at 200–300 DPI — so portals and printers get predictable dimensions.",
    ],
  },
  {
    table: {
      head: ["Symptom in your photo", "Cause", "Pipeline fix"],
      rows: [
        ["Grey, washed-out paper", "Exposure metered for the room", "Flatten + white-point stretch"],
        ["Trapezoid page, converging lines", "Phone not parallel to paper", "Corner detection + keystone warp"],
        ["Yellow/blue half-cast", "Mixed light sources", "White balance keyed to the paper"],
        ["Soft, mushy small text", "Too few pixels on the glyphs", "Nothing can invent detail — re-shoot closer"],
      ],
    },
  },
  {
    note: {
      tone: "warn",
      title: "Binarisation is a choice, not an upgrade",
      text: "Pure black-and-white mode is superb for OCR and printing, but it destroys everything colour carries: blue signatures, red stamps, yellow highlighter. For anything signed, stamped or annotated, keep grey or colour mode. The cleanest file is not always the most faithful one.",
    },
  },
  { h2: "Shoot so the pipeline has something to work with" },
  {
    ol: [
      "Put the paper flat and get parallel — keystone correction works, but every degree you save it is sharpness kept.",
      "Light from the side (a window), never a bulb directly above: overhead light is what throws your phone's shadow onto the page.",
      "Fill the frame with the sheet plus a thin margin of desk — the desk edge is how corner detection finds the page.",
      "Tap to focus and expose on the paper itself, not the room.",
      "Wipe the lens. Half of all 'bad scanner apps' are fingerprint smears on glass.",
    ],
  },
  { h2: "What portals, landlords and lawyers actually accept" },
  {
    p: "Most submission systems ask for A4 or Letter pages at 200–300 DPI, in PDF for multi-page documents or JPG/PNG for a single sheet, under a size cap that varies from 100 KB to a few MB. Legibility, completeness and fidelity are the three tests a human reviewer applies: every corner visible, nothing cropped, nothing altered. Enhancement that cleans light and perspective is routine; enhancement that changes content is falsification — so keep the original photo too, and treat the scan as a copy.",
  },
  {
    ul: [
      "Signed or stamped documents: colour or grey mode, never binarised.",
      "Multi-page forms: one PDF in page order beats a pile of JPGs every time.",
      "Over the size cap? Compress the scan afterwards (dimensions first, quality second) rather than shooting smaller and blurrier.",
      "OCR destinations: clean contrast matters more than resolution past ~200 DPI.",
    ],
  },
  {
    p: "A phone scan is not a photograph of paper; it is a photograph that has confessed to being a document — perspective corrected, light flattened, whites made white. Give the pipeline a flat, lit, lens-clean source and the confession is flawless; give it blur and shadow and no algorithm will sign what it cannot read.",
  },
  {
    faq: [
      {
        q: "Why does my scanned text still look grey instead of black?",
        a: "Usually the white-point/contrast stretch was gentle (grey-mode output) or the source had too few pixels on the glyphs. For OCR or printing, choose a higher-contrast mode; for faithful copies of signed paper, gentle grey is actually the honest choice.",
      },
      {
        q: "Is a phone-scanned document legally acceptable?",
        a: "For the overwhelming majority of forms, applications, rentals and contracts: yes — portals explicitly accept scans, provided the document is legible, complete and unaltered. A few notarised or original-only processes still demand wet ink; check the specific instruction, and keep your original either way.",
      },
      {
        q: "Can software rescue a scan that came out blurry?",
        a: "Sharpening can crisp edges that are slightly soft; it cannot reconstruct glyph detail that was never captured. If small text mushes, the fix is physical: move closer, hold steady, wipe the lens — then re-shoot.",
      },
      {
        q: "PDF or JPG for submissions?",
        a: "PDF when the document has pages (forms, contracts, mark sheets) — it keeps order, orientation and A4 geometry in one file. JPG/PNG when a portal asks for a single image (IDs, signatures, receipts). When in doubt, the portal's own wording wins.",
      },
    ],
  },
  {
    cta: {
      tool: "document-scanner",
      text: "Scan paper with your camera in the browser — corners squared, light flattened, PDF or image out. On-device, as always.",
    },
  },
];
