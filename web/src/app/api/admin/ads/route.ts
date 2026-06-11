import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdminApi } from "@/lib/adminGuard";
import { AD_PLACEMENTS } from "@/lib/types";

const createSchema = z.object({
  action: z.literal("create"),
  placement: z.enum(AD_PLACEMENTS),
  headline: z.string().min(3).max(120),
  body: z.string().max(200).optional().default(""),
  targetUrl: z.string().min(1).max(300),
  imageUrl: z.string().url().max(300).optional().or(z.literal("")).default(""),
});

const updateSchema = z.object({
  action: z.enum(["toggle", "delete"]),
  id: z.string(),
});

export async function POST(req: Request) {
  const denied = await requireAdminApi();
  if (denied) return denied;
  const body = await req.json().catch(() => null);

  const create = createSchema.safeParse(body);
  if (create.success) {
    const { action: _action, ...data } = create.data;
    const ad = await db.ad.create({ data });
    return NextResponse.json({ ok: true, id: ad.id });
  }

  const update = updateSchema.safeParse(body);
  if (update.success) {
    if (update.data.action === "delete") {
      await db.ad.delete({ where: { id: update.data.id } });
    } else {
      const ad = await db.ad.findUnique({ where: { id: update.data.id } });
      if (!ad) return NextResponse.json({ error: "Ad not found" }, { status: 404 });
      await db.ad.update({ where: { id: ad.id }, data: { active: !ad.active } });
    }
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Invalid request" }, { status: 400 });
}
