import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { searchBusinesses } from "@/lib/queries/businesses";
import BusinessCard from "@/components/BusinessCard";
import EmptyState from "@/components/EmptyState";
import {
  CATEGORIES,
  CATEGORY_LABELS,
  CITIES,
  CITY_LABELS,
  isCategory,
  isCity,
  type Category,
  type City,
} from "@/lib/types";

interface Props {
  params: Promise<{ category: string; city: string }>;
}

export function generateStaticParams() {
  return CATEGORIES.flatMap((category) => CITIES.map((city) => ({ category, city })));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, city } = await params;
  if (!isCategory(category) || !isCity(city)) return {};
  const categoryLabel = CATEGORY_LABELS[category as Category];
  const cityLabel = CITY_LABELS[city as City];
  return {
    title: `Ethiopian ${categoryLabel} in ${cityLabel}`,
    description: `Find the best Ethiopian and Habesha ${categoryLabel.toLowerCase()} in ${cityLabel}. Ratings, reviews, opening hours and verified contact details.`,
    alternates: { canonical: `/${category}/${city}` },
  };
}

export default async function CategoryCityPage({ params }: Props) {
  const { category, city } = await params;
  if (!isCategory(category) || !isCity(city)) notFound();

  const categoryLabel = CATEGORY_LABELS[category as Category];
  const cityLabel = CITY_LABELS[city as City];
  const results = await searchBusinesses({ category, city });

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Ethiopian ${categoryLabel} in ${cityLabel}`,
    itemListElement: results.map((b, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${process.env.SITE_URL ?? "http://localhost:3000"}/business/${b.slug}`,
      name: b.name,
    })),
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />

      <nav className="text-sm text-neutral-400">
        <Link href="/" className="hover:text-emerald-700">Home</Link>
        {" / "}
        <Link href={`/businesses?category=${category}`} className="hover:text-emerald-700">{categoryLabel}</Link>
        {" / "}
        <span className="text-neutral-600">{cityLabel}</span>
      </nav>

      <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
        Ethiopian {categoryLabel} in {cityLabel}
      </h1>
      <p className="mt-2 max-w-2xl text-neutral-500">
        Discover {results.length > 0 ? results.length : ""} Habesha-owned{" "}
        {categoryLabel.toLowerCase()} in {cityLabel}, rated and reviewed by the
        community — with verified contact details, opening hours and photos.
      </p>

      {results.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="No verified businesses listed yet."
            hint="Are you a business owner? List your business and be the first verified listing here."
          />
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((b) => (
            <BusinessCard key={b.id} business={b} />
          ))}
        </div>
      )}

      <section className="mt-14 grid gap-8 sm:grid-cols-2">
        <div>
          <h2 className="text-sm font-semibold text-neutral-900">
            {categoryLabel} in other cities
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-neutral-500">
            {CITIES.filter((c) => c !== city).map((c) => (
              <li key={c}>
                <Link href={`/${category}/${c}`} className="hover:text-emerald-700">
                  Ethiopian {categoryLabel} in {CITY_LABELS[c]}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-neutral-900">
            More in {cityLabel}
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-neutral-500">
            {CATEGORIES.filter((c) => c !== category)
              .slice(0, 6)
              .map((c) => (
                <li key={c}>
                  <Link href={`/${c}/${city}`} className="hover:text-emerald-700">
                    Ethiopian {CATEGORY_LABELS[c]} in {cityLabel}
                  </Link>
                </li>
              ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
