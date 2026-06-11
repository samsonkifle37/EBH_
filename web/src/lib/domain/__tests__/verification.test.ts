import { describe, it, expect } from "vitest";
import { verificationScore, profileCompleteness } from "../verification";

describe("verificationScore", () => {
  it("scores 0 for unverified empty profile", () => {
    expect(verificationScore(0, 0)).toBe(0);
  });
  it("adds 20 points per verification level", () => {
    expect(verificationScore(1, 0)).toBe(20);
    expect(verificationScore(3, 0)).toBe(60);
  });
  it("adds up to 20 points for profile completeness", () => {
    expect(verificationScore(0, 1)).toBe(20);
    expect(verificationScore(0, 0.5)).toBe(10);
  });
  it("caps at 100", () => {
    expect(verificationScore(4, 1)).toBe(100);
  });
});

describe("profileCompleteness", () => {
  const full = {
    description: "x".repeat(120),
    phone: "020 1234 5678",
    website: "https://example.co.uk",
    socials: JSON.stringify({ instagram: "https://instagram.com/x" }),
    openingHours: JSON.stringify({ mon: [{ open: "09:00", close: "17:00" }] }),
    photoCount: 4,
  };

  it("returns 1 when all six signals are present", () => {
    expect(profileCompleteness(full)).toBe(1);
  });
  it("returns 0 for an empty profile", () => {
    expect(
      profileCompleteness({
        description: "",
        phone: "",
        website: "",
        socials: "{}",
        openingHours: "{}",
        photoCount: 0,
      })
    ).toBe(0);
  });
  it("requires description of at least 80 chars", () => {
    expect(profileCompleteness({ ...full, description: "short" })).toBeCloseTo(5 / 6);
  });
  it("requires at least 3 photos", () => {
    expect(profileCompleteness({ ...full, photoCount: 2 })).toBeCloseTo(5 / 6);
  });
  it("treats invalid JSON as missing", () => {
    expect(profileCompleteness({ ...full, socials: "not-json" })).toBeCloseTo(5 / 6);
  });
});
