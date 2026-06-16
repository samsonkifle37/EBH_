import { describe, it, expect } from "vitest";
import { absoluteUrl, breadcrumbJsonLd, faqJsonLd, websiteJsonLd, organizationJsonLd, SITE_URL } from "../seo";

describe("absoluteUrl", () => {
  it("prefixes relative paths with the site URL", () => {
    expect(absoluteUrl("/about")).toBe(`${SITE_URL}/about`);
    expect(absoluteUrl("about")).toBe(`${SITE_URL}/about`);
  });
  it("passes absolute URLs through", () => {
    expect(absoluteUrl("https://x.test/y")).toBe("https://x.test/y");
  });
});

describe("breadcrumbJsonLd", () => {
  it("builds a positioned BreadcrumbList with absolute items", () => {
    const ld = breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "About", path: "/about" },
    ]);
    expect(ld["@type"]).toBe("BreadcrumbList");
    expect(ld.itemListElement).toHaveLength(2);
    expect(ld.itemListElement[0]).toMatchObject({ position: 1, name: "Home" });
    expect(ld.itemListElement[1].item).toBe(`${SITE_URL}/about`);
  });
});

describe("faqJsonLd", () => {
  it("maps Q/A into FAQPage questions", () => {
    const ld = faqJsonLd([{ q: "Q1?", a: "A1" }]);
    expect(ld["@type"]).toBe("FAQPage");
    expect(ld.mainEntity[0]).toMatchObject({ "@type": "Question", name: "Q1?" });
    expect(ld.mainEntity[0].acceptedAnswer.text).toBe("A1");
  });
});

describe("websiteJsonLd / organizationJsonLd", () => {
  it("exposes a SearchAction with the search term template", () => {
    const ld = websiteJsonLd();
    expect(ld.potentialAction["@type"]).toBe("SearchAction");
    expect(ld.potentialAction.target.urlTemplate).toContain("{search_term_string}");
  });
  it("organization has a support ContactPoint", () => {
    const ld = organizationJsonLd();
    expect(ld.contactPoint["@type"]).toBe("ContactPoint");
    expect(ld.contactPoint.email).toContain("@");
  });
});
