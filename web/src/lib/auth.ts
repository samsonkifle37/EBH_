import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import type { Role } from "@/lib/types";

export const signUpSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email().toLowerCase(),
  password: z.string().min(8).max(100),
});

export const signInSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(1),
});

export async function signUp(input: z.infer<typeof signUpSchema>) {
  const existing = await db.user.findUnique({ where: { email: input.email } });
  if (existing) return { error: "An account with that email already exists" as const };
  const passwordHash = await bcrypt.hash(input.password, 10);
  const user = await db.user.create({
    data: { email: input.email, name: input.name, passwordHash, roles: "USER" },
  });
  return { user };
}

export async function verifyCredentials(email: string, password: string) {
  const user = await db.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.passwordHash);
  return ok ? user : null;
}

export function parseRoles(roles: string): Role[] {
  return roles.split(",").filter(Boolean) as Role[];
}

export async function addRole(userId: string, role: Role): Promise<Role[]> {
  const user = await db.user.findUniqueOrThrow({ where: { id: userId } });
  const roles = new Set(parseRoles(user.roles));
  roles.add(role);
  const list = [...roles];
  await db.user.update({ where: { id: userId }, data: { roles: list.join(",") } });
  return list;
}
