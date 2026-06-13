import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdminPage } from "@/lib/adminGuard";
import AdminAction from "@/components/AdminAction";
import AdminBusinessTools from "@/components/AdminBusinessTools";

export const metadata = { title: "Admin — Businesses" };

const SOURCE_BADGES: Record<string, { label: string; cls: string }> = {
  google_places: { label: "Google Places", cls: "bg-blue-50 text-blue-700" },
  companies_house: { label: "Companies House", cls: "bg-indigo-50 text-indigo-700" },
  openstreetmap: { label: "OpenStreetMap", cls: "bg-lime-50 text-lime-700" },
  owner_submitted: { label: "Owner submitted", cls: "bg-emerald-50 text-emerald-700" },
  admin_created: { label: "Admin created", cls: "bg-neutral-100 text-neutral-600" },
  facebook_page: { label: "Lead · Facebook", cls: "bg-sky-50 text-sky-700" },
  instagram: { label: "Lead · Instagram", cls: "bg-pink-50 text-pink-700" },
  community_referral: { label: "Lead · Referral", cls: "bg-amber-50 text-amber-700" },
  flyer: { label: "Lead · Flyer", cls: "bg-amber-50 text-amber-700" },
  other: { label: "Lead · Other", cls: "bg-amber-50 text-amber-700" },
  demo: { label: "DEMO DATA", cls: "bg-red-50 text-red-600" },
};

export default async function AdminBusinessesPage() {
  await requireAdminPage();

  const businesses = await db.business.findMany({
    orderBy: [{ status: "desc" }, { createdAt: "desc" }],
    include: { owner: { select: { email: true } }, sources: { select: { sourceType: true } } },
  });
  const pending = businesses.filter((b) => b.status === "PENDING");
  const rest = businesses.filter((b) => b.status !== "PENDING");
  const mergeTargets = businesses
    .filter((b) => b.sourceType !== "demo")
    .map((b) => ({ id: b.id, name: b.name }));

  function row(b: (typeof businesses)[number]) {
    const source = SOURCE_BADGES[b.sourceType] ?? SOURCE_BADGES.admin_created;
    const chMatched = b.companyNumber || b.sources.some((s) => s.sourceType === "companies_house");
    return (
      <li key={b.id} className="space-y-2 rounded-2xl border border-neutral-200 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Link href={`/business/${b.slug}`} className="font-semibold text-neutral-900 hover:text-emerald-700">{b.name}</Link>
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${b.status === "APPROVED" ? "bg-emerald-50 text-emerald-700" : b.status === "PENDING" ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"}`}>
                {b.status}
              </span>
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${source.cls}`}>{source.label}</span>
              {chMatched && <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700">CH ✓</span>}
              {b.featured && <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">★ Featured</span>}
              <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-semibold text-neutral-500">L{b.verificationLevel}</span>
              <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-semibold text-neutral-500">conf {b.dataConfidenceScore}</span>
            </div>
            <p className="mt-0.5 text-xs text-neutral-400">
              {b.category} · {b.city} · {b.owner?.email ?? "unclaimed"} · plan {b.plan}
              {b.sourceUrl && (
                <>
                  {" · "}
                  <a href={b.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-700 hover:underline">source ↗</a>
                </>
              )}
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {b.status !== "APPROVED" && <AdminAction url={`/api/admin/businesses/${b.id}`} body={{ action: "approve" }} label="Approve" variant="primary" />}
            {b.status !== "REJECTED" && <AdminAction url={`/api/admin/businesses/${b.id}`} body={{ action: "reject" }} label="Reject" variant="danger" />}
            {b.featured
              ? <AdminAction url={`/api/admin/businesses/${b.id}`} body={{ action: "unfeature" }} label="Unfeature" />
              : <AdminAction url={`/api/admin/businesses/${b.id}`} body={{ action: "feature" }} label="Feature" />}
            {[1, 2, 3, 4].filter((l) => l !== b.verificationLevel).slice(0, 2).map((l) => (
              <AdminAction key={l} url={`/api/admin/businesses/${b.id}`} body={{ action: "setLevel", level: l }} label={`L${l}`} />
            ))}
          </div>
        </div>
        <AdminBusinessTools
          businessId={b.id}
          category={b.category}
          city={b.city}
          mergeTargets={mergeTargets.filter((t) => t.id !== b.id)}
        />
      </li>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <nav className="text-sm text-neutral-400">
        <Link href="/admin" className="hover:text-emerald-700">Admin</Link> / <span className="text-neutral-600">Businesses</span>
      </nav>
      <h1 className="mt-2 text-2xl font-bold tracking-tight">Businesses</h1>

      <h2 className="mt-8 text-lg font-bold">Awaiting approval ({pending.length})</h2>
      {pending.length === 0 ? (
        <p className="mt-2 text-sm text-neutral-400">Queue is clear 🎉</p>
      ) : (
        <ul className="mt-3 space-y-3">{pending.map(row)}</ul>
      )}

      <h2 className="mt-10 text-lg font-bold">All listings ({rest.length})</h2>
      <ul className="mt-3 space-y-3">{rest.map(row)}</ul>
    </main>
  );
}
