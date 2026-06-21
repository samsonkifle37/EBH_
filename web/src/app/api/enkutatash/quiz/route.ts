import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { rateLimitDb, HOUR } from "@/lib/rateLimitDb";
import { TOTAL } from "@/lib/enkutatashQuiz";

const schema = z.object({
  name: z.string().min(1).max(60).trim().default("Anonymous"),
  score: z.number().int().min(0).max(TOTAL),
  city: z.string().max(60).trim().default(""),
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const allowed = await rateLimitDb(`enkutatash_quiz:ip:${ip}`, 10, HOUR);
  if (!allowed) return NextResponse.json({ error: "Rate limited" }, { status: 429 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  await db.enkutatashQuizScore.create({ data: { ...parsed.data, total: TOTAL } });
  await db.analyticsEvent.create({ data: { type: "QUIZ_COMPLETED" } }).catch(() => {});

  return NextResponse.json({ ok: true });
}
