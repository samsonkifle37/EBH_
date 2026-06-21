import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

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
