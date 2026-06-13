"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES, CATEGORY_LABELS, CITIES, CITY_LABELS } from "@/lib/types";

const SOURCE_OPTIONS = [
  { value: "facebook_page", label: "Facebook page" },
  { value: "instagram", label: "Instagram" },
  { value: "community_referral", label: "Community referral" },
  { value: "flyer", label: "Flyer" },
  { value: "other", label: "Other" },
];

interface SessionItem {
  name: string;
  sourceType: string;
  slug: string;
  addedAt: string;
}

interface DupInfo {
  id: string;
  name: string;
  slug: string;
  reason: string;
}

const EMPTY = {
  businessName: "",
  sourceType: "facebook_page",
  sourceUrl: "",
  city: "",
  category: "",
  phone: "",
  website: "",
  notes: "",
};

export default function LeadCaptureForm() {
  const router = useRouter();
  const [form, setForm] = useState({ ...EMPTY });
  const [busy, setBusy] = useState(false);
  const [duplicate, setDuplicate] = useState<DupInfo | null>(null);
  const [error, setError] = useState("");
  const [added, setAdded] = useState<SessionItem[]>([]);

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(force: boolean) {
    if (!form.businessName.trim() || busy) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: form.businessName.trim(),
          sourceType: form.sourceType,
          sourceUrl: form.sourceUrl.trim(),
          city: form.city || undefined,
          category: form.category || undefined,
          phone: form.phone.trim(),
          website: form.website.trim(),
          notes: form.notes.trim(),
          force,
        }),
      });
      const data = await res.json();
      if (data.duplicate) {
        setDuplicate(data.duplicate);
        return;
      }
      if (data.error) {
        setError(data.error);
        return;
      }
      if (data.ok) {
        setAdded((prev) => [
          { name: data.business.name, sourceType: data.business.sourceType, slug: data.business.slug, addedAt: new Date().toLocaleTimeString("en-GB") },
          ...prev,
        ]);
        setForm({ ...EMPTY, sourceType: form.sourceType });
        setDuplicate(null);
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  }

  const input = "w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none";

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(false);
        }}
        className="space-y-4"
      >
        <div>
          <label className="text-xs font-semibold text-neutral-500">Business name *</label>
          <input autoFocus value={form.businessName} onChange={(e) => set("businessName", e.target.value)} className={input} placeholder="e.g. Selam Cafe" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs font-semibold text-neutral-500">Source type *</label>
            <select value={form.sourceType} onChange={(e) => set("sourceType", e.target.value)} className={input}>
              {SOURCE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-neutral-500">Source URL</label>
            <input value={form.sourceUrl} onChange={(e) => set("sourceUrl", e.target.value)} className={input} placeholder="https://facebook.com/…" />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs font-semibold text-neutral-500">City</label>
            <select value={form.city} onChange={(e) => set("city", e.target.value)} className={input}>
              <option value="">—</option>
              {CITIES.map((c) => (
                <option key={c} value={c}>{CITY_LABELS[c]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-neutral-500">Category</label>
            <select value={form.category} onChange={(e) => set("category", e.target.value)} className={input}>
              <option value="">—</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs font-semibold text-neutral-500">Phone</label>
            <input value={form.phone} onChange={(e) => set("phone", e.target.value)} className={input} placeholder="020 …" />
          </div>
          <div>
            <label className="text-xs font-semibold text-neutral-500">Website</label>
            <input value={form.website} onChange={(e) => set("website", e.target.value)} className={input} placeholder="https://…" />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-neutral-500">Notes</label>
          <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={2} className={input} placeholder="Where you found them, who referred, etc." />
        </div>

        {duplicate && (
          <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
            <p className="font-semibold">Potential duplicate found ({duplicate.reason.replace("_", " ")}).</p>
            <p className="mt-1">
              Matches{" "}
              <a href={`/business/${duplicate.slug}`} target="_blank" rel="noopener noreferrer" className="font-semibold underline">
                {duplicate.name}
              </a>
              .
            </p>
            <div className="mt-2 flex gap-2">
              <button type="button" onClick={() => submit(true)} disabled={busy} className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700 disabled:opacity-50">
                Add anyway
              </button>
              <button type="button" onClick={() => setDuplicate(null)} className="rounded-lg border border-amber-400 px-3 py-1.5 text-xs font-semibold text-amber-800">
                Cancel
              </button>
            </div>
          </div>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button disabled={busy || !form.businessName.trim()} className="rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50">
          {busy ? "Saving…" : "Add lead (pending)"}
        </button>
      </form>

      <aside>
        <h2 className="text-sm font-bold text-neutral-900">Added this session ({added.length})</h2>
        {added.length === 0 ? (
          <p className="mt-2 text-sm text-neutral-400">Nothing yet. Added leads appear here so you don&apos;t enter them twice.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {added.map((a, i) => (
              <li key={i} className="rounded-xl border border-neutral-200 bg-white p-3 text-sm">
                <a href={`/business/${a.slug}`} target="_blank" rel="noopener noreferrer" className="font-semibold text-neutral-900 hover:text-emerald-700">{a.name}</a>
                <p className="mt-0.5 text-xs text-neutral-400">{a.sourceType.replace("_", " ")} · {a.addedAt} · PENDING</p>
              </li>
            ))}
          </ul>
        )}
      </aside>
    </div>
  );
}
