import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession, hasRole } from "@/lib/session";
import { eventInputSchema } from "@/lib/validation";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const { id } = await params;

  const event = await db.event.findUnique({ where: { id } });
  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });
  if (event.organizerId !== session.userId && !hasRole(session, "ADMIN")) {
    return NextResponse.json({ error: "You don't manage this event" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = eventInputSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Please check the form fields" }, { status: 400 });
  const d = parsed.data;

  await db.event.update({
    where: { id },
    data: {
      title: d.title,
      type: d.type,
      city: d.city,
      venueName: d.venueName,
      address: d.address,
      startsAt: d.startsAt,
      description: d.description,
      ticketUrl: d.ticketUrl,
      priceFrom: d.priceFrom ?? null,
      imageUrl: d.imageUrl,
    },
  });

  return NextResponse.json({ ok: true });
}
