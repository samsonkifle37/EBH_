import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdminPage } from "@/lib/adminGuard";
import { normalizeName } from "@/lib/domain/match";
import {
  ADMIN_FILTERS,
  isAdminFilter,
  matchesChip,
  buildHaystack,
  searchMatches,
  type AdminFilter,
  type BizFlags,
} from "@/lib/adminBusinessFilter";
import AdminAction from "@/components/AdminAction";
import AdminBusinessTools from "@/components/AdminBusinessTools";
import AdminBusinessSearch from "@/components/AdminBusinessSearch";

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

const RENDER_CAP = 300;

// module-scope keeps the server-component render pure (no Date.now() in body)
function sevenDaysAgoMs(now: number = Date.now()): number {
  return now - 7 * 24 * 3600 * 1000;
}

export default async function AdminBusinessesPage({ searchParams }: { searchParams: Promise<{ filter?: string; q?: string }> }) {
  await requireAdminPage();
  const sp = await searchParams;
  const filter: AdminFilter = isAdminFilter(sp.filter) ? sp.filter : "all";
  const q = (sp.q ?? "").trim();

  const businesses = await db.business.findMany({
    orderBy: [{ status: "desc" }, { createdAt: "desc" }],
    include: {
      owner: { select: { email: true } },
      sources: { select: { sourceType: true } },
      _count: { select: { photos: true } },
    },
  });

  type Row = (typeof businesses)[number];

  // names shared by >1 listing → duplicate candidates
  const nameCounts = new Map<string, number>();
  for (const b of businesses) {
    const n = normalizeName(b.name);
    nameCounts.set(n, (nameCounts.get(n) ?? 0) + 1);
  }

  const sevenDaysAgo = sevenDaysAgoMs();
  const flagsOf = (b: Row): BizFlags => ({
    isPending: b.status === "PENDING",
    hasImage: b._count.photos > 0 || !!b.coverImageUrl || !!b.logoUrl,
    hasContact: !!(b.phone || b.website || b.email),
    isDuplicate: (nameCounts.get(normalizeName(b.name)) ?? 0) > 1,
    needsEnrichment: b.reviewBucket === "needs_enrichment",
    needsContactBucket: b.reviewBucket === "needs_contact_info",
    autoApprovedRecent: b.approvedBy === "system" && b.createdAt.getTime() >= sevenDaysAgo,
  });
  const haystackOf = (b: Row): string =>
    buildHaystack({
      name: b.name,
      city: b.city,
      category: b.category,
      source: SOURCE_BADGES[b.sourceType]?.label ?? b.sourceType,
      phone: b.phone,
      website: b.website,
      email: b.email,
      status: b.status,
      claimed: !!b.ownerId,
      verified: b.verificationLevel >= 1,
    });

  const mergeTargets = businesses.filter((b) => b.sourceType !== "demo").map((b) => ({ id: b.id, name: b.name }));

  // chip counts = per-chip totals (independent of search)
  const counts = Object.fromEntries(
    ADMIN_FILTERS.map((f) => [f.key, businesses.filter((b) => matchesChip(f.key, flagsOf(b))).length]),
  ) as Record<AdminFilter, number>;

  // displayed = active chip ∩ search
  const filtered = businesses.filter((b) => matchesChip(filter, flagsOf(b)) && searchMatches(haystackOf(b), q));
  const shown = filtered.slice(0, RENDER_CAP);
  const chipHref = (key: AdminFilter) => `/admin/businesses?filter=${key}${q ? `&q=${encodeURIComponent(q)}` : ""}`;

  function row(b: Row) {
    const source = SOURCE_BADGES[b.sourceType] ?? SOURCE_BADGES.admin_created;
    const f = flagsOf(b);
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
              {!f.hasImage && <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-semibold text-neutral-400">no image</span>}
              {!f.hasContact && <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-semibold text-neutral-400">no contact</span>}
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
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight">Businesses</h1>
        <Link href="/admin/businesses/new" className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800">+ New business</Link>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {ADMIN_FILTERS.map((f) => (
          <Link
            key={f.key}
            href={chipHref(f.key)}
            aria-current={filter === f.key ? "page" : undefined}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${filter === f.key ? "border-emerald-600 bg-emerald-50 text-emerald-700" : "border-neutral-300 text-neutral-600 hover:border-emerald-600 hover:text-emerald-700"}`}
          >
            {f.label} <span className="ml-1 text-neutral-400">{counts[f.key]}</span>
          </Link>
        ))}
      </div>

      <AdminBusinessSearch />

      <p className="mt-5 text-sm text-neutral-500">
        Showing {shown.length}{filtered.length > shown.length ? ` of ${filtered.length}` : ""} listings
        {q ? ` matching “${q}”` : ""}.
        {filter === "all" && !q && " The Needs image queue is hidden here — see the chip above."}
      </p>

      {shown.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-dashed border-neutral-200 p-8 text-center text-sm text-neutral-400">
          {q ? `No businesses match “${q}” in this queue. Try a different search or clear it.` : "Nothing in this queue 🎉"}
        </p>
      ) : (
        <ul className="mt-3 space-y-3">{shown.map(row)}</ul>
      )}
    </main>
  );
}
