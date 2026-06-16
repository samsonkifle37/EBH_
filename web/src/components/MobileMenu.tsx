"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import SearchBar from "@/components/ui/SearchBar";

export interface MobileNavLink {
  href: string;
  label: string;
}

/**
 * Hamburger + slide-down sheet for small screens. Server passes the resolved
 * nav (role-aware) so no session logic lives on the client.
 */
export default function MobileMenu({ links, signedIn, accountHref }: { links: MobileNavLink[]; signedIn: boolean; accountHref?: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-300 bg-white text-neutral-700"
      >
        {open ? (
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5"><path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" /></svg>
        ) : (
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5"><path d="M3 6h14M3 10h14M3 14h14" strokeLinecap="round" /></svg>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 top-16 z-40 bg-ink/30" onClick={() => setOpen(false)} aria-hidden />
          <div className="fixed inset-x-0 top-16 z-50 border-b border-neutral-200 bg-ivory-card p-4 shadow-xl">
            <SearchBar variant="compact" className="mb-3" />
            <nav className="flex flex-col">
              {links.map((l) => (
                <Link
                  key={l.href + l.label}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-100"
                >
                  {l.label}
                </Link>
              ))}
              {signedIn && accountHref && (
                <Link href={accountHref} onClick={() => setOpen(false)} className="rounded-lg px-3 py-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-100">
                  My account
                </Link>
              )}
            </nav>
          </div>
        </>
      )}
    </div>
  );
}
