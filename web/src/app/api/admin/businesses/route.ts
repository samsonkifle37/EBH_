import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { requireAdminApi } from "@/lib/adminGuard";
import { slugify } from "@/lib/domain/slug";
import { addRole } from "@/lib/auth";
import { logAdminAction } from "@/lib/adminAudit";
import { recordPrideEvent } from "@/lib/analytics/record";
import { CATEGORIES } from "@/lib/types";

export const runtime = "nodejs";

const SOURCES = ["admin_created", "google_places", "companies_house", "openstreetmap", "owner_submitted", "community_referral", "facebook_page", "instagram", "flyer", "other"] as const;

const schema = z.object({
  name: z.string().min(2).max(120),
  category: z.enum(CATEGORIES),
  city: z.string().min(1).max(120),
  county: z.string().max(120).optional().default(""),
  region: z.string().max(120).optional().default(""),
  country: z.string().max(120).optional().default("United Kingdom"),
  address: z.string().max(200).optional().default(""),
  postcode: z.string().max(12).optional().default(""),
  phone: z.string().max(40).optional().default(""),
  website: z.string().max(200).optional().default(""),
  description: z.string().max(2000).optional().default(""),
  logoUrl: z.string().max(400).optional().default(""),
  coverImageUrl: z.string().max(400).optional().default(""),
  sourceType: z.enum(SOURCES).optional().default("admin_created"),
  autoApprove: z.boolean().optional().default(false),
  ownerEmail: z.string().email().optional().or(z.literal("")).default(""),
});

async function uniqueSlug(name: string): Promise<string> {
  const base = slugify(name) || "business";
  let slug = base;
  for (let i = 2; ; i++) {
    const exists = await db.business.findUnique({ where: { slug }, select: { id: true } });
    if (!exists) return slug;
    slug = `${base}-${i}`;
  }
}

export async function POST(req: Request) {
  const denied = await requireAdminApi();
  if (denied) return denied;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Please check the form — name, category and city are required." }, { status: 400 });
  const d = parsed.data;

  // Optional owner assignment (create as claimed).
  let owner: { id: string } | null = null;
  if (d.ownerEmail) {
    owner = await db.user.findUnique({ where: { email: d.ownerEmail.toLowerCase() }, select: { id: true } });
    if (!owner) return NextResponse.json({ error: `No user found with email ${d.ownerEmail}.` }, { status: 400 });
  }

  const slug = await uniqueSlug(d.name);
  const business = await db.business.create({
    data: {
      name: d.name,
      slug,
      category: d.category,
      city: d.city,
      county: d.county,
      region: d.region,
      country: d.country,
      address: d.address,
      postcode: d.postcode,
      phone: d.phone,
      website: d.website,
      description: d.description,
      logoUrl: d.logoUrl,
      coverImageUrl: d.coverImageUrl,
      status: d.autoApprove ? "APPROVED" : "PENDING",
      approvedBy: d.autoApprove ? session.userId : "",
      approvalReason: d.autoApprove ? "admin created (auto-approved)" : "",
      ownerId: owner?.id ?? null,
      claimedAt: owner ? new Date() : null,
      verificationLevel: owner ? 1 : 0,
      sourceType: d.sourceType,
      sourceId: `admin-${slug}`,
      sources: { create: [{ sourceType: d.sourceType, sourceId: `admin-${slug}`, rawData: JSON.stringify({ createdByAdmin: session.userId, createdAt: new Date().toISOString() }) }] },
    },
  });

  if (owner) await addRole(owner.id, "BUSINESS_OWNER");

  await logAdminAction({ actorId: session.userId, actorEmail: session.name, targetType: "business", targetId: business.id, action: "ADMIN_BUSINESS_CREATED", metadata: { autoApprove: d.autoApprove, claimed: !!owner, sourceType: d.sourceType } });
  void recordPrideEvent({ action: "ADMIN_BUSINESS_CREATED", businessId: business.id, visitorId: "admin" });

  return NextResponse.json({ ok: true, id: business.id, slug: business.slug });
}
