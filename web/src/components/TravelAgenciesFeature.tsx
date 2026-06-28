import { NU_URL, NU_PLAY_STORE_URL } from "@/lib/nu";
import NuLogo from "@/components/NuLogo";

const ETHIOPIAN_AIRLINES_URL = "https://www.ethiopianairlines.com/";
// Public Google Flights search (no API / no scraping) — opens a flights search to Ethiopia.
const GOOGLE_FLIGHTS_URL =
  "https://www.google.com/travel/flights?q=Flights%20to%20Addis%20Ababa%20from%20United%20Kingdom";

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600";

function VerifiedPill() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
      ✓ Verified
    </span>
  );
}

/**
 * Curated Ethiopia-travel discovery shown on the Travel Agencies category page.
 * Front-end only (no paid APIs / scraping): NU Discover Ethiopia, a cheap-tickets
 * explainer, and a direct Ethiopian Airlines booking card.
 */
export default function TravelAgenciesFeature() {
  return (
    <section aria-label="Ethiopia travel" className="mt-8 space-y-6">
      {/* NU Discover Ethiopia — featured travel companion */}
      <article className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start">
          <NuLogo className="h-16 w-16 shrink-0 rounded-2xl" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-bold text-ink">NU Discover Ethiopia</h2>
              <VerifiedPill />
            </div>
            <p className="mt-0.5 text-xs font-medium text-neutral-400">Travel Agencies · UK / Online</p>
            <p className="mt-2 text-sm leading-relaxed text-neutral-600">
              NU Discover Ethiopia helps travellers discover trusted places, tours, transport, stays, dining, and
              cultural experiences across Ethiopia. Built as a travel companion for visitors, diaspora, and locals.
            </p>
            <div className="mt-4 flex flex-wrap gap-2.5">
              <a
                href={NU_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex min-h-[44px] items-center rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800 ${focusRing}`}
              >
                Visit website →
              </a>
              <a
                href={NU_PLAY_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex min-h-[44px] items-center rounded-xl border border-neutral-300 px-4 py-2 text-sm font-semibold text-ink transition hover:bg-neutral-50 ${focusRing}`}
              >
                🤖 Google Play
              </a>
            </div>
          </div>
        </div>
      </article>

      {/* Find Cheap Tickets to Ethiopia */}
      <section className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5">
        <h2 className="text-lg font-bold text-ink">Find Cheap Tickets to Ethiopia</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-neutral-600">
          Compare flights, check trusted travel agencies, and find booking links for trips to Ethiopia.
        </p>
        <div className="mt-4 flex flex-wrap gap-2.5">
          <a
            href={GOOGLE_FLIGHTS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex min-h-[44px] items-center rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800 ${focusRing}`}
          >
            Search Flights to Ethiopia →
          </a>
          <a
            href={NU_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex min-h-[44px] items-center rounded-xl border border-emerald-300 bg-white px-4 py-2 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-50 ${focusRing}`}
          >
            Explore Ethiopian Travel Services
          </a>
        </div>
      </section>

      {/* Ethiopian Airlines Booking — whole card is clickable */}
      <a
        href={ETHIOPIAN_AIRLINES_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Book with Ethiopian Airlines (opens in a new tab)"
        className={`group block rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-600/60 hover:shadow-md ${focusRing}`}
      >
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-xl" aria-hidden>
            ✈️
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-bold text-ink group-hover:text-emerald-800">Ethiopian Airlines Booking</h2>
            <VerifiedPill />
          </div>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-neutral-600">
          Book flights directly with Ethiopian Airlines for travel between the UK, Ethiopia, and international destinations.
        </p>
        <span className="mt-4 inline-flex items-center text-sm font-semibold text-emerald-700">
          Book with Ethiopian Airlines →
        </span>
      </a>
    </section>
  );
}
