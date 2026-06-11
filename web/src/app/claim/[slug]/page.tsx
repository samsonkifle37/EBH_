import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import ClaimFlow from "@/components/ClaimFlow";

export const metadata = { title: "Claim Your Business" };

export default async function ClaimPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await getSession();
  if (!session) redirect(`/auth/signin?next=/claim/${slug}`);

  const business = await db.business.findUnique({
    where: { slug },
    select: { id: true, name: true, address: true, city: true, ownerId: true },
  });
  if (!business) notFound();

  return (
    <main className="mx-auto max-w-xl px-4 py-12">
      <h1 className="text-2xl font-bold tracking-tight">Claim {business.name}</h1>
      <p className="mt-1 text-sm text-neutral-500">{business.address}</p>

      {business.ownerId ? (
        <div className="mt-8 rounded-2xl border border-neutral-200 bg-white p-6 text-sm text-neutral-600">
          This business has already been claimed.{" "}
          <Link href={`/business/${slug}`} className="font-semibold text-emerald-700 hover:underline">
            Back to listing →
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-6 rounded-2xl bg-neutral-50 p-4 text-sm text-neutral-600">
            <p className="font-semibold text-neutral-800">Claiming unlocks:</p>
            <ul className="mt-2 space-y-1">
              <li>✓ Verified badge (Level 1–2)</li>
              <li>✓ Edit your listing, photos and hours</li>
              <li>✓ Respond publicly to reviews</li>
              <li>✓ Analytics dashboard</li>
            </ul>
          </div>
          <div className="mt-6">
            <ClaimFlow businessId={business.id} businessName={business.name} />
          </div>
          <p className="mt-6 text-xs text-neutral-400">
            Optional later: Companies House and photo-ID verification for Level 3–4 and a higher trust score.
          </p>
        </>
      )}
    </main>
  );
}
