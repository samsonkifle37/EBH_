"use client";

import { useState } from "react";
import { track } from "@/lib/analytics/client";
import type { TrustRow } from "@/lib/website";

/** Explainable, expandable Trust-Score breakdown. Answers "why should I trust
 * this business?" Fires TRUST_BREAKDOWN_VIEW the first time it's opened. */
export default function TrustBreakdown({ businessId, score, rows }: { businessId: string; score: number; rows: TrustRow[] }) {
  const [open, setOpen] = useState(false);
  const met = rows.filter((r) => r.met).length;

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4">
      <button
        onClick={() => {
          if (!open) track("TRUST_BREAKDOWN_VIEW", { businessId, dedupeKey: `trust:${businessId}` });
          setOpen((v) => !v);
        }}
        aria-expanded={open}
        className="flex min-h-11 w-full items-center justify-between gap-3 text-left"
      >
        <span className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-sm font-bold text-emerald-700">{score}</span>
          <span>
            <span className="block text-sm font-semibold text-ink">Why you can trust this business</span>
            <span className="block text-xs text-neutral-500">{met} of {rows.length} trust signals · Trust Score {score}/100</span>
          </span>
        </span>
        <span aria-hidden className={`shrink-0 text-neutral-400 transition ${open ? "rotate-180" : ""}`}>⌄</span>
      </button>

      {open && (
        <ul className="mt-4 space-y-2 border-t border-neutral-100 pt-4">
          {rows.map((r) => (
            <li key={r.label} className="flex items-start gap-2.5 text-sm">
              <span
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${r.met ? "bg-emerald-100 text-emerald-700" : "bg-neutral-100 text-neutral-400"}`}
                aria-hidden
              >
                {r.met ? "✓" : "–"}
              </span>
              <span>
                <span className={r.met ? "text-neutral-800" : "text-neutral-400"}>{r.label}</span>
                {r.hint && <span className="block text-xs text-neutral-400">{r.hint}</span>}
              </span>
            </li>
          ))}
          <li className="pt-1 text-xs text-neutral-400">Based on verified public data. Higher scores reflect more independent evidence.</li>
        </ul>
      )}
    </div>
  );
}
