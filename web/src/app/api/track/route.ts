import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { rateLimitDb, HOUR } from "@/lib/rateLimitDb";

const schema = z.object({
  type: z.enum([
    "LISTING_VIEW",
    "PHONE_CLICK",
    "WEBSITE_CLICK",
    "DIRECTION_CLICK",
    "SHARE_CLICK",
    "BOOKING_CLICK",
    "EVENT_VIEW",
    "TICKET_CLICK",
  ]),
  businessId: z.string().cuid().optional(),
  eventId: z.string().cuid().optional(),
});

export async function POST(req: Request) {
  // Rate limit: 120 analytics events per IP per hour (prevents event flooding)
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";
  const allowed = await rateLimitDb(`track:ip:${ip}`, 120, HOUR);
  if (!allowed) return NextResponse.json({ ok: true }); // silent drop — no error to clients

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  await db.analyticsEvent.create({ data: parsed.data }).catch(() => {});
  return NextResponse.json({ ok: true });
}
