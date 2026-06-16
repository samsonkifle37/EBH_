"use client";

import { useMemo, useState } from "react";
import { track } from "@/lib/analytics/client";

export interface HelpArticle {
  id: string;
  topic: string;
  q: string;
  a: string;
}

export default function HelpCenter({ articles }: { articles: HelpArticle[] }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return articles;
    return articles.filter((a) => `${a.q} ${a.a} ${a.topic}`.toLowerCase().includes(q));
  }, [articles, query]);

  function toggle(id: string) {
    setOpen((cur) => (cur === id ? null : id));
    if (open !== id) track("HELP_ARTICLE_VIEW", { dedupeKey: `help:${id}` });
  }

  return (
    <div>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Search help articles"
        placeholder="Search help…"
        className="min-h-11 w-full rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-600"
      />

      {filtered.length === 0 ? (
        <p className="mt-6 text-sm text-neutral-500">
          No articles match &ldquo;{query}&rdquo;. Try different words or <a href="/contact" className="text-emerald-700 underline">contact support</a>.
        </p>
      ) : (
        <ul className="mt-6 divide-y divide-neutral-200 overflow-hidden rounded-2xl border border-neutral-200 bg-white">
          {filtered.map((a) => {
            const isOpen = open === a.id;
            return (
              <li key={a.id}>
                <h3>
                  <button
                    onClick={() => toggle(a.id)}
                    aria-expanded={isOpen}
                    className="flex min-h-11 w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold text-ink hover:bg-neutral-50"
                  >
                    <span>{a.q}</span>
                    <span aria-hidden className={`shrink-0 text-neutral-400 transition ${isOpen ? "rotate-180" : ""}`}>⌄</span>
                  </button>
                </h3>
                {isOpen && <div className="px-5 pb-5 text-sm leading-relaxed text-neutral-600" dangerouslySetInnerHTML={{ __html: a.a }} />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
