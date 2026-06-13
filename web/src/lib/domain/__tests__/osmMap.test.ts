import { describe, it, expect } from "vitest";
import { mapOsmElement } from "../importMap";

const NODE = {
  type: "node",
  id: 123456789,
  lat: 51.5074,
  lon: -0.1278,
  tags: {
    name: "Addis Ababa Restaurant",
    cuisine: "ethiopian",
    amenity: "restaurant",
    "addr:housenumber": "123",
    "addr:street": "High Road",
    "addr:city": "London",
    "addr:postcode": "N17 0AA",
    phone: "020 8801 1234",
    website: "https://addisababa.example.co.uk",
    email: "hello@addisababa.example.co.uk",
    image: "https://images.example.org/addis.jpg",
    opening_hours: "Mo-Su 12:00-22:00",
  },
};

const WAY = {
  type: "way",
  id: 987654321,
  center: { lat: 52.4862, lon: -1.8904 },
  tags: {
    name: "Habesha Market",
    shop: "convenience",
    "addr:street": "Soho Road",
    "addr:city": "Birmingham",
    "addr:postcode": "B21 9LU",
    "contact:phone": "0121 554 2200",
    "contact:website": "https://habesha-market.example.co.uk",
  },
};

const RELATION = {
  type: "relation",
  id: 5555555,
  center: { lat: 53.4808, lon: -2.2426 },
  tags: {
    name: "Eritrean Orthodox Church",
    amenity: "place_of_worship",
  },
};

const NO_NAME = { type: "node", id: 1, lat: 51, lon: 0, tags: { amenity: "restaurant" } };

describe("mapOsmElement", () => {
  it("maps a node with full tags", () => {
    const b = mapOsmElement(NODE)!;
    expect(b.name).toBe("Addis Ababa Restaurant");
    expect(b.lat).toBe(51.5074);
    expect(b.lng).toBe(-0.1278);
    expect(b.address).toBe("123 High Road, London, N17 0AA");
    expect(b.postcode).toBe("N17 0AA");
    expect(b.city).toBe("london");
    expect(b.phone).toBe("020 8801 1234");
    expect(b.website).toBe("https://addisababa.example.co.uk");
    expect(b.category).toBe("restaurants");
    expect(b.sourceId).toBe("node/123456789");
    expect(b.sourceUrl).toBe("https://www.openstreetmap.org/node/123456789");
    expect(b.openingHoursRaw).toBe("Mo-Su 12:00-22:00");
    expect(b.email).toBe("hello@addisababa.example.co.uk");
    expect(b.imageUrl).toBe("https://images.example.org/addis.jpg");
  });

  it("falls back to contact:email and leaves image empty when absent", () => {
    const b = mapOsmElement(WAY)!;
    expect(b.email).toBe("");
    expect(b.imageUrl).toBe("");
  });

  it("uses center coordinates for ways", () => {
    const b = mapOsmElement(WAY)!;
    expect(b.lat).toBe(52.4862);
    expect(b.lng).toBe(-1.8904);
    expect(b.sourceId).toBe("way/987654321");
    expect(b.category).toBe("grocery-stores");
  });

  it("falls back to contact:* for phone and website", () => {
    const b = mapOsmElement(WAY)!;
    expect(b.phone).toBe("0121 554 2200");
    expect(b.website).toBe("https://habesha-market.example.co.uk");
  });

  it("uses center coordinates for relations and maps worship to churches", () => {
    const b = mapOsmElement(RELATION)!;
    expect(b.lat).toBe(53.4808);
    expect(b.lng).toBe(-2.2426);
    expect(b.sourceId).toBe("relation/5555555");
    expect(b.sourceUrl).toBe("https://www.openstreetmap.org/relation/5555555");
    expect(b.category).toBe("churches");
  });

  it("returns null when name is missing", () => {
    expect(mapOsmElement(NO_NAME)).toBeNull();
  });

  it("retains raw category signals", () => {
    const b = mapOsmElement(NODE)!;
    expect(b.categorySignals).toEqual({ cuisine: "ethiopian", amenity: "restaurant", shop: undefined });
  });
});
