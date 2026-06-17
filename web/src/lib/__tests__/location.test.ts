import { describe, it, expect } from "vitest";
import { normalizeCity, findLocation, resolveLocation, searchLocations } from "../location";

describe("normalizeCity", () => {
  it("title-cases and collapses whitespace", () => {
    expect(normalizeCity("  potters   bar ")).toBe("Potters Bar");
    expect(normalizeCity("LONDON")).toBe("London");
    expect(normalizeCity("milton keynes")).toBe("Milton Keynes");
  });
  it("keeps connector words lowercase and hyphens intact", () => {
    expect(normalizeCity("newcastle upon tyne")).toBe("Newcastle upon Tyne");
    expect(normalizeCity("stoke-on-trent")).toBe("Stoke-on-Trent");
  });
  it("returns empty for blank", () => {
    expect(normalizeCity("   ")).toBe("");
  });
});

describe("findLocation", () => {
  it("matches known places case-insensitively", () => {
    expect(findLocation("glasgow")?.region).toBe("Scotland");
    expect(findLocation("Cardiff")?.country).toBe("United Kingdom");
    expect(findLocation("Enfield")?.county).toBe("Greater London");
  });
  it("returns null for unknown places", () => {
    expect(findLocation("Narnia")).toBeNull();
  });
});

describe("resolveLocation", () => {
  it("enriches known places", () => {
    expect(resolveLocation("belfast")).toMatchObject({ city: "Belfast", region: "Northern Ireland", country: "United Kingdom" });
  });
  it("accepts unknown UK places as free text", () => {
    expect(resolveLocation("some tiny village")).toMatchObject({ city: "Some Tiny Village", county: "", region: "", country: "United Kingdom" });
  });
});

describe("searchLocations", () => {
  it("prioritises prefix matches", () => {
    const r = searchLocations("lon");
    expect(r[0].city).toBe("London"); // prefix beats "Londonderry" ordering by dataset, both prefix
    expect(r.every((l) => l.city.toLowerCase().includes("lon"))).toBe(true);
  });
  it("falls back to substring and respects the limit", () => {
    expect(searchLocations("shire").length).toBe(0); // no city contains 'shire'
    expect(searchLocations("", 3).length).toBe(3);
  });
});
