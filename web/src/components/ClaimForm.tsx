"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ClaimForm({ businessId, defaultName }: { businessId: string; defaultName: string }) {
  const router = useRouter();
  const [form, setForm] = useState({ claimantName: defaultName, claimantEmail: "", claimantPhone: "", founderName: defaultName, founderStory: "", evidenceUrl: "", notes: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId, ...form }),
      });
      const data = await res.json();
      if (data.ok) {
        setDone(true);
        router.refresh();
      } else {
        setError(data.error ?? "Something went wrong");
      }
    } finally {
      setBusy(false);
    }
  }

  const input = "w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none";

  if (done) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-sm text-emerald-900">
        <p className="font-semibold">Claim submitted ✓</p>
        <p className="mt-1">
          Our team will review your evidence and get back to you. You&apos;ll become the owner once it&apos;s approved —
          there&apos;s nothing to pay right now.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="text-xs font-semibold text-neutral-500">Your name *</label>
        <input value={form.claimantName} onChange={(e) => set("claimantName", e.target.value)} className={input} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-xs font-semibold text-neutral-500">Email *</label>
          <input type="email" value={form.claimantEmail} onChange={(e) => set("claimantEmail", e.target.value)} className={input} placeholder="you@business.co.uk" />
        </div>
        <div>
          <label className="text-xs font-semibold text-neutral-500">Phone</label>
          <input value={form.claimantPhone} onChange={(e) => set("claimantPhone", e.target.value)} className={input} />
        </div>
      </div>
      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4">
        <p className="text-sm font-semibold text-emerald-900">Your founder story</p>
        <p className="mt-0.5 text-xs text-emerald-800">This is the heart of your profile — customers connect with the person behind the business.</p>
        <div className="mt-3 space-y-3">
          <div>
            <label className="text-xs font-semibold text-neutral-500">Founder name *</label>
            <input value={form.founderName} onChange={(e) => set("founderName", e.target.value)} className={input} placeholder="Who runs the business?" />
          </div>
          <div>
            <label className="text-xs font-semibold text-neutral-500">Why did you start this business? *</label>
            <textarea value={form.founderStory} onChange={(e) => set("founderStory", e.target.value)} rows={4} className={input} placeholder="Tell your story in a few sentences — what inspired you, what you're proud of…" />
            <p className="mt-1 text-xs text-neutral-400">{form.founderStory.trim().length}/40 characters minimum</p>
          </div>
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-neutral-500">Evidence URL</label>
        <input value={form.evidenceUrl} onChange={(e) => set("evidenceUrl", e.target.value)} className={input} placeholder="Link proving ownership — website, social page, listing…" />
      </div>
      <div>
        <label className="text-xs font-semibold text-neutral-500">Message</label>
        <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={3} className={input} placeholder="Anything that helps us verify you own this business" />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button disabled={busy || !form.claimantName.trim() || !form.claimantEmail.trim() || !form.founderName.trim() || form.founderStory.trim().length < 40} className="rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50">
        {busy ? "Submitting…" : "Submit claim"}
      </button>
      <p className="text-xs text-neutral-400">Free to submit. No payment required while we verify ownership.</p>
    </form>
  );
}
