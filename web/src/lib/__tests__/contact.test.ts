import { describe, it, expect } from "vitest";
import { buildMailto, CONTACT_CATEGORIES, getContactCategory, SUPPORT_EMAIL } from "../contact";

describe("contact catalogue", () => {
  it("routes every category to the single support inbox", () => {
    expect(SUPPORT_EMAIL).toBe("admin@nu-discoverethiopia.com");
  });

  it("has the six required categories", () => {
    expect(CONTACT_CATEGORIES.map((c) => c.id)).toEqual([
      "business-owners",
      "listing-corrections",
      "verification-support",
      "privacy-requests",
      "technical-support",
      "abuse-reports",
    ]);
  });

  it("routes abuse reports to the in-app report flow, others to email", () => {
    expect(getContactCategory("abuse-reports")?.action).toBe("report");
    expect(getContactCategory("technical-support")?.action).toBe("email");
    expect(getContactCategory("business-owners")?.action).toBe("email");
  });

  it("returns undefined for an unknown category", () => {
    // @ts-expect-error testing a non-existent id
    expect(getContactCategory("nope")).toBeUndefined();
  });
});

describe("buildMailto", () => {
  it("encodes subject and body into a valid mailto", () => {
    const url = buildMailto("a@b.com", "Hi there", "Line one");
    expect(url.startsWith("mailto:a@b.com?")).toBe(true);
    expect(url).toContain("subject=Hi%20there");
    expect(url).toContain("body=Line%20one");
  });

  it("appends the page URL when provided", () => {
    const url = buildMailto("a@b.com", "S", "B", { url: "https://ebh.uk/contact" });
    expect(decodeURIComponent(url)).toContain("Page: https://ebh.uk/contact");
  });

  it("appends device diagnostics only when requested", () => {
    const withDiag = buildMailto("a@b.com", "S", "B", { userAgent: "UA/1.0", includeDiagnostics: true });
    expect(decodeURIComponent(withDiag)).toContain("Device: UA/1.0");

    const withoutDiag = buildMailto("a@b.com", "S", "B", { userAgent: "UA/1.0", includeDiagnostics: false });
    expect(decodeURIComponent(withoutDiag)).not.toContain("Device:");
  });
});
