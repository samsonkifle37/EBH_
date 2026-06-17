// Client-only: downscale + re-encode an image before upload to keep payloads
// small and uploads fast. Falls back to the original file on any error.

export async function resizeImage(file: File, maxDim = 1600, quality = 0.82): Promise<File> {
  if (typeof document === "undefined" || typeof createImageBitmap !== "function") return file;
  try {
    const bitmap = await createImageBitmap(file);
    const longest = Math.max(bitmap.width, bitmap.height);
    const scale = Math.min(1, maxDim / longest);
    // Already small enough — don't bother re-encoding.
    if (scale >= 1 && file.size < 1.5 * 1024 * 1024) {
      bitmap.close?.();
      return file;
    }
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close?.();
    // Preserve PNG (transparency, e.g. logos); otherwise encode JPEG.
    const type = file.type === "image/png" ? "image/png" : "image/jpeg";
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, type, quality));
    if (!blob) return file;
    const ext = type === "image/png" ? "png" : "jpg";
    return new File([blob], file.name.replace(/\.[^.]+$/, `.${ext}`), { type });
  } catch {
    return file;
  }
}
