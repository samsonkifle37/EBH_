"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

/** Quick search for the admin businesses queue. Preserves the active filter
 * chip, writes ?q= to the URL (back/forward restores it), and offers Clear. */
export default function AdminBusinessSearch() {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const filter = params.get("filter");

  function go(value: string) {
    const p = new URLSearchParams();
    if (filter) p.set("filter", filter);
    if (value.trim()) p.set("q", value.trim());
    const qs = p.toString();
    router.push(`/admin/businesses${qs ? `?${qs}` : ""}`);
  }

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); go(q); }}
      role="search"
      className="mt-4 flex items-center gap-2"
    >
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        aria-label="Search businesses by name, city, category, source, phone, website or status"
        placeholder="Search name, city, category, source, phone, website, status…"
        className="min-h-11 w-full max-w-md rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600"
      />
      <button type="submit" className="min-h-11 shrink-0 rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800">
        Search
      </button>
      {q && (
        <button
          type="button"
          onClick={() => { setQ(""); go(""); }}
          className="min-h-11 shrink-0 rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-600 hover:border-emerald-600 hover:text-emerald-700"
        >
          Clear
        </button>
      )}
    </form>
  );
}
