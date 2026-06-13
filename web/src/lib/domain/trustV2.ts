export interface TrustV2Input {
  verifiedSubscription: boolean;
  ownerClaimed: boolean;
  hasGoogleSource: boolean;
  hasCompaniesHouse: boolean;
  hasOsmSource: boolean;
  hasManualLead: boolean;
  phone: boolean;
  website: boolean;
  email: boolean;
  photoCount: number;
  reviewCount: number;
  reviewAvg: number;
  recentActivity: boolean;
  descriptionComplete: boolean;
  hasAddress: boolean;
  hasHours: boolean;
  hasSocial: boolean;
}

export interface TrustBreakdownRow {
  label: string;
  points: number;
}

export interface TrustV2Result {
  score: number; // 0-100
  breakdown: TrustBreakdownRow[];
}

/**
 * Trust Engine V2 — additive, capped at 100, with a per-factor breakdown so
 * admins can see exactly why a business has its score. Trust is the foundation
 * of every ranking and monetization decision in EBH.
 */
export function computeTrustV2(b: TrustV2Input): TrustV2Result {
  const rows: TrustBreakdownRow[] = [];
  const add = (label: string, points: number) => {
    if (points > 0) rows.push({ label, points });
  };

  add("Verified subscription", b.verifiedSubscription ? 20 : 0);
  add("Owner claimed", b.ownerClaimed ? 20 : 0);
  add("Google Places listing", b.hasGoogleSource ? 15 : 0);
  add("Companies House match", b.hasCompaniesHouse ? 10 : 0);
  add("OpenStreetMap listing", b.hasOsmSource ? 5 : 0);
  add("Community lead", b.hasManualLead ? 2 : 0);
  add("Phone number", b.phone ? 5 : 0);
  add("Website", b.website ? 5 : 0);
  add("Email", b.email ? 3 : 0);
  add("Photos", Math.min(b.photoCount, 5) * 2);

  const reviewVolume = Math.min(b.reviewCount, 5);
  const reviewQuality = b.reviewCount >= 3 && b.reviewAvg >= 4 ? 5 : 0;
  add("Reviews", reviewVolume + reviewQuality);

  add("Recent activity", b.recentActivity ? 5 : 0);

  const completion =
    (b.descriptionComplete ? 1 : 0) +
    (b.hasAddress ? 1 : 0) +
    (b.hasHours ? 1 : 0) +
    (b.hasSocial ? 1 : 0);
  add("Profile completion", Math.min(completion * 2.5, 10));

  const rawScore = rows.reduce((a, r) => a + r.points, 0);
  return { score: Math.min(100, Math.round(rawScore)), breakdown: rows };
}
