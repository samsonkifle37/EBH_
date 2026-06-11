import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { toSummary } from "@/lib/queries/businesses";
import BusinessCard from "@/components/BusinessCard";
import RatingStars from "@/components/RatingStars";

export const metadata = { title: "My Account" };

export default async function AccountPage() {
  const session = await getSession();
  if (!session) redirect("/auth/signin?next=/account");

  const include = {
    business: {
      include: {
        photos: { orderBy: { sortOrder: "asc" as const }, take: 1 },
        reviews: { select: { rating: true, status: true } },
      },
    },
  };
  const [user, favorites, follows, reviews] = await Promise.all([
    db.user.findUnique({ where: { id: session.userId } }),
    db.favorite.findMany({ where: { userId: session.userId }, include }),
    db.follow.findMany({ where: { userId: session.userId }, include }),
    db.review.findMany({
      where: { userId: session.userId },
      include: { business: { select: { name: true, slug: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Hi, {session.name.split(" ")[0]} 👋</h1>
      <p className="mt-1 text-sm text-neutral-500">{user?.email} · member since {user?.createdAt.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}</p>

      <section className="mt-10">
        <h2 className="text-lg font-bold">♥ Saved businesses</h2>
        {favorites.length === 0 ? (
          <p className="mt-3 text-sm text-neutral-400">
            Nothing saved yet — tap “Save” on any business.{" "}
            <Link href="/businesses" className="font-semibold text-emerald-700 hover:underline">Browse the directory →</Link>
          </p>
        ) : (
          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {favorites.map((f) => (
              <BusinessCard key={f.id} business={toSummary(f.business)} />
            ))}
          </div>
        )}
      </section>

      <section className="mt-12">
        <h2 className="text-lg font-bold">Following</h2>
        {follows.length === 0 ? (
          <p className="mt-3 text-sm text-neutral-400">Follow businesses to keep up with them here.</p>
        ) : (
          <ul className="mt-4 flex flex-wrap gap-2">
            {follows.map((f) => (
              <li key={f.id}>
                <Link href={`/business/${f.business.slug}`} className="rounded-full border border-neutral-200 bg-white px-3.5 py-1.5 text-sm font-medium text-neutral-700 hover:border-emerald-600 hover:text-emerald-700">
                  {f.business.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-12">
        <h2 className="text-lg font-bold">My reviews</h2>
        {reviews.length === 0 ? (
          <p className="mt-3 text-sm text-neutral-400">You haven&apos;t written any reviews yet.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {reviews.map((r) => (
              <li key={r.id} className="rounded-2xl border border-neutral-200 bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Link href={`/business/${r.business.slug}`} className="font-semibold text-neutral-900 hover:text-emerald-700">
                    {r.business.name}
                  </Link>
                  <RatingStars rating={r.rating} />
                </div>
                {r.title && <p className="mt-1 text-sm font-medium text-neutral-700">{r.title}</p>}
                <p className="mt-1 text-sm text-neutral-500">{r.body}</p>
                {r.status === "REMOVED" && (
                  <p className="mt-2 text-xs font-semibold text-red-600">Removed by moderators</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
