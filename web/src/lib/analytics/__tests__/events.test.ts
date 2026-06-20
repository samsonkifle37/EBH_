import { describe, it, expect } from "vitest";
import {
  PRIDE_EVENTS,
  SUPPORT_EVENTS,
  WEBSITE_EVENTS,
  ADMIN_EVENTS,
  DISCOVERY_EVENTS,
  TRACKABLE_EVENTS,
  isPrideEvent,
  isShareAction,
  isDistributionShare,
  isShareChannel,
} from "../events";

describe("event taxonomy", () => {
  it("recognises canonical events and rejects others", () => {
    expect(isPrideEvent("PROFILE_VIEW")).toBe(true);
    expect(isPrideEvent("SHARE_WHATSAPP")).toBe(true);
    expect(isPrideEvent("LISTING_VIEW")).toBe(false); // legacy taxonomy
    expect(isPrideEvent(123)).toBe(false);
  });

  it("has exactly the 12 specified events", () => {
    expect(PRIDE_EVENTS).toHaveLength(12);
  });

  it("adds support + website events to the trackable set without touching the pride loop", () => {
    expect(SUPPORT_EVENTS).toEqual(["ABOUT_VIEW", "HELP_ARTICLE_VIEW", "REPORT_SUBMITTED", "SAFETY_VIEW"]);
    expect(TRACKABLE_EVENTS).toContain("REPORT_SUBMITTED");
    expect(TRACKABLE_EVENTS).toContain("PROFILE_VIEW");
    expect(TRACKABLE_EVENTS).toContain("LOGO_ADDED");
    expect(TRACKABLE_EVENTS).toContain("WEBSITE_SCORE_VIEW");
    expect(TRACKABLE_EVENTS).toContain("WEBSITE_MODE_VIEW");
    expect(TRACKABLE_EVENTS).toContain("IMAGE_UPLOADED");
    expect(TRACKABLE_EVENTS).toContain("USER_ROLE_CHANGED");
    expect(TRACKABLE_EVENTS).toContain("CITY_ADDED");
    expect(TRACKABLE_EVENTS).toContain("CITY_CHIP_CLICKED");
    expect(TRACKABLE_EVENTS).toContain("CATEGORY_CHIP_CLICKED");
    expect(TRACKABLE_EVENTS).toHaveLength(PRIDE_EVENTS.length + SUPPORT_EVENTS.length + WEBSITE_EVENTS.length + ADMIN_EVENTS.length + DISCOVERY_EVENTS.length);
  });

  it("classifies share actions vs distribution shares", () => {
    expect(isShareAction("SHARE_KIT_OPENED")).toBe(true);
    expect(isShareAction("PROFILE_VIEW")).toBe(false);
    // opening the kit / previewing the image is intent, not a distribution
    expect(isDistributionShare("SHARE_KIT_OPENED")).toBe(false);
    expect(isDistributionShare("SHARE_IMAGE_GENERATED")).toBe(false);
    expect(isDistributionShare("SHARE_WHATSAPP")).toBe(true);
    expect(isDistributionShare("SHARE_QR_SCAN")).toBe(true);
  });

  it("identifies share-attributed channels", () => {
    expect(isShareChannel("whatsapp")).toBe(true);
    expect(isShareChannel("qr")).toBe(true);
    expect(isShareChannel("direct")).toBe(false);
    expect(isShareChannel("")).toBe(false);
    expect(isShareChannel(null)).toBe(false);
  });
});
