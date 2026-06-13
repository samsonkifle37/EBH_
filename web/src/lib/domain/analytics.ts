export interface DailyMetrics {
  views: number;
  phoneClicks: number;
  websiteClicks: number;
  directionClicks: number;
  shareClicks: number;
  bookingClicks: number;
}

export const EVENT_TO_FIELD: Record<string, keyof DailyMetrics> = {
  LISTING_VIEW: "views",
  PHONE_CLICK: "phoneClicks",
  WEBSITE_CLICK: "websiteClicks",
  DIRECTION_CLICK: "directionClicks",
  SHARE_CLICK: "shareClicks",
  BOOKING_CLICK: "bookingClicks",
};

export function emptyMetrics(): DailyMetrics {
  return { views: 0, phoneClicks: 0, websiteClicks: 0, directionClicks: 0, shareClicks: 0, bookingClicks: 0 };
}

export function dayKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Aggregate raw analytics events into per-day metric rows keyed by YYYY-MM-DD. */
export function bucketEvents(events: { type: string; createdAt: Date }[]): Record<string, DailyMetrics> {
  const rows: Record<string, DailyMetrics> = {};
  for (const e of events) {
    const field = EVENT_TO_FIELD[e.type];
    if (!field) continue;
    const key = dayKey(e.createdAt);
    (rows[key] ??= emptyMetrics())[field] += 1;
  }
  return rows;
}
