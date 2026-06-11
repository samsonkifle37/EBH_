"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES, CATEGORY_LABELS, CITIES, CITY_LABELS } from "@/lib/types";

export interface BusinessFormValues {
  name: string;
  category: string;
  city: string;
  address: string;
  postcode: string;
  phone: string;
  website: string;
  description: string;
  instagram: string;
  facebook: string;
  photoUrls: string[];
}

interface Props {
  businessId?: string; // present = edit mode
  initial?: Partial<BusinessFormValues>;
}

const inputCls =
  "w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-600";

export default function BusinessForm({ businessId, initial = {} }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const photoUrls = String(form.get("photoUrls") || "")
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    const body = {
      name: String(form.get("name") || ""),
      category: String(form.get("category") || ""),
      city: String(form.get("city") || ""),
      address: String(form.get("address") || ""),
      postcode: String(form.get("postcode") || ""),
      phone: String(form.get("phone") || ""),
      website: String(form.get("website") || ""),
      description: String(form.get("description") || ""),
      instagram: String(form.get("instagram") || ""),
      facebook: String(form.get("facebook") || ""),
      hoursPreset: String(form.get("hoursPreset") || "none"),
      photoUrls,
    };
    const res = await fetch(businessId ? `/api/businesses/${businessId}` : "/api/businesses", {
      method: businessId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      router.push("/dashboard");
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
        <input name="name" required minLength={2} defaultValue={initial.name} className={inputCls} placeholder="Abyssinia Restaurant" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Category *</label>
          <select name="category" required defaultValue={initial.category ?? ""} className={inputCls}>
            <option value="" disabled>Choose…</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">City *</label>
          <select name="city" required defaultValue={initial.city ?? ""} className={inputCls}>
            <option value="" disabled>Choose…</option>
            {CITIES.map((c) => (
              <option key={c} value={c}>{CITY_LABELS[c]}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
        <div>
          <label className="mb-1 block text-sm font-medium">Street address</label>
          <input name="address" defaultValue={initial.address} className={inputCls} placeholder="12 High Street" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Postcode</label>
          <input name="postcode" defaultValue={initial.postcode} className={inputCls} placeholder="N1 9DT" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Phone</label>
          <input name="phone" defaultValue={initial.phone} className={inputCls} placeholder="020 1234 5678" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Website</label>
          <input name="website" type="url" defaultValue={initial.website} className={inputCls} placeholder="https://…" />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Description</label>
        <textarea name="description" rows={4} maxLength={2000} defaultValue={initial.description} className={inputCls} placeholder="Tell customers what makes you special (80+ characters boosts your trust score)" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Instagram</label>
          <input name="instagram" defaultValue={initial.instagram} className={inputCls} placeholder="https://instagram.com/…" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Facebook</label>
          <input name="facebook" defaultValue={initial.facebook} className={inputCls} placeholder="https://facebook.com/…" />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Opening hours</label>
        <select name="hoursPreset" defaultValue="none" className={inputCls}>
          <option value="none">{businessId ? "Keep current hours" : "Not specified"}</option>
          <option value="restaurant">Restaurant (12:00–22:00, late weekends)</option>
          <option value="shop">Shop (9:00–19:00, 7 days)</option>
          <option value="office">Office (9:00–17:30, Mon–Fri)</option>
        </select>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Photo URLs (one per line, up to 8)</label>
        <textarea name="photoUrls" rows={3} defaultValue={(initial.photoUrls ?? []).join("\n")} className={inputCls} placeholder="https://…/photo1.jpg" />
      </div>
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <button disabled={busy} className="rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50">
        {busy ? "Saving…" : businessId ? "Save changes" : "Submit for approval"}
      </button>
      {!businessId && (
        <p className="text-xs text-neutral-400">New listings are reviewed by our team before going live.</p>
      )}
    </form>
  );
}
