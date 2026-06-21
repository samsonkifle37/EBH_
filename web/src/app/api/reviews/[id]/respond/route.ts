import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

const schema = z.object({ response: z.string().min(2).max(1000) });

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const { id } = await params;

  const review = await db.review.findUnique({
    where: { id },
    include: { business: { select: { ownerId: true, submittedById: true } } },
  });
  if (!review) return NextResponse.json({ error: "Review not found" }, { status: 404 });

  const isAdmin = session.roles.includes("ADMIN");
  const isOwner =
    review.business.ownerId === session.userId ||
    review.business.submittedById === session.userId;
  if (!isAdmin && !isOwner) {
    return NextResponse.json({ error: "Only the business owner can respond" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Response must be 2–1000 characters" }, { status: 400 });

  await db.review.update({
    where: { id },
    data: { ownerResponse: parsed.data.response, ownerRespondedAt: new Date() },
  });
  return NextResponse.json({ ok: true });
}
