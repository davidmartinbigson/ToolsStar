// Shared client-side helpers for all tools.

export function formatBytes(bytes, decimals = 2) {
  if (bytes === 0 || bytes == null) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
  return `${(bytes / Math.pow(k, i)).toFixed(decimals)} ${sizes[i]}`;
}

export function savedPct(before, after) {
  if (!before || after == null) return 0;
  return Math.max(0, Math.round((1 - after / before) * 100));
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export function stripExt(name) {
  return name.replace(/\.[^.]+$/, "");
}

/** Load an image File/Blob into an HTMLImageElement (or ImageBitmap info). */
export function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve({ img, url, width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read this image file."));
    };
    img.src = url;
  });
}

/**
 * Draw an image onto a canvas at the target size and export a Blob.
 * Flattening onto `background` is used when exporting to JPEG (no alpha).
 *
 * `fit` controls mismatched aspect ratios:
 * - "stretch" (default, legacy behaviour): force the image to width × height
 * - "contain": show the whole image, centered, without distortion
 * - "cover": fill the frame without distortion, center-cropping overflow
 */
export function renderToBlob(img, { width, height, type = "image/jpeg", quality = 0.82, background = null, fit = "stretch" }) {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(width));
    canvas.height = Math.max(1, Math.round(height));
    const ctx = canvas.getContext("2d");
    // In contain mode, PNG/WebP background means only the empty edges. Do not
    // pre-fill the whole canvas there, or transparent pixels inside the image
    // itself would also be flattened. JPEG still needs a full flatten.
    const flattenWholeCanvas = background && (fit !== "contain" || type === "image/jpeg");
    if (flattenWholeCanvas) {
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    const sourceWidth = img.naturalWidth || img.width;
    const sourceHeight = img.naturalHeight || img.height;
    if (sourceWidth > 0 && sourceHeight > 0 && fit === "contain") {
      const scale = Math.min(canvas.width / sourceWidth, canvas.height / sourceHeight);
      const drawWidth = Math.max(1, Math.round(sourceWidth * scale));
      const drawHeight = Math.max(1, Math.round(sourceHeight * scale));
      const drawX = Math.round((canvas.width - drawWidth) / 2);
      const drawY = Math.round((canvas.height - drawHeight) / 2);
      ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
      if (background && !flattenWholeCanvas) {
        ctx.fillStyle = background;
        if (drawY > 0) ctx.fillRect(0, 0, canvas.width, drawY);
        const bottomY = drawY + drawHeight;
        if (bottomY < canvas.height) ctx.fillRect(0, bottomY, canvas.width, canvas.height - bottomY);
        if (drawX > 0) ctx.fillRect(0, drawY, drawX, drawHeight);
        const rightX = drawX + drawWidth;
        if (rightX < canvas.width) ctx.fillRect(rightX, drawY, canvas.width - rightX, drawHeight);
      }
    } else if (sourceWidth > 0 && sourceHeight > 0 && fit === "cover") {
      const scale = Math.max(canvas.width / sourceWidth, canvas.height / sourceHeight);
      const cropWidth = canvas.width / scale;
      const cropHeight = canvas.height / scale;
      ctx.drawImage(
        img,
        (sourceWidth - cropWidth) / 2,
        (sourceHeight - cropHeight) / 2,
        cropWidth,
        cropHeight,
        0,
        0,
        canvas.width,
        canvas.height
      );
    } else {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    }
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Export failed in this browser."))),
      type,
      quality
    );
  });
}

export function fitWithin(w, h, maxDim) {
  if (!maxDim || (w <= maxDim && h <= maxDim)) return { width: w, height: h };
  const scale = maxDim / Math.max(w, h);
  return { width: Math.round(w * scale), height: Math.round(h * scale) };
}

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

/** Load a classic script from a CDN once (for gif.js, tesseract, etc.). */
export function loadScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[data-cdn="${src}"]`);
    if (existing) {
      if (existing.dataset.loaded) resolve();
      else {
        existing.addEventListener("load", () => resolve());
        existing.addEventListener("error", () => reject(new Error("A required library failed to download. Check your connection or ad-blocker.")));
      }
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.dataset.cdn = src;
    s.onload = () => { s.dataset.loaded = "1"; resolve(); };
    s.onerror = () => reject(new Error("A required library failed to download. Check your connection or ad-blocker."));
    document.head.appendChild(s);
  });
}

/** Download [{blob,name}] as one ZIP (or directly, if there is only one). */
export async function downloadZip(entries, zipName) {
  if (!entries.length) return;
  if (entries.length === 1) return downloadBlob(entries[0].blob, entries[0].name);
  const { default: JSZip } = await import("jszip");
  const zip = new JSZip();
  const used = new Set();
  for (const e of entries) {
    let name = e.name;
    let n = 2;
    while (used.has(name)) name = `${stripExt(e.name)}-${n++}.${e.name.split(".").pop()}`;
    used.add(name);
    zip.file(name, e.blob);
  }
  downloadBlob(await zip.generateAsync({ type: "blob" }), zipName);
}
