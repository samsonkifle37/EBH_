import { describe, it, expect } from "vitest";
import { slugify } from "../slug";

describe("slugify", () => {
  it("lowercases and hyphenates", () => {
    expect(slugify("Abyssinia Restaurant")).toBe("abyssinia-restaurant");
  });
  it("strips punctuation and collapses repeats", () => {
    expect(slugify("Queen of Sheba -- Venue & Hall!")).toBe("queen-of-sheba-venue-hall");
  });
  it("trims leading and trailing hyphens", () => {
    expect(slugify(" -Addis- ")).toBe("addis");
  });
});
