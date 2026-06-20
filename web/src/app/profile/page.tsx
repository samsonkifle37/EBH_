import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

/**
 * /profile — mobile bottom-nav entry point for the user's account.
 * Redirects to /account (signed-in users) or /auth/signin (guests).
 */
export default async function ProfilePage() {
  const session = await getSession();
  redirect(session ? "/account" : "/auth/signin");
}
