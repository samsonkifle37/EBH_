import { describe, it, expect } from "vitest";
import {
  matchesChip,
  inMainQueue,
  isNeedsContact,
  isAdminFilter,
  buildHaystack,
  searchMatches,
  type BizFlags,
} from "../adminBusinessFilter";

const base: BizFlags = {
  isPending: true,
  hasImage: true,
  hasContact: true,
  isDuplicate: false,
  needsEnrichment: false,
  needsContactBucket: false,
  autoApprovedRecent: false,
};

describe("matchesChip", () => {
  it("ready_to_approve = pending + image + contact + not duplicate", () => {
    expect(matchesChip("ready_to_approve", base)).toBe(true);
    expect(matchesChip("ready_to_approve", { ...base, isDuplicate: true })).toBe(false);
    expect(matchesChip("ready_to_approve", { ...base, hasContact: false })).toBe(false);
  });
  it("needs_contact = pending + image + no contact (or contact bucket)", () => {
    expect(matchesChip("needs_contact", { ...base, hasContact: false })).toBe(true);
    expect(matchesChip("needs_contact", { ...base, hasContact: true })).toBe(false);
    expect(isNeedsContact({ ...base, isPending: false, needsContactBucket: true })).toBe(true);
  });
  it("needs_image follows the enrichment bucket", () => {
    expect(matchesChip("needs_image", { ...base, needsEnrichment: true })).toBe(true);
    expect(matchesChip("needs_image", base)).toBe(false);
  });
  it("duplicate_candidates requires pending + duplicate", () => {
    expect(matchesChip("duplicate_candidates", { ...base, isDuplicate: true })).toBe(true);
    expect(matchesChip("duplicate_candidates", { ...base, isDuplicate: true, isPending: false })).toBe(false);
  });
  it("auto_approved uses the recent flag", () => {
    expect(matchesChip("auto_approved", { ...base, autoApprovedRecent: true })).toBe(true);
  });
  it("all = main queue (pending, not in enrichment/contact buckets)", () => {
    expect(matchesChip("all", base)).toBe(true);
    expect(inMainQueue({ ...base, needsEnrichment: true })).toBe(false);
  });
});

describe("isAdminFilter", () => {
  it("validates filter keys", () => {
    expect(isAdminFilter("ready_to_approve")).toBe(true);
    expect(isAdminFilter("bogus")).toBe(false);
  });
});

describe("search", () => {
  const hay = buildHaystack({
    name: "Abyssinia Restaurant",
    city: "london",
    category: "restaurants",
    source: "google_places",
    phone: "020 1234 5678",
    website: "https://abyssinia.co.uk",
    email: "",
    status: "PENDING",
    claimed: false,
    verified: true,
  });

  it("matches across fields, case-insensitive, AND tokens", () => {
    expect(searchMatches(hay, "abyssinia")).toBe(true);
    expect(searchMatches(hay, "LONDON restaurants")).toBe(true);
    expect(searchMatches(hay, "google")).toBe(true);
    expect(searchMatches(hay, "abyssinia birmingham")).toBe(false);
  });
  it("supports claim + verification status tokens", () => {
    expect(searchMatches(hay, "unclaimed")).toBe(true); // claimed: false
    expect(searchMatches(hay, "owned")).toBe(false);
    expect(searchMatches(hay, "verified")).toBe(true);
    expect(buildHaystack({ name: "X", city: "leeds", category: "cafes", source: "", phone: "", website: "", email: "", status: "APPROVED", claimed: true, verified: false })).toContain("owned");
  });
  it("empty query matches everything", () => {
    expect(searchMatches(hay, "")).toBe(true);
    expect(searchMatches(hay, "   ")).toBe(true);
  });
});
