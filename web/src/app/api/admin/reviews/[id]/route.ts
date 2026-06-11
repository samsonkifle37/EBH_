import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdminApi } from "@/lib/adminGuard";

const schema = z.object({ action: z.enum(["remove", "restore"]) });

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdminApi();
  if (denied) return denied;
  const { id } = await params;

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  await db.review.update({
    where: { id },
    data: { status: parsed.data.action === "remove" ? "REMOVED" : "VISIBLE" },
  });
  return NextResponse.json({ ok: true });
}
