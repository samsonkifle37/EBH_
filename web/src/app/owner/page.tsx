import { requireOwner, listOwnedBusinesses } from "@/lib/ownerGuard";
import OwnedBusinessList, { EmptyOwnerState } from "@/components/OwnedBusinessList";

export const metadata = { title: "Owner Dashboard" };

export default async function OwnerHome() {
  const session = await requireOwner();
  const businesses = await listOwnedBusinesses(session.userId);

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-bold tracking-tight">Your businesses</h1>
      <p className="mt-1 text-sm text-neutral-500">Manage the listings you own, respond to reviews, and track performance.</p>

      {businesses.length === 0 ? <EmptyOwnerState /> : <OwnedBusinessList businesses={businesses} />}
    </main>
  );
}
