"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Result {
  status: string;
  found: number;
  imported: number;
  duplicates: number;
  errors: string;
}

interface Props {
  type: "google_places" | "companies_house";
  presets: string[];
}

export default function ImportRunner({ type, presets }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [running, setRunning] = useState<string | null>(null);
  const [results, setResults] = useState<{ query: string; result: Result }[]>([]);

  async function run(q: string) {
    if (!q.trim() || running) return;
    setRunning(q);
    try {
      const res = await fetch("/api/admin/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, query: q }),
      });
      const result = (await res.json()) as Result;
      setResults((prev) => [{ query: q, result }, ...prev]);
      router.refresh();
    } finally {
      setRunning(null);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {presets.map((p) => (
          <button
            key={p}
            disabled={!!running}
            onClick={() => run(p)}
            className="rounded-full border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-600 transition hover:border-emerald-600 hover:text-emerald-700 disabled:opacity-50"
          >
            {running === p ? "Importing…" : p}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          run(query);
        }}
        className="flex gap-2"
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Custom search query…"
          className="w-full rounded-xl border border-neutral-300 px-4 py-2 text-sm focus:border-emerald-600 focus:outline-none"
        />
        <button
          disabled={!!running || !query.trim()}
          className="shrink-0 rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"
        >
          {running === query ? "Importing…" : "Run import"}
        </button>
      </form>

      {results.length > 0 && (
        <div className="space-y-2">
          {results.map((r, i) => (
            <div
              key={i}
              className={`rounded-xl border p-3 text-sm ${r.result.status === "failed" ? "border-red-200 bg-red-50 text-red-800" : "border-emerald-200 bg-emerald-50 text-emerald-900"}`}
            >
              <p className="font-semibold">“{r.query}” — {r.result.status}</p>
              {r.result.status === "failed" ? (
                <p className="mt-1 break-words text-xs">{r.result.errors}</p>
              ) : (
                <p className="mt-1 text-xs">
                  Found {r.result.found} · Imported {r.result.imported} (pending approval) · Duplicates {r.result.duplicates}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
