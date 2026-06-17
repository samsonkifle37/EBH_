import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { requireAdminApi } from "@/lib/adminGuard";
import { parseRoles } from "@/lib/auth";
import { normalizeRoles, roleChangeBlocked, deleteBlocked, suspendBlocked } from "@/lib/userAdmin";
import { logAdminAction } from "@/lib/adminAudit";
import { recordPrideEvent } from "@/lib/analytics/record";
import type { TrackableEvent } from "@/lib/analytics/events";

export const runtime = "nodejs";

const patchSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("set_roles"), roles: z.array(z.string()).max(4) }),
  z.object({ action: z.literal("suspend"), reason: z.string().max(300).optional().default("") }),
  z.object({ action: z.literal("reactivate") }),
  z.object({ action: z.literal("deactivate") }),
  z.object({ action: z.literal("reset_password") }),
]);

/** Count active admins other than `excludeId`. */
async function otherActiveAdmins(excludeId: string): Promise<number> {
  const admins = await db.user.findMany({
    where: { roles: { contains: "ADMIN" }, status: "active", id: { not: excludeId } },
    select: { id: true },
  });
  return admins.length;
}

async function audit(actorId: string, actorEmail: string, targetId: string, action: string, metadata: unknown, event: TrackableEvent) {
  await logAdminAction({ actorId, actorEmail, targetType: "user", targetId, action, metadata });
  void recordPrideEvent({ action: event, visitorId: actorId });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdminApi();
  if (denied) return denied;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const { id } = await params;

  const target = await db.user.findUnique({ where: { id } });
  if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  const d = parsed.data;
  const isSelf = session.userId === id;
  const targetHasAdmin = parseRoles(target.roles).includes("ADMIN");

  if (d.action === "set_roles") {
    const next = normalizeRoles(d.roles);
    const nextHasAdmin = next.includes("ADMIN");
    const guard = roleChangeBlocked({ actorId: session.userId, targetId: id, targetHasAdmin, nextHasAdmin, otherActiveAdmins: await otherActiveAdmins(id) });
    if (guard.blocked) return NextResponse.json({ error: guard.reason }, { status: 409 });
    await db.user.update({ where: { id }, data: { roles: next.join(",") } });
    await audit(session.userId, session.name, id, "USER_ROLE_CHANGED", { from: target.roles, to: next.join(",") }, "USER_ROLE_CHANGED");
    return NextResponse.json({ ok: true, roles: next });
  }

  if (d.action === "suspend") {
    const guard = suspendBlocked(isSelf);
    if (guard.blocked) return NextResponse.json({ error: guard.reason }, { status: 409 });
    if (targetHasAdmin && (await otherActiveAdmins(id)) === 0) return NextResponse.json({ error: "Can't suspend the last active admin." }, { status: 409 });
    await db.user.update({ where: { id }, data: { status: "suspended", suspendedAt: new Date(), suspendedReason: d.reason } });
    await audit(session.userId, session.name, id, "USER_SUSPENDED", { reason: d.reason }, "USER_SUSPENDED");
    return NextResponse.json({ ok: true });
  }

  if (d.action === "reactivate") {
    await db.user.update({ where: { id }, data: { status: "active", suspendedAt: null, suspendedReason: "" } });
    await audit(session.userId, session.name, id, "USER_UPDATED", { status: "active" }, "USER_UPDATED");
    return NextResponse.json({ ok: true });
  }

  if (d.action === "deactivate") {
    if (isSelf) return NextResponse.json({ error: "You can't deactivate your own account." }, { status: 409 });
    if (targetHasAdmin && (await otherActiveAdmins(id)) === 0) return NextResponse.json({ error: "Can't deactivate the last active admin." }, { status: 409 });
    await db.user.update({ where: { id }, data: { status: "deactivated" } });
    await audit(session.userId, session.name, id, "USER_UPDATED", { status: "deactivated" }, "USER_UPDATED");
    return NextResponse.json({ ok: true });
  }

  // reset_password — generate a temporary password, return it once to the admin.
  const tempPassword = `EBH-${randomBytes(9).toString("base64url")}`;
  await db.user.update({ where: { id }, data: { passwordHash: await bcrypt.hash(tempPassword, 10) } });
  await audit(session.userId, session.name, id, "USER_UPDATED", { passwordReset: true }, "USER_UPDATED");
  return NextResponse.json({ ok: true, tempPassword });
}

/** Anonymize (not hard-delete): scrub PII, keep business ownership integrity. */
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdminApi();
  if (denied) return denied;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const { id } = await params;

  const target = await db.user.findUnique({ where: { id } });
  if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const targetActiveAdmin = target.status === "active" && parseRoles(target.roles).includes("ADMIN");
  const guard = deleteBlocked({ isSelf: session.userId === id, targetActiveAdmin, otherActiveAdmins: await otherActiveAdmins(id) });
  if (guard.blocked) return NextResponse.json({ error: guard.reason }, { status: 409 });

  await db.user.update({
    where: { id },
    data: {
      name: "Deleted user",
      email: `deleted+${id}@ebh.invalid`,
      passwordHash: await bcrypt.hash(randomBytes(16).toString("hex"), 10),
      roles: "USER",
      status: "deactivated",
      suspendedReason: "account anonymized by admin",
    },
  });
  await audit(session.userId, session.name, id, "USER_DELETED", { anonymized: true }, "USER_DELETED");
  return NextResponse.json({ ok: true });
}
