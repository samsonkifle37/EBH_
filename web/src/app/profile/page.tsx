import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile — Ethiopian Business Hub UK",
  description:
    "Sign in to your EBH account, or find help, support, and trust information.",
};

const SUPPORT_LINKS = [
  { icon: "ℹ️", label: "About EBH", href: "/about" },
  { icon: "❓", label: "Help centre", href: "/help" },
  { icon: "💬", label: "Contact us", href: "/contact" },
  { icon: "🛡️", label: "Safety & moderation", href: "/safety" },
  { icon: "🚩", label: "Report a problem", href: "/report" },
  { icon: "🔒", label: "Privacy policy", href: "/privacy" },
  { icon: "📄", label: "Terms of service", href: "/terms" },
];

/**
 * /profile — mobile bottom-nav entry point for the user's account.
 *
 * Signed-in users  → redirect to /account (full account dashboard)
 * Guests           → show sign-in CTA + Support & trust hub
 *
 * All support/legal links that previously lived in the footer are surfaced
 * here so they remain reachable on mobile without cluttering the home page.
 */
export default async function ProfilePage() {
  const session = await getSession();

  // Signed-in users go straight to their account dashboard
  if (session) redirect("/account");

  return (
    <main className="mx-auto max-w-md px-5 py-10">
      {/* Sign-in CTA */}
      <section className="rounded-2xl bg-ebh-green px-6 py-8 text-center text-white">
        <div className="text-4xl">👤</div>
        <h1 className="mt-3 text-xl font-bold">Your profile</h1>
        <p className="mt-2 text-sm leading-relaxed text-emerald-100">
          Sign in to access your saved businesses, reviews, and account settings.
        </p>
        <Link
          href="/auth/signin"
          className="mt-5 inline-block rounded-xl bg-white px-6 py-3 text-sm font-bold text-ebh-green hover:bg-emerald-50 transition-colors"
        >
          Sign in
        </Link>
        <div className="mt-3 text-xs text-emerald-200">
          No account?{" "}
          <Link href="/auth/signup" className="underline hover:text-white">
            Create one free
          </Link>
        </div>
      </section>

      {/* Support & trust */}
      <section className="mt-8">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-neutral-400">
          Support &amp; trust
        </h2>
        <ul className="space-y-2">
          {SUPPORT_LINKS.map(({ icon, label, href }) => (
            <li key={href}>
              <Link
                href={href}
                className="flex items-center gap-3.5 rounded-xl border border-neutral-200 bg-white p-4 hover:shadow-sm transition-shadow"
              >
                <span className="text-xl">{icon}</span>
                <span className="text-sm font-medium text-neutral-800">{label}</span>
                <span className="ml-auto text-neutral-300">›</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
