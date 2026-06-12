import { db } from "@/lib/db";
import { demoFilter } from "@/lib/flags";

export async function getUpcomingEvents(opts: { city?: string; type?: string; limit?: number } = {}) {
  return db.event.findMany({
    where: {
      status: "APPROVED",
      startsAt: { gte: new Date() },
      ...demoFilter(),
      ...(opts.city ? { city: opts.city } : {}),
      ...(opts.type ? { type: opts.type } : {}),
    },
    orderBy: [{ featured: "desc" }, { startsAt: "asc" }],
    take: opts.limit ?? 60,
  });
}
