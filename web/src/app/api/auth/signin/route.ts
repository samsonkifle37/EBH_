import { NextResponse } from "next/server";
import { signInSchema, verifyCredentials, parseRoles } from "@/lib/auth";
import { createSessionCookie } from "@/lib/session";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = signInSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please enter a valid email and password" }, { status: 400 });
  }
  const user = await verifyCredentials(parsed.data.email, parsed.data.password);
  if (!user) return NextResponse.json({ error: "Incorrect email or password" }, { status: 401 });
  await createSessionCookie({ userId: user.id, name: user.name, roles: parseRoles(user.roles) });
  return NextResponse.json({ ok: true });
}
