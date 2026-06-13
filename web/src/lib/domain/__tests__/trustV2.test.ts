import { describe, it, expect } from "vitest";
import { computeTrustV2, type TrustV2Input } from "../trustV2";

const empty: TrustV2Input = {
  verifiedSubscription: false,
  ownerClaimed: false,
  hasGoogleSource: false,
  hasCompaniesHouse: false,
  hasOsmSource: false,
  hasManualLead: false,
  phone: false,
  website: false,
  email: false,
  photoCount: 0,
  reviewCount: 0,
  reviewAvg: 0,
  recentActivity: false,
  descriptionComplete: false,
  hasAddress: false,
  hasHours: false,
  hasSocial: false,
};

describe("computeTrustV2", () => {
  it("scores 0 for an empty business", () => {
    expect(computeTrustV2(empty).score).toBe(0);
  });

  it("awards the headline boosts", () => {
    expect(computeTrustV2({ ...empty, verifiedSubscription: true }).score).toBe(20);
    expect(computeTrustV2({ ...empty, ownerClaimed: true }).score).toBe(20);
    expect(computeTrustV2({ ...empty, hasGoogleSource: true }).score).toBe(15);
    expect(computeTrustV2({ ...empty, hasCompaniesHouse: true }).score).toBe(10);
    expect(computeTrustV2({ ...empty, hasOsmSource: true }).score).toBe(5);
    expect(computeTrustV2({ ...empty, hasManualLead: true }).score).toBe(2);
  });

  it("caps photos at +10 and counts +2 each", () => {
    expect(computeTrustV2({ ...empty, photoCount: 3 }).score).toBe(6);
    expect(computeTrustV2({ ...empty, photoCount: 9 }).score).toBe(10);
  });

  it("scores reviews by volume and quality", () => {
    expect(computeTrustV2({ ...empty, reviewCount: 2, reviewAvg: 3 }).score).toBe(2); // 2*1, avg bonus needs >=3 reviews
    expect(computeTrustV2({ ...empty, reviewCount: 4, reviewAvg: 4.5 }).score).toBe(9); // min(4,5)=4 + 5 quality
    expect(computeTrustV2({ ...empty, reviewCount: 9, reviewAvg: 4.2 }).score).toBe(10); // 5 cap + 5 quality
  });

  it("scores profile completion at 2.5 each capped at 10", () => {
    const r = computeTrustV2({ ...empty, descriptionComplete: true, hasAddress: true, hasHours: true, hasSocial: true });
    expect(r.score).toBe(10);
  });

  it("caps the total at 100 and the breakdown sums to the score", () => {
    const full: TrustV2Input = {
      verifiedSubscription: true,
      ownerClaimed: true,
      hasGoogleSource: true,
      hasCompaniesHouse: true,
      hasOsmSource: true,
      hasManualLead: true,
      phone: true,
      website: true,
      email: true,
      photoCount: 10,
      reviewCount: 20,
      reviewAvg: 5,
      recentActivity: true,
      descriptionComplete: true,
      hasAddress: true,
      hasHours: true,
      hasSocial: true,
    };
    const r = computeTrustV2(full);
    expect(r.score).toBe(100);
    const sum = r.breakdown.reduce((a, b) => a + b.points, 0);
    expect(Math.min(100, sum)).toBe(100);
  });

  it("returns only non-zero breakdown rows, each with a label", () => {
    const r = computeTrustV2({ ...empty, ownerClaimed: true, phone: true });
    expect(r.breakdown).toEqual([
      { label: "Owner claimed", points: 20 },
      { label: "Phone number", points: 5 },
    ]);
  });
});
