import { NextResponse } from "next/server";
import { signInSchema, verifyCredentials, parseRoles } from "@/lib/auth";
import { createSessionCookie } from "@/lib/session";
import { rateLimitDb, clientIp, MINUTE } from "@/lib/rateLimitDb";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = signInSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please enter a valid email and password" }, { status: 400 });
  }
  // Throttle brute-force / credential stuffing: per IP and per account.
  const ipOk = await rateLimitDb(`signin:ip:${clientIp(req)}`, 10, 15 * MINUTE);
  const emailOk = await rateLimitDb(`signin:email:${parsed.data.email}`, 5, 15 * MINUTE);
  if (!ipOk || !emailOk) {
    return NextResponse.json({ error: "Too many attempts. Please wait a few minutes and try again." }, { status: 429 });
  }
  const user = await verifyCredentials(parsed.data.email, parsed.data.password);
  if (!user) return NextResponse.json({ error: "Incorrect email or password" }, { status: 401 });
  if (user.status !== "active") return NextResponse.json({ error: "This account is not active. Contact support." }, { status: 403 });
  await createSessionCookie({ userId: user.id, name: user.name, roles: parseRoles(user.roles), tokenVersion: user.tokenVersion });
  return NextResponse.json({ ok: true });
}
