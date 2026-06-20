"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, PlusCircle, Briefcase, User, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * EBH Mobile Bottom Navigation — LOCKED DESIGN SYSTEM RULE
 *
 * Exactly 5 tabs in this exact order:
 *   1. Home (/)
 *   2. Search (/search)
 *   3. List Business (/list-business) — primary CTA, elevated treatment
 *   4. For Businesses (/for-businesses) — owner hub, replaces Messages
 *   5. Profile (/profile)
 *
 * DO NOT change tab order, labels, quantity, icons, or behaviour without
 * explicit approval from the product owner. See:
 *   docs/design-system/mobile-bottom-nav.md
 */

type Tab = {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
  primary?: boolean;
};

const TABS: Tab[] = [
  { href: "/", label: "Home", icon: Home, exact: true },
  { href: "/search", label: "Search", icon: Search },
  { href: "/list-business", label: "List Business", icon: PlusCircle, primary: true },
  { href: "/for-businesses", label: "For Businesses", icon: Briefcase },
  { href: "/profile", label: "Profile", icon: User },
];

/** Pathnames where the bottom nav is hidden (non-primary screens) */
const HIDDEN_PREFIXES = ["/admin", "/auth", "/owner", "/dashboard"];

export default function MobileBottomNav() {
  const pathname = usePathname();

  // Hide on admin / auth / owner dashboards — those have their own nav
  if (HIDDEN_PREFIXES.some((p) => pathname.startsWith(p))) return null;

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <nav
      aria-label="Main navigation"
      className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white border-t border-neutral-200 shadow-[0_-1px_4px_rgba(0,0,0,0.07)]"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex h-16 items-center justify-around px-1">
        {TABS.map(({ href, label, icon: Icon, exact, primary }) => {
          const active = isActive(href, exact);

          /* ── Primary CTA: List Business — elevated pill button ── */
          if (primary) {
            return (
              <Link
                key={href}
                href={href}
                aria-label={label}
                aria-current={active ? "page" : undefined}
                className="flex flex-col items-center justify-end gap-0.5 min-w-[44px] min-h-[44px] -mt-5"
              >
                <span
                  className={cn(
                    "flex items-center justify-center w-[52px] h-[52px] rounded-full shadow-lg transition-transform active:scale-95",
                    active
                      ? "bg-ebh-green-dark"
                      : "bg-ebh-green"
                  )}
                >
                  <Icon className="w-6 h-6 text-white" strokeWidth={2.25} />
                </span>
                <span
                  className={cn(
                    "text-[10px] font-semibold leading-tight",
                    active ? "text-ebh-green" : "text-neutral-500"
                  )}
                >
                  {label}
                </span>
              </Link>
            );
          }

          /* ── Standard tab ── */
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              aria-current={active ? "page" : undefined}
              className="flex flex-col items-center justify-center gap-1 min-w-[44px] min-h-[44px] px-1 transition-opacity active:opacity-70"
            >
              <Icon
                className={cn(
                  "w-[22px] h-[22px] transition-colors",
                  active ? "text-ebh-green" : "text-neutral-400"
                )}
                strokeWidth={active ? 2.5 : 2}
              />
              <span
                className={cn(
                  "text-[10px] font-medium leading-tight",
                  active ? "text-ebh-green font-semibold" : "text-neutral-400"
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
