import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdminPage } from "@/lib/adminGuard";
import { trustV2ForBusiness } from "@/lib/trust";

export const metadata = { title: "Admin — Business trust" };

export default async function AdminBusinessTrustPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage();
  const { id } = await params;

  const business = await db.business.findUnique({
    where: { id },
    include: {
      photos: { select: { id: true } },
      sources: { select: { sourceType: true, sourceUrl: true } },
      reviews: { select: { rating: true, status: true } },
      owner: { select: { email: true } },
    },
  });
  if (!business) notFound();

  const { score, breakdown } = trustV2ForBusiness({
    plan: business.plan,
    ownerId: business.ownerId,
    sourceType: business.sourceType,
    companyNumber: business.companyNumber,
    mapsUrl: business.mapsUrl,
    phone: business.phone,
    website: business.website,
    email: business.email,
    description: business.description,
    address: business.address,
    openingHours: business.openingHours,
    socials: business.socials,
    lastSourceCheckedAt: business.lastSourceCheckedAt,
    photos: business.photos,
    reviews: business.reviews,
    sources: business.sources,
  });

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <nav className="text-sm text-neutral-400">
        <Link href="/admin" className="hover:text-emerald-700">Admin</Link> /{" "}
        <Link href="/admin/businesses" className="hover:text-emerald-700">Businesses</Link> /{" "}
        <span className="text-neutral-600">{business.name}</span>
      </nav>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight">{business.name}</h1>
        <Link href={`/business/${business.slug}`} className="text-sm font-semibold text-emerald-700 hover:underline">
          View public listing ↗
        </Link>
      </div>
      <p className="mt-1 text-sm text-neutral-500">
        {business.category} · {business.city} · {business.status} · {business.owner?.email ?? "unclaimed"} · plan {business.plan}
      </p>

      <section className="mt-8 rounded-2xl border border-neutral-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wide text-neutral-400">Trust score</h2>
          <span className="text-3xl font-bold tracking-tight text-emerald-700">{score}<span className="text-base text-neutral-400">/100</span></span>
        </div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-neutral-100">
          <div className="h-full rounded-full bg-emerald-600" style={{ width: `${score}%` }} />
        </div>

        <h3 className="mt-6 text-xs font-bold uppercase tracking-wide text-neutral-400">Why this score</h3>
        {breakdown.length === 0 ? (
          <p className="mt-2 text-sm text-neutral-400">No trust signals yet. Add an image, contact details, or claim the listing.</p>
        ) : (
          <ul className="mt-3 divide-y divide-neutral-100">
            {breakdown.map((row) => (
              <li key={row.label} className="flex items-center justify-between py-2 text-sm">
                <span className="text-neutral-700">{row.label}</span>
                <span className="font-semibold text-emerald-700">+{row.points}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ── Cultural Moment Engine ─────────────────────────── */}
      <section className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/60 p-6">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-amber-700">
          🌸 Enkutatash 2026
        </h2>
        <form
          action={async (formData: FormData) => {
            "use server";
            await requireAdminPage();
            const partner = formData.get("partner") === "true";
            const offer = (formData.get("offer") as string | null) ?? "";
            await db.business.update({
              where: { id },
              data: { enkutatashPartner: partner, enkutatashOffer: offer.slice(0, 280) },
            });
            redirect(`/admin/business/${id}`);
          }}
        >
          <label className="flex items-center gap-3 text-sm font-medium text-neutral-800">
            <input
              type="checkbox"
              name="partner"
              value="true"
              defaultChecked={business.enkutatashPartner}
              className="h-4 w-4 accent-amber-600"
            />
            Enkutatash Partner 2026
          </label>
          <p className="mt-1 text-xs text-neutral-500">
            Check to show the 🌸 badge on the listing and include on{" "}
            <a href="/enkutatash" target="_blank" className="text-amber-700 underline">/enkutatash</a>.
          </p>
          <div className="mt-4">
            <label className="block text-xs font-semibold text-neutral-700">
              Special offer (optional, ≤280 chars)
            </label>
            <textarea
              name="offer"
              defaultValue={business.enkutatashOffer ?? ""}
              maxLength={280}
              rows={2}
              placeholder="e.g. Free dessert with any main course on Ethiopian New Year"
              className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
          <button
            type="submit"
            className="mt-3 rounded-xl bg-amber-500 px-4 py-2 text-sm font-bold text-white hover:bg-amber-600 transition-colors"
          >
            Save Enkutatash settings
          </button>
        </form>
      </section>

      <section className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6">
        <h2 className="text-sm font-bold uppercase tracking-wide text-neutral-400">Sources</h2>
        {business.sources.length === 0 ? (
          <p className="mt-2 text-sm text-red-500">⚠ No source records — this listing is not source-tracked.</p>
        ) : (
          <ul className="mt-3 space-y-1.5 text-sm">
            {business.sources.map((s, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-semibold text-neutral-600">{s.sourceType}</span>
                {s.sourceUrl && (
                  <a href={s.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-700 hover:underline">{s.sourceUrl}</a>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
