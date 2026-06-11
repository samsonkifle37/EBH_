import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { aggregateRating } from "@/lib/domain/ratings";
import UpgradeButtons from "@/components/UpgradeButtons";

export const metadata = { title: "Business Dashboard" };

const PLAN_BADGES: Record<string, string> = {
  FREE: "bg-neutral-100 text-neutral-600",
  VERIFIED: "bg-emerald-50 text-emerald-700",
  FEATURED: "bg-amber-50 text-amber-700",
};

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/auth/signin?next=/dashboard");

  const businesses = await db.business.findMany({
    where: { ownerId: session.userId },
    include: {
      reviews: { select: { rating: true, status: true } },
      photos: { take: 1, orderBy: { sortOrder: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Business Dashboard</h1>
          <p className="mt-1 text-sm text-neutral-500">Manage listings, reviews, analytics and plans.</p>
        </div>
        <Link href="/dashboard/new" className="rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800">
          + Add a listing
        </Link>
      </div>

      {businesses.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-dashed border-neutral-300 bg-white px-6 py-16 text-center">
          <p className="text-3xl">🏪</p>
          <p className="mt-3 font-semibold text-neutral-700">You don&apos;t manage any listings yet</p>
          <p className="mt-1 text-sm text-neutral-500">
            Create a new listing, or find your business in the directory and claim it.
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <Link href="/dashboard/new" className="rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800">
              Create listing
            </Link>
            <Link href="/businesses" className="rounded-xl border border-neutral-300 px-4 py-2.5 text-sm font-semibold text-neutral-700 hover:border-emerald-600">
              Find &amp; claim
            </Link>
          </div>
        </div>
      ) : (
        <ul className="mt-8 space-y-4">
          {businesses.map((b) => {
            const { avg, count } = aggregateRating(b.reviews);
            return (
              <li key={b.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-4">
                {b.photos[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={b.photos[0].url} alt={b.name} className="h-16 w-24 rounded-xl object-cover" />
                ) : (
                  <div className="flex h-16 w-24 items-center justify-center rounded-xl bg-neutral-100 text-2xl">🏪</div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link href={`/dashboard/business/${b.id}`} className="font-semibold text-neutral-900 hover:text-emerald-700">
                      {b.name}
                    </Link>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${PLAN_BADGES[b.plan] ?? PLAN_BADGES.FREE}`}>
                      {b.plan}
                    </span>
                    {b.status !== "APPROVED" && (
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                        {b.status === "PENDING" ? "Awaiting approval" : "Rejected"}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm text-neutral-500">
                    ⭐ {avg > 0 ? avg.toFixed(1) : "—"} ({count} reviews) · {b.city}
                  </p>
                  <div className="mt-2">
                    <UpgradeButtons businessId={b.id} currentPlan={b.plan} />
                  </div>
                </div>
                <div className="flex shrink-0 flex-col gap-1.5 text-sm font-semibold">
                  <Link href={`/dashboard/business/${b.id}`} className="text-emerald-700 hover:underline">Analytics &amp; reviews →</Link>
                  <Link href={`/dashboard/business/${b.id}/edit`} className="text-neutral-500 hover:underline">Edit listing</Link>
                  {b.status === "APPROVED" && (
                    <Link href={`/business/${b.slug}`} className="text-neutral-500 hover:underline">View public page</Link>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
