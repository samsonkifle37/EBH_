"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import SearchBar from "@/components/ui/SearchBar";

export interface MobileNavLink {
  href: string;
  label: string;
}

export interface NavSection {
  heading?: string;
  links: MobileNavLink[];
}

export default function MobileMenu({ sections }: { sections: NavSection[] }) {
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
          <div className="fixed inset-x-0 top-16 z-50 max-h-[calc(100dvh-4rem)] overflow-y-auto border-b border-neutral-200 bg-ivory-card shadow-xl">
            <div className="p-4">
              <SearchBar variant="compact" className="mb-4" />
              <nav className="flex flex-col">
                {sections.map((section, i) => (
                  <div key={i}>
                    {i > 0 && <div className="my-2 border-t border-neutral-100" />}
                    {section.heading && (
                      <p className="mb-1 px-3 pt-1 text-xs font-bold uppercase tracking-wider text-neutral-400">
                        {section.heading}
                      </p>
                    )}
                    {section.links.map((l) => (
                      <Link
                        key={l.href + l.label}
                        href={l.href}
                        onClick={() => setOpen(false)}
                        className="block rounded-lg px-3 py-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-100"
                      >
                        {l.label}
                      </Link>
                    ))}
                  </div>
                ))}
              </nav>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
