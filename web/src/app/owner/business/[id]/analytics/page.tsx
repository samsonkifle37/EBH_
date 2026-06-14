import Link from "next/link";
import { requireOwner, getOwnedBusiness } from "@/lib/ownerGuard";
import { rollupDaily } from "@/lib/analytics/rollup";
import { getBusinessAnalytics } from "@/lib/analytics/summary";
import AnalyticsCards from "@/components/AnalyticsCards";
import TrendChart from "@/components/TrendChart";

export const metadata = { title: "Listing analytics" };

const PERIODS = [7, 30, 90] as const;

export default async function OwnerAnalytics({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ days?: string }>;
}) {
  const { id } = await params;
  const { days: daysParam } = await searchParams;
  const days = PERIODS.includes(Number(daysParam) as (typeof PERIODS)[number]) ? Number(daysParam) : 30;
  const session = await requireOwner(`/owner/business/${id}/analytics`);
  const business = await getOwnedBusiness(id, session.userId);

  await rollupDaily({ businessId: id });
  const a = await getBusinessAnalytics(id, days);

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <nav className="text-sm text-neutral-400">
        <Link href="/owner" className="hover:text-emerald-700">Owner</Link> /{" "}
        <Link href={`/owner/business/${id}`} className="hover:text-emerald-700">{business.name}</Link> /{" "}
        <span className="text-neutral-600">Analytics</span>
      </nav>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight">Performance</h1>
        <div className="flex gap-1.5">
          {PERIODS.map((p) => (
            <Link
              key={p}
              href={`/owner/business/${id}/analytics?days=${p}`}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${days === p ? "bg-emerald-700 text-white" : "border border-neutral-300 text-neutral-600 hover:border-emerald-600 hover:text-emerald-700"}`}
            >
              {p} days
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <AnalyticsCards
          stats={[
            { label: "Listing views", value: a.totals.views },
            { label: "Phone clicks", value: a.totals.phoneClicks },
            { label: "Website clicks", value: a.totals.websiteClicks },
            { label: "Directions", value: a.totals.directionClicks },
            { label: "Shares", value: a.totals.shareClicks },
            { label: "Bookings", value: a.totals.bookingClicks },
          ]}
        />
      </div>

      <div className="mt-5">
        <TrendChart label={`Listing views — last ${days} days`} values={a.series.map((p) => p.views)} />
      </div>

      <div className="mt-5 rounded-2xl border border-neutral-200 bg-white p-5">
        <h2 className="text-sm font-bold text-neutral-700">Top interactions</h2>
        {a.topSources.length === 0 ? (
          <p className="mt-2 text-sm text-neutral-400">No clicks yet in this period.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {a.topSources.map((s) => {
              const pct = a.totalInteractions ? Math.round((s.value / a.totalInteractions) * 100) : 0;
              return (
                <li key={s.label}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-700">{s.label}</span>
                    <span className="font-semibold text-neutral-500">{s.value} · {pct}%</span>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
                    <div className="h-full rounded-full bg-emerald-600" style={{ width: `${pct}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}
