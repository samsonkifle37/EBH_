import { describe, it, expect } from "vitest";
import { aggregateRating } from "../ratings";

describe("aggregateRating", () => {
  it("returns zero for no reviews", () => {
    expect(aggregateRating([])).toEqual({ avg: 0, count: 0 });
  });
  it("averages visible reviews to 1 decimal place", () => {
    const r = aggregateRating([
      { rating: 5, status: "VISIBLE" },
      { rating: 4, status: "VISIBLE" },
      { rating: 4, status: "VISIBLE" },
    ]);
    expect(r).toEqual({ avg: 4.3, count: 3 });
  });
  it("ignores removed reviews", () => {
    const r = aggregateRating([
      { rating: 5, status: "VISIBLE" },
      { rating: 1, status: "REMOVED" },
    ]);
    expect(r).toEqual({ avg: 5, count: 1 });
  });
});
