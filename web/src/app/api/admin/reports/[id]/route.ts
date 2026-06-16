import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { requireAdminApi } from "@/lib/adminGuard";

export const runtime = "nodejs";

const schema = z.object({ action: z.enum(["reviewing", "resolved", "dismissed", "open"]) });

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const session = await getSession();
  const status = parsed.data.action;
  await db.report.update({
    where: { id },
    data: {
      status,
      reviewedAt: status === "open" ? null : new Date(),
      reviewedBy: status === "open" ? null : session?.userId ?? null,
    },
  });
  return NextResponse.json({ ok: true });
}
