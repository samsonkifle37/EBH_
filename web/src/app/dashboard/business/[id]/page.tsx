import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { aggregateRating } from "@/lib/domain/ratings";
import AnalyticsCards from "@/components/AnalyticsCards";
import RatingStars from "@/components/RatingStars";
import RespondForm from "@/components/RespondForm";

export const metadata = { title: "Listing Analytics" };

export default async function BusinessAnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect("/auth/signin?next=/dashboard");

  const business = await db.business.findUnique({
    where: { id },
    include: {
      reviews: { include: { user: { select: { name: true } } }, orderBy: { createdAt: "desc" } },
    },
  });
  if (!business || business.ownerId !== session.userId) notFound();

  const since = new Date(Date.now() - 30 * 24 * 3600 * 1000);
  const [views, phoneClicks, websiteClicks, impressions] = await Promise.all([
    db.analyticsEvent.count({ where: { businessId: id, type: "LISTING_VIEW", createdAt: { gte: since } } }),
    db.analyticsEvent.count({ where: { businessId: id, type: "PHONE_CLICK", createdAt: { gte: since } } }),
    db.analyticsEvent.count({ where: { businessId: id, type: "WEBSITE_CLICK", createdAt: { gte: since } } }),
    db.analyticsEvent.count({ where: { businessId: id, type: "SEARCH_IMPRESSION", createdAt: { gte: since } } }),
  ]);
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
        <h2 className="text-lg font-bold">Last 30 days</h2>
        <div className="mt-4">
          <AnalyticsCards
            stats={[
              { label: "Listing views", value: views },
              { label: "Phone clicks", value: phoneClicks },
              { label: "Website clicks", value: websiteClicks },
              { label: "Search impressions", value: impressions },
              { label: "Reviews", value: count, hint: avg > 0 ? `${avg.toFixed(1)}★ average` : undefined },
            ]}
          />
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
