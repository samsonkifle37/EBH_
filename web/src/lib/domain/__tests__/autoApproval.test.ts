import { describe, it, expect } from "vitest";
import { hasValidName, isPlaceholderImage, autoApprovalScore, evaluateListing } from "../autoApproval";

describe("hasValidName", () => {
  it("accepts a real name longer than 2 chars", () => {
    expect(hasValidName("Selam Cafe")).toBe(true);
  });
  it("rejects short or placeholder names", () => {
    expect(hasValidName("AB")).toBe(false);
    expect(hasValidName("Unknown")).toBe(false);
    expect(hasValidName("test")).toBe(false);
    expect(hasValidName("N/A")).toBe(false);
    expect(hasValidName("  placeholder ")).toBe(false);
    expect(hasValidName("")).toBe(false);
  });
});

describe("isPlaceholderImage", () => {
  it("flags empty and placeholder URLs", () => {
    expect(isPlaceholderImage("")).toBe(true);
    expect(isPlaceholderImage("https://picsum.photos/seed/x/800/600")).toBe(true);
    expect(isPlaceholderImage("https://example.com/logo.png")).toBe(true);
  });
  it("accepts a real image URL", () => {
    expect(isPlaceholderImage("https://maps.googleapis.com/x.jpg")).toBe(false);
    expect(isPlaceholderImage("/api/photos/google?name=places/x/photos/y")).toBe(false);
  });
});

describe("autoApprovalScore", () => {
  it("matches the PRD example: OSM + website + phone + image = 30", () => {
    expect(autoApprovalScore({ hasOsm: true, hasGoogle: false, hasCompaniesHouse: false, website: true, phone: true, email: false, hasImage: true })).toBe(30);
  });
  it("OSM + image + website only = 25 (below threshold)", () => {
    expect(autoApprovalScore({ hasOsm: true, hasGoogle: false, hasCompaniesHouse: false, website: true, phone: false, email: false, hasImage: true })).toBe(25);
  });
  it("counts a single source bonus even with multiple sources", () => {
    expect(autoApprovalScore({ hasOsm: true, hasGoogle: true, hasCompaniesHouse: true, website: false, phone: false, email: false, hasImage: false })).toBe(10);
  });
  it("email counts as +5 contact", () => {
    expect(autoApprovalScore({ hasOsm: true, hasGoogle: false, hasCompaniesHouse: false, website: true, phone: false, email: true, hasImage: true })).toBe(30);
  });
});

const base = {
  name: "Selam Cafe",
  hasImage: true,
  phone: "020 1234 5678",
  website: "https://selam.example.co.uk",
  email: "",
  hasOsm: true,
  hasGoogle: false,
  hasCompaniesHouse: false,
};

describe("evaluateListing", () => {
  it("auto-approves a complete high-confidence listing", () => {
    const r = evaluateListing(base);
    expect(r.status).toBe("APPROVED");
    expect(r.verificationStatus).toBe("auto_verified");
    expect(r.approvedBy).toBe("system");
    expect(r.approvalReason).toBe("Trust Threshold Passed");
    expect(r.reviewBucket).toBe("");
  });

  it("routes a listing with no image to needs_enrichment", () => {
    const r = evaluateListing({ ...base, hasImage: false });
    expect(r.status).toBe("PENDING");
    expect(r.reviewBucket).toBe("needs_enrichment");
  });

  it("keeps an image-but-no-contact listing pending with a clear reason", () => {
    const r = evaluateListing({ ...base, phone: "", website: "", email: "" });
    expect(r.status).toBe("PENDING");
    expect(r.reviewBucket).toBe("");
    expect(r.approvalReason).toBe("Missing contact information");
  });

  it("keeps a below-threshold listing pending (image + phone only = 25)", () => {
    const r = evaluateListing({ ...base, website: "" });
    expect(r.status).toBe("PENDING");
    expect(r.approvalReason).toBe("Below trust threshold");
  });

  it("flags an invalid name for review", () => {
    const r = evaluateListing({ ...base, name: "Test" });
    expect(r.status).toBe("PENDING");
    expect(r.approvalReason).toBe("Name needs review");
  });
});
