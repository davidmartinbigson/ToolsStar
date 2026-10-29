// EXIF & GPS — the metadata your photos carry around.
export default [
  {
    p: "Every photo your phone takes quietly records more than pixels: the camera make and model, the lens settings, the exact timestamp, and — unless you turned it off — the latitude and longitude where the shutter opened. None of this is visible in the picture. All of it travels with the file, to whoever you send it to.",
  },
  {
    p: "That metadata has a name, EXIF, and it is genuinely useful: it is how photo apps sort your library by place and date. It is also a privacy leak of the most concrete kind, because a photo of your kitchen window is, with GPS attached, a photo of your address.",
  },
  { h2: "What is actually in the file" },
  {
    ul: [
      "GPS: latitude, longitude, often altitude and the direction the camera faced. The precise one.",
      "Device: make, model, sometimes the serial-number-adjacent identifiers and the lens details.",
      "Time: capture timestamp, frequently in UTC plus a local offset — enough to place you in a timezone.",
      "Settings: exposure, aperture, ISO, focal length, and whether flash fired.",
      "Software: which app last saved the file, and sometimes its version.",
    ],
  },
  {
    p: "Individually each field is harmless. Together they form a small dossier: what you shoot with, when, and where. For most people the GPS field is the one worth thinking about, because it is the only field that pins a photo to a place on a map.",
  },
  { h2: "When it actually matters" },
  {
    ol: [
      "Public posting. A photo of your home, your child's school run, or your favourite running route publishes coordinates to anyone who downloads the original file.",
      "Selling or licensing images. Buyers receive the full original; so does anyone the file is forwarded to.",
      "Documents and screenshots of sensitive screens. Device and software metadata can reveal more context than the visible content.",
      "Journalism, activism or any situation where location is itself sensitive. Here it is not a preference, it is operational security.",
    ],
  },
  {
    note: {
      tone: "info",
      title: "Most platforms strip it for you — and you should not rely on that",
      text: "Major social networks generally remove GPS on upload, which is why the problem feels theoretical until it is not. Originals sent by email, messaging apps in 'file' mode, cloud links and forum attachments typically do NOT strip anything. The safe habit is to control the file yourself rather than trusting each destination's policy.",
    },
  },
  { h2: "The clean way to remove it" },
  {
    p: "There are two philosophies. Stripping edits the metadata out of the existing file, keeping every pixel and the original encoding. Re-encoding draws the pixels into a brand-new file, which drops metadata by construction and also re-compresses the image.",
  },
  {
    p: "Stripping is the better default: it is lossless and fast. Re-encoding earns its place when you also want a smaller file, or when you want certainty — a freshly drawn file cannot carry fields nobody thought to list, which matters because EXIF has hundreds of tags and hand-written strippers routinely miss obscure ones.",
  },
  {
    p: "Whichever route you take, verify afterwards. A trustworthy tool shows you what it found and confirms what remains; 'trust me' is not a privacy feature.",
  },
  { h2: "Prevention is cheaper than cleaning" },
  {
    ul: [
      "Phones let you disable location tagging for the camera entirely. If you rarely use the map view in your photos app, this is the simplest permanent fix.",
      "Some platforms let you share a photo 'without location' at send time — convenient, but per-message, which makes it a habit you will eventually forget.",
      "For anything sensitive, treat the original file as the sensitive object: clean it once, keep the clean copy as the shareable master.",
    ],
  },
  { h2: "What metadata removal does not do" },
  {
    p: "It does not anonymise the picture itself. A distinctive view from your window, a street sign, a school badge in frame — those identify a place without any metadata at all. Cleaning EXIF removes the machine-readable leak; it does not remove what the photograph depicts. Both deserve a moment of thought before you post.",
  },
  { cta: { tool: "exif-viewer", label: "EXIF Viewer & Metadata Remover", text: "See exactly what your photo carries — GPS, device, timestamps — then produce a clean copy, verified, entirely on your device." } },
  {
    faq: [
      {
        q: "Does removing metadata reduce image quality?",
        a: "Not when the metadata is stripped rather than the image re-encoded: pixels are untouched. Re-encoding to drop metadata does recompress the image, so use lossless stripping unless you also want the size reduction.",
      },
      {
        q: "Can someone recover removed EXIF?",
        a: "Not from the cleaned file itself. The risk is copies: the original on your phone, in cloud backups, or already sent somewhere still carries it. Clean the file before it spreads, not after.",
      },
      {
        q: "Do screenshots contain location data?",
        a: "Screenshots carry no GPS, but they do carry device and software metadata, and their visible content is often the sensitive part. Metadata cleaning helps the former; cropping helps the latter.",
      },
      {
        q: "Is it illegal to remove EXIF?",
        a: "Removing metadata from your own photos is ordinary file management. The legal questions arise around copyright-management information in some jurisdictions when removing someone else's embedded rights data — your own files are yours to clean.",
      },
    ],
  },
];
