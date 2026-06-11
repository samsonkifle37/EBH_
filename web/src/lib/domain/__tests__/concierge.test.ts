import { describe, it, expect } from "vitest";
import { parseConciergeQuery } from "../concierge";

describe("parseConciergeQuery", () => {
  it("extracts category, city and capacity from the PRD example", () => {
    const q = parseConciergeQuery("Find a wedding venue for 250 guests in London");
    expect(q.category).toBe("wedding-services");
    expect(q.city).toBe("london");
    expect(q.capacity).toBe(250);
  });
  it("maps solicitor to lawyers", () => {
    const q = parseConciergeQuery("Ethiopian solicitor near Birmingham");
    expect(q.category).toBe("lawyers");
    expect(q.city).toBe("birmingham");
  });
  it("maps restaurant words", () => {
    expect(parseConciergeQuery("best place to eat injera").category).toBe("restaurants");
    expect(parseConciergeQuery("Ethiopian restaurant in Manchester").category).toBe("restaurants");
  });
  it("returns keywords without stopwords", () => {
    const q = parseConciergeQuery("find me an authentic coffee ceremony");
    expect(q.keywords).toContain("authentic");
    expect(q.keywords).toContain("ceremony");
    expect(q.keywords).not.toContain("find");
    expect(q.keywords).not.toContain("an");
  });
  it("leaves fields undefined when absent", () => {
    const q = parseConciergeQuery("something nice");
    expect(q.category).toBeUndefined();
    expect(q.city).toBeUndefined();
    expect(q.capacity).toBeUndefined();
  });
});
