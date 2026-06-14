export const CLAIM_STATUSES = ["pending", "approved", "rejected", "needs_more_evidence"] as const;
export type ClaimStatus = (typeof CLAIM_STATUSES)[number];

export type ClaimAction = "approve" | "reject" | "request_more_evidence";

const ACTION_TARGET: Record<ClaimAction, ClaimStatus> = {
  approve: "approved",
  reject: "rejected",
  request_more_evidence: "needs_more_evidence",
};

// statuses an admin can still act on
const ACTIONABLE: ClaimStatus[] = ["pending", "needs_more_evidence"];

/** Validate and resolve a claim status transition; throws on invalid moves. */
export function claimTransition(current: ClaimStatus, action: ClaimAction): ClaimStatus {
  const target = ACTION_TARGET[action];
  if (!target) throw new Error(`Unknown claim action: ${action}`);
  if (!ACTIONABLE.includes(current)) {
    throw new Error(`Claim is ${current} and can no longer be changed`);
  }
  return target;
}
