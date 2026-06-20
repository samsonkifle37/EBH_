import Link from "next/link";
import { getSession, hasRole } from "@/lib/session";
import { NU_URL } from "@/lib/nu";
import SignOutButton from "@/components/SignOutButton";
import SearchBar from "@/components/ui/SearchBar";
import MobileMenu, { type NavSection, type MobileNavLink } from "@/components/MobileMenu";
import Logo from "@/components/Logo";

const DESKTOP_NAV: MobileNavLink[] = [
  { href: "/businesses", label: "Businesses" },
  { href: "/events", label: "Events" },
  { href: "/concierge", label: "AI Concierge" },
  { href: "/pricing", label: "Pricing" },
];

export default async function Header() {
  const session = await getSession();

  // Core links: app navigation + role-based utilities
  const coreLinks: MobileNavLink[] = [
    { href: "/businesses", label: "Businesses" },
    { href: "/events", label: "Events" },
    { href: "/concierge", label: "AI Concierge" },
  ];

  if (session) {
    if (hasRole(session, "ADMIN")) coreLinks.push({ href: "/admin", label: "Admin" });
    if (hasRole(session, "EVENT_ORGANIZER")) coreLinks.push({ href: "/dashboard/events", label: "My Events" });
    if (hasRole(session, "BUSINESS_OWNER")) coreLinks.push({ href: "/owner", label: "My Businesses" });
    coreLinks.push({ href: "/account", label: "My account" });
  } else {
    coreLinks.push({ href: "/auth/signin", label: "Sign in" });
  }

  const mobileSections: NavSection[] = [
    { links: coreLinks },
    {
      heading: "For Businesses",
      links: [
        { href: "/pricing", label: "List your business" },
        { href: "/pricing", label: "Get verified" },
        { href: "/advertise", label: "Advertise with us" },
        { href: "/dashboard/events", label: "Promote an event" },
      ],
    },
    {
      heading: "Support & Trust",
      links: [
        { href: "/about", label: "About EBH" },
        { href: "/help", label: "Help centre" },
        { href: "/contact", label: "Contact us" },
        { href: "/safety", label: "Safety & moderation" },
        { href: "/report", label: "Report a problem" },
        { href: "/privacy", label: "Privacy policy" },
        { href: "/terms", label: "Terms" },
      ],
    },
  ];

  return (
    <header data-ebh-chrome className="sticky top-0 z-40 border-b border-neutral-200/80 bg-ivory/85 backdrop-blur supports-[backdrop-filter]:bg-ivory/70">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:gap-5">
        {/* Brand */}
        <Link href="/" className="shrink-0" aria-label="Ethiopian Business Hub UK — home">
          <Logo />
        </Link>

        {/* Center search (tablet+) */}
        <div className="hidden flex-1 justify-center md:flex">
          <SearchBar variant="compact" className="w-full max-w-md" />
        </div>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-5 text-sm font-medium text-neutral-600 lg:flex">
          {DESKTOP_NAV.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-ink">{l.label}</Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <a
            href={NU_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden rounded-xl bg-ink px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-ink-soft sm:inline-flex"
          >
            Download NU
          </a>

          {session ? (
            <div className="hidden items-center gap-1 md:flex">
              {hasRole(session, "ADMIN") && (
                <Link href="/admin" className="rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100">Admin</Link>
              )}
              {hasRole(session, "EVENT_ORGANIZER") && (
                <Link href="/dashboard/events" className="rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100">My Events</Link>
              )}
              {hasRole(session, "BUSINESS_OWNER") && (
                <Link href="/owner" className="rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100">My Businesses</Link>
              )}
              <Link href="/account" className="rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100">
                {session.name.split(" ")[0]}
              </Link>
              <SignOutButton />
            </div>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Link href="/auth/signin" className="rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100">Sign In</Link>
              <Link href="/pricing" className="rounded-xl bg-emerald-700 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-800">
                List Your Business
              </Link>
            </div>
          )}

          <MobileMenu sections={mobileSections} />
        </div>
      </div>
    </header>
  );
}
