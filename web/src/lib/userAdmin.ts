// Pure guards for admin user management. The route supplies live counts; these
// functions decide what's allowed so the rules are unit-tested in one place.

export const VALID_ROLES = ["USER", "BUSINESS_OWNER", "EVENT_ORGANIZER", "ADMIN"] as const;
export type AdminRole = (typeof VALID_ROLES)[number];

export function isValidRole(r: string): r is AdminRole {
  return (VALID_ROLES as readonly string[]).includes(r);
}

/** Keep only valid roles; everyone always has USER. */
export function normalizeRoles(roles: string[]): AdminRole[] {
  const s = new Set<AdminRole>(["USER"]);
  for (const r of roles) if (isValidRole(r)) s.add(r);
  return VALID_ROLES.filter((r) => s.has(r));
}

export interface GuardResult {
  blocked: boolean;
  reason?: string;
}

export interface RoleChangeInput {
  actorId: string;
  targetId: string;
  targetHasAdmin: boolean;
  nextHasAdmin: boolean;
  otherActiveAdmins: number; // active admins other than the target
}

export function roleChangeBlocked(i: RoleChangeInput): GuardResult {
  const removingAdmin = i.targetHasAdmin && !i.nextHasAdmin;
  if (removingAdmin && i.actorId === i.targetId) return { blocked: true, reason: "You can't remove your own admin role." };
  if (removingAdmin && i.otherActiveAdmins === 0) return { blocked: true, reason: "Can't remove the last active admin." };
  return { blocked: false };
}

export interface DeleteInput {
  isSelf: boolean;
  targetActiveAdmin: boolean;
  otherActiveAdmins: number;
}

export function deleteBlocked(i: DeleteInput): GuardResult {
  if (i.isSelf) return { blocked: true, reason: "You can't delete your own account from here." };
  if (i.targetActiveAdmin && i.otherActiveAdmins === 0) return { blocked: true, reason: "Can't delete the last active admin." };
  return { blocked: false };
}

export function suspendBlocked(isSelf: boolean): GuardResult {
  return isSelf ? { blocked: true, reason: "You can't suspend your own account." } : { blocked: false };
}
