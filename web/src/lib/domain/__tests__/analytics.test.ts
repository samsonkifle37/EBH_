import { describe, it, expect } from "vitest";
import { dayKey, bucketEvents, EVENT_TO_FIELD } from "../analytics";

describe("dayKey", () => {
  it("formats a date as YYYY-MM-DD", () => {
    expect(dayKey(new Date(2026, 5, 9, 23, 30))).toBe("2026-06-09");
    expect(dayKey(new Date(2026, 0, 1, 0, 0))).toBe("2026-01-01");
  });
});

describe("bucketEvents", () => {
  it("aggregates events into per-day metric rows", () => {
    const events = [
      { type: "LISTING_VIEW", createdAt: new Date(2026, 5, 9, 10) },
      { type: "LISTING_VIEW", createdAt: new Date(2026, 5, 9, 12) },
      { type: "PHONE_CLICK", createdAt: new Date(2026, 5, 9, 13) },
      { type: "WEBSITE_CLICK", createdAt: new Date(2026, 5, 10, 9) },
      { type: "DIRECTION_CLICK", createdAt: new Date(2026, 5, 10, 9) },
      { type: "SHARE_CLICK", createdAt: new Date(2026, 5, 10, 9) },
      { type: "BOOKING_CLICK", createdAt: new Date(2026, 5, 10, 9) },
      { type: "SEARCH_IMPRESSION", createdAt: new Date(2026, 5, 10, 9) }, // ignored
    ];
    const rows = bucketEvents(events);
    expect(rows["2026-06-09"]).toEqual({ views: 2, phoneClicks: 1, websiteClicks: 0, directionClicks: 0, shareClicks: 0, bookingClicks: 0 });
    expect(rows["2026-06-10"]).toEqual({ views: 0, phoneClicks: 0, websiteClicks: 1, directionClicks: 1, shareClicks: 1, bookingClicks: 1 });
  });

  it("maps every tracked business event to a field", () => {
    expect(EVENT_TO_FIELD.LISTING_VIEW).toBe("views");
    expect(EVENT_TO_FIELD.PHONE_CLICK).toBe("phoneClicks");
    expect(EVENT_TO_FIELD.BOOKING_CLICK).toBe("bookingClicks");
  });
});
