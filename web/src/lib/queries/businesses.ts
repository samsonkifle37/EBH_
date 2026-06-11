import { db } from "@/lib/db";
import { aggregateRating } from "@/lib/domain/ratings";
import { isOpenNow, parseOpeningHours } from "@/lib/domain/hours";
import { profileCompleteness, verificationScore } from "@/lib/domain/verification";
import type { Business, BusinessPhoto, Review } from "@prisma/client";

export interface BusinessSummary {
  id: string;
  name: string;
  slug: string;
  category: string;
  city: string;
  address: string;
  photoUrl: string | null;
  avg: number;
  count: number;
  verificationLevel: number;
  verificationScore: number;
  featured: boolean;
  openNow: boolean;
  description: string;
}

type BusinessWithRels = Business & { photos: BusinessPhoto[]; reviews: Pick<Review, "rating" | "status">[] };

export function toSummary(b: BusinessWithRels, now: Date = new Date()): BusinessSummary {
  const { avg, count } = aggregateRating(b.reviews);
  const completeness = profileCompleteness({
    description: b.description,
    phone: b.phone,
    website: b.website,
    socials: b.socials,
    openingHours: b.openingHours,
    photoCount: b.photos.length,
  });
  return {
    id: b.id,
    name: b.name,
    slug: b.slug,
    category: b.category,
    city: b.city,
    address: b.address,
    photoUrl: b.photos[0]?.url ?? null,
    avg,
    count,
    verificationLevel: b.verificationLevel,
    verificationScore: verificationScore(b.verificationLevel, completeness),
    featured: b.featured,
    openNow: isOpenNow(parseOpeningHours(b.openingHours), now),
    description: b.description,
  };
}

export interface SearchParams {
  q?: string;
  category?: string;
  city?: string;
  minRating?: number;
  openNow?: boolean;
  verifiedOnly?: boolean;
  limit?: number;
}

export async function searchBusinesses(params: SearchParams): Promise<BusinessSummary[]> {
  const where: Record<string, unknown> = { status: "APPROVED" };
  if (params.category) where.category = params.category;
  if (params.city) where.city = params.city;
  if (params.verifiedOnly) where.verificationLevel = { gte: 1 };
  if (params.q) {
    const q = params.q.trim();
    where.OR = [
      { name: { contains: q } },
      { description: { contains: q } },
      { category: { contains: q.toLowerCase().replace(/\s+/g, "-") } },
    ];
  }

  const rows = await db.business.findMany({
    where,
    include: {
      photos: { orderBy: { sortOrder: "asc" }, take: 1 },
      reviews: { select: { rating: true, status: true } },
    },
    orderBy: [{ featured: "desc" }, { verificationLevel: "desc" }],
  });

  let results = rows.map((b) => toSummary(b));
  if (params.minRating) results = results.filter((r) => r.avg >= params.minRating!);
  if (params.openNow) results = results.filter((r) => r.openNow);
  results.sort((a, b) => Number(b.featured) - Number(a.featured) || b.avg - a.avg || b.count - a.count);
  return results.slice(0, params.limit ?? 60);
}

export async function getFeaturedBusinesses(limit = 6): Promise<BusinessSummary[]> {
  const rows = await db.business.findMany({
    where: { status: "APPROVED", featured: true },
    include: {
      photos: { orderBy: { sortOrder: "asc" }, take: 1 },
      reviews: { select: { rating: true, status: true } },
    },
    take: limit,
  });
  return rows.map((b) => toSummary(b));
}
