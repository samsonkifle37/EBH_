"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { CATEGORIES, CATEGORY_LABELS, CITIES, CITY_LABELS } from "@/lib/types";

export default function FilterBar() {
  const router = useRouter();
  const params = useSearchParams();

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`/businesses?${next.toString()}`);
  }

  const selectCls =
    "min-h-11 rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 outline-none focus:border-emerald-600";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        type="search"
        defaultValue={params.get("q") ?? ""}
        placeholder="Search…"
        aria-label="Search businesses"
        className="min-h-11 w-44 rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600"
        onKeyDown={(e) => {
          if (e.key === "Enter") setParam("q", e.currentTarget.value);
        }}
      />
      <select aria-label="Filter by category" className={selectCls} value={params.get("category") ?? ""} onChange={(e) => setParam("category", e.target.value)}>
        <option value="">All categories</option>
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
        ))}
      </select>
      <select aria-label="Filter by city" className={selectCls} value={params.get("city") ?? ""} onChange={(e) => setParam("city", e.target.value)}>
        <option value="">All cities</option>
        {CITIES.map((c) => (
          <option key={c} value={c}>{CITY_LABELS[c]}</option>
        ))}
      </select>
      <select aria-label="Filter by minimum rating" className={selectCls} value={params.get("minRating") ?? ""} onChange={(e) => setParam("minRating", e.target.value)}>
        <option value="">Any rating</option>
        <option value="4">4★ &amp; up</option>
        <option value="4.5">4.5★ &amp; up</option>
      </select>
      <label className="flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700">
        <input
          type="checkbox"
          checked={params.get("openNow") === "1"}
          onChange={(e) => setParam("openNow", e.target.checked ? "1" : "")}
          className="h-4 w-4 accent-emerald-700"
        />
        Open now
      </label>
      <label className="flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700">
        <input
          type="checkbox"
          checked={params.get("verified") === "1"}
          onChange={(e) => setParam("verified", e.target.checked ? "1" : "")}
          className="h-4 w-4 accent-emerald-700"
        />
        Verified only
      </label>
    </div>
  );
}
