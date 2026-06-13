import { db } from "@/lib/db";
import { dayKey, emptyMetrics, type DailyMetrics } from "@/lib/domain/analytics";

export interface AnalyticsSeriesPoint extends DailyMetrics {
  date: string;
}

export interface AnalyticsSummary {
  days: number;
  totals: DailyMetrics;
  totalInteractions: number;
  series: AnalyticsSeriesPoint[]; // one point per day, oldest → newest
  topSources: { label: string; value: number }[];
}

const FIELD_LABELS: { field: keyof DailyMetrics; label: string }[] = [
  { field: "views", label: "Listing views" },
  { field: "phoneClicks", label: "Phone clicks" },
  { field: "websiteClicks", label: "Website clicks" },
  { field: "directionClicks", label: "Directions" },
  { field: "shareClicks", label: "Shares" },
  { field: "bookingClicks", label: "Bookings" },
];

/** Read a business's daily analytics for the last N days from the rollup table. */
export async function getBusinessAnalytics(businessId: string, days: number): Promise<AnalyticsSummary> {
  const start = new Date();
  start.setDate(start.getDate() - (days - 1));
  const startKey = dayKey(start);

  const rows = await db.businessAnalyticsDaily.findMany({
    where: { businessId, date: { gte: startKey } },
  });
  const byDate = new Map(rows.map((r) => [r.date, r]));

  const totals = emptyMetrics();
  const series: AnalyticsSeriesPoint[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const key = dayKey(d);
    const r = byDate.get(key);
    const point: AnalyticsSeriesPoint = {
      date: key,
      views: r?.views ?? 0,
      phoneClicks: r?.phoneClicks ?? 0,
      websiteClicks: r?.websiteClicks ?? 0,
      directionClicks: r?.directionClicks ?? 0,
      shareClicks: r?.shareClicks ?? 0,
      bookingClicks: r?.bookingClicks ?? 0,
    };
    series.push(point);
    for (const { field } of FIELD_LABELS) totals[field] += point[field];
  }

  const topSources = FIELD_LABELS
    .filter((f) => f.field !== "views")
    .map((f) => ({ label: f.label, value: totals[f.field] }))
    .filter((s) => s.value > 0)
    .sort((a, b) => b.value - a.value);

  const totalInteractions = topSources.reduce((a, s) => a + s.value, 0);

  return { days, totals, totalInteractions, series, topSources };
}
