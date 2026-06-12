export interface TrustEvidence {
  hasGooglePlace: boolean;
  hasPhone: boolean;
  hasWebsite: boolean;
  hasCompaniesHouseMatch: boolean;
  ownerClaimed: boolean;
  hasPhotos: boolean;
}

/**
 * Evidence-based public trust score (0-100). Never invented:
 * +30 Google Place exists, +20 phone, +20 website,
 * +15 Companies House match, +10 owner claimed, +5 photos.
 */
export function trustScore(e: TrustEvidence): number {
  let score = 0;
  if (e.hasGooglePlace) score += 30;
  if (e.hasPhone) score += 20;
  if (e.hasWebsite) score += 20;
  if (e.hasCompaniesHouseMatch) score += 15;
  if (e.ownerClaimed) score += 10;
  if (e.hasPhotos) score += 5;
  return Math.min(100, score);
}

export interface TrustInput {
  phone: string;
  website: string;
  companyNumber: string;
  ownerId: string | null;
  photoCount: number;
  hasGoogleSource: boolean;
}

/** Derive evidence from a business record + its sources. */
export function trustScoreForBusiness(b: TrustInput): number {
  return trustScore({
    hasGooglePlace: b.hasGoogleSource,
    hasPhone: b.phone.trim().length > 0,
    hasWebsite: b.website.trim().length > 0,
    hasCompaniesHouseMatch: b.companyNumber.trim().length > 0,
    ownerClaimed: !!b.ownerId,
    hasPhotos: b.photoCount > 0,
  });
}
