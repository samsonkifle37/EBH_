"use client";

import Link from "next/link";
import { CITIES, CITY_LABELS, type City } from "@/lib/types";
import { track } from "@/lib/analytics/client";

export default function CityChips() {
  return (
    <section aria-label="Browse by city" className="border-b border-neutral-100 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-4">
        <div className="flex items-center gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <span className="shrink-0 text-xs font-semibold uppercase tracking-wider text-neutral-400">
            📍 City
          </span>
          {CITIES.map((c: City) => (
            <Link
              key={c}
              href={`/businesses?city=${c}`}
              onClick={() => track("CITY_CHIP_CLICKED", { channel: c })}
              className="flex min-h-[44px] shrink-0 items-center rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:border-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600"
            >
              {CITY_LABELS[c]}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
