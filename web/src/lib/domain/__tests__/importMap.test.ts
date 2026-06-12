import { describe, it, expect } from "vitest";
import { mapPlaceToBusiness, mapCompanyToBusiness } from "../importMap";

const PLACE_FIXTURE = {
  id: "ChIJabc123",
  displayName: { text: "Merkato Ethiopian Restaurant", languageCode: "en" },
  formattedAddress: "12 Granby Street, Leicester LE1 6EP, UK",
  location: { latitude: 52.6336, longitude: -1.1332 },
  nationalPhoneNumber: "0116 254 7100",
  websiteUri: "https://merkato-leicester.co.uk/",
  rating: 4.6,
  userRatingCount: 213,
  businessStatus: "OPERATIONAL",
  googleMapsUri: "https://maps.google.com/?cid=123",
  regularOpeningHours: {
    periods: [
      { open: { day: 1, hour: 12, minute: 0 }, close: { day: 1, hour: 22, minute: 0 } },
      { open: { day: 0, hour: 12, minute: 30 }, close: { day: 0, hour: 21, minute: 0 } },
    ],
  },
  photos: [{ name: "places/ChIJabc123/photos/photo1" }, { name: "places/ChIJabc123/photos/photo2" }],
};

describe("mapPlaceToBusiness", () => {
  const b = mapPlaceToBusiness(PLACE_FIXTURE, "Ethiopian restaurant Leicester");

  it("maps identity and contact fields", () => {
    expect(b.name).toBe("Merkato Ethiopian Restaurant");
    expect(b.placeId).toBe("ChIJabc123");
    expect(b.address).toBe("12 Granby Street, Leicester LE1 6EP, UK");
    expect(b.postcode).toBe("LE1 6EP");
    expect(b.phone).toBe("0116 254 7100");
    expect(b.website).toBe("https://merkato-leicester.co.uk/");
    expect(b.lat).toBeCloseTo(52.6336);
    expect(b.mapsUrl).toBe("https://maps.google.com/?cid=123");
  });

  it("keeps real Google rating data and never invents one", () => {
    expect(b.googleRating).toBe(4.6);
    expect(b.googleReviewCount).toBe(213);
    const noRating = mapPlaceToBusiness({ ...PLACE_FIXTURE, rating: undefined, userRatingCount: undefined }, "x");
    expect(noRating.googleRating).toBeNull();
    expect(noRating.googleReviewCount).toBeNull();
  });

  it("detects city from the address and category from the query", () => {
    expect(b.city).toBe("leicester");
    expect(b.category).toBe("restaurants");
  });

  it("converts opening periods (day 0=Sunday) to our hours JSON", () => {
    const hours = JSON.parse(b.openingHours);
    expect(hours.mon).toEqual([{ open: "12:00", close: "22:00" }]);
    expect(hours.sun).toEqual([{ open: "12:30", close: "21:00" }]);
  });

  it("maps photo references", () => {
    expect(b.photoNames).toEqual(["places/ChIJabc123/photos/photo1", "places/ChIJabc123/photos/photo2"]);
  });
});

const COMPANY_FIXTURE = {
  title: "ABYSSINIA RESTAURANT LTD",
  company_number: "09876543",
  company_status: "active",
  date_of_creation: "2015-03-02",
  company_type: "ltd",
  address_snippet: "12 Caledonian Road, London, N1 9DT",
  address: { address_line_1: "12 Caledonian Road", locality: "London", postal_code: "N1 9DT" },
};

describe("mapCompanyToBusiness", () => {
  const c = mapCompanyToBusiness(COMPANY_FIXTURE);

  it("maps company fields", () => {
    expect(c.name).toBe("ABYSSINIA RESTAURANT LTD");
    expect(c.companyNumber).toBe("09876543");
    expect(c.companyStatus).toBe("active");
    expect(c.address).toBe("12 Caledonian Road");
    expect(c.postcode).toBe("N1 9DT");
    expect(c.city).toBe("london");
    expect(c.sourceUrl).toBe("https://find-and-update.company-information.service.gov.uk/company/09876543");
  });

  it("leaves city empty when locality is not a supported city", () => {
    const other = mapCompanyToBusiness({ ...COMPANY_FIXTURE, address: { ...COMPANY_FIXTURE.address, locality: "Cardiff" } });
    expect(other.city).toBe("");
  });
});
