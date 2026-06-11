import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdminApi } from "@/lib/adminGuard";

const schema = z.object({ action: z.enum(["approve", "reject", "feature", "unfeature"]) });

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
    { featured: false };

  await db.event.update({ where: { id }, data });
  return NextResponse.json({ ok: true });
}
