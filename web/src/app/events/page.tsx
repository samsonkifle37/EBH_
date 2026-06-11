import Link from "next/link";
import type { Metadata } from "next";
import { getUpcomingEvents } from "@/lib/queries/events";
import EventCard from "@/components/EventCard";
import EmptyState from "@/components/EmptyState";
import { CITIES, CITY_LABELS, EVENT_TYPES, EVENT_TYPE_LABELS, isEventType } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ethiopian & Habesha Events in the UK",
  description:
    "Upcoming Ethiopian concerts, cultural celebrations, business networking and community events across the UK.",
};

export default async function EventsPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const { type } = await searchParams;
  const validType = type && isEventType(type) ? type : undefined;
  const events = await getUpcomingEvents({ type: validType });

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Upcoming Events</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Concerts, culture, faith, business and community across the UK.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/events"
          className={`rounded-full px-3.5 py-1.5 text-sm font-medium ${!validType ? "bg-emerald-700 text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"}`}
        >
          All
        </Link>
        {EVENT_TYPES.map((t) => (
          <Link
            key={t}
            href={`/events?type=${t}`}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium ${validType === t ? "bg-emerald-700 text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"}`}
          >
            {EVENT_TYPE_LABELS[t]}
          </Link>
        ))}
      </div>

      {events.length === 0 ? (
        <div className="mt-8">
          <EmptyState title="No upcoming events in this category" hint="Check back soon or browse all events." />
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
        </div>
      )}

      <section className="mt-14">
        <h2 className="text-sm font-semibold text-neutral-900">Events by city</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {CITIES.map((c) => (
            <Link key={c} href={`/events/${c}`} className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-sm font-medium text-neutral-600 hover:border-emerald-600 hover:text-emerald-700">
              Events in {CITY_LABELS[c]}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
