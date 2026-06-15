import { describe, it, expect } from "vitest";
import { earnedBadges, type BadgeInput } from "../badges";

const base: BadgeInput = {
  ownerId: null,
  claimedAt: null,
  verificationLevel: 0,
  plan: "FREE",
};

describe("earnedBadges", () => {
  it("returns none for an unclaimed listing", () => {
    expect(earnedBadges(base)).toEqual([]);
  });

  it("grants Founder Verified + Early Supporter on claim (day one)", () => {
    const keys = earnedBadges({ ...base, ownerId: "u1", claimedAt: new Date("2026-06-01") }).map((b) => b.key);
    expect(keys).toContain("founder_verified");
    expect(keys).toContain("early_supporter");
  });

  it("grants Verified Business at verification level 2+", () => {
    const keys = earnedBadges({ ...base, ownerId: "u1", claimedAt: new Date(), verificationLevel: 2 }).map((b) => b.key);
    expect(keys).toContain("verified_business");
  });

  it("grants Verified Business on a paid plan even at level 0", () => {
    const keys = earnedBadges({ ...base, ownerId: "u1", claimedAt: new Date(), plan: "VERIFIED" }).map((b) => b.key);
    expect(keys).toContain("verified_business");
  });

  it("never returns an empty set for a claimed business (dignity)", () => {
    expect(earnedBadges({ ...base, ownerId: "u1", claimedAt: new Date() }).length).toBeGreaterThan(0);
  });

  it("every badge has a label and owner-facing explanation", () => {
    for (const b of earnedBadges({ ...base, ownerId: "u1", claimedAt: new Date(), verificationLevel: 3 })) {
      expect(b.label.length).toBeGreaterThan(0);
      expect(b.explanation.length).toBeGreaterThan(0);
    }
  });
});
