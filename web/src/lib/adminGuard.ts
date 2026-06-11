import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { getSession, hasRole, type Session } from "@/lib/session";

/** For pages: redirects non-admins away. */
export async function requireAdminPage(): Promise<Session> {
  const session = await getSession();
  if (!session) redirect("/auth/signin?next=/admin");
  if (!hasRole(session, "ADMIN")) redirect("/");
  return session;
}

/** For API routes: returns an error response, or null if authorized. */
export async function requireAdminApi(): Promise<NextResponse | null> {
  const session = await getSession();
  if (!session || !hasRole(session, "ADMIN")) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }
  return null;
}
