import { describe, it, expect } from "vitest";
import { profileCompletion, type CompletionInput } from "../profileCompletion";

const empty: CompletionInput = {
  coverImageUrl: "",
  founderPhotoUrl: "",
  founderStory: "",
  brandStory: "",
  signatureCount: 0,
  phone: "",
  website: "",
  hoursJson: "{}",
  photoCount: 0,
};

const full: CompletionInput = {
  coverImageUrl: "https://x/cover.jpg",
  founderPhotoUrl: "https://x/me.jpg",
  founderStory: "x".repeat(60),
  brandStory: "x".repeat(60),
  signatureCount: 2,
  phone: "020 1234 5678",
  website: "https://x.co.uk",
  hoursJson: JSON.stringify({ mon: [{ open: "09:00", close: "17:00" }] }),
  photoCount: 5,
};

describe("profileCompletion", () => {
  it("is 0 with a next action when nothing is filled", () => {
    const r = profileCompletion(empty);
    expect(r.score).toBe(0);
    expect(r.nextAction).not.toBeNull();
  });

  it("is 100 and complete when everything is filled", () => {
    const r = profileCompletion(full);
    expect(r.score).toBe(100);
    expect(r.complete).toBe(true);
    expect(r.nextAction).toBeNull();
  });

  it("nextAction points at the highest-impact missing item", () => {
    // only missing the cover image (the heaviest single item)
    const r = profileCompletion({ ...full, coverImageUrl: "" });
    expect(r.score).toBeLessThan(100);
    expect(r.nextAction?.label).toMatch(/cover/i);
  });

  it("requires a meaningful founder story, not a stub", () => {
    const r = profileCompletion({ ...full, founderStory: "hi" });
    expect(r.complete).toBe(false);
    expect(r.items.find((i) => i.key === "founderStory")?.done).toBe(false);
  });

  it("items sum to 100", () => {
    const total = profileCompletion(empty).items.reduce((a, i) => a + i.points, 0);
    expect(total).toBe(100);
  });
});
