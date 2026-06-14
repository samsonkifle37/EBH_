/**
 * Business ownership claim status machine.
 *
 * Claims are reviewed by an admin. Ownership of a business is only ever
 * transferred when a claim reaches `approved` (handled in the admin API
 * route, not here). This module is the single source of truth for which
 * status transitions are legal, so the API route and any future automation
 * stay consistent.
 */

export const CLAIM_STATUSES = ["pending", "approved", "rejected", "needs_more_evidence"] as const;
export type ClaimStatus = (typeof CLAIM_STATUSES)[number];

export const CLAIM_ACTIONS = ["approve", "reject", "request_more_evidence"] as const;
export type ClaimAction = (typeof CLAIM_ACTIONS)[number];

const ACTION_TARGET: Record<ClaimAction, ClaimStatus> = {
  approve: "approved",
  reject: "rejected",
  request_more_evidence: "needs_more_evidence",
};

/** A claim can still be acted on while it is pending or awaiting more evidence. */
const ACTIONABLE: ReadonlySet<ClaimStatus> = new Set(["pending", "needs_more_evidence"]);

export function isClaimStatus(v: string): v is ClaimStatus {
  return (CLAIM_STATUSES as readonly string[]).includes(v);
}

export function isClaimAction(v: string): v is ClaimAction {
  return (CLAIM_ACTIONS as readonly string[]).includes(v);
}

export function canActOnClaim(current: ClaimStatus): boolean {
  return ACTIONABLE.has(current);
}

/**
 * Compute the next status for a claim given an admin action.
 * Throws if the action is unknown or the current status is terminal
 * (`approved` / `rejected`).
 */
export function claimTransition(current: ClaimStatus, action: ClaimAction): ClaimStatus {
  if (!isClaimAction(action)) {
    throw new Error(`Unknown claim action: ${action}`);
  }
  if (!ACTIONABLE.has(current)) {
    throw new Error(`Cannot ${action} a claim that is already ${current}`);
  }
  return ACTION_TARGET[action];
}

export const CLAIM_STATUS_LABELS: Record<ClaimStatus, string> = {
  pending: "Pending review",
  approved: "Approved",
  rejected: "Rejected",
  needs_more_evidence: "Needs more evidence",
};
