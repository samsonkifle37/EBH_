export interface CompletenessInput {
  description: string;
  phone: string;
  website: string;
  socials: string; // JSON string
  openingHours: string; // JSON string
  photoCount: number;
}

function hasJsonEntries(json: string): boolean {
  try {
    const parsed = JSON.parse(json);
    return !!parsed && typeof parsed === "object" && Object.keys(parsed).length > 0;
  } catch {
    return false;
  }
}

/** Fraction (0-1) of the six profile-quality signals that are present. */
export function profileCompleteness(b: CompletenessInput): number {
  const signals = [
    b.description.trim().length >= 80,
    b.phone.trim().length > 0,
    b.website.trim().length > 0,
    hasJsonEntries(b.socials),
    hasJsonEntries(b.openingHours),
    b.photoCount >= 3,
  ];
  return signals.filter(Boolean).length / signals.length;
}

/** Public verification score 0-100: 20 per verification level + up to 20 for completeness. */
export function verificationScore(level: number, completeness: number): number {
  return Math.min(100, level * 20 + Math.round(completeness * 20));
}
