import { NextResponse } from "next/server";
import { z } from "zod";
import { conciergeReply } from "@/lib/ai/provider";

const schema = z.object({ message: z.string().min(2).max(500) });

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Please ask a question" }, { status: 400 });
  const result = await conciergeReply(parsed.data.message);
  return NextResponse.json(result);
}
