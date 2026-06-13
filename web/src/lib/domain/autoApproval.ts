const BANNED_NAMES = new Set(["unknown", "test", "n/a", "na", "placeholder", "none", "null", "tbd", "xxx"]);

export function hasValidName(name: string): boolean {
  const trimmed = name.trim();
  if (trimmed.length <= 2) return false;
  return !BANNED_NAMES.has(trimmed.toLowerCase());
}

/** A URL that is empty or a known non-real placeholder. */
export function isPlaceholderImage(url: string): boolean {
  const u = url.trim().toLowerCase();
  if (!u) return true;
  return u.includes("picsum.photos") || u.includes("example.com") || u.includes("placeholder");
}

export interface AutoApprovalEvidence {
  hasOsm: boolean;
  hasGoogle: boolean;
  hasCompaniesHouse: boolean;
  website: boolean;
  phone: boolean;
  email: boolean;
  hasImage: boolean;
}

/**
 * Auto-approval score per the trust-filter PRD (distinct from the public trust
 * score). A single source bonus (+10) for OSM/Google/Companies House, +10
 * website, +5 phone, +5 email, +5 image. Threshold for auto-approval is 30.
 */
export function autoApprovalScore(ev: AutoApprovalEvidence): number {
  let score = 0;
  if (ev.hasOsm || ev.hasGoogle || ev.hasCompaniesHouse) score += 10;
  if (ev.website) score += 10;
  if (ev.phone) score += 5;
  if (ev.email) score += 5;
  if (ev.hasImage) score += 5;
  return score;
}

export const AUTO_APPROVAL_THRESHOLD = 30;

export interface EvaluateInput extends Omit<AutoApprovalEvidence, "website" | "phone" | "email"> {
  name: string;
  phone: string;
  website: string;
  email: string;
}

export interface EvaluateResult {
  status: "APPROVED" | "PENDING";
  verificationStatus: string;
  approvedBy: string;
  approvalReason: string;
  reviewBucket: string;
}

const PENDING = (approvalReason: string, reviewBucket = ""): EvaluateResult => ({
  status: "PENDING",
  verificationStatus: "",
  approvedBy: "",
  approvalReason,
  reviewBucket,
});

/** Apply the five gates and return the resulting status fields. */
export function evaluateListing(input: EvaluateInput): EvaluateResult {
  const hasContact = !!(input.phone.trim() || input.website.trim() || input.email.trim());

  // Gate 1: image — no image goes to the enrichment queue, out of the main queue.
  if (!input.hasImage) return PENDING("Awaiting image enrichment", "needs_enrichment");

  // Gate 2: contact details.
  if (!hasContact) return PENDING("Missing contact information", "needs_contact_info");

  // Gate 3: valid name.
  if (!hasValidName(input.name)) return PENDING("Name needs review");

  // Gate 5: trust threshold (gate 4, dedup, is enforced before evaluation).
  const score = autoApprovalScore({
    hasOsm: input.hasOsm,
    hasGoogle: input.hasGoogle,
    hasCompaniesHouse: input.hasCompaniesHouse,
    website: !!input.website.trim(),
    phone: !!input.phone.trim(),
    email: !!input.email.trim(),
    hasImage: input.hasImage,
  });
  if (score < AUTO_APPROVAL_THRESHOLD) return PENDING("Below trust threshold");

  return {
    status: "APPROVED",
    verificationStatus: "auto_verified",
    approvedBy: "system",
    approvalReason: "Trust Threshold Passed",
    reviewBucket: "",
  };
}
