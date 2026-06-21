import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { allowDemoData } from "@/lib/flags";
import MapEmbed from "@/components/MapEmbed";
import TrackedLink from "@/components/TrackedLink";
import AdSlot from "@/components/AdSlot";
import NuCallout from "@/components/NuCallout";
import EventInterestButton from "@/components/EventInterestButton";
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
  if (event.sourceType === "demo" && !allowDemoData()) notFound();

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

            {/* Interest counter + tap */}
            <div className="mt-5">
              <EventInterestButton eventId={event.id} initialCount={(event as { interestCount: number }).interestCount ?? 0} />
            </div>

            {event.ticketUrl ? (
              <TrackedLink
                href={event.ticketUrl}
                type="TICKET_CLICK"
                eventId={event.id}
                className="mt-3 block rounded-xl bg-emerald-700 px-5 py-3 text-center text-sm font-semibold text-white hover:bg-emerald-800"
              >
                Get Tickets →
              </TrackedLink>
            ) : (
              <p className="mt-3 rounded-xl bg-neutral-50 px-4 py-3 text-center text-sm text-neutral-500">
                No ticket required — just turn up!
              </p>
            )}

            {/* WhatsApp share */}
            {(() => {
              const shareText = `🎉 ${event.title}\n📅 ${DATE_FMT.format(event.startsAt)} · ${event.venueName}, ${cityLabel}\n${event.priceFrom === 0 || event.priceFrom === null ? "Free entry" : `From £${event.priceFrom}`}\n\nMore info 👇\nhttps://ethiopianbh.co.uk/event/${event.slug}`;
              return (
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-green-200 bg-green-50 px-5 py-3 text-sm font-semibold text-green-800 transition hover:bg-green-100"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 shrink-0">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Share on WhatsApp
                </a>
              );
            })()}
          </div>

          {event.lat && event.lng && <MapEmbed lat={event.lat} lng={event.lng} name={event.venueName} />}

          <NuCallout title="Going to Ethiopia soon?" body="Build your itinerary with NU — flights, hotels, tours and the best of home, planned in minutes." cta="Build your itinerary" />

          <AdSlot placement="EVENT_DETAIL" />
        </aside>
      </div>
    </main>
  );
}
