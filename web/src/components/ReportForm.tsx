"use client";

import { useState } from "react";
import { REPORT_REASONS } from "@/lib/report";

export default function ReportForm({ businessId, businessName, signedIn }: { businessId?: string; businessName?: string; signedIn: boolean }) {
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reason: String(form.get("reason") || ""),
        details: String(form.get("details") || ""),
        reporterEmail: String(form.get("reporterEmail") || ""),
        businessId: businessId ?? undefined,
      }),
    });
    if (res.ok) {
      setDone(true);
      return;
    }
    const data = await res.json().catch(() => ({}));
    setError(data.error ?? "Something went wrong. Please try again.");
    setBusy(false);
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <p className="text-2xl" aria-hidden>✅</p>
        <h2 className="mt-2 text-lg font-bold text-emerald-900">Thank you — report received</h2>
        <p className="mt-1 text-sm text-emerald-800">
          Our team will review this. Safety, impersonation and fraud reports are prioritised. You don&rsquo;t need to do anything else.
        </p>
      </div>
    );
  }

  const inputCls = "min-h-11 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-600";

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {businessName && (
        <p className="rounded-xl bg-neutral-100 px-3 py-2 text-sm text-neutral-600">
          Reporting: <span className="font-semibold text-ink">{businessName}</span>
        </p>
      )}
      <div>
        <label htmlFor="reason" className="mb-1 block text-sm font-medium">What&rsquo;s the problem? *</label>
        <select id="reason" name="reason" required defaultValue="" className={inputCls}>
          <option value="" disabled>Choose a reason…</option>
          {REPORT_REASONS.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="details" className="mb-1 block text-sm font-medium">Details</label>
        <textarea id="details" name="details" rows={4} maxLength={2000} className={inputCls} placeholder="Tell us what&rsquo;s wrong so we can act on it." />
      </div>
      {!signedIn && (
        <div>
          <label htmlFor="reporterEmail" className="mb-1 block text-sm font-medium">Your email (optional)</label>
          <input id="reporterEmail" name="reporterEmail" type="email" autoComplete="email" className={inputCls} placeholder="So we can follow up — you can report anonymously" />
          <p className="mt-1 text-xs text-neutral-400">Reporting anonymously is fine. Signing in helps us follow up with you.</p>
        </div>
      )}
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{error}</p>}
      <button disabled={busy} className="inline-flex min-h-11 items-center rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50">
        {busy ? "Submitting…" : "Submit report"}
      </button>
    </form>
  );
}
