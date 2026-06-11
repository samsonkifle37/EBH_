import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import ReviewForm from "@/components/ReviewForm";

export const metadata = { title: "Write a Review" };

export default async function ReviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await getSession();
  if (!session) redirect(`/auth/signin?next=/business/${slug}/review`);

  const business = await db.business.findUnique({ where: { slug }, select: { id: true, name: true, status: true } });
  if (!business || business.status !== "APPROVED") notFound();

  const existing = await db.review.findUnique({
    where: { businessId_userId: { businessId: business.id, userId: session.userId } },
  });

  return (
    <main className="mx-auto max-w-xl px-4 py-12">
      <h1 className="text-2xl font-bold tracking-tight">Review {business.name}</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Share your honest experience to help the community. One review per business.
      </p>
      {existing ? (
        <div className="mt-8 rounded-2xl border border-neutral-200 bg-white p-6 text-sm text-neutral-600">
          You have already reviewed this business.{" "}
          <Link href={`/business/${slug}`} className="font-semibold text-emerald-700 hover:underline">
            Back to listing →
          </Link>
        </div>
      ) : (
        <div className="mt-8">
          <ReviewForm businessId={business.id} businessSlug={slug} />
        </div>
      )}
    </main>
  );
}
