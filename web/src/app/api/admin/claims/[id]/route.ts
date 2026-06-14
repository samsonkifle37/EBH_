import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdminApi } from "@/lib/adminGuard";
import { getSession } from "@/lib/session";
import { addRole } from "@/lib/auth";
import { claimTransition, canActOnClaim, type ClaimStatus, type ClaimAction } from "@/lib/domain/claim";

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
    await db.$transaction([
      db.claimRequest.update({
        where: { id },
        data: { status: nextStatus, reviewedAt: new Date(), reviewedBy: session?.userId ?? null },
      }),
      db.business.update({
        where: { id: claim.businessId },
        data: { ownerId: claim.userId, claimedAt: new Date(), verificationLevel: Math.max(claim.business.verificationLevel, 1) },
      }),
    ]);
    await addRole(claim.userId, "BUSINESS_OWNER");
    return NextResponse.json({ ok: true, status: nextStatus });
  }

  await db.claimRequest.update({
    where: { id },
    data: { status: nextStatus, reviewedAt: new Date(), reviewedBy: session?.userId ?? null },
  });
  return NextResponse.json({ ok: true, status: nextStatus });
}
