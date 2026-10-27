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
 */
export function renderToBlob(img, { width, height, type = "image/jpeg", quality = 0.82, background = null }) {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(width));
    canvas.height = Math.max(1, Math.round(height));
    const ctx = canvas.getContext("2d");
    if (background) {
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
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
