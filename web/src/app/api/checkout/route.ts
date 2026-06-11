import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { startCheckout } from "@/lib/payments/provider";

const schema = z.object({
  plan: z.enum(["FREE", "VERIFIED", "FEATURED"]),
  businessId: z.string(),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  try {
    const result = await startCheckout(parsed.data.plan, parsed.data.businessId, session.userId);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Checkout failed" }, { status: 400 });
  }
}
