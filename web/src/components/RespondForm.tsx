"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RespondForm({ reviewId, existing }: { reviewId: string; existing: string | null }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-xs font-semibold text-emerald-700 hover:underline">
        {existing ? "Edit response" : "Respond publicly"}
      </button>
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const res = await fetch(`/api/reviews/${reviewId}/respond`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ response: String(form.get("response") || "") }),
    });
    if (res.ok) {
      setOpen(false);
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong");
    }
    setBusy(false);
  }

  return (
    <form onSubmit={onSubmit} className="mt-2 space-y-2">
      <textarea
        name="response"
        rows={3}
        required
        minLength={2}
        maxLength={1000}
        defaultValue={existing ?? ""}
        className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-emerald-600"
        placeholder="Thank the customer or address their feedback…"
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button disabled={busy} className="rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-800 disabled:opacity-50">
          {busy ? "Posting…" : "Post response"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="rounded-lg px-3 py-1.5 text-xs font-semibold text-neutral-500 hover:bg-neutral-100">
          Cancel
        </button>
      </div>
    </form>
  );
}
