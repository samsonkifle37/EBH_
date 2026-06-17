import { resizeImage } from "./imageResize";
import { track } from "./analytics/client";

const CLIENT_ALLOWED = ["image/jpeg", "image/png", "image/webp"];

export interface UploadHandlers {
  onProgress?: (pct: number) => void;
}

/** Resize then upload a single image; resolves to the public URL. */
export async function uploadImage(
  file: File,
  opts: { kind: string; businessId?: string },
  handlers: UploadHandlers = {},
): Promise<string> {
  if (!CLIENT_ALLOWED.includes(file.type)) throw new Error("Only JPG, PNG or WebP images are allowed.");

  const resized = await resizeImage(file);
  const fd = new FormData();
  fd.append("file", resized);
  fd.append("kind", opts.kind);
  if (opts.businessId) fd.append("businessId", opts.businessId);

  const url = await new Promise<string>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/upload");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && handlers.onProgress) handlers.onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      try {
        const r = JSON.parse(xhr.responseText) as { url?: string; error?: string };
        if (xhr.status >= 200 && xhr.status < 300 && r.url) resolve(r.url);
        else reject(new Error(r.error || "Upload failed."));
      } catch {
        reject(new Error("Upload failed."));
      }
    };
    xhr.onerror = () => reject(new Error("Network error during upload."));
    xhr.send(fd);
  });

  track("IMAGE_UPLOADED", { businessId: opts.businessId, channel: opts.kind });
  return url;
}
