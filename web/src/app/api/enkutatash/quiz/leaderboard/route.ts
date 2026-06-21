import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // last 7 days
  const scores = await db.enkutatashQuizScore.findMany({
    where: { createdAt: { gte: since } },
    orderBy: [{ score: "desc" }, { createdAt: "asc" }],
    take: 10,
    select: { name: true, score: true, total: true, city: true, createdAt: true },
  });
  return NextResponse.json({ scores });
}
