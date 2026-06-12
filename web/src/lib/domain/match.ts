export interface MatchCandidate {
  id: string;
  name: string;
  postcode: string;
  phone: string;
  website: string;
  googlePlaceId: string;
  companyNumber: string;
}

export type MatchReason =
  | "google_place_id"
  | "company_number"
  | "phone"
  | "website"
  | "name_postcode";

const SUFFIXES = /\b(ltd|limited|plc|llp|uk|the)\b/g;

export function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(SUFFIXES, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizePhone(phone: string): string {
  let digits = phone.replace(/[^\d+]/g, "");
  if (digits.startsWith("+44")) digits = "0" + digits.slice(3);
  return digits.replace(/\D/g, "");
}

export function websiteHost(url: string): string {
  try {
    const u = new URL(url.includes("://") ? url : `https://${url}`);
    if (!u.hostname.includes(".")) return "";
    return u.hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
}

function postcodePrefix(postcode: string): string {
  return postcode.toUpperCase().replace(/\s+/g, "").slice(0, 3);
}

/**
 * Find an existing business that is (very likely) the same real-world
 * business as the candidate. Strong identifiers first, then fuzzy
 * name + postcode-area match (catches "ABYSSINIA RESTAURANT LTD" vs
 * "Abyssinia Restaurant").
 */
export function findDuplicate(
  candidate: MatchCandidate,
  existing: MatchCandidate[]
): { match: MatchCandidate; reason: MatchReason } | null {
  const cPhone = normalizePhone(candidate.phone);
  const cHost = websiteHost(candidate.website);
  const cName = normalizeName(candidate.name);
  const cPc = postcodePrefix(candidate.postcode);

  for (const e of existing) {
    if (e.id === candidate.id) continue;
    if (candidate.googlePlaceId && e.googlePlaceId && candidate.googlePlaceId === e.googlePlaceId) {
      return { match: e, reason: "google_place_id" };
    }
    if (candidate.companyNumber && e.companyNumber && candidate.companyNumber === e.companyNumber) {
      return { match: e, reason: "company_number" };
    }
    if (cPhone && normalizePhone(e.phone) === cPhone) {
      return { match: e, reason: "phone" };
    }
    if (cHost && websiteHost(e.website) === cHost) {
      return { match: e, reason: "website" };
    }
    if (cName && cName === normalizeName(e.name) && cPc && cPc === postcodePrefix(e.postcode)) {
      return { match: e, reason: "name_postcode" };
    }
  }
  return null;
}
