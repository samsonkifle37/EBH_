import { describe, it, expect } from "vitest";
import {
  parseServices,
  parseFaqs,
  businessInitials,
  normalizeWhatsApp,
  whatsappLink,
  hasExternalWebsite,
  primaryWebsiteScore,
  trustBreakdownRows,
} from "../website";

describe("parseServices", () => {
  it("filters unnamed and sorts by sortOrder", () => {
    const json = JSON.stringify([
      { name: "B", sortOrder: 2 },
      { name: "", sortOrder: 0 },
      { name: "A", sortOrder: 1 },
    ]);
    expect(parseServices(json).map((s) => s.name)).toEqual(["A", "B"]);
  });
  it("returns [] for junk", () => {
    expect(parseServices("nope")).toEqual([]);
    expect(parseServices("{}")).toEqual([]);
  });
});

describe("parseFaqs", () => {
  it("requires both question and answer, sorted", () => {
    const json = JSON.stringify([
      { question: "Q2", answer: "A2", sortOrder: 2 },
      { question: "Q1", answer: "A1", sortOrder: 1 },
      { question: "Q3", answer: "" },
    ]);
    expect(parseFaqs(json).map((f) => f.question)).toEqual(["Q1", "Q2"]);
  });
});

describe("businessInitials", () => {
  it("derives 1–2 letters", () => {
    expect(businessInitials("Abyssinia Restaurant")).toBe("AR");
    expect(businessInitials("Shiro")).toBe("SH");
    expect(businessInitials("  ")).toBe("?");
  });
});

describe("whatsapp", () => {
  it("normalises UK local and international forms", () => {
    expect(normalizeWhatsApp("07911 123456")).toBe("447911123456");
    expect(normalizeWhatsApp("+44 7911 123456")).toBe("447911123456");
    expect(normalizeWhatsApp("0044 7911 123456")).toBe("447911123456");
    expect(normalizeWhatsApp("")).toBeNull();
    expect(normalizeWhatsApp("123")).toBeNull();
  });
  it("builds a wa.me link with optional message", () => {
    expect(whatsappLink("07911123456")).toBe("https://wa.me/447911123456");
    expect(whatsappLink("07911123456", "Hi!")).toBe("https://wa.me/447911123456?text=Hi!");
    expect(whatsappLink("")).toBeNull();
  });
});

describe("hasExternalWebsite", () => {
  it("treats empty and EBH links as non-external", () => {
    expect(hasExternalWebsite("")).toBe(false);
    expect(hasExternalWebsite("https://ethiopianbh.vercel.app/business/x")).toBe(false);
    expect(hasExternalWebsite("https://shiro.co.uk")).toBe(true);
    expect(hasExternalWebsite("shiro.co.uk")).toBe(true);
  });
});

describe("primaryWebsiteScore", () => {
  const full = { claimed: true, shares: 2, directVisits: 5, returnVisitors: 2, hasExternalWebsite: false };
  it("qualifies and scores 100 when all criteria met", () => {
    const r = primaryWebsiteScore(full);
    expect(r.qualifies).toBe(true);
    expect(r.score).toBe(100);
  });
  it("does not qualify if an external website exists", () => {
    const r = primaryWebsiteScore({ ...full, hasExternalWebsite: true });
    expect(r.qualifies).toBe(false);
    expect(r.score).toBe(80);
  });
  it("scales with criteria met", () => {
    const r = primaryWebsiteScore({ claimed: true, shares: 0, directVisits: 0, returnVisitors: 0, hasExternalWebsite: false });
    expect(r.qualifies).toBe(false);
    expect(r.score).toBe(40); // claimed + noExternal
  });
});

describe("trustBreakdownRows", () => {
  it("maps evidence to explainable rows", () => {
    const rows = trustBreakdownRows({ ownerClaimed: true, companiesHouse: false, google: true, photos: 3, reviews: 0, recentActivity: true, completion: 90 });
    expect(rows).toHaveLength(7);
    expect(rows.find((r) => r.label === "Verified owner")?.met).toBe(true);
    expect(rows.find((r) => r.label === "Has customer reviews")?.met).toBe(false);
    expect(rows.find((r) => r.label === "Profile complete")?.met).toBe(true);
  });
});
