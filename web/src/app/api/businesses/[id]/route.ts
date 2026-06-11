import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession, hasRole } from "@/lib/session";
import { businessInputSchema, HOUR_PRESETS } from "@/lib/validation";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const { id } = await params;

  const business = await db.business.findUnique({ where: { id } });
  if (!business) return NextResponse.json({ error: "Business not found" }, { status: 404 });
  if (business.ownerId !== session.userId && !hasRole(session, "ADMIN")) {
    return NextResponse.json({ error: "You don't manage this business" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = businessInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check the form fields" }, { status: 400 });
  }
  const d = parsed.data;

  await db.$transaction([
    db.businessPhoto.deleteMany({ where: { businessId: id } }),
    db.business.update({
      where: { id },
      data: {
        name: d.name,
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
        ...(d.hoursPreset !== "none" ? { openingHours: HOUR_PRESETS[d.hoursPreset] } : {}),
        photos: { create: d.photoUrls.map((url, i) => ({ url, sortOrder: i })) },
      },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
