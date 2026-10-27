// ── Tools Stars catalog ──────────────────────────────────────────────────────
// Add a new tool here + create its page, and it automatically appears in
// the homepage grid, the search, the /tools directory and the sitemap.

export const CATEGORIES = ["All", "Video", "Image", "PDF & Docs", "Generators", "Text"];

export const TOOLS = [
  {
    slug: "video-compressor",
    name: "Video Compressor",
    short: "Shrink MP4, WebM & MOV videos by up to 90% without losing visible quality.",
    category: "Video",
    icon: "video",
    badge: "Popular",
    gradient: "from-rose-500 to-orange-400",
    glow: "shadow-rose-500/25",
    keywords: ["compress video", "mp4 compressor", "reduce video size", "shrink video", "video size reducer"],
  },
  {
    slug: "background-remover",
    name: "AI Background Remover",
    short: "Remove any image background in one click with on-device AI. Transparent PNG out.",
    category: "Image",
    icon: "wand",
    badge: "AI Powered",
    gradient: "from-violet-500 to-fuchsia-400",
    glow: "shadow-violet-500/25",
    keywords: ["remove background", "bg remover", "transparent png", "cutout", "erase background"],
  },
  {
    slug: "image-compressor",
    name: "Image Compressor",
    short: "Compress JPG, PNG & WebP images in bulk. Control quality, resize, download as ZIP.",
    category: "Image",
    icon: "compress",
    badge: "Popular",
    gradient: "from-amber-400 to-yellow-300",
    glow: "shadow-amber-400/25",
    keywords: ["compress image", "reduce image size", "photo compressor", "bulk image compressor"],
  },
  {
    slug: "jpg-compressor",
    name: "JPG Compressor",
    short: "Tuned specifically for JPEG photos — smart quality slider with live size preview.",
    category: "Image",
    icon: "image",
    gradient: "from-sky-400 to-cyan-300",
    glow: "shadow-sky-400/25",
    keywords: ["compress jpg", "jpeg compressor", "jpg size reducer", "compress jpeg online"],
  },
  {
    slug: "png-compressor",
    name: "PNG Compressor",
    short: "Make PNGs dramatically smaller — lossless optimize or convert with transparency kept.",
    category: "Image",
    icon: "layers",
    gradient: "from-emerald-400 to-teal-300",
    glow: "shadow-emerald-400/25",
    keywords: ["compress png", "png optimizer", "reduce png size", "png minifier"],
  },
  {
    slug: "image-resizer",
    name: "Image Resizer",
    short: "Resize to exact pixels or % — with presets for Instagram, YouTube, Facebook & more.",
    category: "Image",
    icon: "resize",
    gradient: "from-indigo-400 to-blue-400",
    glow: "shadow-indigo-400/25",
    keywords: ["resize image", "image dimensions", "photo resizer", "instagram size"],
  },
  {
    slug: "image-converter",
    name: "Image Converter",
    short: "Convert between PNG, JPG and WebP in bulk. PNG to JPG, JPG to PNG, WebP & more.",
    category: "Image",
    icon: "convert",
    badge: "New",
    gradient: "from-pink-400 to-rose-400",
    glow: "shadow-pink-400/25",
    keywords: ["png to jpg", "jpg to png", "webp converter", "convert image format"],
  },
  {
    slug: "image-to-pdf",
    name: "Image to PDF",
    short: "Turn JPG & PNG images into a clean PDF. Reorder pages, pick A4 / Letter / Fit.",
    category: "PDF & Docs",
    icon: "pdf",
    gradient: "from-red-400 to-orange-400",
    glow: "shadow-red-400/25",
    keywords: ["jpg to pdf", "image to pdf", "png to pdf", "photo to pdf converter"],
  },
  {
    slug: "qr-code-generator",
    name: "QR Code Generator",
    short: "Create custom QR codes for links, text & Wi-Fi — your colors, PNG or SVG download.",
    category: "Generators",
    icon: "qr",
    gradient: "from-lime-400 to-green-400",
    glow: "shadow-lime-400/25",
    keywords: ["qr generator", "make qr code", "qr code maker", "free qr code"],
  },
  {
    slug: "password-generator",
    name: "Password Generator",
    short: "Generate unbreakable passwords with true on-device randomness + strength meter.",
    category: "Generators",
    icon: "key",
    gradient: "from-yellow-400 to-amber-500",
    glow: "shadow-yellow-400/25",
    keywords: ["strong password", "random password generator", "secure password"],
  },
  {
    slug: "word-counter",
    name: "Word Counter",
    short: "Count words, characters, sentences & reading time. Plus keyword density checker.",
    category: "Text",
    icon: "type",
    gradient: "from-cyan-400 to-sky-500",
    glow: "shadow-cyan-400/25",
    keywords: ["word count", "character counter", "reading time", "keyword density"],
  },
];

export function getTool(slug) {
  return TOOLS.find((t) => t.slug === slug);
}

export function relatedTools(slug, count = 4) {
  const tool = getTool(slug);
  const same = TOOLS.filter((t) => t.slug !== slug && t.category === tool?.category);
  const rest = TOOLS.filter((t) => t.slug !== slug && t.category !== tool?.category);
  return [...same, ...rest].slice(0, count);
}
