"use client";

import { useState } from "react";
import type { FaqEntry } from "@/lib/website";

/** Collapsible per-business FAQ. (FAQPage JSON-LD is emitted server-side.) */
export default function BusinessFaq({ faqs }: { faqs: FaqEntry[] }) {
  const [open, setOpen] = useState<number | null>(0);
  if (faqs.length === 0) return null;

  return (
    <section className="mt-10">
      <h2 className="text-sm font-bold uppercase tracking-wide text-neutral-400">Frequently asked questions</h2>
      <ul className="mt-4 divide-y divide-neutral-200 overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        {faqs.map((f, i) => {
          const isOpen = open === i;
          return (
            <li key={i}>
              <h3>
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex min-h-11 w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold text-ink hover:bg-neutral-50"
                >
                  <span>{f.question}</span>
                  <span aria-hidden className={`shrink-0 text-neutral-400 transition ${isOpen ? "rotate-180" : ""}`}>⌄</span>
                </button>
              </h3>
              {isOpen && <p className="px-5 pb-5 text-sm leading-relaxed text-neutral-600">{f.answer}</p>}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
