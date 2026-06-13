import { computeTrustV2, type TrustV2Input, type TrustV2Result } from "@/lib/domain/trustV2";
import { isManualLeadSource } from "@/lib/domain/trust";
import { aggregateRating } from "@/lib/domain/ratings";

/** Shape needed to derive a Trust V2 score for a business. */
export interface BusinessForTrust {
  plan: string;
  ownerId: string | null;
  sourceType: string;
  companyNumber: string;
  mapsUrl: string;
  phone: string;
  website: string;
  email: string;
  description: string;
  address: string;
  openingHours: string;
  socials: string;
  lastSourceCheckedAt: Date | null;
  photos: { id: string }[];
  reviews: { rating: number; status: string }[];
  sources?: { sourceType: string }[];
  lastActivityAt?: Date | null;
}

function hasJsonEntries(json: string): boolean {
  try {
    const v = JSON.parse(json);
    return !!v && typeof v === "object" && Object.keys(v).length > 0;
  } catch {
    return false;
  }
}

export function trustInputFromBusiness(b: BusinessForTrust): TrustV2Input {
  const sourceTypes = b.sources?.map((s) => s.sourceType) ?? [b.sourceType];
  const { avg, count } = aggregateRating(b.reviews);
  const thirtyDaysAgo = Date.now() - 30 * 24 * 3600 * 1000;
  const recentActivity =
    (b.lastActivityAt ? b.lastActivityAt.getTime() : 0) >= thirtyDaysAgo ||
    (b.lastSourceCheckedAt ? b.lastSourceCheckedAt.getTime() : 0) >= thirtyDaysAgo;

  return {
    // a paid (non-free) plan stands in for a verified subscription until Stripe lands
    verifiedSubscription: b.plan !== "FREE",
    ownerClaimed: !!b.ownerId,
    hasGoogleSource: sourceTypes.includes("google_places") || b.mapsUrl.length > 0,
    hasCompaniesHouse: b.companyNumber.trim().length > 0 || sourceTypes.includes("companies_house"),
    hasOsmSource: sourceTypes.includes("openstreetmap"),
    hasManualLead: sourceTypes.some(isManualLeadSource),
    phone: b.phone.trim().length > 0,
    website: b.website.trim().length > 0,
    email: b.email.trim().length > 0,
    photoCount: b.photos.length,
    reviewCount: count,
    reviewAvg: avg,
    recentActivity,
    descriptionComplete: b.description.trim().length >= 80,
    hasAddress: b.address.trim().length > 0,
    hasHours: hasJsonEntries(b.openingHours),
    hasSocial: hasJsonEntries(b.socials),
  };
}

export function trustV2ForBusiness(b: BusinessForTrust): TrustV2Result {
  return computeTrustV2(trustInputFromBusiness(b));
}
