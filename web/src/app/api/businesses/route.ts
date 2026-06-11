import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession, createSessionCookie } from "@/lib/session";
import { addRole } from "@/lib/auth";
import { slugify } from "@/lib/domain/slug";
import { businessInputSchema, HOUR_PRESETS } from "@/lib/validation";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in to list a business" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = businessInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check the form — name, category and city are required" }, { status: 400 });
  }
  const d = parsed.data;

  let slug = slugify(d.name);
  const clash = await db.business.findUnique({ where: { slug } });
  if (clash) slug = `${slug}-${d.city}`;
  const clash2 = await db.business.findUnique({ where: { slug } });
  if (clash2) slug = `${slug}-${Date.now().toString(36)}`;

  const business = await db.business.create({
    data: {
      name: d.name,
      slug,
      category: d.category,
      city: d.city,
      address: d.address,
      postcode: d.postcode,
      phone: d.phone,
      website: d.website,
      description: d.description,
      socials: JSON.stringify({
        ...(d.instagram ? { instagram: d.instagram } : {}),
        ...(d.facebook ? { facebook: d.facebook } : {}),
      }),
      openingHours: HOUR_PRESETS[d.hoursPreset] ?? "{}",
      status: "PENDING",
      ownerId: session.userId,
      claimedAt: new Date(),
      photos: { create: d.photoUrls.map((url, i) => ({ url, sortOrder: i })) },
    },
  });

  const roles = await addRole(session.userId, "BUSINESS_OWNER");
  await createSessionCookie({ userId: session.userId, name: session.name, roles });

  return NextResponse.json({ ok: true, id: business.id, slug: business.slug });
}
