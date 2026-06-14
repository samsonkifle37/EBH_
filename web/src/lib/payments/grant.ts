import { db } from "@/lib/db";
import { addRole } from "@/lib/auth";

/**
 * Grant ownership for a paid/approved claim. Single source of truth used by the
 * Stripe webhook (pay-to-activate) and the dev-mode admin fallback. Idempotent:
 * if the business is already owned by the claimant it only tops up the records.
 */
export async function grantClaimOwnership(claimId: string, amountPence: number): Promise<void> {
  const claim = await db.claimRequest.findUnique({
    where: { id: claimId },
    include: { business: { select: { id: true, ownerId: true, verificationLevel: true } } },
  });
  if (!claim) return;
  if (claim.business.ownerId && claim.business.ownerId !== claim.userId) return; // owned by someone else — refuse

  await db.$transaction([
    db.claimRequest.update({
      where: { id: claimId },
      data: { status: "approved", paymentStatus: "paid", reviewedAt: claim.reviewedAt ?? new Date() },
    }),
    db.business.update({
      where: { id: claim.businessId },
      data: { ownerId: claim.userId, claimedAt: claim.business.ownerId ? undefined : new Date(), verificationLevel: Math.max(claim.business.verificationLevel, 1) },
    }),
  ]);
  await addRole(claim.userId, "BUSINESS_OWNER");

  // record the claim payment once (dedupe by claim id in metadata-free schema)
  const existing = await db.payment.findFirst({ where: { kind: "claim", businessId: claim.businessId, userId: claim.userId, status: "paid" } });
  if (!existing) {
    await db.payment.create({
      data: { kind: "claim", businessId: claim.businessId, userId: claim.userId, amount: amountPence, status: "paid", planType: "CLAIM" },
    });
  }
}
