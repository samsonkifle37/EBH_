import { db } from "@/lib/db";

export interface AdminAction {
  actorId: string;
  actorEmail?: string;
  targetType: "user" | "business" | "event" | "lead";
  targetId: string;
  action: string;
  metadata?: unknown;
}

/** Append-only admin audit trail. Never throws — auditing must not block the action. */
export async function logAdminAction(a: AdminAction): Promise<void> {
  try {
    await db.adminAuditLog.create({
      data: {
        actorId: a.actorId,
        actorEmail: a.actorEmail ?? "",
        targetType: a.targetType,
        targetId: a.targetId,
        action: a.action,
        metadata: JSON.stringify(a.metadata ?? {}),
      },
    });
  } catch (e) {
    console.error("[audit] failed to log", a.action, e);
  }
}
