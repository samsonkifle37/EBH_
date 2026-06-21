import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { rateLimitDb, HOUR } from "@/lib/rateLimitDb";

export const GREETINGS = [
  { key: "melkam_addis_amet", amharic: "መልካም አዲስ ዓመት", latin: "Melkam Addis Amet", meaning: "Happy New Year" },
  { key: "enkuan_aderesachu", amharic: "እንኩዋን አደረሳቸሁ", latin: "Enkuan Aderesachu", meaning: "Congratulations on reaching (this new year)" },
  { key: "melkam_enkutatash", amharic: "መልካም እንቁጣጣሽ", latin: "Melkam Enkutatash", meaning: "Happy Enkutatash" },
  { key: "yihe_amet_yibezu", amharic: "ይህ ዓመት ይብዛ", latin: "Yihe Amet Yibzu", meaning: "May this year multiply (with blessings)" },
] as const;

export type GreetingKey = (typeof GREETINGS)[number]["key"];

const voteSchema = z.object({
  greeting: z.enum(["melkam_addis_amet", "enkuan_aderesachu", "melkam_enkutatash", "yihe_amet_yibezu"]),
  sessionId: z.string().min(1).max(64),
});

export async function GET() {
  const counts = await db.enkutatashGreetingVote.groupBy({
    by: ["greeting"],
    _count: { greeting: true },
  });
  const result: Record<string, number> = {};
  for (const g of GREETINGS) result[g.key] = 0;
  for (const c of counts) result[c.greeting] = c._count.greeting;
  return NextResponse.json({ counts: result, greetings: GREETINGS });
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const allowed = await rateLimitDb(`enkutatash_greeting:ip:${ip}`, 10, HOUR);
  if (!allowed) return NextResponse.json({ error: "Rate limited" }, { status: 429 });

  const body = await req.json().catch(() => null);
  const parsed = voteSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  // upsert: allow re-voting (vote changes their pick)
  try {
    // Remove previous vote by this session, then insert new one
    await db.enkutatashGreetingVote.deleteMany({ where: { sessionId: parsed.data.sessionId } });
    await db.enkutatashGreetingVote.create({ data: parsed.data });
  } catch {
    // ignore duplicate
  }

  await db.analyticsEvent.create({ data: { type: "GREETING_VOTED" } }).catch(() => {});

  // Return updated counts
  const counts = await db.enkutatashGreetingVote.groupBy({
    by: ["greeting"],
    _count: { greeting: true },
  });
  const result: Record<string, number> = {};
  for (const g of GREETINGS) result[g.key] = 0;
  for (const c of counts) result[c.greeting] = c._count.greeting;

  return NextResponse.json({ counts: result });
}
