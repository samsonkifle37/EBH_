import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

export const runtime = "nodejs";

const schema = z.object({
  token: z.string().min(8).max(512),
  platform: z.enum(["ios", "android"]),
});

/** Register (or refresh) a native push token for the signed-in user. */
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid token" }, { status: 400 });

  await db.deviceToken.upsert({
    where: { token: parsed.data.token },
    update: { userId: session.userId, platform: parsed.data.platform },
    create: { userId: session.userId, token: parsed.data.token, platform: parsed.data.platform },
  });
  return NextResponse.json({ ok: true });
}

/** Deregister a token (e.g. on logout / disable notifications). */
export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const token = typeof body?.token === "string" ? body.token : "";
  if (token) await db.deviceToken.deleteMany({ where: { token, userId: session.userId } });
  return NextResponse.json({ ok: true });
}
