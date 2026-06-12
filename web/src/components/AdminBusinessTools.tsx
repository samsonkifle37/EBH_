"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES, CITIES, CATEGORY_LABELS, CITY_LABELS } from "@/lib/types";

interface Props {
  businessId: string;
  category: string;
  city: string;
  mergeTargets: { id: string; name: string }[];
}

export default function AdminBusinessTools({ businessId, category, city, mergeTargets }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function post(body: Record<string, unknown>) {
    setBusy(true);
    await fetch(`/api/admin/businesses/${businessId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    router.refresh();
    setBusy(false);
  }

  const select = "rounded-lg border border-neutral-300 px-2 py-1 text-xs text-neutral-600 focus:border-emerald-600 focus:outline-none disabled:opacity-50";

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <select
        disabled={busy}
        value={category}
        onChange={(e) => post({ action: "setCategory", category: e.target.value })}
        className={select}
        title="Category"
      >
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
        ))}
      </select>
      <select
        disabled={busy}
        value={city}
        onChange={(e) => post({ action: "setCity", city: e.target.value })}
        className={select}
        title="City"
      >
        {CITIES.map((c) => (
          <option key={c} value={c}>{CITY_LABELS[c]}</option>
        ))}
      </select>
      <select
        disabled={busy}
        value=""
        onChange={(e) => {
          if (e.target.value && confirm("Merge this listing into the selected one? This cannot be undone.")) {
            post({ action: "merge", intoId: e.target.value });
          }
          e.target.value = "";
        }}
        className={select}
        title="Merge duplicate into…"
      >
        <option value="">Merge into…</option>
        {mergeTargets.map((t) => (
          <option key={t.id} value={t.id}>{t.name}</option>
        ))}
      </select>
    </div>
  );
}
