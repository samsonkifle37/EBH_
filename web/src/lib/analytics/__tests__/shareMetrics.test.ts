import { describe, it, expect } from "vitest";
import {
  shareRate,
  rankChannels,
  bestChannel,
  median,
  average,
  ownerInsights,
} from "../shareMetrics";

describe("shareRate", () => {
  it("is 0 when there are no claimed businesses", () => {
    expect(shareRate(0, 0)).toBe(0);
  });
  it("computes a one-decimal percentage", () => {
    expect(shareRate(8, 3)).toBe(37.5);
    expect(shareRate(3, 1)).toBe(33.3);
    expect(shareRate(10, 10)).toBe(100);
  });
  it("never divides by zero even with shares recorded", () => {
    expect(shareRate(0, 5)).toBe(0);
  });
});

describe("rankChannels / bestChannel", () => {
  it("ranks by count desc and drops zeroes", () => {
    const r = rankChannels({ whatsapp: 5, qr: 0, copy_link: 2 });
    expect(r.map((c) => c.channel)).toEqual(["whatsapp", "copy_link"]);
    expect(r[0].label).toBe("WhatsApp");
  });
  it("breaks ties deterministically by channel name", () => {
    const r = rankChannels({ whatsapp: 2, instagram: 2 });
    expect(r.map((c) => c.channel)).toEqual(["instagram", "whatsapp"]);
  });
  it("bestChannel returns null when empty", () => {
    expect(bestChannel({})).toBeNull();
    expect(bestChannel({ whatsapp: 4 })?.channel).toBe("whatsapp");
  });
});

describe("median / average", () => {
  it("median handles odd and even lengths", () => {
    expect(median([])).toBe(0);
    expect(median([5])).toBe(5);
    expect(median([3, 1, 2])).toBe(2);
    expect(median([4, 1, 3, 2])).toBe(2.5);
  });
  it("average handles empty", () => {
    expect(average([])).toBe(0);
    expect(average([2, 4])).toBe(3);
  });
});

describe("ownerInsights", () => {
  const base = {
    hasShared: true,
    totalShares: 5,
    shareViews: 12,
    shareContacts: 3,
    completionScore: 90,
    platformShareRate: 40,
    categoryShareRate: 35,
  };

  it("nudges non-sharers to share (incomplete profile variant)", () => {
    const out = ownerInsights({ ...base, hasShared: false, completionScore: 50 });
    expect(out).toHaveLength(1);
    expect(out[0]).toMatch(/finish your profile/i);
  });

  it("nudges non-sharers with a complete profile to share", () => {
    const out = ownerInsights({ ...base, hasShared: false, completionScore: 95 });
    expect(out[0]).toMatch(/haven't shared/i);
  });

  it("celebrates share-driven views and contacts", () => {
    const out = ownerInsights(base);
    expect(out[0]).toMatch(/12 profile views/);
    expect(out[0]).toMatch(/3 turned into/);
    expect(out.length).toBeGreaterThanOrEqual(1);
    expect(out.length).toBeLessThanOrEqual(3);
  });

  it("handles a sharer with no attributed views yet", () => {
    const out = ownerInsights({ ...base, shareViews: 0, shareContacts: 0, totalShares: 1 });
    expect(out[0]).toMatch(/share is live/i);
    expect(out.some((s) => /different channel/i.test(s))).toBe(true);
  });
});
