"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CITIES, CITY_LABELS, EVENT_TYPES, EVENT_TYPE_LABELS } from "@/lib/types";

export interface EventFormValues {
  title: string;
  type: string;
  city: string;
  venueName: string;
  address: string;
  startsAt: string; // datetime-local value
  description: string;
  ticketUrl: string;
  priceFrom: string;
  imageUrl: string;
}

const inputCls =
  "w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-600";

export default function EventForm({ eventId, initial = {} }: { eventId?: string; initial?: Partial<EventFormValues> }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const priceRaw = String(form.get("priceFrom") || "").trim();
    const body = {
      title: String(form.get("title") || ""),
      type: String(form.get("type") || ""),
      city: String(form.get("city") || ""),
      venueName: String(form.get("venueName") || ""),
      address: String(form.get("address") || ""),
      startsAt: String(form.get("startsAt") || ""),
      description: String(form.get("description") || ""),
      ticketUrl: String(form.get("ticketUrl") || ""),
      priceFrom: priceRaw === "" ? null : Number(priceRaw),
      imageUrl: String(form.get("imageUrl") || ""),
    };
    const res = await fetch(eventId ? `/api/events/${eventId}` : "/api/events", {
      method: eventId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      router.push("/dashboard/events");
      router.refresh();
    } else {
      setError(data.error ?? "Something went wrong");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Event title *</label>
        <input name="title" required minLength={3} defaultValue={initial.title} className={inputCls} placeholder="Ethiopian New Year Festival" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Type *</label>
          <select name="type" required defaultValue={initial.type ?? ""} className={inputCls}>
            <option value="" disabled>Choose…</option>
            {EVENT_TYPES.map((t) => (
              <option key={t} value={t}>{EVENT_TYPE_LABELS[t]}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">City *</label>
          <select name="city" required defaultValue={initial.city ?? ""} className={inputCls}>
            <option value="" disabled>Choose…</option>
            {CITIES.map((c) => (
              <option key={c} value={c}>{CITY_LABELS[c]}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Venue name *</label>
          <input name="venueName" required minLength={2} defaultValue={initial.venueName} className={inputCls} placeholder="Habesha Grand Hall" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Venue address</label>
          <input name="address" defaultValue={initial.address} className={inputCls} placeholder="1 Western Gateway, London" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Date &amp; time *</label>
          <input name="startsAt" type="datetime-local" required defaultValue={initial.startsAt} className={inputCls} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Ticket price from (£, blank = free)</label>
          <input name="priceFrom" type="number" min={0} step="0.01" defaultValue={initial.priceFrom} className={inputCls} placeholder="15" />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Ticket link</label>
        <input name="ticketUrl" type="url" defaultValue={initial.ticketUrl} className={inputCls} placeholder="https://tickets.example.com/…" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Poster image URL</label>
        <input name="imageUrl" type="url" defaultValue={initial.imageUrl} className={inputCls} placeholder="https://…/poster.jpg" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Description</label>
        <textarea name="description" rows={5} maxLength={3000} defaultValue={initial.description} className={inputCls} placeholder="What can attendees expect?" />
      </div>
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <button disabled={busy} className="rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50">
        {busy ? "Saving…" : eventId ? "Save changes" : "Submit for approval"}
      </button>
      {!eventId && <p className="text-xs text-neutral-400">New events are reviewed by our team before going live.</p>}
    </form>
  );
}
