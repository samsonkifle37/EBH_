"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ReviewForm({ businessId, businessSlug }: { businessId: string; businessSlug: string }) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (rating === 0) {
      setError("Please choose a star rating");
      return;
    }
    setBusy(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const res = await fetch(`/api/businesses/${businessId}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rating,
        title: String(form.get("title") || ""),
        body: String(form.get("body") || ""),
      }),
    });
    if (res.ok) {
      router.push(`/business/${businessSlug}`);
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <p className="mb-2 text-sm font-medium">Your rating</p>
        <div className="flex gap-1 text-3xl">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
              className={n <= rating ? "text-amber-500" : "text-neutral-300 hover:text-amber-300"}
            >
              ★
            </button>
          ))}
        </div>
      </div>
      <div>
        <label htmlFor="title" className="mb-1 block text-sm font-medium">Title (optional)</label>
        <input id="title" name="title" maxLength={80} className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-600" placeholder="Sum up your experience" />
      </div>
      <div>
        <label htmlFor="body" className="mb-1 block text-sm font-medium">Your review</label>
        <textarea id="body" name="body" required minLength={10} maxLength={2000} rows={5} className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-600" placeholder="What did you like? What could be better? (10–2000 characters)" />
      </div>
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <button disabled={busy} className="rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50">
        {busy ? "Posting…" : "Post review"}
      </button>
    </form>
  );
}
