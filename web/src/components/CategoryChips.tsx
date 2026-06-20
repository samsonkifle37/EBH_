"use client";

import Link from "next/link";
import { CATEGORY_ICONS, CATEGORY_LABELS, type Category } from "@/lib/types";
import { track } from "@/lib/analytics/client";

const FEATURED_CATEGORIES: readonly Category[] = [
  "restaurants",
  "grocery-stores",
  "cafes",
  "travel-agencies",
  "lawyers",
  "beauty-services",
  "accountants",
  "wedding-services",
  "cleaning-services",
  "community-organizations",
];

export default function CategoryChips() {
  return (
    <section aria-label="Browse by category" className="border-b border-neutral-100 bg-ivory-card">
      <div className="mx-auto max-w-6xl px-4 py-4">
        <div className="flex items-center gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <span className="shrink-0 text-xs font-semibold uppercase tracking-wider text-neutral-400">
            🗂 Category
          </span>
          {FEATURED_CATEGORIES.map((c) => (
            <Link
              key={c}
              href={`/businesses?category=${c}`}
              onClick={() => track("CATEGORY_CHIP_CLICKED", { channel: c })}
              className="flex min-h-[44px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:border-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600"
            >
              <span className="text-base">{CATEGORY_ICONS[c]}</span>
              <span>{CATEGORY_LABELS[c]}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
