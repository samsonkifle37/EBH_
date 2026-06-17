"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES, CATEGORY_LABELS, CITIES, CITY_LABELS } from "@/lib/types";
import ImageUploadField from "@/components/ImageUploadField";
import ImageUploadList from "@/components/ImageUploadList";

export interface SignatureItemValue {
  title: string;
  description: string;
  imageUrl: string;
}

export interface ServiceValue {
  name: string;
  description: string;
  priceRange: string;
  imageUrl: string;
}

export interface FaqValue {
  question: string;
  answer: string;
}

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
  coverImageUrl: string;
  logoUrl: string;
  founderName: string;
  founderPhotoUrl: string;
  founderStory: string;
  brandStory: string;
  yearFounded: number | null;
  signatureItems: SignatureItemValue[];
  whatsapp: string;
  services: ServiceValue[];
  faqs: FaqValue[];
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
      coverImageUrl: String(form.get("coverImageUrl") || ""),
      logoUrl: String(form.get("logoUrl") || ""),
      founderName: String(form.get("founderName") || ""),
      founderPhotoUrl: String(form.get("founderPhotoUrl") || ""),
      founderStory: String(form.get("founderStory") || ""),
      brandStory: String(form.get("brandStory") || ""),
      yearFounded: form.get("yearFounded") ? Number(form.get("yearFounded")) : null,
      signatureItems: [0, 1, 2]
        .map((i) => ({
          title: String(form.get(`sig${i}title`) || ""),
          imageUrl: String(form.get(`sig${i}img`) || ""),
          description: String(form.get(`sig${i}desc`) || ""),
        }))
        .filter((s) => s.title || s.imageUrl),
      whatsapp: String(form.get("whatsapp") || ""),
      services: [0, 1, 2, 3]
        .map((i) => ({
          name: String(form.get(`svc${i}name`) || ""),
          priceRange: String(form.get(`svc${i}price`) || ""),
          description: String(form.get(`svc${i}desc`) || ""),
          imageUrl: String(form.get(`svc${i}img`) || ""),
        }))
        .filter((s) => s.name.trim()),
      faqs: [0, 1, 2, 3]
        .map((i) => ({
          question: String(form.get(`faq${i}q`) || ""),
          answer: String(form.get(`faq${i}a`) || ""),
        }))
        .filter((f) => f.question.trim() && f.answer.trim()),
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
      <ImageUploadList name="photoUrls" businessId={businessId} initialUrls={initial.photoUrls ?? []} />

      {/* Boutique profile — the story that makes owners proud to share */}
      <fieldset className="space-y-4 rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4">
        <legend className="px-1 text-sm font-bold text-emerald-900">Your story — make your profile shine ✨</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <ImageUploadField name="coverImageUrl" kind="cover" businessId={businessId} initialUrl={initial.coverImageUrl} label="Cover image" aspect="aspect-[3/1]" />
          <ImageUploadField name="logoUrl" kind="logo" businessId={businessId} initialUrl={initial.logoUrl} label="Logo" aspect="aspect-square" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Founder name</label>
            <input name="founderName" defaultValue={initial.founderName} className={inputCls} placeholder="Who runs the business?" />
          </div>
          <ImageUploadField name="founderPhotoUrl" kind="founder" businessId={businessId} initialUrl={initial.founderPhotoUrl} label="Founder photo" aspect="aspect-square" />

        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Founder story</label>
          <textarea name="founderStory" rows={3} maxLength={2000} defaultValue={initial.founderStory} className={inputCls} placeholder="Why did you start? What are you proud of?" />
        </div>
        <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
          <div>
            <label className="mb-1 block text-sm font-medium">Brand story</label>
            <textarea name="brandStory" rows={3} maxLength={2000} defaultValue={initial.brandStory} className={inputCls} placeholder="What do you do and what makes you special?" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Year founded</label>
            <input name="yearFounded" type="number" min={1800} max={2100} defaultValue={initial.yearFounded ?? undefined} className={inputCls} placeholder="2015" />
          </div>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium">Signature offerings (up to 3)</label>
          {[0, 1, 2].map((i) => {
            const s = initial.signatureItems?.[i];
            return (
              <div key={i} className="grid gap-2 sm:grid-cols-3">
                <input name={`sig${i}title`} defaultValue={s?.title} className={inputCls} placeholder={`Item ${i + 1} name`} />
                <input name={`sig${i}img`} defaultValue={s?.imageUrl} className={inputCls} placeholder="Image URL" />
                <input name={`sig${i}desc`} defaultValue={s?.description} className={inputCls} placeholder="Short description" />
              </div>
            );
          })}
        </div>
      </fieldset>

      {/* Website essentials — what turns a listing into a usable website */}
      <fieldset className="space-y-4 rounded-2xl border border-amber-100 bg-amber-50/40 p-4">
        <legend className="px-1 text-sm font-bold text-amber-900">Your website essentials 🌐</legend>
        <div>
          <label className="mb-1 block text-sm font-medium">WhatsApp number</label>
          <input name="whatsapp" defaultValue={initial.whatsapp} className={inputCls} placeholder="07911 123456 — becomes a click-to-chat button" />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium">Services (up to 4)</label>
          {[0, 1, 2, 3].map((i) => {
            const s = initial.services?.[i];
            return (
              <div key={i} className="grid gap-2 sm:grid-cols-[1fr_110px_1fr_1fr]">
                <input name={`svc${i}name`} defaultValue={s?.name} className={inputCls} placeholder={`Service ${i + 1}`} />
                <input name={`svc${i}price`} defaultValue={s?.priceRange} className={inputCls} placeholder="£ from" />
                <input name={`svc${i}desc`} defaultValue={s?.description} className={inputCls} placeholder="Short description" />
                <input name={`svc${i}img`} defaultValue={s?.imageUrl} className={inputCls} placeholder="Image URL" />
              </div>
            );
          })}
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium">FAQs (up to 4)</label>
          {[0, 1, 2, 3].map((i) => {
            const f = initial.faqs?.[i];
            return (
              <div key={i} className="grid gap-2 sm:grid-cols-2">
                <input name={`faq${i}q`} defaultValue={f?.question} className={inputCls} placeholder={`Question ${i + 1}`} />
                <input name={`faq${i}a`} defaultValue={f?.answer} className={inputCls} placeholder="Answer" />
              </div>
            );
          })}
        </div>
      </fieldset>

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
