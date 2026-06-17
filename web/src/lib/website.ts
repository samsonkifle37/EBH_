// "Website essentials" domain logic. Pure + unit-tested so the profile, owner
// form and analytics all agree.

export interface ServiceItem {
  name: string;
  description: string;
  priceRange: string;
  imageUrl: string;
  sortOrder: number;
}

export interface FaqEntry {
  question: string;
  answer: string;
  sortOrder: number;
}

export function parseServices(json: string): ServiceItem[] {
  try {
    const v = JSON.parse(json);
    if (!Array.isArray(v)) return [];
    return v
      .map((s, i) => ({
        name: String(s?.name ?? "").trim(),
        description: String(s?.description ?? "").trim(),
        priceRange: String(s?.priceRange ?? "").trim(),
        imageUrl: String(s?.imageUrl ?? "").trim(),
        sortOrder: Number.isFinite(s?.sortOrder) ? Number(s.sortOrder) : i,
      }))
      .filter((s) => s.name.length > 0)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  } catch {
    return [];
  }
}

export function parseFaqs(json: string): FaqEntry[] {
  try {
    const v = JSON.parse(json);
    if (!Array.isArray(v)) return [];
    return v
      .map((f, i) => ({
        question: String(f?.question ?? "").trim(),
        answer: String(f?.answer ?? "").trim(),
        sortOrder: Number.isFinite(f?.sortOrder) ? Number(f.sortOrder) : i,
      }))
      .filter((f) => f.question.length > 0 && f.answer.length > 0)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  } catch {
    return [];
  }
}

/** Up to two uppercase initials for the branded fallback avatar. */
export function businessInitials(name: string): string {
  const words = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

/** Normalise a phone number to international digits for wa.me (UK-aware). */
export function normalizeWhatsApp(raw: string): string | null {
  let digits = (raw ?? "").replace(/[^\d]/g, "");
  if (!digits) return null;
  if (digits.startsWith("00")) digits = digits.slice(2); // 0044… → 44…
  else if (digits.startsWith("0")) digits = "44" + digits.slice(1); // UK local 07… → 447…
  return digits.length >= 8 ? digits : null;
}

export function whatsappLink(raw: string, message?: string): string | null {
  const digits = normalizeWhatsApp(raw);
  if (!digits) return null;
  const q = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${digits}${q}`;
}

/** True only when the business has a real, non-EBH external website. */
export function hasExternalWebsite(website: string): boolean {
  const w = (website ?? "").trim().toLowerCase();
  if (!w) return false;
  if (w.includes("ethiopianbh")) return false; // points back to EBH = not external
  return /^https?:\/\//.test(w) || w.includes(".");
}

export interface WebsiteScoreInput {
  claimed: boolean;
  shares: number;
  directVisits: number;
  returnVisitors: number;
  hasExternalWebsite: boolean;
}

export interface WebsiteCriterion {
  key: string;
  label: string;
  met: boolean;
}

export interface WebsiteScoreResult {
  qualifies: boolean;
  score: number; // 0–100, share of criteria met
  criteria: WebsiteCriterion[];
}

/**
 * PrimaryWebsiteScore — proxy for "is this profile actually being used as the
 * business's primary website". Qualifies only when ALL criteria are met.
 */
export function primaryWebsiteScore(i: WebsiteScoreInput): WebsiteScoreResult {
  const criteria: WebsiteCriterion[] = [
    { key: "claimed", label: "Claimed by the owner", met: i.claimed },
    { key: "shared", label: "Shared at least once", met: i.shares > 0 },
    { key: "direct", label: "Getting direct visits", met: i.directVisits > 0 },
    { key: "return", label: "Has return visitors", met: i.returnVisitors > 0 },
    { key: "noExternal", label: "EBH is the only website", met: !i.hasExternalWebsite },
  ];
  const met = criteria.filter((c) => c.met).length;
  return {
    qualifies: met === criteria.length,
    score: Math.round((met / criteria.length) * 100),
    criteria,
  };
}

export interface TrustEvidenceInput {
  ownerClaimed: boolean;
  companiesHouse: boolean;
  google: boolean;
  photos: number;
  reviews: number;
  recentActivity: boolean;
  completion: number;
}

export interface TrustRow {
  label: string;
  met: boolean;
  hint?: string;
}

/** Explainable Trust-Score breakdown rows from the Trust V2 evidence. */
export function trustBreakdownRows(i: TrustEvidenceInput): TrustRow[] {
  return [
    { label: "Verified owner", met: i.ownerClaimed, hint: "Claimed and managed by the business" },
    { label: "Companies House matched", met: i.companiesHouse, hint: "Listed on the official UK company register" },
    { label: "Listed on Google", met: i.google },
    { label: "Has photos", met: i.photos > 0 },
    { label: "Has customer reviews", met: i.reviews > 0 },
    { label: "Recently active", met: i.recentActivity },
    { label: "Profile complete", met: i.completion >= 80, hint: `${i.completion}% complete` },
  ];
}
