import { Suspense } from "react";
import type { Metadata } from "next";
import { searchBusinesses } from "@/lib/queries/businesses";
import { db } from "@/lib/db";
import BusinessCard from "@/components/BusinessCard";
import FilterBar from "@/components/FilterBar";
import AdSlot from "@/components/AdSlot";
import EmptyState from "@/components/EmptyState";
import { CATEGORY_LABELS, CITY_LABELS, isCategory, isCity, type Category, type City } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Browse Ethiopian Businesses in the UK",
  description:
    "Search and filter Ethiopian and Habesha businesses across London, Birmingham, Manchester, Leicester and Sheffield.",
};

interface Props {
  searchParams: Promise<{ q?: string; category?: string; city?: string; minRating?: string; openNow?: string; verified?: string }>;
}

export default async function BusinessesPage({ searchParams }: Props) {
  const params = await searchParams;
  const results = await searchBusinesses({
    q: params.q,
    category: params.category && isCategory(params.category) ? params.category : undefined,
    city: params.city && isCity(params.city) ? params.city : undefined,
    minRating: params.minRating ? Number(params.minRating) : undefined,
    openNow: params.openNow === "1",
    verifiedOnly: params.verified === "1",
  });

  // fire-and-forget search impressions for analytics
  if (results.length > 0) {
    void db.analyticsEvent
      .createMany({ data: results.slice(0, 10).map((r) => ({ type: "SEARCH_IMPRESSION", businessId: r.id })) })
      .catch(() => {});
  }

  const categoryLabel = params.category && isCategory(params.category) ? CATEGORY_LABELS[params.category as Category] : null;
  const cityLabel = params.city && isCity(params.city) ? CITY_LABELS[params.city as City] : null;
  const heading = [categoryLabel ?? "Ethiopian Businesses", cityLabel ? `in ${cityLabel}` : "across the UK"].join(" ");

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{heading}</h1>
      <p className="mt-1 text-sm text-neutral-500">
        {results.length} {results.length === 1 ? "business" : "businesses"} found
        {params.q ? ` for “${params.q}”` : ""}
      </p>

      <div className="mt-6">
        <Suspense>
          <FilterBar />
        </Suspense>
      </div>

      {results.length === 0 ? (
        <div className="mt-8">
          <EmptyState title="No businesses match those filters" hint="Try removing a filter or searching a different city." />
        </div>
      ) : (
        <>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {results.slice(0, 3).map((b) => (
              <BusinessCard key={b.id} business={b} />
            ))}
          </div>
          <div className="mt-5">
            <AdSlot placement="SEARCH_RESULTS" />
          </div>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {results.slice(3).map((b) => (
              <BusinessCard key={b.id} business={b} />
            ))}
          </div>
        </>
      )}
    </main>
  );
}
