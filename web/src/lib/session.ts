import { cookies } from "next/headers";
import { cache } from "react";
import { SignJWT, jwtVerify } from "jose";
import { db } from "@/lib/db";
import { getAuthSecret } from "@/lib/authConfig";
import type { Role } from "@/lib/types";

const COOKIE_NAME = "ebh_session";

// Lazy so a missing AUTH_SECRET can't crash the build — only request-time use.
function key(): Uint8Array {
  return new TextEncoder().encode(getAuthSecret());
}

export interface Session {
  userId: string;
  name: string;
  roles: Role[];
}

export interface SessionPrincipal extends Session {
  tokenVersion: number;
}

export async function createSessionCookie(principal: SessionPrincipal): Promise<void> {
  const token = await new SignJWT({ name: principal.name, roles: principal.roles, tv: principal.tokenVersion })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(principal.userId)
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(key());
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
}

export async function clearSessionCookie(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

/**
 * Resolve the current session against LIVE database state, not just the token:
 *  - account must exist and be `active` (suspended/deactivated/anonymized → out)
 *  - roles are read from the DB so demotions take effect immediately
 *  - tokenVersion must match (bumped on suspend/role-change/reset → forced logout)
 * Deduped per request with React cache(), so it's one DB read per request.
 */
const loadSession = cache(async (): Promise<Session | null> => {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;

  let payload: Record<string, unknown>;
  try {
    payload = (await jwtVerify(token, key())).payload as Record<string, unknown>;
  } catch {
    return null;
  }

  const userId = typeof payload.sub === "string" ? payload.sub : "";
  const tv = typeof payload.tv === "number" ? payload.tv : 0;
  if (!userId) return null;

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, roles: true, status: true, tokenVersion: true },
  });
  if (!user) return null;
  if (user.status !== "active") return null; // suspended / deactivated / anonymized
  if (user.tokenVersion !== tv) return null; // revoked / forced logout

  return { userId: user.id, name: user.name, roles: user.roles.split(",").filter(Boolean) as Role[] };
});

export async function getSession(): Promise<Session | null> {
  return loadSession();
}

export function hasRole(session: Session | null, role: Role): boolean {
  return !!session?.roles.includes(role);
}
