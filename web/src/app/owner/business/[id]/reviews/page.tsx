import Link from "next/link";
import { requireOwner, getOwnedBusiness } from "@/lib/ownerGuard";
import { db } from "@/lib/db";
import RatingStars from "@/components/RatingStars";
import RespondForm from "@/components/RespondForm";

export const metadata = { title: "Reviews" };

export default async function OwnerReviews({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireOwner(`/owner/business/${id}/reviews`);
  const business = await getOwnedBusiness(id, session.userId);

  const reviews = await db.review.findMany({
    where: { businessId: id, status: "VISIBLE" },
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true } } },
  });

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <nav className="text-sm text-neutral-400">
        <Link href="/owner" className="hover:text-emerald-700">Owner</Link> /{" "}
        <Link href={`/owner/business/${id}`} className="hover:text-emerald-700">{business.name}</Link> /{" "}
        <span className="text-neutral-600">Reviews</span>
      </nav>
      <h1 className="mt-2 text-2xl font-bold tracking-tight">Reviews ({reviews.length})</h1>

      {reviews.length === 0 ? (
        <p className="mt-6 text-sm text-neutral-400">No reviews yet.</p>
      ) : (
        <ul className="mt-5 space-y-4">
          {reviews.map((r) => (
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
    </main>
  );
}
