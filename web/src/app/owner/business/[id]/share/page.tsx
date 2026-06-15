import Link from "next/link";
import { requireOwner, getOwnedBusiness } from "@/lib/ownerGuard";
import { siteUrl } from "@/lib/payments/stripe";
import ShareKit from "@/components/ShareKit";

export const metadata = { title: "Share kit" };

export default async function OwnerSharePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireOwner(`/owner/business/${id}/share`);
  const business = await getOwnedBusiness(id, session.userId);

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <nav className="text-sm text-neutral-400">
        <Link href="/owner" className="hover:text-emerald-700">Owner</Link> /{" "}
        <Link href={`/owner/business/${id}`} className="hover:text-emerald-700">{business.name}</Link> /{" "}
        <span className="text-neutral-600">Share kit</span>
      </nav>
      <h1 className="mt-2 text-2xl font-bold tracking-tight">Your share kit</h1>
      <p className="mt-1 text-sm text-neutral-500">Show your community you&apos;re a proud member of Ethiopian Business Hub UK — no design skills needed.</p>

      <div className="mt-8">
        <ShareKit businessId={business.id} slug={business.slug} name={business.name} publicUrl={`${siteUrl()}/business/${business.slug}`} />
      </div>
    </main>
  );
}
