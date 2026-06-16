/**
 * Security remediation: neutralise the legacy demo accounts (admin@ebh.uk etc.)
 * on a LIVE database. They previously shared the password "demo1234" and one
 * held the ADMIN role on a public site.
 *
 * For each demo account that still exists it:
 *   - sets a fresh random password (so the old shared one no longer works)
 *   - strips elevated roles down to plain USER
 *
 * Run once against production (needs the Neon connection env the app uses):
 *   cd web && npx tsx scripts/rotate-demo-accounts.ts
 *
 * The new passwords are printed once; store or discard them. To remove the
 * accounts entirely instead, delete them via the in-app account-deletion flow
 * after signing in, or adapt this script to call db.user.delete.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";

const db = new PrismaClient();
const DEMO_EMAILS = ["admin@ebh.uk", "owner@ebh.uk", "organizer@ebh.uk", "user@ebh.uk"];

async function main() {
  for (const email of DEMO_EMAILS) {
    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      console.log(`[skip] ${email} — not found`);
      continue;
    }
    const newPassword = `EBH-${randomBytes(15).toString("base64url")}`;
    await db.user.update({
      where: { email },
      data: { passwordHash: await bcrypt.hash(newPassword, 10), roles: "USER" },
    });
    console.log(`[rotated] ${email} — roles reset to USER, new password: ${newPassword}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
