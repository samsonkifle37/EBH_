"use client";

import { useState, useEffect } from "react";

interface Props {
  eventId: string;
  initialCount: number;
}

const STORAGE_KEY = (id: string) => `ebh_interest_${id}`;

export default function EventInterestButton({ eventId, initialCount }: Props) {
  const [count, setCount] = useState(initialCount);
  const [interested, setInterested] = useState(false);
  const [loading, setLoading] = useState(false);
  const [justTapped, setJustTapped] = useState(false);

  // Hydrate from localStorage after mount (avoids SSR mismatch)
  useEffect(() => {
    try {
      setInterested(localStorage.getItem(STORAGE_KEY(eventId)) === "1");
    } catch {
      // private browsing may block localStorage
    }
  }, [eventId]);

  async function handleTap() {
    if (interested || loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/event/${eventId}/interest`, { method: "POST" });
      if (res.ok) {
        const data = await res.json() as { count: number };
        setCount(data.count);
        setInterested(true);
        setJustTapped(true);
        setTimeout(() => setJustTapped(false), 2000);
        try {
          localStorage.setItem(STORAGE_KEY(eventId), "1");
        } catch {
          // ignore
        }
      }
    } catch {
      // network error — silently ignore
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      {count > 0 && (
        <p className="text-center text-sm font-medium text-neutral-600">
          🙋 <span className="font-bold text-neutral-800">{count.toLocaleString()}</span>{" "}
          {count === 1 ? "person" : "people"} interested
        </p>
      )}
      <button
        onClick={handleTap}
        disabled={interested || loading}
        className={[
          "w-full rounded-xl px-5 py-3 text-sm font-bold transition-all",
          interested
            ? "cursor-default bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
            : "bg-ebh-green text-white hover:bg-ebh-green-dark active:scale-95",
          loading ? "opacity-60" : "",
        ].join(" ")}
      >
        {interested
          ? justTapped
            ? "🎉 You're in!"
            : "✓ Interested"
          : loading
          ? "…"
          : "🙋 I'm Interested"}
      </button>
    </div>
  );
}
