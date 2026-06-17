import { describe, it, expect } from "vitest";
import { validateUpload, isAllowedImageType, extForType, storageKey, MAX_IMAGE_BYTES } from "../upload";

describe("isAllowedImageType / extForType", () => {
  it("allows jpg/png/webp only", () => {
    expect(isAllowedImageType("image/jpeg")).toBe(true);
    expect(isAllowedImageType("image/png")).toBe(true);
    expect(isAllowedImageType("image/webp")).toBe(true);
    expect(isAllowedImageType("image/gif")).toBe(false);
    expect(isAllowedImageType("application/pdf")).toBe(false);
    expect(isAllowedImageType("text/html")).toBe(false);
  });
  it("maps type → extension", () => {
    expect(extForType("image/jpeg")).toBe("jpg");
    expect(extForType("image/webp")).toBe("webp");
    expect(extForType("image/svg+xml")).toBe("bin");
  });
});

describe("validateUpload", () => {
  it("rejects unsafe types", () => {
    expect(validateUpload("image/svg+xml", 100).ok).toBe(false);
    expect(validateUpload("application/octet-stream", 100).ok).toBe(false);
  });
  it("rejects empty and oversized files", () => {
    expect(validateUpload("image/png", 0).ok).toBe(false);
    expect(validateUpload("image/png", MAX_IMAGE_BYTES + 1).ok).toBe(false);
  });
  it("accepts a valid image and returns ext", () => {
    const r = validateUpload("image/jpeg", 1234);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.ext).toBe("jpg");
  });
});

describe("storageKey", () => {
  it("namespaces by business + kind and is sanitized", () => {
    const k = storageKey("logo", "png", "biz_123", "abc-DEF_9");
    expect(k).toBe("business-images/biz_123/logo-abc-DEF_9.png");
  });
  it("defends against path traversal / junk in inputs", () => {
    const k = storageKey("../../etc", "p n g", "../../secret", "../../x/y");
    expect(k).not.toContain("..");
    expect(k).not.toContain("/etc");
    expect(k.startsWith("business-images/")).toBe(true);
    expect(k.endsWith(".bin")).toBe(true); // "p n g" is not a valid ext
  });
  it("falls back to 'new' when businessId is missing", () => {
    expect(storageKey("cover", "webp", null, "id1")).toBe("business-images/new/cover-id1.webp");
  });
});
