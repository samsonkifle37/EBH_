import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdminApi } from "@/lib/adminGuard";

const schema = z.object({
  action: z.enum(["approve", "reject", "feature", "unfeature", "setLevel"]),
  level: z.number().int().min(0).max(4).optional(),
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdminApi();
  if (denied) return denied;
  const { id } = await params;

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  const data =
    parsed.data.action === "approve" ? { status: "APPROVED" } :
    parsed.data.action === "reject" ? { status: "REJECTED" } :
    parsed.data.action === "feature" ? { featured: true } :
    parsed.data.action === "unfeature" ? { featured: false } :
    { verificationLevel: parsed.data.level ?? 0 };

  await db.business.update({ where: { id }, data });
  return NextResponse.json({ ok: true });
}
