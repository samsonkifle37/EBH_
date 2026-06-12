import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdminPage } from "@/lib/adminGuard";
import AnalyticsCards from "@/components/AnalyticsCards";

export const metadata = { title: "Admin" };

export default async function AdminPage() {
  await requireAdminPage();

  const [pendingBiz, pendingEvents, totalBiz, totalEvents, totalUsers, totalReviews, activeAds] = await Promise.all([
    db.business.count({ where: { status: "PENDING" } }),
    db.event.count({ where: { status: "PENDING" } }),
    db.business.count(),
    db.event.count(),
    db.user.count(),
    db.review.count(),
    db.ad.count({ where: { active: true } }),
  ]);

  const sections = [
    { href: "/admin/businesses", title: "Businesses", desc: "Approve listings, manage featured placement and verification levels", badge: pendingBiz },
    { href: "/admin/events", title: "Events", desc: "Approve and feature community events", badge: pendingEvents },
    { href: "/admin/reviews", title: "Reviews", desc: "Moderate abusive or fake reviews", badge: 0 },
    { href: "/admin/ads", title: "Advertising", desc: "Manage banner campaigns across all placements", badge: 0 },
    { href: "/admin/import/google-places", title: "Import — Google Places", desc: "Import real trading businesses into the approval queue", badge: 0 },
    { href: "/admin/import/companies-house", title: "Import — Companies House", desc: "Verify listings against official UK company records", badge: 0 },
    { href: "/admin/data-quality", title: "Data Quality", desc: "Source coverage, missing fields, duplicates and flagged listings", badge: 0 },
  ];

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Platform Admin</h1>

      <div className="mt-6">
        <AnalyticsCards
          stats={[
            { label: "Businesses", value: totalBiz, hint: `${pendingBiz} pending` },
            { label: "Events", value: totalEvents, hint: `${pendingEvents} pending` },
            { label: "Users", value: totalUsers },
            { label: "Reviews", value: totalReviews },
            { label: "Active ads", value: activeAds },
          ]}
        />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {sections.map((s) => (
          <Link key={s.href} href={s.href} className="rounded-2xl border border-neutral-200 bg-white p-6 transition hover:-translate-y-0.5 hover:border-emerald-600 hover:shadow-md">
            <div className="flex items-center justify-between">
              <p className="font-bold text-neutral-900">{s.title}</p>
              {s.badge > 0 && (
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800">
                  {s.badge} pending
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-neutral-500">{s.desc}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
