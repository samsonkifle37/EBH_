import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession, clearSessionCookie } from "@/lib/session";
import { confirmDeletionInput, deleteUserAccount } from "@/lib/account";

export const runtime = "nodejs"; // Prisma

const schema = z.object({ confirmEmail: z.string().min(1) });

/** Permanently delete the signed-in user's account (GDPR erasure). */
export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Confirmation required" }, { status: 400 });

  const user = await db.user.findUnique({ where: { id: session.userId }, select: { email: true } });
  if (!user) {
    await clearSessionCookie();
    return NextResponse.json({ ok: true });
  }
  if (!confirmDeletionInput(parsed.data.confirmEmail, user.email)) {
    return NextResponse.json({ error: "Email does not match — type your account email exactly to confirm." }, { status: 400 });
  }

  await deleteUserAccount(session.userId);
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}
