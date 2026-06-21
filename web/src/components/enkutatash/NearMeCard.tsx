"use client";

import { useState } from "react";
import Link from "next/link";

interface Business {
  id: string;
  name: string;
  category: string;
  city: string;
  enkutatashOffer?: string | null;
  imageUrl?: string | null;
  slug?: string | null;
}

interface Event {
  id: string;
  title: string;
  city: string;
  startDate: string;
  venue?: string | null;
  slug?: string | null;
}

interface Props {
  businesses: Business[];
  events: Event[];
}

const CITIES = ["All", "London", "Birmingham", "Manchester", "Leicester", "Leeds", "Edinburgh", "Cardiff", "Other"];

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function NearMeCard({ businesses, events }: Props) {
  const [city, setCity] = useState("All");

  const filteredBiz = businesses.filter((b) => city === "All" || b.city?.toLowerCase().includes(city.toLowerCase()));
  const filteredEvts = events.filter((e) => city === "All" || e.city?.toLowerCase().includes(city.toLowerCase()));

  const hasContent = filteredBiz.length > 0 || filteredEvts.length > 0;

  return (
    <div className="flex flex-col gap-4">
      {/* City filter */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">Filter by city</p>
        <div className="flex flex-wrap gap-1.5">
          {CITIES.map((c) => (
            <button
              key={c}
              onClick={() => setCity(c)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                city === c
                  ? "bg-[var(--color-ebh-green)] text-white"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {!hasContent && (
        <p className="py-6 text-center text-sm text-neutral-400">
          No Enkutatash events or partner businesses found{city !== "All" ? ` in ${city}` : ""} yet.<br />
          <Link href="/submit" className="text-emerald-700 underline">List your business</Link> or{" "}
          <Link href="/events/submit" className="text-emerald-700 underline">submit an event</Link>.
        </p>
      )}

      {/* Events */}
      {filteredEvts.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-neutral-500">🎉 Enkutatash events</p>
          <div className="flex flex-col gap-2">
            {filteredEvts.slice(0, 4).map((e) => (
              <Link
                key={e.id}
                href={e.slug ? `/events/${e.slug}` : "/events"}
                className="flex items-start gap-3 rounded-2xl border border-neutral-200 bg-white p-3 transition hover:border-emerald-300 hover:shadow-sm"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-xl">
                  🗓️
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-neutral-900">{e.title}</p>
                  <p className="text-xs text-neutral-500">{formatDate(e.startDate)} · {e.city}{e.venue ? ` · ${e.venue}` : ""}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Partner businesses */}
      {filteredBiz.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-neutral-500">🌸 Enkutatash partners</p>
          <div className="flex flex-col gap-2">
            {filteredBiz.slice(0, 5).map((b) => (
              <Link
                key={b.id}
                href={b.slug ? `/businesses/${b.slug}` : "/businesses"}
                className="flex items-start gap-3 rounded-2xl border border-neutral-200 bg-white p-3 transition hover:border-emerald-300 hover:shadow-sm"
              >
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-lg font-black text-[var(--color-ebh-green)]"
                >
                  {b.imageUrl ? (
                    <img src={b.imageUrl} alt="" className="h-10 w-10 rounded-xl object-cover" />
                  ) : (
                    b.name[0]
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-neutral-900">{b.name}</p>
                  <p className="text-xs text-neutral-500">{b.category} · {b.city}</p>
                  {b.enkutatashOffer && (
                    <p className="mt-0.5 truncate text-xs font-semibold text-amber-700">🌟 {b.enkutatashOffer}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <p className="text-center text-xs text-neutral-400">
        Want to be listed?{" "}
        <Link href="/submit" className="text-emerald-700 underline">
          Register your business on EBH
        </Link>
      </p>
    </div>
  );
}
