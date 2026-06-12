import { describe, it, expect } from "vitest";
import { trustScore } from "../trust";

describe("trustScore", () => {
  it("is 0 with no evidence", () => {
    expect(
      trustScore({
        hasGooglePlace: false,
        hasPhone: false,
        hasWebsite: false,
        hasCompaniesHouseMatch: false,
        ownerClaimed: false,
        hasPhotos: false,
      })
    ).toBe(0);
  });

  it("awards spec-defined points per evidence item", () => {
    expect(trustScore({ hasGooglePlace: true, hasPhone: false, hasWebsite: false, hasCompaniesHouseMatch: false, ownerClaimed: false, hasPhotos: false })).toBe(30);
    expect(trustScore({ hasGooglePlace: false, hasPhone: true, hasWebsite: false, hasCompaniesHouseMatch: false, ownerClaimed: false, hasPhotos: false })).toBe(20);
    expect(trustScore({ hasGooglePlace: false, hasPhone: false, hasWebsite: true, hasCompaniesHouseMatch: false, ownerClaimed: false, hasPhotos: false })).toBe(20);
    expect(trustScore({ hasGooglePlace: false, hasPhone: false, hasWebsite: false, hasCompaniesHouseMatch: true, ownerClaimed: false, hasPhotos: false })).toBe(15);
    expect(trustScore({ hasGooglePlace: false, hasPhone: false, hasWebsite: false, hasCompaniesHouseMatch: false, ownerClaimed: true, hasPhotos: false })).toBe(10);
    expect(trustScore({ hasGooglePlace: false, hasPhone: false, hasWebsite: false, hasCompaniesHouseMatch: false, ownerClaimed: false, hasPhotos: true })).toBe(5);
  });

  it("sums to exactly 100 with all evidence", () => {
    expect(
      trustScore({
        hasGooglePlace: true,
        hasPhone: true,
        hasWebsite: true,
        hasCompaniesHouseMatch: true,
        ownerClaimed: true,
        hasPhotos: true,
      })
    ).toBe(100);
  });
});
