import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import MapEmbed from "@/components/MapEmbed";
import TrackedLink from "@/components/TrackedLink";
import AdSlot from "@/components/AdSlot";
import { CITY_LABELS, EVENT_TYPE_LABELS, isCity, isEventType, type City, type EventType } from "@/lib/types";

interface Props {
  params: Promise<{ slug: string }>;
}

const DATE_FMT = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
const TIME_FMT = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" });

async function getEvent(slug: string) {
  return db.event.findUnique({
    where: { slug },
    include: { organizer: { select: { name: true } } },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event || event.status !== "APPROVED") return {};
  return {
    title: event.title,
    description: event.description.slice(0, 160),
    alternates: { canonical: `/event/${event.slug}` },
    openGraph: { images: event.imageUrl ? [event.imageUrl] : [] },
  };
}

export default async function EventPage({ params }: Props) {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event || event.status !== "APPROVED") notFound();

  void db.analyticsEvent.create({ data: { type: "EVENT_VIEW", eventId: event.id } }).catch(() => {});

  const cityLabel = isCity(event.city) ? CITY_LABELS[event.city as City] : event.city;
  const typeLabel = isEventType(event.type) ? EVENT_TYPE_LABELS[event.type as EventType] : event.type;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.description,
    startDate: event.startsAt.toISOString(),
    ...(event.endsAt && { endDate: event.endsAt.toISOString() }),
    image: event.imageUrl ? [event.imageUrl] : undefined,
    location: {
      "@type": "Place",
      name: event.venueName,
      address: { "@type": "PostalAddress", streetAddress: event.address, addressLocality: cityLabel, addressCountry: "GB" },
    },
    organizer: { "@type": "Organization", name: event.organizer.name },
    ...(event.priceFrom !== null && {
      offers: {
        "@type": "Offer",
        price: event.priceFrom,
        priceCurrency: "GBP",
        url: event.ticketUrl || undefined,
        availability: "https://schema.org/InStock",
      },
    }),
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav className="mb-4 text-sm text-neutral-400">
        <Link href="/" className="hover:text-emerald-700">Home</Link>
        {" / "}
        <Link href="/events" className="hover:text-emerald-700">Events</Link>
        {" / "}
        <span className="text-neutral-600">{event.title}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
        <div>
          {event.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={event.imageUrl} alt={event.title} className="max-h-[480px] w-full rounded-3xl object-cover" />
          )}
          <span className="mt-6 inline-block rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-600">
            {typeLabel}
          </span>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">{event.title}</h1>
          <p className="mt-2 text-sm text-neutral-500">Organised by {event.organizer.name}</p>
          <p className="mt-6 max-w-2xl whitespace-pre-line leading-relaxed text-neutral-700">{event.description}</p>
        </div>

        <aside className="space-y-5">
          <div className="rounded-2xl border border-neutral-200 bg-white p-5">
            <p className="text-lg font-bold text-neutral-900">
              {event.priceFrom === 0 || event.priceFrom === null ? "Free entry" : `From £${event.priceFrom}`}
            </p>
            <div className="mt-3 space-y-2 text-sm text-neutral-600">
              <p>📅 {DATE_FMT.format(event.startsAt)}</p>
              <p>🕒 {TIME_FMT.format(event.startsAt)}{event.endsAt ? ` – ${TIME_FMT.format(event.endsAt)}` : ""}</p>
              <p>📍 {event.venueName}, {event.address}</p>
            </div>
            {event.ticketUrl ? (
              <TrackedLink
                href={event.ticketUrl}
                type="TICKET_CLICK"
                eventId={event.id}
                className="mt-5 block rounded-xl bg-emerald-700 px-5 py-3 text-center text-sm font-semibold text-white hover:bg-emerald-800"
              >
                Get Tickets →
              </TrackedLink>
            ) : (
              <p className="mt-5 rounded-xl bg-neutral-50 px-4 py-3 text-center text-sm text-neutral-500">
                No ticket required — just turn up!
              </p>
            )}
          </div>

          {event.lat && event.lng && <MapEmbed lat={event.lat} lng={event.lng} name={event.venueName} />}

          <AdSlot placement="EVENT_DETAIL" />
        </aside>
      </div>
    </main>
  );
}
