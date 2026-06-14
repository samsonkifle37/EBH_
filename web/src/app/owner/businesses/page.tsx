import Link from "next/link";
import { requireOwner, listOwnedBusinesses } from "@/lib/ownerGuard";
import OwnedBusinessList, { EmptyOwnerState } from "@/components/OwnedBusinessList";

export const metadata = { title: "Your Businesses" };

export default async function OwnerBusinesses() {
  const session = await requireOwner("/owner/businesses");
  const businesses = await listOwnedBusinesses(session.userId);

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <nav className="text-sm text-neutral-400">
        <Link href="/owner" className="hover:text-emerald-700">Owner</Link> / <span className="text-neutral-600">Businesses</span>
      </nav>
      <h1 className="mt-2 text-2xl font-bold tracking-tight">Your businesses</h1>
      {businesses.length === 0 ? <EmptyOwnerState /> : <OwnedBusinessList businesses={businesses} />}
    </main>
  );
}
