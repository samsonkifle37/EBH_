import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { rateLimitDb, HOUR } from "@/lib/rateLimitDb";

const schema = z.object({
  businessId: z.string().min(1),
  claimantName: z.string().min(2).max(120),
  claimantEmail: z.string().email().max(160),
  claimantPhone: z.string().max(40).optional().default(""),
  founderName: z.string().min(2).max(120),
  // Founder story is mandatory — it's the heart of the profile.
  founderStory: z.string().min(40).max(2000),
  evidenceUrl: z.string().max(300).optional().default(""),
  notes: z.string().max(1000).optional().default(""),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in to claim a business" }, { status: 401 });

  if (!(await rateLimitDb(`claim:user:${session.userId}`, 10, HOUR))) {
    return NextResponse.json({ error: "Too many claim attempts. Please try again later." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please add your name, a valid email, and a founder story (at least 40 characters)." }, { status: 400 });
  }
  const d = parsed.data;

  const business = await db.business.findUnique({ where: { id: d.businessId }, select: { id: true, ownerId: true } });
  if (!business) return NextResponse.json({ error: "Business not found" }, { status: 404 });
  if (business.ownerId) return NextResponse.json({ error: "This business has already been claimed" }, { status: 409 });

  // one open claim per user per business
  const existing = await db.claimRequest.findFirst({
    where: { businessId: d.businessId, userId: session.userId, status: { in: ["pending", "needs_more_evidence"] } },
    select: { id: true },
  });
  if (existing) {
    return NextResponse.json({ error: "You already have a claim under review for this business" }, { status: 409 });
  }

  await db.claimRequest.create({
    data: {
      businessId: d.businessId,
      userId: session.userId,
      claimantName: d.claimantName,
      claimantEmail: d.claimantEmail,
      claimantPhone: d.claimantPhone,
      founderName: d.founderName,
      founderStory: d.founderStory,
      evidenceUrl: d.evidenceUrl,
      notes: d.notes,
      status: "pending",
      paymentStatus: "pending_payment", // free for now; Stripe wires this in Milestone B
    },
  });

  // ownership and listing status are intentionally NOT changed here — an admin
  // must approve the claim first.
  return NextResponse.json({ ok: true });
}
