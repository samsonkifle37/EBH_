import { describe, it, expect } from "vitest";
import {
  attributionFromParams,
  serializeAttribution,
  parseAttribution,
  shareParams,
  ATTRIBUTION_MAX_AGE,
} from "../attribution";

describe("attributionFromParams", () => {
  it("returns null when ref is not 'share'", () => {
    expect(attributionFromParams({ ref: null })).toBeNull();
    expect(attributionFromParams({ ref: "email", channel: "whatsapp", business: "x" })).toBeNull();
  });
  it("captures a normalised share channel + slug", () => {
    const a = attributionFromParams({ ref: "share", channel: "whatsapp", business: "abc" }, 1000);
    expect(a).toEqual({ channel: "whatsapp", business: "abc", ts: 1000 });
  });
  it("normalises channel aliases", () => {
    expect(attributionFromParams({ ref: "share", channel: "wa", business: "x" })?.channel).toBe("whatsapp");
    expect(attributionFromParams({ ref: "share", channel: "story", business: "x" })?.channel).toBe("instagram");
    expect(attributionFromParams({ ref: "share", channel: "link", business: "x" })?.channel).toBe("copy_link");
  });
  it("falls back to 'direct' for unknown channels", () => {
    expect(attributionFromParams({ ref: "share", channel: "weird", business: "x" })?.channel).toBe("direct");
    expect(attributionFromParams({ ref: "share", business: "x" })?.channel).toBe("direct");
  });
});

describe("serialize/parse roundtrip", () => {
  it("roundtrips", () => {
    const a = { channel: "qr", business: "shiro-cafe", ts: 5_000 };
    expect(parseAttribution(serializeAttribution(a), 6_000)).toEqual(a);
  });
  it("returns null for junk", () => {
    expect(parseAttribution("not json")).toBeNull();
    expect(parseAttribution("")).toBeNull();
    expect(parseAttribution(null)).toBeNull();
  });
  it("expires after the max age", () => {
    const a = { channel: "qr", business: "x", ts: 0 };
    const raw = serializeAttribution(a);
    expect(parseAttribution(raw, ATTRIBUTION_MAX_AGE * 1000 - 1)).not.toBeNull();
    expect(parseAttribution(raw, ATTRIBUTION_MAX_AGE * 1000 + 1)).toBeNull();
  });
});

describe("shareParams", () => {
  it("builds a stable query string", () => {
    expect(shareParams("shiro-cafe", "whatsapp")).toBe(
      "ref=share&business=shiro-cafe&channel=whatsapp",
    );
  });
});
