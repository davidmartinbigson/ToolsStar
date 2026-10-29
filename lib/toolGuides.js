// Editorial layer for the tool pages themselves.
//
// AdSense reviewers (and readers) judge a tool page on more than its
// interface: what it does, how it works under the hood, where its limits
// are, and when you should pick something else. Each entry below is real
// prose about the matching tool, written from the behaviour of the code in
// components/tools/*, and rendered by components/ToolShell.js between the
// features list and the FAQ.
//
// Shape: { slug: [ { h: "Heading", p: ["paragraph", ...], bullets?: ["..."] } ] }
// Tests in tests/logic.test.mjs (section 21) enforce the word floor, the
// section count and that every slug here is a real tool.

export const TOOL_GUIDES = {
  "split-pdf": [
    {
      h: "What splitting actually does inside a PDF",
      p: [
        "A PDF is not a long picture; it is a container of page objects, each holding its own text, vector shapes and references to shared resources such as fonts and images. Splitting here works at that object level: the pages you ask for are copied, intact, into a brand-new document. Nothing is re-rendered, re-compressed or rasterised, which is why the output keeps selectable text, sharp vectors and working links — and why the job finishes in a second or two instead of minutes.",
        "One consequence surprises people: an extracted page rarely weighs its proportional share of the original file. Fonts and images are stored once per document, so a single page pulled from a 200-page report can carry a font subset or an embedded logo with it. If your extract seems heavier than expected, that shared baggage is the usual reason — not a bug in the split.",
      ],
    },
    {
      h: "Extract, delete, or one PDF per page: choosing the right mode",
      p: [
        "The three modes cover genuinely different jobs. Extract is for pulling something out: one chapter, a signed form, the certificate buried on page 14 of a scan. Delete is the same operation inverted — you list the pages you do not want, which is the fastest way to clear blank separators and duplicate scans from a photocopied document. Each page = 1 PDF is for filing: every page becomes its own named file, page-1, page-2 and so on, which suits invoice bundles and scanned receipts that need to be sorted later.",
        "When a split produces many files, downloading them one by one is tedious, so the results panel offers a single ZIP instead. Ranges accept commas and dashes (1-3, 5, 8-10), an open end like 3- for “page 3 to the last”, and the presets fill common cases in one tap. Every number is validated against the document's real page count, so a typo tells you which page does not exist rather than failing silently.",
      ],
    },
  ],

  "merge-pdf": [
    {
      h: "What merging does to your pages — and what it cannot keep",
      p: [
        "Merging copies every page object from each source document, in the order you arrange them, into one new PDF. Because pages are copied rather than re-drawn, text stays selectable, vectors stay sharp and the visual result is identical to the originals. The list you see before merging shows each file's page count and size, and the up/down controls set the final order — the single most common reason people merge is exactly that: putting things in the right sequence.",
        "Two honest limits are worth knowing before you rely on a merge. First, PDF bookmarks live in a document-level outline tree, not on the pages, so a merged file keeps all the pages but not the sidebar bookmarks of its sources. Second, interactive form fields are also document-level: copied pages keep their filled-in appearance, but a field you could type into may arrive as fixed content. If a source is password-protected, print it to a fresh PDF first; locked internals tend to refuse copying.",
      ],
    },
    {
      h: "When merging is the wrong tool",
      p: [
        "Merge joins whole documents end to end. If you need only some pages of a source — say, the signature page of one contract inside a bundle of three — split that source first, then merge the pieces. Trying to do it in one merge produces a document you will have to redo.",
        "Size expectations matter too. Merging does not deduplicate resources across different sources: two files that each embed the same font will still embed it twice in the result, so the merged size is usually close to the sum of the parts. If the total is too big for an upload limit, compress after merging, not before — compressing first and then merging can undo part of the saving.",
      ],
      bullets: [
        "Order is set visually before anything is written — nothing is committed until you press Merge",
        "Page counts and file sizes are shown per source, so a wrong file is obvious before you download",
        "At least two PDFs are required; a single file has nothing to merge with",
        "The result is saved with object streams, which trims structural overhead for free",
      ],
    },
  ],

  "pdf-to-jpg": [
    {
      h: "DPI in one paragraph, with the maths you actually need",
      p: [
        "DPI decides how many pixels each inch of paper becomes. At 72 DPI a page is roughly one pixel per point — fine for a quick on-screen look, fuzzy the moment you zoom. At 150 DPI text is comfortably readable on screen and in slides; at 300 DPI you reach print quality, the setting archives and print shops expect. The pixel maths is simple: an A4 page at 300 DPI is about 2480 × 3508 pixels, while the same page at 72 DPI is under 600 pixels wide. That is why the same document can produce a 40 KB thumbnail or a 2 MB print file from one slider.",
        "Rendering happens page by page on your device, with a progress readout, because holding every rendered page in memory at once is what crashes low-memory laptops on long documents. If a conversion fails, the honest fix is a lower DPI or a shorter document — not a different browser tab.",
      ],
    },
    {
      h: "JPG, PNG or WebP for pages: a practical rule",
      p: [
        "Pages are mixed content — crisp black text sitting on photographs or coloured backgrounds — so the format choice is a trade. JPG at 85–90% quality is the smallest universal option and handles photographic pages well. PNG is lossless: text edges stay razor sharp with no compression artefacts, which matters for line art, diagrams and screenshots, at the cost of much larger files; that is also why the quality slider disables itself for PNG, since there is no quality to trade. WebP usually beats JPG at the same visual quality where the destination supports it.",
        "One detail worth knowing: PDF pages can contain transparency, and images cannot. The converter paints a white background under every page before exporting, so a page designed on transparent layers arrives looking like printed paper. Every page becomes its own numbered image, and multi-page results can be taken as a single ZIP.",
      ],
    },
  ],

  "video-to-gif": [
    {
      h: "Why GIFs are so heavy, and how to keep yours small",
      p: [
        "A GIF stores every frame as a full 256-colour picture. There is no clever between-frames compression like MP4 has, so the file size is essentially width × height × frames-per-second × seconds. Double the width and you roughly quadruple the file. That single fact explains every bloated GIF you have ever received.",
        "The controls here exist to fight that maths. Width options run from 240 px for tiny stickers to 560 px for quality demos, with 480 px the balanced default; smoothness runs 6–20 FPS, and 10–12 FPS reads as perfectly smooth for reactions and UI demos while costing far less than 20. Clip length is capped at 15 seconds on purpose: past about ten seconds a GIF stops being a reaction and starts being a video file with a worse codec. Pick the two-to-ten-second moment, not the whole scene.",
      ],
    },
    {
      h: "How the conversion runs, and what to do when it struggles",
      p: [
        "The clip is decoded in your browser: the player seeks frame by frame through your chosen window, paints each frame to a canvas, and hands it to a pool of encoding workers — up to four, matched to your CPU cores. It is real work on real hardware, so a progress bar and a Cancel button are part of the interface, not decorations.",
        "If a conversion fails or crawls, the effective remedies are a shorter clip, a smaller width, or an MP4 source in Chrome or Edge; heavily compressed MOV files from phones are the slowest inputs. And one permanent truth: GIF has no audio track at all, so sound is dropped by the format itself, not by the tool.",
      ],
      bullets: [
        "240 px — tiny stickers and emoji-style loops",
        "360 px — WhatsApp and Discord, where upload limits bite",
        "480 px — the balanced default for demos and reactions",
        "560 px — best quality, for when size genuinely does not matter",
      ],
    },
  ],

  "heic-to-jpg": [
    {
      h: "What HEIC actually is, and why it keeps getting rejected",
      p: [
        "HEIC is Apple's name for images stored in the HEIF container using HEVC compression — the same codec family as modern video. It earns its keep: at similar visual quality a HEIC file is routinely about half the size of a JPG, which is why iPhones have defaulted to it for years. The cost is compatibility. Windows only reads it with an added codec extension, many Android devices and most web upload forms — job portals, visa sites, exam portals, bank KYC pages — simply refuse it, and browsers cannot display it natively.",
        "So the practical workflow is: shoot in HEIC to save phone storage, convert to JPG the moment a file has to leave your device. Conversion here decodes the HEIC entirely in your browser and re-encodes to JPG at your chosen quality, 90% by default, which keeps detail while staying universally openable. PNG output is available when you need lossless pixels instead.",
      ],
    },
    {
      h: "Batch habits that make this a ten-second job",
      p: [
        "HEIC files rarely arrive alone — a day of photos arrives as twenty. The drop zone accepts many files at once and converts them the moment they land, showing a thumbnail and the new size per photo, with a single ZIP button once more than one result exists. Decoding HEIC is genuinely heavy work, so a few seconds per photo is normal and the status line says so rather than leaving you guessing.",
        "Two practical notes from real use. The decoder library is fetched on first use, so an aggressive ad-blocker or an offline machine will report a load failure rather than a conversion failure — different problem, different fix. And if a destination demands an exact file size, convert here first for compatibility, then run the JPG through a compressor; converting straight to a tiny quality setting to hit a size limit costs more detail than a proper compression pass.",
      ],
    },
  ],

  "video-trimmer": [
    {
      h: "Browser trimming is a re-encode, not a cut — here is why that matters",
      p: [
        "This tool trims by playing your chosen segment on a hidden player and recording it in real time through the browser's MediaRecorder, at about 5 Mbps for video and 160 kbps for audio. That has two honest consequences. First, a sixty-second clip takes roughly sixty seconds to produce, because the segment is genuinely played and captured rather than sliced out of the file. Second, the output container depends on your browser: Chrome and Edge typically yield MP4, Firefox yields WebM.",
        "The upside is privacy and cost: no upload, no server, no queue, and it works on files too personal to send anywhere. The trade is that this is not a frame-accurate lossless cut — that requires server-side ffmpeg rewriting the container without touching pixels. For cutting the boring start off a clip, isolating a highlight, or making a short loopable segment, re-encoding at 5 Mbps is visually indistinguishable from the source.",
      ],
    },
    {
      h: "Getting clean in and out points",
      p: [
        "Sliders are fine for rough cuts and useless for precise ones, so each slider has a companion button: set start (or end) to the current player position. Play the video, pause exactly where the good part begins, tap the button, and the in-point lands on that frame. The Preview selection button then plays only your chosen window so you can confirm before committing.",
        "The readout under the sliders states the resulting clip length in plain words, and the keep-sound checkbox drops the audio track when you only need the picture — useful for silent demos and previews. A clip needs at least half a second between in and out points; anything tighter is rejected with an explanation instead of producing a broken file.",
      ],
    },
  ],

  "image-cropper": [
    {
      h: "Cropping at full resolution, without surprises on export",
      p: [
        "The crop box works in the image's own pixels. The selection readout shows real dimensions — 1240 × 800, not a percentage — so what you frame is exactly what exports, at original resolution, with no hidden downscaling. Drag the box to move it, pull the amber corner to resize, and use the rotate and flip controls when a phone photo arrives sideways.",
        "Export format changes one subtle thing: transparency. PNG keeps transparent corners, which is what makes the circle-crop mode usable for profile pictures — it forces a 1:1 box and switches the output to PNG so the corners stay see-through. JPG has no transparency, so cropping to JPG paints any transparent area white; WebP sits between the two where your destination supports it. Lossy exports are written at 92% quality, high enough that crop edges stay clean without inflating the file.",
      ],
    },
    {
      h: "Which aspect ratio belongs where",
      p: [
        "Aspect presets exist because every destination has an opinion. Square 1:1 covers profile pictures and avatars across social platforms. 3:2 and 4:3 match camera photos and classic prints. 16:9 is the shape of video thumbnails, blog headers and presentation slides. 9:16 is the vertical story and reel format. Free mode is for when only the subject matters and no platform is involved.",
        "Choosing the preset before you drag saves a step: the box locks to the ratio and you only position it. You can also paste an image straight from the clipboard instead of hunting for the file, which is the fastest route for screenshots.",
      ],
      bullets: [
        "1:1 — profile pictures, avatars, DP crops",
        "3:2 and 4:3 — camera photos and prints",
        "16:9 — thumbnails, headers, slides",
        "9:16 — stories, reels, short-video covers",
      ],
    },
  ],

  "image-to-text": [
    {
      h: "What OCR reads well, and what it honestly cannot",
      p: [
        "Optical character recognition runs entirely in your browser: the image is analysed on your device and the recognised text appears in an editable box you can copy or download. On its first run the engine downloads the language data it needs, which is why the very first conversion is slower than every one after it.",
        "Before recognition, the scan is enhanced on your device: small photos are upscaled, the image is greyed and its contrast stretched to the full range, glyph edges are crisped, and a genuinely ink-on-paper page is binarised with Otsu's threshold. OCR accuracy follows input quality more than anything else, so this pass is usually the difference between clean text and garbage words. Photos and screenshots keep their greys, because forcing ink-and-paper on them destroys the anti-aliasing the recognition engine relies on. For handwritten forms there is a Handwriting / numbers scan type that repairs the classic digit mix-ups (O read as 0, l as 1, s as 5), and you can drag a box around just the line you need — signatures, stamps and borders outside the box never reach the engine at all.",
        "Accuracy follows the input, not the tool. Sharp, straight, well-lit scans of printed text at roughly 300 DPI come back nearly perfect. Handwriting, decorative scripts, curved text on packaging, blurry phone photos taken at an angle, and white text on pale backgrounds all degrade quickly — the engine is reading pixel shapes, not understanding the document. When nothing readable is found, the message says so plainly and suggests the fixes that actually work: sharper, straighter, better lit.",
      ],
    },
    {
      h: "Language selection changes the result more than people expect",
      p: [
        "The engine recognises shapes it was trained on, so telling it the document's language is not a formality. English, Urdu, Arabic, Hindi, Spanish, French and German are available, and mixed documents — an English form with Urdu stamps, for instance — need the combined English + Urdu model, because a single-language model treats the other script as noise.",
        "Because everything runs locally, this is also the right choice for documents you would not upload: medical papers, statements, contracts. The extracted text lands in a plain editable field, so fixing the odd misread character takes seconds before you copy it into your document.",
      ],
    },
  ],

  "screen-recorder": [
    {
      h: "What your browser is allowed to record",
      p: [
        "Recording happens through the browser's own screen-capture permission, the same one video-conferencing apps use. You choose a single tab, one window, or the entire screen, and nothing is captured before you make that choice. System audio is included only when your browser offers it in the share dialog — Chrome and Edge do for tab sharing — and your microphone can be mixed in separately for voice-overs. Phone browsers do not expose screen capture at all, which is why this tool asks for a desktop.",
        "One behaviour is a safety feature, not a flaw: if you press the browser's Stop sharing button, the recording ends immediately. The browser revokes the capture the moment sharing stops, and the tool treats that as your stop signal so you never keep an unintended tail on a recording.",
      ],
    },
    {
      h: "Settings and habits that make a usable recording",
      p: [
        "Capture runs at 30 frames per second and about 6 Mbps, which is plenty for demos, tutorials and bug reports while keeping files shareable. Output format follows your browser — WebM or MP4 — and a running timer keeps you honest about length. Record one topic per take; three short clips edit far better than one long ramble.",
        "Before you start: silence the tabs you will not narrate, turn off message notifications, and close anything private that lives on your desktop if you are sharing the whole screen. The microphone checkbox is off by default, so a recording made without it is picture and system sound only.",
      ],
      bullets: [
        "Tab capture — cleanest result, and the only mode that can carry tab audio",
        "Window capture — one app, immune to you switching screens",
        "Full screen — needed for multi-app workflows, but review it for private content first",
        "Stop & save in the tool, or Stop sharing in the browser — both end the take safely",
      ],
    },
  ],

  "compress-pdf": [
    {
      h: "Two genuinely different methods, and how to choose",
      p: [
        "The Keep-text method rebuilds the PDF structure losslessly: pages are copied into a fresh document written with object streams, unused structural overhead is dropped, and every glyph stays selectable and searchable. Savings are modest but free — nothing visual changes at all. It is the right first attempt for text-born PDFs from Word, Google Docs or export dialogs.",
        "The Smallest-size method re-renders each page to an image and rebuilds the document from those images. Scanned PDFs, which are already pictures wrapped in a PDF, shrink dramatically this way — often 70–95% — because the original scans were usually saved far larger than they need to be. The honest trade: after rasterising, text is no longer selectable or searchable, because the page really is a picture now. Choose it for scans and photo-heavy documents; avoid it for contracts and forms you will need to copy text from.",
      ],
    },
    {
      h: "Picking a level by destination, not by greed",
      p: [
        "Balanced re-renders at 150 DPI, which reads sharply on screen and satisfies most assignment and portal uploads. Strong drops to 120 DPI for email attachments where every megabyte counts. Extreme goes to 96 DPI with aggressive image quality for hard upload ceilings — the last resort when a portal simply refuses the file.",
        "And one expectation worth setting: if your PDF was already exported efficiently, compression may return almost the same size, and the tool says so instead of pretending to win. Modern exporters write tight files; there is no fat left to trim, and re-rendering such a document only risks quality for nothing.",
      ],
      bullets: [
        "Balanced, 150 DPI — portals, assignments, general sharing",
        "Strong, 120 DPI — email attachments and slow connections",
        "Extreme, 96 DPI — strict upload limits, readability over beauty",
        "Keep text — lossless cleanup when selectable text must survive",
      ],
    },
  ],
};

export function toolGuide(slug) {
  return TOOL_GUIDES[slug] || null;
}
