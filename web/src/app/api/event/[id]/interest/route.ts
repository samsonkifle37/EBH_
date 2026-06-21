import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rateLimitDb, HOUR } from "@/lib/rateLimitDb";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  // Rate limit: 3 per IP per event per hour — prevents count inflation
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";
  const allowed = await rateLimitDb(`interest:ip:${ip}:event:${id}`, 3, HOUR);
  if (!allowed) {
    return NextResponse.json({ error: "too_many_requests" }, { status: 429 });
  }

  const event = await db.event.findUnique({
    where: { id },
    select: { id: true, status: true, interestCount: true },
  });

  if (!event || event.status !== "APPROVED") {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const updated = await db.event.update({
    where: { id },
    data: { interestCount: { increment: 1 } },
    select: { interestCount: true },
  });

  return NextResponse.json({ count: updated.interestCount });
}
