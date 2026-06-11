import Link from "next/link";
import { CITY_LABELS, EVENT_TYPE_LABELS, isCity, isEventType, type City, type EventType } from "@/lib/types";

export interface EventSummary {
  id: string;
  title: string;
  slug: string;
  type: string;
  city: string;
  venueName: string;
  imageUrl: string;
  startsAt: Date;
  priceFrom: number | null;
  ticketUrl: string;
}

const DATE_FMT = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });
const TIME_FMT = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" });

export default function EventCard({ event }: { event: EventSummary }) {
  const cityLabel = isCity(event.city) ? CITY_LABELS[event.city as City] : event.city;
  const typeLabel = isEventType(event.type) ? EVENT_TYPE_LABELS[event.type as EventType] : event.type;

  return (
    <Link
      href={`/event/${event.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100">
        {event.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={event.imageUrl} alt={event.title} loading="lazy" className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-50 to-red-50 text-4xl">🎵</div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2 py-0.5 text-xs font-semibold text-neutral-700 backdrop-blur">
          {typeLabel}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="font-semibold leading-snug text-neutral-900 group-hover:text-emerald-800">{event.title}</h3>
        <p className="text-sm font-medium text-emerald-700">
          {DATE_FMT.format(event.startsAt)} · {TIME_FMT.format(event.startsAt)}
        </p>
        <p className="text-sm text-neutral-500">📍 {event.venueName}, {cityLabel}</p>
        <p className="mt-auto pt-2 text-sm font-semibold text-neutral-800">
          {event.priceFrom === 0 || event.priceFrom === null ? "Free entry" : `From £${event.priceFrom}`}
          <span className="ml-2 text-emerald-700 group-hover:underline">Get Tickets →</span>
        </p>
      </div>
    </Link>
  );
}
