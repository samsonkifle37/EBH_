import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdminPage } from "@/lib/adminGuard";
import { gbp } from "@/lib/revenue";

export const metadata = { title: "Admin — Event Promotions" };

const PACKAGES = [
  { tier: "Bronze", blurb: "Listing boost in event search", price: "£25" },
  { tier: "Silver", blurb: "Category + city placement", price: "£75" },
  { tier: "Gold", blurb: "Homepage placement, featured status, email promotion", price: "£250" },
];

export default async function EventPromotionsPage() {
  await requireAdminPage();
  const promotions = await db.eventPromotion.findMany({ orderBy: { createdAt: "desc" }, take: 200 });

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <nav className="text-sm text-neutral-400">
        <Link href="/admin" className="hover:text-emerald-700">Admin</Link> / <span className="text-neutral-600">Event Promotions</span>
      </nav>
      <h1 className="mt-2 text-2xl font-bold tracking-tight">Event Promotions</h1>
      <p className="mt-1 text-sm text-neutral-500">Bronze / Silver / Gold packages. Purchasing goes live with Stripe (Milestone B).</p>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {PACKAGES.map((p) => (
          <div key={p.tier} className="rounded-2xl border border-neutral-200 bg-white p-5">
            <p className="font-bold text-neutral-900">{p.tier}</p>
            <p className="mt-1 text-2xl font-bold tracking-tight">{p.price}</p>
            <p className="mt-1 text-sm text-neutral-500">{p.blurb}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-8 text-sm font-bold uppercase tracking-wide text-neutral-400">Active & past promotions</h2>
      {promotions.length === 0 ? (
        <div className="mt-3 rounded-2xl border border-dashed border-neutral-300 bg-white p-8 text-center">
          <p className="text-sm font-semibold text-neutral-700">No event promotions yet.</p>
          <p className="mt-1 text-sm text-neutral-500">Organisers can purchase packages once billing is enabled.</p>
        </div>
      ) : (
        <ul className="mt-3 space-y-2">
          {promotions.map((p) => (
            <li key={p.id} className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm">
              <span className="font-medium text-neutral-800">{p.packageTier}</span>
              <span className="text-neutral-500">{gbp(p.amount)} · {p.status} · {p.impressions} impressions / {p.clicks} clicks</span>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
