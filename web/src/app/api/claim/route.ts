import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession, createSessionCookie } from "@/lib/session";
import { addRole } from "@/lib/auth";

const startSchema = z.object({
  action: z.literal("start"),
  businessId: z.string(),
  method: z.enum(["EMAIL", "PHONE"]),
});

const verifySchema = z.object({
  action: z.literal("verify"),
  requestId: z.string(),
  code: z.string().length(6),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in to claim a business" }, { status: 401 });
  const body = await req.json().catch(() => null);

  const start = startSchema.safeParse(body);
  if (start.success) {
    const business = await db.business.findUnique({ where: { id: start.data.businessId } });
    if (!business) return NextResponse.json({ error: "Business not found" }, { status: 404 });
    if (business.ownerId) return NextResponse.json({ error: "This business has already been claimed" }, { status: 409 });

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const request = await db.claimRequest.create({
      data: { businessId: business.id, userId: session.userId, method: start.data.method, code },
    });

    // In production this code would be emailed/texted to the business's
    // registered contact. Without a provider configured we return it directly.
    const devMode = !process.env.EMAIL_PROVIDER_KEY;
    return NextResponse.json({ ok: true, requestId: request.id, ...(devMode ? { devCode: code } : {}) });
  }

  const verify = verifySchema.safeParse(body);
  if (verify.success) {
    const request = await db.claimRequest.findUnique({
      where: { id: verify.data.requestId },
      include: { business: true },
    });
    if (!request || request.userId !== session.userId) {
      return NextResponse.json({ error: "Claim request not found" }, { status: 404 });
    }
    if (request.status !== "PENDING") return NextResponse.json({ error: "This request was already used" }, { status: 409 });
    if (request.code !== verify.data.code) return NextResponse.json({ error: "Incorrect code — check and try again" }, { status: 400 });

    const newLevel = Math.max(request.business.verificationLevel, request.method === "PHONE" ? 2 : 1);
    await db.$transaction([
      db.claimRequest.update({ where: { id: request.id }, data: { status: "VERIFIED" } }),
      db.business.update({
        where: { id: request.businessId },
        data: { ownerId: session.userId, claimedAt: new Date(), verificationLevel: newLevel },
      }),
    ]);
    const roles = await addRole(session.userId, "BUSINESS_OWNER");
    await createSessionCookie({ userId: session.userId, name: session.name, roles });

    return NextResponse.json({ ok: true, verified: true });
  }

  return NextResponse.json({ error: "Invalid request" }, { status: 400 });
}
