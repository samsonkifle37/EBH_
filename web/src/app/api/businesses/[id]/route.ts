import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession, hasRole } from "@/lib/session";
import { businessInputSchema, HOUR_PRESETS } from "@/lib/validation";
import { recordPrideEvent } from "@/lib/analytics/record";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const { id } = await params;

  const business = await db.business.findUnique({ where: { id } });
  if (!business) return NextResponse.json({ error: "Business not found" }, { status: 404 });
  const manages = business.ownerId === session.userId || business.submittedById === session.userId || hasRole(session, "ADMIN");
  if (!manages) {
    return NextResponse.json({ error: "You don't manage this business" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = businessInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check the form fields" }, { status: 400 });
  }
  const d = parsed.data;

  const services = d.services.filter((s) => s.name.trim()).map((s, i) => ({ ...s, sortOrder: i }));
  const faqs = d.faqs.filter((f) => f.question.trim() && f.answer.trim()).map((f, i) => ({ ...f, sortOrder: i }));

  await db.$transaction([
    db.businessPhoto.deleteMany({ where: { businessId: id } }),
    db.business.update({
      where: { id },
      data: {
        name: d.name,
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
        socials: JSON.stringify({
          ...(d.instagram ? { instagram: d.instagram } : {}),
          ...(d.facebook ? { facebook: d.facebook } : {}),
        }),
        ...(d.hoursPreset !== "none" ? { openingHours: HOUR_PRESETS[d.hoursPreset] } : {}),
        coverImageUrl: d.coverImageUrl,
        logoUrl: d.logoUrl,
        founderName: d.founderName,
        founderPhotoUrl: d.founderPhotoUrl,
        founderStory: d.founderStory,
        brandStory: d.brandStory,
        yearFounded: d.yearFounded ?? null,
        signatureItems: JSON.stringify(d.signatureItems),
        whatsapp: d.whatsapp,
        services: JSON.stringify(services),
        faqs: JSON.stringify(faqs),
        photos: { create: d.photoUrls.map((url, i) => ({ url, sortOrder: i })) },
      },
    }),
  ]);

  // Analytics: profile updated, plus first-time milestones for website essentials.
  void recordPrideEvent({ action: "PROFILE_UPDATED", businessId: id, visitorId: "owner", dedupeKey: `profile_updated:${id}:${new Date().toISOString().slice(0, 10)}` });
  if (!business.logoUrl && d.logoUrl) void recordPrideEvent({ action: "LOGO_ADDED", businessId: id, visitorId: "owner", dedupeKey: `logo_added:${id}` });
  if (services.length > 0 && (() => { try { return (JSON.parse(business.services) as unknown[]).length === 0; } catch { return true; } })())
    void recordPrideEvent({ action: "SERVICES_ADDED", businessId: id, visitorId: "owner", dedupeKey: `services_added:${id}` });
  if (faqs.length > 0 && (() => { try { return (JSON.parse(business.faqs) as unknown[]).length === 0; } catch { return true; } })())
    void recordPrideEvent({ action: "FAQ_ADDED", businessId: id, visitorId: "owner", dedupeKey: `faq_added:${id}` });

  return NextResponse.json({ ok: true });
}
