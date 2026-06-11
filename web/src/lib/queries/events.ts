import { db } from "@/lib/db";

export async function getUpcomingEvents(opts: { city?: string; type?: string; limit?: number } = {}) {
  return db.event.findMany({
    where: {
      status: "APPROVED",
      startsAt: { gte: new Date() },
      ...(opts.city ? { city: opts.city } : {}),
      ...(opts.type ? { type: opts.type } : {}),
    },
    orderBy: [{ featured: "desc" }, { startsAt: "asc" }],
    take: opts.limit ?? 60,
  });
}
