import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdminPage } from "@/lib/adminGuard";
import AdminAction from "@/components/AdminAction";
import RatingStars from "@/components/RatingStars";

export const metadata = { title: "Admin — Reviews" };

export default async function AdminReviewsPage() {
  await requireAdminPage();

  const reviews = await db.review.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      business: { select: { name: true, slug: true } },
    },
    take: 200,
  });

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <nav className="text-sm text-neutral-400">
        <Link href="/admin" className="hover:text-emerald-700">Admin</Link> / <span className="text-neutral-600">Reviews</span>
      </nav>
      <h1 className="mt-2 text-2xl font-bold tracking-tight">Review moderation</h1>
      <p className="mt-1 text-sm text-neutral-500">Remove abusive or fake content; removed reviews are hidden and excluded from ratings.</p>

      <ul className="mt-6 space-y-3">
        {reviews.map((r) => (
          <li key={r.id} className={`rounded-2xl border bg-white p-4 ${r.status === "REMOVED" ? "border-red-200 opacity-70" : "border-neutral-200"}`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="font-semibold text-neutral-800">{r.user.name}</span>
                <span className="text-neutral-400">on</span>
                <Link href={`/business/${r.business.slug}`} className="font-semibold text-emerald-700 hover:underline">{r.business.name}</Link>
                <RatingStars rating={r.rating} />
                {r.status === "REMOVED" && <span className="rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-700">REMOVED</span>}
              </div>
              <div>
                {r.status === "VISIBLE" ? (
                  <AdminAction url={`/api/admin/reviews/${r.id}`} body={{ action: "remove" }} label="Remove" variant="danger" />
                ) : (
                  <AdminAction url={`/api/admin/reviews/${r.id}`} body={{ action: "restore" }} label="Restore" variant="primary" />
                )}
              </div>
            </div>
            {r.title && <p className="mt-2 text-sm font-medium text-neutral-700">{r.title}</p>}
            <p className="mt-1 text-sm text-neutral-500">{r.body}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
