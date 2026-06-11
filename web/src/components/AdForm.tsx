"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AD_PLACEMENTS } from "@/lib/types";

const inputCls =
  "w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-600";

export default function AdForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/admin/ads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "create",
        placement: String(form.get("placement") || ""),
        headline: String(form.get("headline") || ""),
        body: String(form.get("body") || ""),
        targetUrl: String(form.get("targetUrl") || ""),
        imageUrl: String(form.get("imageUrl") || ""),
      }),
    });
    if (res.ok) {
      (e.target as HTMLFormElement).reset?.();
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong");
    }
    setBusy(false);
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-2xl border border-neutral-200 bg-white p-5 sm:grid-cols-2">
      <div>
        <label className="mb-1 block text-sm font-medium">Placement</label>
        <select name="placement" required className={inputCls}>
          {AD_PLACEMENTS.map((p) => (
            <option key={p} value={p}>{p.replace("_", " ")}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Headline</label>
        <input name="headline" required minLength={3} className={inputCls} placeholder="Fly to Addis from £499" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Body (optional)</label>
        <input name="body" className={inputCls} placeholder="Short supporting line" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Target URL</label>
        <input name="targetUrl" required className={inputCls} placeholder="/business/selam-travel or https://…" />
      </div>
      <div className="sm:col-span-2">
        <label className="mb-1 block text-sm font-medium">Image URL (optional)</label>
        <input name="imageUrl" type="url" className={inputCls} placeholder="https://…/banner.jpg" />
      </div>
      {error && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}
      <div className="sm:col-span-2">
        <button disabled={busy} className="rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50">
          {busy ? "Creating…" : "Create campaign"}
        </button>
      </div>
    </form>
  );
}
