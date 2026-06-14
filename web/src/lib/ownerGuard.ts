import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getSession, type Session } from "@/lib/session";

/** Require a signed-in user for the owner area. */
export async function requireOwner(next = "/owner"): Promise<Session> {
  const session = await getSession();
  if (!session) redirect(`/auth/signin?next=${next}`);
  return session;
}

/** Load a business the current user owns, or 404. */
export async function getOwnedBusiness(id: string, userId: string) {
  const business = await db.business.findUnique({ where: { id } });
  if (!business || business.ownerId !== userId) notFound();
  return business;
}

export async function listOwnedBusinesses(userId: string) {
  return db.business.findMany({
    where: { ownerId: userId },
    orderBy: { name: "asc" },
    include: { _count: { select: { reviews: true, photos: true } } },
  });
}
