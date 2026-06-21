import { NextResponse } from "next/server";
import { z } from "zod";
import { conciergeReply } from "@/lib/ai/provider";
import { rateLimitDb, HOUR } from "@/lib/rateLimitDb";
import { getSession } from "@/lib/session";

const schema = z.object({ message: z.string().min(2).max(500) });

export async function POST(req: Request) {
  // Rate limit: 20 messages per hour per user (auth) or per IP (anon)
  const session = await getSession();
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";
  const rlKey = session ? `concierge:user:${session.userId}` : `concierge:ip:${ip}`;
  const allowed = await rateLimitDb(rlKey, 20, HOUR);
  if (!allowed) {
    return NextResponse.json(
      { error: "You've sent a lot of messages. Please wait an hour and try again." },
      { status: 429 },
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Please ask a question" }, { status: 400 });
  const result = await conciergeReply(parsed.data.message);
  return NextResponse.json(result);
}
