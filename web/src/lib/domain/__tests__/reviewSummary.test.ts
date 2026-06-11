import { describe, it, expect } from "vitest";
import { summarizeReviews } from "../reviewSummary";

describe("summarizeReviews", () => {
  it("surfaces loved themes from positive sentences", () => {
    const { loves } = summarizeReviews([
      "Amazing authentic food, the injera was delicious.",
      "Lovely authentic dishes and the staff were so friendly.",
      "Great food. Friendly service every time.",
    ]);
    expect(loves).toContain("Authentic food");
    expect(loves).toContain("Friendly service");
  });
  it("surfaces disliked themes from negative sentences", () => {
    const { dislikes } = summarizeReviews([
      "Food was good but the waiting time was far too long.",
      "Slow service, we had to wait 45 minutes.",
    ]);
    expect(dislikes).toContain("Waiting times");
  });
  it("returns empty arrays for no reviews", () => {
    expect(summarizeReviews([])).toEqual({ loves: [], dislikes: [] });
  });
  it("caps each list at 3 themes", () => {
    const texts = [
      "Great food, friendly staff, lovely atmosphere, good value and easy parking.",
    ];
    const { loves } = summarizeReviews(texts);
    expect(loves.length).toBeLessThanOrEqual(3);
  });
});
