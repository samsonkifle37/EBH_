import { NextResponse } from "next/server";
import { signUp, signUpSchema, parseRoles } from "@/lib/auth";
import { createSessionCookie } from "@/lib/session";
import { rateLimitDb, clientIp, HOUR } from "@/lib/rateLimitDb";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!(await rateLimitDb(`signup:ip:${clientIp(req)}`, 5, HOUR))) {
    return NextResponse.json({ error: "Too many sign-up attempts. Please try again later." }, { status: 429 });
  }
  const body = await req.json().catch(() => null);
  const parsed = signUpSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check your details (password must be 8+ characters)" }, { status: 400 });
  }
  const result = await signUp(parsed.data);
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 409 });
  await createSessionCookie({
    userId: result.user.id,
    name: result.user.name,
    roles: parseRoles(result.user.roles),
    tokenVersion: result.user.tokenVersion,
  });
  return NextResponse.json({ ok: true });
}
