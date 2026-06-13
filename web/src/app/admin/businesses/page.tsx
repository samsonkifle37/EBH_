import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdminPage } from "@/lib/adminGuard";
import { normalizeName } from "@/lib/domain/match";
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

type Filter = "all" | "ready_to_approve" | "needs_image" | "needs_contact" | "duplicate_candidates" | "auto_approved";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All pending" },
  { key: "ready_to_approve", label: "Ready to approve" },
  { key: "needs_contact", label: "Needs contact" },
  { key: "needs_image", label: "Needs image" },
  { key: "duplicate_candidates", label: "Duplicate candidates" },
  { key: "auto_approved", label: "Recently auto approved" },
];

const RENDER_CAP = 300;

export default async function AdminBusinessesPage({ searchParams }: { searchParams: Promise<{ filter?: string }> }) {
  await requireAdminPage();
  const { filter: filterParam } = await searchParams;
  const filter: Filter = (FILTERS.some((f) => f.key === filterParam) ? filterParam : "all") as Filter;

  const businesses = await db.business.findMany({
    orderBy: [{ status: "desc" }, { createdAt: "desc" }],
    include: {
      owner: { select: { email: true } },
      sources: { select: { sourceType: true } },
      _count: { select: { photos: true } },
    },
  });

  type Row = (typeof businesses)[number];
  const hasImage = (b: Row) => b._count.photos > 0;
  const hasContact = (b: Row) => !!(b.phone || b.website || b.email);

  // names shared by >1 listing → duplicate candidates
  const nameCounts = new Map<string, number>();
  for (const b of businesses) {
    const n = normalizeName(b.name);
    nameCounts.set(n, (nameCounts.get(n) ?? 0) + 1);
  }
  const isDuplicateCandidate = (b: Row) => (nameCounts.get(normalizeName(b.name)) ?? 0) > 1;

  const mergeTargets = businesses.filter((b) => b.sourceType !== "demo").map((b) => ({ id: b.id, name: b.name }));

  const sevenDaysAgo = Date.now() - 7 * 24 * 3600 * 1000;
  const inMainQueue = (b: Row) => b.status === "PENDING" && b.reviewBucket !== "needs_enrichment" && b.reviewBucket !== "needs_contact_info";
  const isNeedsContact = (b: Row) => b.reviewBucket === "needs_contact_info" || (b.status === "PENDING" && hasImage(b) && !hasContact(b));
  const isRecentlyAutoApproved = (b: Row) => b.approvedBy === "system" && b.createdAt.getTime() >= sevenDaysAgo;

  // counts for the filter chips
  const counts = {
    all: businesses.filter(inMainQueue).length,
    ready_to_approve: businesses.filter((b) => b.status === "PENDING" && hasImage(b) && hasContact(b)).length,
    needs_contact: businesses.filter(isNeedsContact).length,
    needs_image: businesses.filter((b) => b.reviewBucket === "needs_enrichment").length,
    duplicate_candidates: businesses.filter((b) => b.status === "PENDING" && isDuplicateCandidate(b)).length,
    auto_approved: businesses.filter(isRecentlyAutoApproved).length,
  };

  function matches(b: Row): boolean {
    switch (filter) {
      case "ready_to_approve":
        return b.status === "PENDING" && hasImage(b) && hasContact(b);
      case "needs_contact":
        return isNeedsContact(b);
      case "needs_image":
        return b.reviewBucket === "needs_enrichment";
      case "duplicate_candidates":
        return b.status === "PENDING" && isDuplicateCandidate(b);
      case "auto_approved":
        return isRecentlyAutoApproved(b);
      default:
        // main queue: pending, excluding the needs-image and needs-contact buckets
        return inMainQueue(b);
    }
  }

  const filtered = businesses.filter(matches);
  const shown = filtered.slice(0, RENDER_CAP);

  function row(b: Row) {
    const source = SOURCE_BADGES[b.sourceType] ?? SOURCE_BADGES.admin_created;
    const chMatched = b.companyNumber || b.sources.some((s) => s.sourceType === "companies_house");
    return (
      <li key={b.id} className="space-y-2 rounded-2xl border border-neutral-200 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Link href={`/admin/business/${b.id}`} className="font-semibold text-neutral-900 hover:text-emerald-700">{b.name}</Link>
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${b.status === "APPROVED" ? "bg-emerald-50 text-emerald-700" : b.status === "PENDING" ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"}`}>
                {b.status}
              </span>
              {b.approvedBy === "system" && <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">🤖 auto-verified</span>}
              {b.reviewBucket === "needs_enrichment" && <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[11px] font-semibold text-orange-700">needs image</span>}
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${source.cls}`}>{source.label}</span>
              {chMatched && <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700">CH ✓</span>}
              {!hasImage(b) && <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-semibold text-neutral-400">no image</span>}
              {!hasContact(b) && <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-semibold text-neutral-400">no contact</span>}
              <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-semibold text-neutral-500">conf {b.dataConfidenceScore}</span>
            </div>
            <p className="mt-0.5 text-xs text-neutral-400">
              {b.category} · {b.city} · {b.owner?.email ?? "unclaimed"} · plan {b.plan}
              {b.approvalReason && <> · <span className="text-neutral-500">{b.approvalReason}</span></>}
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

      <div className="mt-5 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={`/admin/businesses?filter=${f.key}`}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${filter === f.key ? "border-emerald-600 bg-emerald-50 text-emerald-700" : "border-neutral-300 text-neutral-600 hover:border-emerald-600 hover:text-emerald-700"}`}
          >
            {f.label} <span className="ml-1 text-neutral-400">{counts[f.key]}</span>
          </Link>
        ))}
      </div>

      <p className="mt-5 text-sm text-neutral-500">
        Showing {shown.length}{filtered.length > shown.length ? ` of ${filtered.length}` : ""} listings.
        {filter === "all" && " The Needs image queue is hidden here — see the chip above."}
      </p>

      {shown.length === 0 ? (
        <p className="mt-4 text-sm text-neutral-400">Nothing in this queue 🎉</p>
      ) : (
        <ul className="mt-3 space-y-3">{shown.map(row)}</ul>
      )}
    </main>
  );
}
