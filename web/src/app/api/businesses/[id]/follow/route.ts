import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const { id } = await params;

  const existing = await db.follow.findUnique({
    where: { userId_businessId: { userId: session.userId, businessId: id } },
  });
  if (existing) {
    await db.follow.delete({ where: { id: existing.id } });
    return NextResponse.json({ ok: true, active: false });
  }
  await db.follow.create({ data: { userId: session.userId, businessId: id } });
  return NextResponse.json({ ok: true, active: true });
}
