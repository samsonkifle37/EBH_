import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const schema = z.object({
  type: z.enum(["LISTING_VIEW", "PHONE_CLICK", "WEBSITE_CLICK", "EVENT_VIEW", "TICKET_CLICK"]),
  businessId: z.string().optional(),
  eventId: z.string().optional(),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  await db.analyticsEvent.create({ data: parsed.data }).catch(() => {});
  return NextResponse.json({ ok: true });
}
