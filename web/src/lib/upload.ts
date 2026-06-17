// Pure upload validation + storage-key helpers. Unit-tested; shared by the
// upload API route.

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8 MB

const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export const UPLOAD_KINDS = ["cover", "logo", "founder", "gallery", "service", "signature"] as const;
export type UploadKind = (typeof UPLOAD_KINDS)[number];

export function isAllowedImageType(type: string): boolean {
  return (ALLOWED_IMAGE_TYPES as readonly string[]).includes(type);
}

export function extForType(type: string): string {
  return EXT_BY_TYPE[type] ?? "bin";
}

export interface UploadValidationOk {
  ok: true;
  ext: string;
}
export type UploadValidation = UploadValidationOk | { ok: false; error: string };

/** Validate a file's declared type + size before it touches storage. */
export function validateUpload(type: string, size: number): UploadValidation {
  if (!isAllowedImageType(type)) return { ok: false, error: "Only JPG, PNG or WebP images are allowed." };
  if (!Number.isFinite(size) || size <= 0) return { ok: false, error: "Empty file." };
  if (size > MAX_IMAGE_BYTES) return { ok: false, error: "Image is too large (max 8 MB)." };
  return { ok: true, ext: extForType(type) };
}

function isUploadKind(v: string): v is UploadKind {
  return (UPLOAD_KINDS as readonly string[]).includes(v);
}

/**
 * Deterministic, collision-resistant, sanitized storage key. Never trusts the
 * client filename for the path — only derives a safe slug for readability.
 */
export function storageKey(kind: string, ext: string, businessId: string | null | undefined, uniqueId: string): string {
  const safeKind = isUploadKind(kind) ? kind : "misc";
  const safeBiz = (businessId || "new").replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 40) || "new";
  const safeExt = /^[a-z0-9]{1,5}$/.test(ext) ? ext : "bin";
  const safeId = uniqueId.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 40) || "x";
  return `business-images/${safeBiz}/${safeKind}-${safeId}.${safeExt}`;
}
