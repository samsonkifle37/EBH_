import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const flower = await db.enkutatashFlower.findUnique({ where: { shareToken: token } });
  if (!flower) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Track analytics
  await db.analyticsEvent.create({ data: { type: "FLOWER_RECEIVED" } }).catch(() => {});

  return NextResponse.json({
    senderName: flower.senderName,
    recipientName: flower.recipientName,
    message: flower.message,
    colour: flower.colour,
  });
}
