import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdminApi } from "@/lib/adminGuard";
import { getSession } from "@/lib/session";
import { claimTransition, canActOnClaim, type ClaimStatus, type ClaimAction } from "@/lib/domain/claim";
import { stripeConfigured, PRODUCTS } from "@/lib/payments/stripe";
import { devFallbackAllowed } from "@/lib/payments/config";
import { grantClaimOwnership } from "@/lib/payments/grant";

const schema = z.object({ action: z.enum(["approve", "reject", "request_more_evidence"]) });

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdminApi();
  if (denied) return denied;
  const session = await getSession();
  const { id } = await params;

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  const claim = await db.claimRequest.findUnique({ where: { id }, include: { business: { select: { id: true, ownerId: true, verificationLevel: true } } } });
  if (!claim) return NextResponse.json({ error: "Claim not found" }, { status: 404 });
  if (!canActOnClaim(claim.status as ClaimStatus)) {
    return NextResponse.json({ error: `Claim is already ${claim.status}` }, { status: 409 });
  }

  const nextStatus = claimTransition(claim.status as ClaimStatus, parsed.data.action as ClaimAction);

  if (nextStatus === "approved") {
    if (claim.business.ownerId && claim.business.ownerId !== claim.userId) {
      return NextResponse.json({ error: "This business is already owned by another user" }, { status: 409 });
    }
    // pay-to-activate: approving endorses the claim but does NOT grant ownership;
    // the claimant pays £9.99 and the Stripe webhook grants it. Without Stripe
    // configured we grant immediately (dev mode) so the flow stays usable.
    await db.claimRequest.update({
      where: { id },
      data: { status: "approved", reviewedAt: new Date(), reviewedBy: session?.userId ?? null },
    });
    if (!stripeConfigured() && devFallbackAllowed()) {
      await grantClaimOwnership(id, PRODUCTS.CLAIM.amountPence);
      return NextResponse.json({ ok: true, status: nextStatus, ownershipGranted: true, devMode: true });
    }
    return NextResponse.json({ ok: true, status: nextStatus, awaitingPayment: true });
  }

  await db.claimRequest.update({
    where: { id },
    data: { status: nextStatus, reviewedAt: new Date(), reviewedBy: session?.userId ?? null },
  });
  return NextResponse.json({ ok: true, status: nextStatus });
}
