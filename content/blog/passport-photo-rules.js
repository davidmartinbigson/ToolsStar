// ID photos — size, DPI, background and the rejections nobody explains.
export default [
  {
    p: "Identity photo rejections are unusually cruel: you find out days after applying, the reason is a single sentence, and the fix means redoing a photo of your own face. The good news is that the rules are almost entirely mechanical — dimensions, background, expression, lighting — which means they can be satisfied deliberately instead of by luck.",
  },
  { h2: "The four rules that cause most rejections" },
  {
    ol: [
      "Background. Plain, light and even — off-white or light grey in most specifications. A patterned wall, a doorframe or a shadow gradient is the single most common rejection.",
      "Expression and pose. Neutral face, mouth closed, eyes open and visible, head straight and centred, shoulders square to the camera. Smiles, tilts and sideways glances fail.",
      "Lighting. Even, frontal, no shadows on the face or behind the head, no glare on glasses. Window light from one side produces the shadow that gets applications returned.",
      "Recency and likeness. The photo must look like you look now. A flattering photo from three years ago is a rejection waiting at a border, not just at the application desk.",
    ],
  },
  { h2: "Size, DPI and why pixels alone are not enough" },
  {
    p: "Specifications are usually given in physical units — 35×45 mm, 2×2 inches, 4.5×3.5 cm — because the photo is often printed. A physical size only means something together with a resolution: 35×45 mm at 300 DPI is 413×531 pixels; at 600 DPI it is 826×1063. Supplying the right pixel dimensions at the wrong implied DPI is a classic silent failure.",
  },
  {
    table: {
      head: ["Common specification", "Physical size", "At 300 DPI"],
      rows: [
        ["Many European / Schengen applications", "35 × 45 mm", "413 × 531 px"],
        ["US passport & visa", "2 × 2 in", "600 × 600 px"],
        ["Common South Asian ID / application", "3.5 × 4.5 cm", "413 × 531 px"],
        ["Printed photo strips", "varies", "always check the printed mm"],
      ],
    },
  },
  {
    note: {
      tone: "test",
      title: "Crop to the ratio before you think about pixels",
      text: "Every specification is really two constraints: an aspect ratio and a resolution. Crop to the ratio first — getting the head-and-shoulders framing right — and then set the pixel dimensions. Doing it in the other order produces correctly-sized photos with the wrong framing, which is the version that gets rejected.",
    },
  },
  { h2: "Framing: the part people get wrong at home" },
  {
    p: "The head should occupy a defined share of the frame — typically around three quarters of the height from chin to crown, with a little space above the head. Too tight and the crown is cropped; too loose and the face falls below the minimum size. Both are automatic rejections in automated checks, which increasingly measure the head box before a human ever looks.",
  },
  {
    ol: [
      "Stand about an arm's length from a plain wall, facing a window for soft frontal light.",
      "Camera at eye height, lens roughly a metre and a half away — closer lenses distort faces.",
      "Frame generously; you will crop afterwards. Cropping is lossless and reversible; un-cropping is impossible.",
      "Take several. Blink, micro-tilt and shadow are all easier to avoid by selection than by repetition.",
    ],
  },
  { h2: "Glasses, head coverings and children" },
  {
    ul: [
      "Glasses: permitted in some specifications, banned in others (the US has banned them in passport photos since 2016). Where permitted, no glare and no frame crossing the eyes.",
      "Religious head coverings: permitted where they are part of sincere religious practice, provided the full face from chin to forehead is visible and the covering casts no shadow on the face.",
      "Children: neutral expression is waived in practice for babies, but the background rule is not — a plain sheet behind the child is the standard trick.",
    ],
  },
  { h2: "File side of the story" },
  {
    p: "Online portals add digital constraints on top of the physical ones: maximum file size (often 100–500 KB), accepted formats (usually JPG), and minimum pixel dimensions. A 300 DPI photo satisfies the pixel side; hitting the byte ceiling then becomes a compression job — and one where you should protect the face: crop to the required frame before compressing so no bits are spent on background.",
  },
  { cta: { tool: "passport-photo-maker", label: "Passport Photo Maker", text: "Crop to the exact specification, set the right resolution, fix the background tone and export at the size your portal asks for — in your browser." } },
  {
    faq: [
      {
        q: "Can I take the photo with my phone?",
        a: "Yes — modern phone cameras are more than adequate. The failures are lighting, background and framing, none of which are camera problems. Use the rear camera, not the selfie camera, to avoid lens distortion.",
      },
      {
        q: "Is a white background mandatory?",
        a: "Usually 'plain and light' rather than strictly white; several specifications ask for light grey or off-white. Match the wording of the specification you are applying under, not a generic article — including this one.",
      },
      {
        q: "Why was my photo rejected for shadows?",
        a: "Because automated checks measure background uniformity. A shadow behind the head or across one cheek reads as an uneven background. Two diffuse light sources, or a window directly in front, removes them.",
      },
      {
        q: "Do I need 300 DPI if I am only uploading?",
        a: "The portal checks pixels, not DPI metadata — but printing may follow later. Exporting at the specification's pixel dimensions for 300 DPI satisfies both worlds at once.",
      },
    ],
  },
];
