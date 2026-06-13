import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { aggregateRating } from "@/lib/domain/ratings";
import { rollupDaily } from "@/lib/analytics/rollup";
import { getBusinessAnalytics } from "@/lib/analytics/summary";
import AnalyticsCards from "@/components/AnalyticsCards";
import TrendChart from "@/components/TrendChart";
import RatingStars from "@/components/RatingStars";
import RespondForm from "@/components/RespondForm";

export const metadata = { title: "Listing Analytics" };

const PERIODS = [7, 30, 90] as const;

export default async function BusinessAnalyticsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ days?: string }>;
}) {
  const { id } = await params;
  const { days: daysParam } = await searchParams;
  const days = PERIODS.includes(Number(daysParam) as (typeof PERIODS)[number]) ? Number(daysParam) : 30;
  const session = await getSession();
  if (!session) redirect("/auth/signin?next=/dashboard");

  const business = await db.business.findUnique({
    where: { id },
    include: {
      reviews: { include: { user: { select: { name: true } } }, orderBy: { createdAt: "desc" } },
    },
  });
  if (!business || business.ownerId !== session.userId) notFound();

  // keep this business's daily rollup fresh, then read the summary
  await rollupDaily({ businessId: id });
  const analytics = await getBusinessAnalytics(id, days);
  const { avg, count } = aggregateRating(business.reviews);

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <nav className="text-sm text-neutral-400">
        <Link href="/dashboard" className="hover:text-emerald-700">Dashboard</Link>
        {" / "}
        <span className="text-neutral-600">{business.name}</span>
      </nav>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight">{business.name}</h1>
        <Link href={`/dashboard/business/${id}/edit`} className="rounded-xl border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-700 hover:border-emerald-600 hover:text-emerald-700">
          Edit listing
        </Link>
      </div>

      <section className="mt-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold">Performance</h2>
          <div className="flex gap-1.5">
            {PERIODS.map((p) => (
              <Link
                key={p}
                href={`/dashboard/business/${id}?days=${p}`}
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
              { label: "Listing views", value: analytics.totals.views },
              { label: "Phone clicks", value: analytics.totals.phoneClicks },
              { label: "Website clicks", value: analytics.totals.websiteClicks },
              { label: "Directions", value: analytics.totals.directionClicks },
              { label: "Shares", value: analytics.totals.shareClicks },
              { label: "Reviews", value: count, hint: avg > 0 ? `${avg.toFixed(1)}★ average` : undefined },
            ]}
          />
        </div>

        <div className="mt-5">
          <TrendChart label={`Listing views — last ${days} days`} values={analytics.series.map((p) => p.views)} />
        </div>

        <div className="mt-5 rounded-2xl border border-neutral-200 bg-white p-5">
          <h3 className="text-sm font-bold text-neutral-700">Top interactions</h3>
          {analytics.topSources.length === 0 ? (
            <p className="mt-2 text-sm text-neutral-400">No clicks yet in this period.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {analytics.topSources.map((s) => {
                const pct = analytics.totalInteractions ? Math.round((s.value / analytics.totalInteractions) * 100) : 0;
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

        <p className="mt-3 text-xs text-neutral-400">
          Tip: Verified and Featured plans appear higher in search, which typically increases views and clicks.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-bold">Reviews ({business.reviews.length})</h2>
        {business.reviews.length === 0 ? (
          <p className="mt-3 text-sm text-neutral-400">No reviews yet.</p>
        ) : (
          <ul className="mt-4 space-y-4">
            {business.reviews.map((r) => (
              <li key={r.id} className="rounded-2xl border border-neutral-200 bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-neutral-800">{r.user.name}</p>
                  <RatingStars rating={r.rating} />
                </div>
                {r.title && <p className="mt-1 text-sm font-medium text-neutral-700">{r.title}</p>}
                <p className="mt-1 text-sm text-neutral-500">{r.body}</p>
                {r.ownerResponse && (
                  <div className="mt-3 rounded-xl bg-neutral-50 p-3">
                    <p className="text-xs font-semibold text-neutral-500">Your response</p>
                    <p className="mt-0.5 text-sm text-neutral-600">{r.ownerResponse}</p>
                  </div>
                )}
                <div className="mt-2">
                  <RespondForm reviewId={r.id} existing={r.ownerResponse} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
