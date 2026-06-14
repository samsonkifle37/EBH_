import Link from "next/link";

interface Owned {
  id: string;
  name: string;
  city: string;
  category: string;
  plan: string;
  status: string;
  _count: { reviews: number; photos: number };
}

export function EmptyOwnerState() {
  return (
    <div className="mt-8 rounded-2xl border border-dashed border-neutral-300 bg-white p-8 text-center">
      <p className="text-lg font-semibold text-neutral-800">You have not claimed a business yet.</p>
      <p className="mt-1 text-sm text-neutral-500">Find your business and submit a claim.</p>
      <Link href="/businesses" className="mt-4 inline-block rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800">
        Find your business
      </Link>
    </div>
  );
}

export default function OwnedBusinessList({ businesses }: { businesses: Owned[] }) {
  return (
    <ul className="mt-5 grid gap-3 sm:grid-cols-2">
      {businesses.map((b) => (
        <li key={b.id} className="rounded-2xl border border-neutral-200 bg-white p-5">
          <div className="flex items-start justify-between gap-2">
            <Link href={`/owner/business/${b.id}`} className="font-semibold text-neutral-900 hover:text-emerald-700">{b.name}</Link>
            <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-semibold text-neutral-500">{b.plan}</span>
          </div>
          {b.status !== "APPROVED" && (
            <span className="mt-1 inline-block rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">Pending approval</span>
          )}
          <p className="mt-0.5 text-xs text-neutral-400">{b.category} · {b.city} · {b.status}</p>
          <p className="mt-2 text-xs text-neutral-500">{b._count.reviews} reviews · {b._count.photos} photos</p>
          <div className="mt-3 flex gap-3 text-sm">
            <Link href={`/owner/business/${b.id}/analytics`} className="font-semibold text-emerald-700 hover:underline">Analytics</Link>
            <Link href={`/owner/business/${b.id}/reviews`} className="font-semibold text-emerald-700 hover:underline">Reviews</Link>
          </div>
        </li>
      ))}
    </ul>
  );
}
