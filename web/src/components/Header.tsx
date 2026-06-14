import Link from "next/link";
import { getSession, hasRole } from "@/lib/session";
import SignOutButton from "@/components/SignOutButton";

export default async function Header() {
  const session = await getSession();

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-700 via-yellow-400 to-red-600 text-sm font-black text-white shadow-sm">
            EB
          </span>
          <span className="hidden text-[15px] font-bold tracking-tight sm:block">
            Ethiopian Business Hub <span className="text-emerald-700">UK</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-neutral-600 md:flex">
          <Link href="/businesses" className="hover:text-neutral-900">Businesses</Link>
          <Link href="/events" className="hover:text-neutral-900">Events</Link>
          <Link href="/concierge" className="hover:text-neutral-900">AI Concierge</Link>
          <Link href="/pricing" className="hover:text-neutral-900">Pricing</Link>
        </nav>

        <div className="flex items-center gap-2">
          {session ? (
            <>
              {hasRole(session, "ADMIN") && (
                <Link href="/admin" className="hidden rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 sm:block">Admin</Link>
              )}
              {hasRole(session, "EVENT_ORGANIZER") && (
                <Link href="/dashboard/events" className="hidden rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 sm:block">My Events</Link>
              )}
              {hasRole(session, "BUSINESS_OWNER") && (
                <Link href="/owner" className="hidden rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 sm:block">My Businesses</Link>
              )}
              <Link href="/account" className="rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100">
                {session.name.split(" ")[0]}
              </Link>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link href="/auth/signin" className="rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100">
                Sign In
              </Link>
              <Link href="/pricing" className="rounded-xl bg-emerald-700 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-800">
                List Your Business
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
