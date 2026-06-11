import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession, createSessionCookie } from "@/lib/session";
import { addRole } from "@/lib/auth";
import { slugify } from "@/lib/domain/slug";
import { eventInputSchema } from "@/lib/validation";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in to create an event" }, { status: 401 });

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
    },
  });

  const roles = await addRole(session.userId, "EVENT_ORGANIZER");
  await createSessionCookie({ userId: session.userId, name: session.name, roles });

  return NextResponse.json({ ok: true, id: event.id, slug: event.slug });
}
