import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getUpcomingEvents } from "@/lib/queries/events";
import EventCard from "@/components/EventCard";
import EmptyState from "@/components/EmptyState";
import { CITIES, CITY_LABELS, isCity, type City } from "@/lib/types";

interface Props {
  params: Promise<{ city: string }>;
}

export function generateStaticParams() {
  return CITIES.map((city) => ({ city }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city } = await params;
  if (!isCity(city)) return {};
  const cityLabel = CITY_LABELS[city as City];
  return {
    title: `Ethiopian Events in ${cityLabel}`,
    description: `Upcoming Ethiopian and Habesha concerts, cultural celebrations and community events in ${cityLabel}.`,
    alternates: { canonical: `/events/${city}` },
  };
}

export default async function EventsCityPage({ params }: Props) {
  const { city } = await params;
  if (!isCity(city)) notFound();
  const cityLabel = CITY_LABELS[city as City];
  const events = await getUpcomingEvents({ city });

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <nav className="text-sm text-neutral-400">
        <Link href="/" className="hover:text-emerald-700">Home</Link>
        {" / "}
        <Link href="/events" className="hover:text-emerald-700">Events</Link>
        {" / "}
        <span className="text-neutral-600">{cityLabel}</span>
      </nav>
      <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">Ethiopian Events in {cityLabel}</h1>
      <p className="mt-2 max-w-2xl text-neutral-500">
        What&apos;s on for the Habesha community in {cityLabel} — concerts, festivals, business networking and more.
      </p>

      {events.length === 0 ? (
        <div className="mt-8">
          <EmptyState title={`No upcoming events in ${cityLabel} yet`} hint="Organising one? Create your event and reach the community." />
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
        </div>
      )}

      <div className="mt-14 flex flex-wrap gap-2">
        {CITIES.filter((c) => c !== city).map((c) => (
          <Link key={c} href={`/events/${c}`} className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-sm font-medium text-neutral-600 hover:border-emerald-600 hover:text-emerald-700">
            Events in {CITY_LABELS[c]}
          </Link>
        ))}
      </div>
    </main>
  );
}
