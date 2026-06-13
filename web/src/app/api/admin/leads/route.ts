import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdminApi } from "@/lib/adminGuard";
import { getSession } from "@/lib/session";
import { slugify } from "@/lib/domain/slug";
import { findDuplicate, normalizeName } from "@/lib/domain/match";
import { trustScoreForBusiness, isManualLeadSource } from "@/lib/domain/trust";
import { CATEGORIES, CITIES } from "@/lib/types";

const LEAD_SOURCES = ["facebook_page", "instagram", "community_referral", "flyer", "other"] as const;

const schema = z.object({
  businessName: z.string().min(2).max(120),
  sourceType: z.enum(LEAD_SOURCES),
  sourceUrl: z.string().max(300).optional().default(""),
  city: z.enum(CITIES).optional(),
  category: z.enum(CATEGORIES).optional(),
  phone: z.string().max(40).optional().default(""),
  website: z.string().max(200).optional().default(""),
  notes: z.string().max(1000).optional().default(""),
  force: z.boolean().optional().default(false),
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

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Business name and a valid source type are required" }, { status: 400 });
  }
  const d = parsed.data;

  // Dedup check on strong signals (name+postcode unavailable here, so name/phone/website)
  if (!d.force) {
    const existing = await db.business.findMany({
      select: { id: true, name: true, slug: true, postcode: true, phone: true, website: true, companyNumber: true },
    });
    const slugById = new Map(existing.map((e) => [e.id, e.slug]));
    const dup = findDuplicate(
      { id: "", name: d.businessName, postcode: "", phone: d.phone, website: d.website, googlePlaceId: "", companyNumber: "" },
      existing.map((e) => ({ id: e.id, name: e.name, postcode: e.postcode, phone: e.phone, website: e.website, companyNumber: e.companyNumber, googlePlaceId: "" }))
    );
    // Leads carry no postcode, so also warn on an exact normalised-name match.
    const nameMatch = dup
      ? null
      : existing.find((e) => normalizeName(e.name) === normalizeName(d.businessName));
    const hit = dup ? { id: dup.match.id, name: dup.match.name, reason: dup.reason } : nameMatch ? { id: nameMatch.id, name: nameMatch.name, reason: "name" as const } : null;
    if (hit) {
      return NextResponse.json({
        duplicate: { id: hit.id, name: hit.name, slug: slugById.get(hit.id) ?? "", reason: hit.reason },
      });
    }
  }

  const slug = await uniqueSlug(d.businessName);
  const confidence = trustScoreForBusiness({
    phone: d.phone,
    website: d.website,
    companyNumber: "",
    ownerId: null,
    photoCount: 0,
    hasGoogleSource: false,
    hasManualLead: isManualLeadSource(d.sourceType),
  });

  const business = await db.business.create({
    data: {
      name: d.businessName,
      slug,
      category: d.category ?? "community-organizations",
      city: d.city ?? "london",
      phone: d.phone,
      website: d.website,
      description: d.notes,
      status: "PENDING",
      sourceType: d.sourceType,
      sourceId: `lead-${slug}`,
      sourceUrl: d.sourceUrl,
      dataConfidenceScore: confidence,
      sources: {
        create: [
          {
            sourceType: d.sourceType,
            sourceId: `lead-${slug}`,
            sourceUrl: d.sourceUrl,
            rawData: JSON.stringify({ createdByAdmin: session?.userId ?? null, createdAt: new Date().toISOString(), notes: d.notes }),
          },
        ],
      },
    },
  });

  return NextResponse.json({
    ok: true,
    business: { id: business.id, name: business.name, slug: business.slug, sourceType: d.sourceType, status: "PENDING" },
  });
}
