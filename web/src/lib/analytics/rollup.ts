import { db } from "@/lib/db";
import { bucketEvents } from "@/lib/domain/analytics";

/**
 * Aggregate raw AnalyticsEvent rows into BusinessAnalyticsDaily. Idempotent —
 * re-running recomputes each affected (business, day) row. Scoped to one
 * business when `businessId` is given (used opportunistically by the dashboard).
 */
export async function rollupDaily(opts: { businessId?: string; sinceDays?: number } = {}): Promise<number> {
  const since = new Date();
  since.setDate(since.getDate() - (opts.sinceDays ?? 95));

  const events = await db.analyticsEvent.findMany({
    where: {
      createdAt: { gte: since },
      businessId: opts.businessId ? opts.businessId : { not: null },
    },
    select: { type: true, createdAt: true, businessId: true },
  });

  // group by business, then bucket per day
  const byBusiness = new Map<string, { type: string; createdAt: Date }[]>();
  for (const e of events) {
    if (!e.businessId) continue;
    (byBusiness.get(e.businessId) ?? byBusiness.set(e.businessId, []).get(e.businessId)!).push(e);
  }

  let written = 0;
  for (const [businessId, evs] of byBusiness) {
    const rows = bucketEvents(evs);
    for (const [date, m] of Object.entries(rows)) {
      await db.businessAnalyticsDaily.upsert({
        where: { businessId_date: { businessId, date } },
        update: { ...m },
        create: { businessId, date, ...m },
      });
      written++;
    }
  }
  return written;
}
