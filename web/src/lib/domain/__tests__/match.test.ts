import { describe, it, expect } from "vitest";
import { normalizeName, normalizePhone, websiteHost, findDuplicate, distanceMetres, type MatchCandidate } from "../match";

describe("normalizeName", () => {
  it("strips company suffixes and punctuation", () => {
    expect(normalizeName("ABYSSINIA RESTAURANT LTD")).toBe("abyssinia restaurant");
    expect(normalizeName("Abyssinia Restaurant Limited.")).toBe("abyssinia restaurant");
    expect(normalizeName("The Habesha Market!")).toBe("habesha market");
  });
});

describe("normalizePhone", () => {
  it("converts +44 to 0 and strips formatting", () => {
    expect(normalizePhone("+44 20 7837 1010")).toBe("02078371010");
    expect(normalizePhone("020 7837 1010")).toBe("02078371010");
    expect(normalizePhone("(0121) 554-2200")).toBe("01215542200");
  });
  it("returns empty for empty", () => {
    expect(normalizePhone("")).toBe("");
  });
});

describe("websiteHost", () => {
  it("extracts host ignoring protocol, www and path", () => {
    expect(websiteHost("https://www.abyssinia.co.uk/menu")).toBe("abyssinia.co.uk");
    expect(websiteHost("http://abyssinia.co.uk")).toBe("abyssinia.co.uk");
    expect(websiteHost("not a url")).toBe("");
  });
});

describe("findDuplicate", () => {
  const existing: MatchCandidate[] = [
    {
      id: "b1",
      name: "Abyssinia Restaurant",
      postcode: "N1 9DT",
      phone: "020 7837 1010",
      website: "https://abyssinia.co.uk",
      googlePlaceId: "place-123",
      companyNumber: "",
    },
  ];

  it("matches on Google place id", () => {
    const r = findDuplicate({ id: "", name: "Different Name", postcode: "", phone: "", website: "", googlePlaceId: "place-123", companyNumber: "" }, existing);
    expect(r?.match.id).toBe("b1");
    expect(r?.reason).toBe("google_place_id");
  });
  it("matches on normalized phone", () => {
    const r = findDuplicate({ id: "", name: "Other", postcode: "", phone: "+44 20 7837 1010", website: "", googlePlaceId: "", companyNumber: "" }, existing);
    expect(r?.reason).toBe("phone");
  });
  it("matches on website host", () => {
    const r = findDuplicate({ id: "", name: "Other", postcode: "", phone: "", website: "http://www.abyssinia.co.uk/contact", googlePlaceId: "", companyNumber: "" }, existing);
    expect(r?.reason).toBe("website");
  });
  it("matches CH company name to trading business via name + postcode prefix", () => {
    const r = findDuplicate({ id: "", name: "ABYSSINIA RESTAURANT LTD", postcode: "N1 9XX", phone: "", website: "", googlePlaceId: "", companyNumber: "12345678" }, existing);
    expect(r?.reason).toBe("name_postcode");
  });
  it("returns null when nothing matches", () => {
    const r = findDuplicate({ id: "", name: "Totally Different", postcode: "M1 1AA", phone: "0161 000 0000", website: "https://other.com", googlePlaceId: "p-9", companyNumber: "999" }, existing);
    expect(r).toBeNull();
  });

  it("matches by geo proximity within 50 metres", () => {
    const geoExisting: MatchCandidate[] = [
      { id: "g1", name: "Some Cafe", postcode: "", phone: "", website: "", googlePlaceId: "", companyNumber: "", lat: 51.5074, lng: -0.1278 },
    ];
    // ~20m away, different name/no shared identifiers
    const near = findDuplicate({ id: "", name: "Different Cafe", postcode: "", phone: "", website: "", googlePlaceId: "", companyNumber: "", lat: 51.50758, lng: -0.1278 }, geoExisting);
    expect(near?.reason).toBe("geo_proximity");
    // ~200m away → no match
    const far = findDuplicate({ id: "", name: "Different Cafe", postcode: "", phone: "", website: "", googlePlaceId: "", companyNumber: "", lat: 51.5092, lng: -0.1278 }, geoExisting);
    expect(far).toBeNull();
  });

  it("does not geo-match when coordinates are missing", () => {
    const geoExisting: MatchCandidate[] = [
      { id: "g1", name: "A", postcode: "", phone: "", website: "", googlePlaceId: "", companyNumber: "", lat: 51.5074, lng: -0.1278 },
    ];
    const r = findDuplicate({ id: "", name: "B", postcode: "", phone: "", website: "", googlePlaceId: "", companyNumber: "" }, geoExisting);
    expect(r).toBeNull();
  });
});

describe("distanceMetres", () => {
  it("is ~0 for identical points", () => {
    expect(distanceMetres(51.5, -0.12, 51.5, -0.12)).toBeCloseTo(0, 1);
  });
  it("measures a known short distance", () => {
    // 0.001 deg latitude ≈ 111 m
    expect(distanceMetres(51.5, -0.12, 51.501, -0.12)).toBeGreaterThan(100);
    expect(distanceMetres(51.5, -0.12, 51.501, -0.12)).toBeLessThan(120);
  });
});
