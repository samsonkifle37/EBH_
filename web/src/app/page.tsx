import Link from "next/link";
import { db } from "@/lib/db";
import { getFeaturedBusinesses } from "@/lib/queries/businesses";
import BusinessCard from "@/components/BusinessCard";
import EventCard from "@/components/EventCard";
import AdSlot from "@/components/AdSlot";
import SectionHeading from "@/components/SectionHeading";
import {
  CATEGORIES,
  CATEGORY_ICONS,
  CATEGORY_LABELS,
  CITIES,
  CITY_LABELS,
} from "@/lib/types";

export const dynamic = "force-dynamic";

const QUICK_CATEGORIES = [
  "restaurants",
  "grocery-stores",
  "lawyers",
  "beauty-services",
  "wedding-services",
  "travel-agencies",
  "accountants",
  "cafes",
] as const;

export default async function HomePage() {
  const [featured, events] = await Promise.all([
    getFeaturedBusinesses(6),
    db.event.findMany({
      where: { status: "APPROVED", startsAt: { gte: new Date() } },
      orderBy: { startsAt: "asc" },
      take: 3,
    }),
  ]);

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Ethiopian Business Hub UK",
    url: process.env.SITE_URL ?? "http://localhost:3000",
    slogan: "Discover, Support, and Grow Ethiopian Businesses Across the UK",
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />

      {/* Hero */}
      <section className="border-b border-neutral-200 bg-gradient-to-b from-emerald-50/60 via-white to-white">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:py-20">
          <h1 className="mx-auto max-w-3xl text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-5xl">
            Discover Ethiopian Businesses, Events &amp; Services Across the UK
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-neutral-500">
            Restaurants, grocery stores, solicitors, beauty salons, weddings and
            community events — found, rated and verified by the Habesha community.
          </p>

          <form action="/businesses" method="get" className="mx-auto mt-8 flex max-w-2xl items-center gap-2 rounded-2xl border border-neutral-200 bg-white p-2 shadow-lg shadow-emerald-900/5">
            <input
              type="search"
              name="q"
              placeholder="Search restaurants, events, accountants, beauty salons…"
              className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm outline-none"
            />
            <button className="shrink-0 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800">
              Search
            </button>
          </form>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-sm">
            <span className="text-neutral-400">📍</span>
            {CITIES.map((c) => (
              <Link key={c} href={`/businesses?city=${c}`} className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 font-medium text-neutral-600 hover:border-emerald-600 hover:text-emerald-700">
                {CITY_LABELS[c]}
              </Link>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm">
            {QUICK_CATEGORIES.map((c) => (
              <Link key={c} href={`/businesses?category=${c}`} className="rounded-full bg-neutral-100 px-3 py-1.5 font-medium text-neutral-600 hover:bg-emerald-50 hover:text-emerald-700">
                {CATEGORY_ICONS[c]} {CATEGORY_LABELS[c]}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured businesses */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <SectionHeading
          title="Featured Businesses"
          subtitle="Trusted and verified partners across the UK"
          href="/businesses"
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((b) => (
            <BusinessCard key={b.id} business={b} />
          ))}
        </div>
      </section>

      {/* AI concierge teaser */}
      <section className="mx-auto max-w-6xl px-4 py-6">
        <div className="overflow-hidden rounded-3xl bg-neutral-900 px-6 py-10 text-white sm:px-10">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-semibold text-emerald-400">🤖 AI Concierge</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight">What are you looking for today?</h2>
              <p className="mt-2 max-w-lg text-sm text-neutral-300">
                Ask in plain English — &ldquo;Find me a wedding venue for 250 guests in
                London&rdquo; — and get instant recommendations from across the directory.
              </p>
            </div>
            <Link href="/concierge" className="shrink-0 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-neutral-900 hover:bg-emerald-400">
              Ask AI →
            </Link>
          </div>
        </div>
      </section>

      {/* Upcoming events */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <SectionHeading title="Upcoming Events" subtitle="Concerts, culture, business and community" href="/events" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
        </div>
      </section>

      {/* Browse categories */}
      <section className="mx-auto max-w-6xl px-4 py-6">
        <SectionHeading title="Browse Categories" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {CATEGORIES.map((c) => (
            <Link key={c} href={`/businesses?category=${c}`} className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-600 hover:shadow-md">
              <span className="text-2xl">{CATEGORY_ICONS[c]}</span>
              <span className="text-sm font-semibold text-neutral-700">{CATEGORY_LABELS[c]}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Sponsored */}
      <section className="mx-auto max-w-6xl px-4 py-8">
        <AdSlot placement="HOME_HERO" />
      </section>

      {/* Business owner CTA */}
      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="rounded-3xl border border-emerald-100 bg-emerald-50/60 px-6 py-12 text-center sm:px-10">
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">Own a business?</h2>
          <p className="mx-auto mt-3 max-w-md text-neutral-600">
            Claim your listing, get verified, collect reviews and promote your
            services to thousands of Ethiopian consumers across the UK.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link href="/pricing" className="rounded-xl bg-emerald-700 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-800">
              List My Business
            </Link>
            <Link href="/advertise" className="rounded-xl border border-neutral-300 bg-white px-6 py-3 text-sm font-semibold text-neutral-700 hover:border-emerald-600 hover:text-emerald-700">
              Advertise with us
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
