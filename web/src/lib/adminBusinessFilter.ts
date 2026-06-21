// Pure admin-businesses filter + search logic. Page computes per-row flags and
// a search haystack, then delegates here so counts, filtering and search stay
// consistent and unit-testable.

export type AdminFilter =
  | "approved"
  | "all"
  | "ready_to_approve"
  | "needs_contact"
  | "needs_image"
  | "duplicate_candidates"
  | "auto_approved";

export const ADMIN_FILTERS: { key: AdminFilter; label: string }[] = [
  { key: "approved", label: "Approved" },
  { key: "all", label: "Pending" },
  { key: "ready_to_approve", label: "Ready to approve" },
  { key: "needs_contact", label: "Needs contact" },
  { key: "needs_image", label: "Needs image" },
  { key: "duplicate_candidates", label: "Duplicate candidates" },
  { key: "auto_approved", label: "Recently auto approved" },
];

export function isAdminFilter(v: unknown): v is AdminFilter {
  return typeof v === "string" && ADMIN_FILTERS.some((f) => f.key === v);
}

export interface BizFlags {
  isPending: boolean;
  isApproved: boolean;
  hasImage: boolean;
  hasContact: boolean;
  isDuplicate: boolean;
  needsEnrichment: boolean; // reviewBucket = needs_enrichment (the "needs image" queue)
  needsContactBucket: boolean; // reviewBucket = needs_contact_info
  autoApprovedRecent: boolean;
}

export function inMainQueue(f: BizFlags): boolean {
  return f.isPending && !f.needsEnrichment && !f.needsContactBucket;
}

export function isNeedsContact(f: BizFlags): boolean {
  return f.needsContactBucket || (f.isPending && f.hasImage && !f.hasContact);
}

/** Whether a row belongs in a given chip's queue. */
export function matchesChip(filter: AdminFilter, f: BizFlags): boolean {
  switch (filter) {
    case "approved":
      return f.isApproved;
    case "ready_to_approve":
      return f.isPending && f.hasImage && f.hasContact && !f.isDuplicate;
    case "needs_contact":
      return isNeedsContact(f);
    case "needs_image":
      return f.needsEnrichment;
    case "duplicate_candidates":
      return f.isPending && f.isDuplicate;
    case "auto_approved":
      return f.autoApprovedRecent;
    default:
      return inMainQueue(f);
  }
}

export interface SearchFields {
  name: string;
  city: string;
  category: string;
  source: string;
  phone: string;
  website: string;
  email: string;
  status: string;
  claimed: boolean;
  verified: boolean;
}

/** Lowercased searchable text covering every supported search field. */
export function buildHaystack(s: SearchFields): string {
  return [
    s.name,
    s.city,
    s.category,
    s.source,
    s.phone,
    s.website,
    s.email,
    s.status,
    // "owned" (not "claimed") so it doesn't collide with the "unclaimed" substring
    s.claimed ? "owned" : "unclaimed",
    s.verified ? "verified" : "unverified",
  ]
    .join(" ")
    .toLowerCase();
}

/** AND-token search: every whitespace-separated token must appear. Empty = match all. */
export function searchMatches(haystack: string, query: string): boolean {
  const tokens = (query ?? "").trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return true;
  return tokens.every((t) => haystack.includes(t));
}
