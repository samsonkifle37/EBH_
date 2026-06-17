"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES, CATEGORY_LABELS } from "@/lib/types";
import LocationInput from "@/components/LocationInput";
import ImageUploadField from "@/components/ImageUploadField";

const SOURCES: [string, string][] = [
  ["admin_created", "Admin created"],
  ["google_places", "Google Places"],
  ["companies_house", "Companies House"],
  ["openstreetmap", "OpenStreetMap"],
  ["community_referral", "Community referral"],
  ["facebook_page", "Facebook page"],
  ["instagram", "Instagram"],
  ["flyer", "Flyer"],
  ["other", "Other"],
];

const inputCls = "w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-600";

export default function AdminBusinessCreateForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const f = new FormData(e.currentTarget);
    const body = {
      name: String(f.get("name") || ""),
      category: String(f.get("category") || ""),
      city: String(f.get("city") || ""),
      county: String(f.get("cityCounty") || ""),
      region: String(f.get("cityRegion") || ""),
      country: String(f.get("cityCountry") || "United Kingdom"),
      address: String(f.get("address") || ""),
      postcode: String(f.get("postcode") || ""),
      phone: String(f.get("phone") || ""),
      website: String(f.get("website") || ""),
      description: String(f.get("description") || ""),
      coverImageUrl: String(f.get("coverImageUrl") || ""),
      logoUrl: String(f.get("logoUrl") || ""),
      sourceType: String(f.get("sourceType") || "admin_created"),
      autoApprove: f.get("autoApprove") === "on",
      ownerEmail: String(f.get("ownerEmail") || ""),
    };
    const res = await fetch("/api/admin/businesses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      router.push(`/admin/business/${data.id}`);
      router.refresh();
    } else {
      setError(data.error ?? "Something went wrong");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Business name *</label>
        <input name="name" required minLength={2} className={inputCls} placeholder="Abyssinia Restaurant" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Category *</label>
          <select name="category" required defaultValue="" className={inputCls}>
            <option value="" disabled>Choose…</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
          </select>
        </div>
        <LocationInput name="city" label="City / town *" required />
      </div>
      <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
        <div>
          <label className="mb-1 block text-sm font-medium">Street address</label>
          <input name="address" className={inputCls} placeholder="12 High Street" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Postcode</label>
          <input name="postcode" className={inputCls} placeholder="N1 9DT" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Phone</label>
          <input name="phone" className={inputCls} placeholder="020 1234 5678" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Website</label>
          <input name="website" type="url" className={inputCls} placeholder="https://…" />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Description</label>
        <textarea name="description" rows={3} maxLength={2000} className={inputCls} placeholder="What the business does." />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <ImageUploadField name="coverImageUrl" kind="cover" label="Cover image" aspect="aspect-[3/1]" />
        <ImageUploadField name="logoUrl" kind="logo" label="Logo" aspect="aspect-square" />
      </div>

      <fieldset className="space-y-3 rounded-2xl border border-neutral-200 bg-neutral-50/60 p-4">
        <legend className="px-1 text-sm font-bold text-neutral-700">Admin options</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Trust source</label>
            <select name="sourceType" defaultValue="admin_created" className={inputCls}>
              {SOURCES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Assign owner (email, optional)</label>
            <input name="ownerEmail" type="email" className={inputCls} placeholder="owner@example.com — leave blank for unclaimed" />
          </div>
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
          <input type="checkbox" name="autoApprove" className="h-4 w-4 accent-emerald-700" />
          Auto-approve (publish immediately). Leave off to create as pending and preview before publishing.
        </label>
      </fieldset>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <button disabled={busy} className="rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50">
        {busy ? "Creating…" : "Create business"}
      </button>
    </form>
  );
}
