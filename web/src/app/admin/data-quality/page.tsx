import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdminPage } from "@/lib/adminGuard";

export const metadata = { title: "Admin — Data Quality" };

function Stat({ label, value, tone = "neutral" }: { label: string; value: number; tone?: "neutral" | "good" | "warn" | "bad" }) {
  const tones = {
    neutral: "border-neutral-200 bg-white",
    good: "border-emerald-200 bg-emerald-50",
    warn: "border-amber-200 bg-amber-50",
    bad: "border-red-200 bg-red-50",
  };
  return (
    <div className={`rounded-2xl border p-4 ${tones[tone]}`}>
      <p className="text-2xl font-bold tracking-tight">{value}</p>
      <p className="mt-0.5 text-xs font-medium text-neutral-500">{label}</p>
    </div>
  );
}

export default async function DataQualityPage() {
  await requireAdminPage();

  const [
    total,
    demo,
    googleSourced,
    chSourced,
    ownerSubmitted,
    adminCreated,
    pending,
    approved,
    rejected,
    missingPhone,
    missingWebsite,
    chMatched,
    jobs,
    noSource,
    photoCounts,
  ] = await Promise.all([
    db.business.count(),
    db.business.count({ where: { sourceType: "demo" } }),
    db.business.count({ where: { sourceType: "google_places" } }),
    db.business.count({ where: { sourceType: "companies_house" } }),
    db.business.count({ where: { sourceType: "owner_submitted" } }),
    db.business.count({ where: { sourceType: "admin_created" } }),
    db.business.count({ where: { status: "PENDING" } }),
    db.business.count({ where: { status: "APPROVED" } }),
    db.business.count({ where: { status: "REJECTED" } }),
    db.business.count({ where: { phone: "" } }),
    db.business.count({ where: { website: "" } }),
    db.business.count({ where: { companyNumber: { not: "" } } }),
    db.importJob.aggregate({ _sum: { imported: true, duplicates: true, found: true } }),
    db.business.findMany({ where: { sources: { none: {} } }, select: { id: true, name: true, slug: true, sourceType: true } }),
    db.business.findMany({ select: { _count: { select: { photos: true } } } }),
  ]);

  const missingPhotos = photoCounts.filter((b) => b._count.photos === 0).length;
  const realTotal = total - demo;

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <nav className="text-sm text-neutral-400">
        <Link href="/admin" className="hover:text-emerald-700">Admin</Link> / <span className="text-neutral-600">Data Quality</span>
      </nav>
      <h1 className="mt-2 text-2xl font-bold tracking-tight">Data Quality</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Every public listing must be real, source-tracked and admin-approved. Demo records are
        {process.env.ALLOW_DEMO_DATA === "true"
          ? " currently VISIBLE (ALLOW_DEMO_DATA=true — set to false in production)."
          : " hidden (ALLOW_DEMO_DATA is off)."}
      </p>

      <h2 className="mt-8 text-sm font-bold uppercase tracking-wide text-neutral-400">Listings by source</h2>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Stat label="Total listings" value={total} />
        <Stat label="Real (non-demo)" value={realTotal} tone="good" />
        <Stat label="Google Places" value={googleSourced} />
        <Stat label="Companies House" value={chSourced} />
        <Stat label="Owner submitted" value={ownerSubmitted} />
        <Stat label="Demo (flagged)" value={demo} tone={demo > 0 ? "warn" : "good"} />
      </div>

      <h2 className="mt-8 text-sm font-bold uppercase tracking-wide text-neutral-400">Approval pipeline</h2>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Stat label="Pending approval" value={pending} tone={pending > 0 ? "warn" : "good"} />
        <Stat label="Approved" value={approved} tone="good" />
        <Stat label="Rejected" value={rejected} />
        <Stat label="Imported (all jobs)" value={jobs._sum.imported ?? 0} />
        <Stat label="Duplicates detected" value={jobs._sum.duplicates ?? 0} />
        <Stat label="Found by importers" value={jobs._sum.found ?? 0} />
      </div>

      <h2 className="mt-8 text-sm font-bold uppercase tracking-wide text-neutral-400">Completeness gaps</h2>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Missing phone" value={missingPhone} tone={missingPhone > 0 ? "warn" : "good"} />
        <Stat label="Missing website" value={missingWebsite} tone={missingWebsite > 0 ? "warn" : "good"} />
        <Stat label="Missing photos" value={missingPhotos} tone={missingPhotos > 0 ? "warn" : "good"} />
        <Stat label="Companies House match" value={chMatched} tone="good" />
      </div>

      <h2 className="mt-8 text-sm font-bold uppercase tracking-wide text-neutral-400">
        Listings without any source record ({noSource.length})
      </h2>
      {noSource.length === 0 ? (
        <p className="mt-3 text-sm text-emerald-700">✓ Every listing has a source record.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {noSource.map((b) => (
            <li key={b.id} className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm">
              <span className="font-medium text-red-800">⚠ {b.name} <span className="text-xs text-red-500">({b.sourceType})</span></span>
              <Link href="/admin/businesses" className="text-xs font-semibold text-red-700 hover:underline">Review →</Link>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-10 flex gap-3">
        <Link href="/admin/import/google-places" className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800">Import from Google Places</Link>
        <Link href="/admin/import/companies-house" className="rounded-xl border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-600 hover:border-emerald-600 hover:text-emerald-700">Import from Companies House</Link>
      </div>
    </main>
  );
}
