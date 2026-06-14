import Link from "next/link";
import { requireAdminPage } from "@/lib/adminGuard";
import { getRevenueSnapshot, gbp } from "@/lib/revenue";

export const metadata = { title: "Admin — Revenue" };

function Card({ label, value, hint, big = false }: { label: string; value: string; hint?: string; big?: boolean }) {
  return (
    <div className={`rounded-2xl border border-neutral-200 bg-white p-5 ${big ? "sm:col-span-2" : ""}`}>
      <p className={`font-bold tracking-tight text-neutral-900 ${big ? "text-3xl" : "text-2xl"}`}>{value}</p>
      <p className="mt-0.5 text-xs font-medium text-neutral-500">{label}</p>
      {hint && <p className="mt-1 text-xs text-neutral-400">{hint}</p>}
    </div>
  );
}

export default async function RevenuePage() {
  await requireAdminPage();
  const r = await getRevenueSnapshot();
  const noData = r.totalRevenuePence === 0 && r.mrrPence === 0;

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <nav className="text-sm text-neutral-400">
        <Link href="/admin" className="hover:text-emerald-700">Admin</Link> / <span className="text-neutral-600">Revenue</span>
      </nav>
      <h1 className="mt-2 text-2xl font-bold tracking-tight">Revenue</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Live figures from the database. {noData && "No billing is active yet — these populate once Stripe (Milestone B) is enabled."}
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card label="Total revenue" value={gbp(r.totalRevenuePence)} big />
        <Card label="MRR" value={gbp(r.mrrPence)} />
        <Card label="ARR" value={gbp(r.arrPence)} />
      </div>

      <h2 className="mt-8 text-sm font-bold uppercase tracking-wide text-neutral-400">Subscribers</h2>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card label="Verified subscribers" value={String(r.verifiedSubscribers)} />
        <Card label="Featured subscribers" value={String(r.featuredSubscribers)} />
        <Card label="AI Toolkit subscribers" value={String(r.aiSubscribers)} />
        <Card label="Subscription revenue" value={gbp(r.subscriptionRevenuePence)} />
      </div>

      <h2 className="mt-8 text-sm font-bold uppercase tracking-wide text-neutral-400">Revenue by stream</h2>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card label="Claim revenue" value={gbp(r.claimRevenuePence)} />
        <Card label="Event promotion" value={gbp(r.eventRevenuePence)} />
        <Card label="Ad revenue" value={gbp(r.adRevenuePence)} />
        <Card label="AI toolkit" value={gbp(r.aiRevenuePence)} />
      </div>
    </main>
  );
}
