import type { Metadata } from "next";
import Link from "next/link";
import SearchBar from "@/components/ui/SearchBar";
import { socialMeta } from "@/lib/seo";
import {
  CATEGORIES,
  CATEGORY_ICONS,
  CATEGORY_LABELS,
  CITIES,
  CITY_LABELS,
} from "@/lib/types";

const TITLE = "Search Ethiopian businesses across the UK";
const DESC = "Search and filter trusted Ethiopian-owned businesses by name, category and city across the UK.";

export const metadata: Metadata = {
  title: "Search",
  description: DESC,
  ...socialMeta({ title: TITLE, description: DESC, path: "/search" }),
};

/**
 * /search — the Search tab from the locked bottom nav. The single, canonical
 * home for category + city filtering (these no longer appear on the homepage).
 */
export default function SearchPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">Search</h1>
      <p className="mt-1.5 text-sm text-neutral-600">
        Find verified Ethiopian businesses by name, category or city.
      </p>

      <div className="mt-5">
        <SearchBar variant="hero" />
      </div>

      {/* Cities — the single, canonical city filter list */}
      <section aria-labelledby="search-cities" className="mt-10">
        <h2 id="search-cities" className="text-sm font-bold uppercase tracking-wider text-neutral-500">
          Browse by city
        </h2>
        <div className="mt-3 flex flex-wrap gap-2.5">
          {CITIES.map((c) => (
            <Link
              key={c}
              href={`/businesses?city=${c}`}
              className="flex min-h-[44px] items-center rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:border-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600"
            >
              {CITY_LABELS[c]}
            </Link>
          ))}
        </div>
      </section>

      {/* Categories — the single, canonical category filter list */}
      <section aria-labelledby="search-categories" className="mt-10">
        <h2 id="search-categories" className="text-sm font-bold uppercase tracking-wider text-neutral-500">
          Browse by category
        </h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {CATEGORIES.map((c) => (
            <Link
              key={c}
              href={`/businesses?category=${c}`}
              className="flex min-h-[44px] items-center gap-3 rounded-2xl border border-neutral-200/80 bg-ivory-card p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-600/60 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600"
            >
              <span className="text-2xl" aria-hidden>{CATEGORY_ICONS[c]}</span>
              <span className="text-sm font-semibold text-ink">{CATEGORY_LABELS[c]}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Recommend a business — community supply (playbook 1.2) */}
      <section className="mt-12 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5">
        <p className="font-semibold text-ink">Can&rsquo;t find a business?</p>
        <p className="mt-1 text-sm text-neutral-600">
          Know a great Ethiopian-owned business that isn&rsquo;t listed yet? Tell us and we&rsquo;ll verify and add it.
        </p>
        <Link
          href="/list-business"
          className="mt-3 inline-flex min-h-[44px] items-center rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
        >
          Recommend a business →
        </Link>
      </section>

      <p className="mt-6 text-sm text-neutral-500">
        Looking for advanced filters?{" "}
        <Link href="/businesses" className="font-semibold text-emerald-700 hover:underline">
          Open the full directory →
        </Link>
      </p>
    </main>
  );
}
