import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdminApi } from "@/lib/adminGuard";
import { addRole } from "@/lib/auth";
import { CATEGORIES, CITIES } from "@/lib/types";

const schema = z.object({
  action: z.enum(["approve", "reject", "feature", "unfeature", "setLevel", "setCategory", "setCity", "merge"]),
  level: z.number().int().min(0).max(4).optional(),
  category: z.enum(CATEGORIES).optional(),
  city: z.enum(CITIES).optional(),
  intoId: z.string().optional(),
});

/** Move everything from business `id` into `intoId`, then delete `id`. */
async function mergeBusiness(id: string, intoId: string) {
  const [from, into] = await Promise.all([
    db.business.findUnique({ where: { id }, include: { sources: true } }),
    db.business.findUnique({ where: { id: intoId } }),
  ]);
  if (!from || !into || id === intoId) return false;

  await db.$transaction(async (tx) => {
    // re-point relations; skip rows that would violate unique constraints
    await tx.businessPhoto.updateMany({ where: { businessId: id }, data: { businessId: intoId } });
    await tx.analyticsEvent.updateMany({ where: { businessId: id }, data: { businessId: intoId } });
    await tx.claimRequest.updateMany({ where: { businessId: id }, data: { businessId: intoId } });

    const reviews = await tx.review.findMany({ where: { businessId: id } });
    for (const r of reviews) {
      const clash = await tx.review.findUnique({ where: { businessId_userId: { businessId: intoId, userId: r.userId } } });
      if (!clash) await tx.review.update({ where: { id: r.id }, data: { businessId: intoId } });
    }
    const favorites = await tx.favorite.findMany({ where: { businessId: id } });
    for (const f of favorites) {
      const clash = await tx.favorite.findUnique({ where: { userId_businessId: { userId: f.userId, businessId: intoId } } });
      if (!clash) await tx.favorite.update({ where: { id: f.id }, data: { businessId: intoId } });
    }
    const follows = await tx.follow.findMany({ where: { businessId: id } });
    for (const f of follows) {
      const clash = await tx.follow.findUnique({ where: { userId_businessId: { userId: f.userId, businessId: intoId } } });
      if (!clash) await tx.follow.update({ where: { id: f.id }, data: { businessId: intoId } });
    }
    await tx.businessSource.updateMany({ where: { businessId: id }, data: { businessId: intoId } });

    // carry over corroborating identifiers the target is missing
    await tx.business.update({
      where: { id: intoId },
      data: {
        companyNumber: into.companyNumber || from.companyNumber,
        mapsUrl: into.mapsUrl || from.mapsUrl,
        googleRating: into.googleRating ?? from.googleRating,
        googleReviewCount: into.googleReviewCount ?? from.googleReviewCount,
        phone: into.phone || from.phone,
        website: into.website || from.website,
        ownerId: into.ownerId ?? from.ownerId,
      },
    });
    await tx.business.delete({ where: { id } });
  });
  return true;
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdminApi();
  if (denied) return denied;
  const { id } = await params;

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  const a = parsed.data;

  if (a.action === "merge") {
    if (!a.intoId) return NextResponse.json({ error: "intoId required" }, { status: 400 });
    const ok = await mergeBusiness(id, a.intoId);
    if (!ok) return NextResponse.json({ error: "Merge failed: business not found or same id" }, { status: 400 });
    return NextResponse.json({ ok: true });
  }

  // Approving an owner-submitted listing grants ownership + the BUSINESS_OWNER
  // role to its creator (this is the point at which owner trust applies).
  if (a.action === "approve") {
    const biz = await db.business.findUnique({ where: { id }, select: { ownerId: true, submittedById: true, verificationLevel: true } });
    if (!biz) return NextResponse.json({ error: "Business not found" }, { status: 404 });
    if (biz.submittedById && !biz.ownerId) {
      await db.business.update({
        where: { id },
        data: { status: "APPROVED", ownerId: biz.submittedById, claimedAt: new Date(), verificationLevel: Math.max(biz.verificationLevel, 1) },
      });
      await addRole(biz.submittedById, "BUSINESS_OWNER");
      return NextResponse.json({ ok: true, ownershipGranted: true });
    }
    await db.business.update({ where: { id }, data: { status: "APPROVED" } });
    return NextResponse.json({ ok: true });
  }

  const data =
    a.action === "reject" ? { status: "REJECTED" } :
    a.action === "feature" ? { featured: true } :
    a.action === "unfeature" ? { featured: false } :
    a.action === "setCategory" ? { category: a.category } :
    a.action === "setCity" ? { city: a.city } :
    { verificationLevel: a.level ?? 0 };

  await db.business.update({ where: { id }, data });
  return NextResponse.json({ ok: true });
}
