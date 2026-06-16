import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { demoFilter } from "@/lib/flags";
import { CATEGORIES, CITIES } from "@/lib/types";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.SITE_URL ?? "http://localhost:3000";

  const statics: MetadataRoute.Sitemap = [
    "",
    "/businesses",
    "/events",
    "/concierge",
    "/pricing",
    "/advertise",
    "/about",
    "/contact",
    "/help",
    "/safety",
    "/report",
    "/privacy",
    "/terms",
  ].map((p) => ({ url: `${base}${p}`, changeFrequency: "daily", priority: p === "" ? 1 : 0.8 }));

  const landing: MetadataRoute.Sitemap = CATEGORIES.flatMap((category) =>
    CITIES.map((city) => ({
      url: `${base}/${category}/${city}`,
      changeFrequency: "daily" as const,
      priority: 0.7,
    }))
  );

  const [businesses, events] = await Promise.all([
    db.business.findMany({ where: { status: "APPROVED", ...demoFilter() }, select: { slug: true } }),
    db.event.findMany({ where: { status: "APPROVED", ...demoFilter() }, select: { slug: true } }),
  ]);

  return [
    ...statics,
    ...landing,
    ...businesses.map((b) => ({ url: `${base}/business/${b.slug}`, changeFrequency: "weekly" as const, priority: 0.6 })),
    ...events.map((e) => ({ url: `${base}/event/${e.slug}`, changeFrequency: "weekly" as const, priority: 0.6 })),
    ...CITIES.map((c) => ({ url: `${base}/events/${c}`, changeFrequency: "daily" as const, priority: 0.6 })),
  ];
}
