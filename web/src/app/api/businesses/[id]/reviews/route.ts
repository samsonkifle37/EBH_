import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

const schema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().max(80).optional().default(""),
  body: z.string().min(10).max(2000),
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in to write a review" }, { status: 401 });
  const { id } = await params;

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please add a star rating and at least 10 characters of feedback" }, { status: 400 });
  }

  const business = await db.business.findUnique({ where: { id }, select: { status: true } });
  if (!business || business.status !== "APPROVED") {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  try {
    const review = await db.review.create({
      data: { businessId: id, userId: session.userId, ...parsed.data },
    });
    return NextResponse.json({ ok: true, id: review.id });
  } catch {
    return NextResponse.json({ error: "You have already reviewed this business" }, { status: 409 });
  }
}
