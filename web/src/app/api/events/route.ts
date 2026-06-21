import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { addRole } from "@/lib/auth";
import { slugify } from "@/lib/domain/slug";
import { eventInputSchema } from "@/lib/validation";
import { rateLimitDb, HOUR } from "@/lib/rateLimitDb";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in to create an event" }, { status: 401 });

  // Rate limit: max 10 event submissions per user per hour
  const allowed = await rateLimitDb(`event_submit:user:${session.userId}`, 10, HOUR);
  if (!allowed) {
    return NextResponse.json(
      { error: "You've submitted several events recently. Please wait before submitting more." },
      { status: 429 },
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = eventInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check the form — title, type, city, venue and date are required" }, { status: 400 });
  }
  const d = parsed.data;

  let slug = slugify(d.title);
  const clash = await db.event.findUnique({ where: { slug } });
  if (clash) slug = `${slug}-${Date.now().toString(36)}`;

  const event = await db.event.create({
    data: {
      title: d.title,
      slug,
      type: d.type,
      city: d.city,
      venueName: d.venueName,
      address: d.address,
      startsAt: d.startsAt,
      description: d.description,
      ticketUrl: d.ticketUrl,
      priceFrom: d.priceFrom ?? null,
      imageUrl: d.imageUrl,
      organizerId: session.userId,
      status: "PENDING",
      sourceType: session.roles.includes("ADMIN") ? "admin_created" : "owner_submitted",
      sources: {
        create: [
          {
            sourceType: session.roles.includes("ADMIN") ? "admin_created" : "owner_submitted",
            sourceId: `submission-${session.userId}`,
            sourceUrl: d.ticketUrl,
          },
        ],
      },
    },
  });

  // Grant the organizer role in the DB; getSession derives roles live, so no
  // session re-issue is needed for it to take effect on the next request.
  await addRole(session.userId, "EVENT_ORGANIZER");

  return NextResponse.json({ ok: true, id: event.id, slug: event.slug });
}
