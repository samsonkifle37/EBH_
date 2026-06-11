import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import type { Role } from "@/lib/types";

const COOKIE_NAME = "ebh_session";
const secret = new TextEncoder().encode(process.env.AUTH_SECRET ?? "dev-secret-ebh-change-in-production");

export interface Session {
  userId: string;
  name: string;
  roles: Role[];
}

export async function createSessionCookie(session: Session): Promise<void> {
  const token = await new SignJWT({ name: session.name, roles: session.roles })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(session.userId)
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);
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

export async function getSession(): Promise<Session | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return {
      userId: payload.sub as string,
      name: (payload.name as string) ?? "",
      roles: (payload.roles as Role[]) ?? [],
    };
  } catch {
    return null;
  }
}

export function hasRole(session: Session | null, role: Role): boolean {
  return !!session?.roles.includes(role);
}
