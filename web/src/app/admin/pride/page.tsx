import Link from "next/link";
import { requireAdminPage } from "@/lib/adminGuard";
import { getAdminPride } from "@/lib/analytics/prideMetrics";
import { CATEGORY_LABELS, CITY_LABELS, isCategory, isCity, type Category, type City } from "@/lib/types";

export const metadata = { title: "Admin — Pride & Sharing" };

function Card({ label, value, hint, big = false }: { label: string; value: string; hint?: string; big?: boolean }) {
  return (
    <div className={`rounded-2xl border border-neutral-200 bg-white p-5 ${big ? "sm:col-span-2" : ""}`}>
      <p className={`font-bold tracking-tight text-neutral-900 ${big ? "text-4xl" : "text-2xl"}`}>{value}</p>
      <p className="mt-0.5 text-xs font-medium text-neutral-500">{label}</p>
      {hint && <p className="mt-1 text-xs text-neutral-400">{hint}</p>}
    </div>
  );
}

function SegmentTable({ title, rows, labeller }: { title: string; rows: { key: string; total: number; shared: number; rate: number }[]; labeller: (k: string) => string }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5">
      <h2 className="text-sm font-bold text-neutral-700">{title}</h2>
      {rows.length === 0 ? (
        <p className="mt-2 text-sm text-neutral-400">Not enough claimed businesses yet.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {rows.slice(0, 8).map((r) => (
            <li key={r.key}>
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-700">{labeller(r.key)}</span>
                <span className="font-semibold text-neutral-500">{r.rate}% · {r.shared}/{r.total}</span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
                <div className="h-full rounded-full bg-emerald-600" style={{ width: `${Math.min(100, r.rate)}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default async function AdminPridePage() {
  await requireAdminPage();
  const p = await getAdminPride();

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <nav className="text-sm text-neutral-400">
        <Link href="/admin" className="hover:text-emerald-700">Admin</Link> / <span className="text-neutral-600">Pride &amp; Sharing</span>
      </nav>
      <h1 className="mt-2 text-2xl font-bold tracking-tight">Pride &amp; Sharing</h1>
      <p className="mt-1 text-sm text-neutral-500">
        North-Star: <span className="font-semibold">Share Rate</span> — claimed businesses that have shared their profile at least once.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card label="Share Rate (North-Star)" value={`${p.platform.shareRate}%`} hint={`${p.platform.claimedWithShare} of ${p.platform.claimedTotal} claimed`} big />
        <Card label="Shares per claimed business" value={String(p.sharesPerClaimed)} />
        <Card label="Median days: claim → first share" value={p.medianDaysToFirstShare == null ? "—" : String(p.medianDaysToFirstShare)} />
      </div>

      <h2 className="mt-8 text-sm font-bold uppercase tracking-wide text-neutral-400">Does completion &amp; trust drive sharing?</h2>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card label="Avg completion — sharers" value={`${p.completionSharers}%`} />
        <Card label="Avg completion — non-sharers" value={`${p.completionNonSharers}%`} />
        <Card label="Avg trust — sharers" value={String(p.trustSharers)} />
        <Card label="Avg trust — non-sharers" value={String(p.trustNonSharers)} />
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <SegmentTable title="Share Rate by city" rows={p.byCity} labeller={(k) => (isCity(k) ? CITY_LABELS[k as City] : k)} />
        <SegmentTable title="Share Rate by category" rows={p.byCategory} labeller={(k) => (isCategory(k) ? CATEGORY_LABELS[k as Category] : k)} />
      </div>

      <p className="mt-6 text-xs text-neutral-400">
        All figures derive from the canonical <code>PrideEvent</code> stream. A &ldquo;share&rdquo; means a real distribution (download, copy link, WhatsApp, Instagram or QR scan) — opening the kit or generating an image is tracked separately as intent.
      </p>
    </main>
  );
}
