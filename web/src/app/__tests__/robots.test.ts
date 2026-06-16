import { describe, it, expect } from "vitest";
import robots from "../robots";

describe("robots.txt", () => {
  it("disallows private areas and points at the sitemap", () => {
    const r = robots();
    const rule = Array.isArray(r.rules) ? r.rules[0] : r.rules;
    const disallow = (rule?.disallow ?? []) as string[];
    expect(disallow).toEqual(expect.arrayContaining(["/admin", "/dashboard", "/account", "/api"]));
    expect(String(r.sitemap)).toMatch(/\/sitemap\.xml$/);
  });
});
