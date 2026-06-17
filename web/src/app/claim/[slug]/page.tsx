import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import ClaimForm from "@/components/ClaimForm";
import ClaimActivateButton from "@/components/ClaimActivateButton";

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

  const myClaim = await db.claimRequest.findFirst({
    where: { businessId: business.id, userId: session.userId, status: { in: ["pending", "needs_more_evidence", "approved"] } },
    orderBy: { createdAt: "desc" },
    select: { id: true, status: true, paymentStatus: true },
  });
  const awaitingPayment = myClaim?.status === "approved" && myClaim.paymentStatus !== "paid";

  return (
    <main className="mx-auto max-w-xl px-4 py-12">
      <h1 className="text-2xl font-bold tracking-tight">Claim {business.name}&rsquo;s website</h1>
      <p className="mt-1 text-sm text-neutral-500">{business.address}</p>

      {business.ownerId ? (
        <div className="mt-8 rounded-2xl border border-neutral-200 bg-white p-6 text-sm text-neutral-600">
          This business has already been claimed.{" "}
          <Link href={`/business/${slug}`} className="font-semibold text-emerald-700 hover:underline">Back to listing →</Link>
        </div>
      ) : awaitingPayment && myClaim ? (
        <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-sm text-emerald-900">
          <p className="font-semibold">Your claim was approved 🎉</p>
          <p className="mt-1 mb-4">Activate ownership with a one-off £9.99 payment to unlock editing, review responses, analytics and the owner badge.</p>
          <ClaimActivateButton claimId={myClaim.id} />
        </div>
      ) : myClaim ? (
        <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
          <p className="font-semibold">Your claim is {myClaim.status === "needs_more_evidence" ? "awaiting more evidence" : "under review"}.</p>
          <p className="mt-1">We&apos;ll email you once it&apos;s been reviewed. Nothing to pay right now.</p>
        </div>
      ) : (
        <>
          <div className="mt-6 rounded-2xl bg-neutral-50 p-4 text-sm text-neutral-600">
            <p className="font-semibold text-neutral-800">Your free business website includes:</p>
            <ul className="mt-2 space-y-1">
              <li>✓ A verified, shareable web page — your logo, WhatsApp, services &amp; FAQ</li>
              <li>✓ Owner badge and a higher trust score</li>
              <li>✓ A share kit &amp; QR code for your shop window and Instagram bio</li>
              <li>✓ Reviews you can respond to, plus a website analytics dashboard</li>
            </ul>
          </div>
          <div className="mt-6">
            <ClaimForm businessId={business.id} defaultName={session.name} />
          </div>
        </>
      )}
    </main>
  );
}
