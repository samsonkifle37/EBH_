import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { rateLimitDb, HOUR } from "@/lib/rateLimitDb";

const schema = z.object({
  senderName: z.string().min(1).max(60).trim(),
  recipientName: z.string().min(1).max(60).trim(),
  message: z.string().max(200).trim().default(""),
  colour: z.enum(["gold", "white", "pink", "purple"]).default("gold"),
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const allowed = await rateLimitDb(`enkutatash_flower:ip:${ip}`, 20, HOUR);
  if (!allowed) return NextResponse.json({ error: "Too many flowers — slow down!" }, { status: 429 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const flower = await db.enkutatashFlower.create({ data: parsed.data });

  // Track analytics
  await db.analyticsEvent.create({ data: { type: "FLOWER_CREATED" } }).catch(() => {});

  return NextResponse.json({ token: flower.shareToken });
}
