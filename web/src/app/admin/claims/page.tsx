import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdminPage } from "@/lib/adminGuard";
import { CLAIM_STATUS_LABELS, type ClaimStatus } from "@/lib/domain/claim";
import AdminAction from "@/components/AdminAction";

export const metadata = { title: "Admin — Claims" };

const STATUS_CLS: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700",
  approved: "bg-emerald-50 text-emerald-700",
  rejected: "bg-red-50 text-red-700",
  needs_more_evidence: "bg-orange-50 text-orange-700",
};

export default async function AdminClaimsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await requireAdminPage();
  const { status } = await searchParams;

  const claims = await db.claimRequest.findMany({
    where: status && status in CLAIM_STATUS_LABELS ? { status } : {},
    orderBy: [{ createdAt: "desc" }],
    include: { business: { select: { name: true, slug: true, ownerId: true } }, user: { select: { email: true } } },
    take: 200,
  });

  const tabs: { key: string; label: string }[] = [
    { key: "", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "needs_more_evidence", label: "Needs evidence" },
    { key: "approved", label: "Approved" },
    { key: "rejected", label: "Rejected" },
  ];

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <nav className="text-sm text-neutral-400">
        <Link href="/admin" className="hover:text-emerald-700">Admin</Link> / <span className="text-neutral-600">Claims</span>
      </nav>
      <h1 className="mt-2 text-2xl font-bold tracking-tight">Business claims</h1>
      <p className="mt-1 text-sm text-neutral-500">Approving a claim transfers ownership and grants the claimant the business-owner role.</p>

      <div className="mt-5 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={`/admin/claims${t.key ? `?status=${t.key}` : ""}`}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${(status ?? "") === t.key ? "border-emerald-600 bg-emerald-50 text-emerald-700" : "border-neutral-300 text-neutral-600 hover:border-emerald-600 hover:text-emerald-700"}`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {claims.length === 0 ? (
        <p className="mt-8 text-sm text-neutral-400">No claims{status ? ` with status ${status}` : ""} yet.</p>
      ) : (
        <ul className="mt-5 space-y-3">
          {claims.map((c) => {
            const actionable = c.status === "pending" || c.status === "needs_more_evidence";
            return (
              <li key={c.id} className="rounded-2xl border border-neutral-200 bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link href={`/business/${c.business.slug}`} className="font-semibold text-neutral-900 hover:text-emerald-700">{c.business.name}</Link>
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${STATUS_CLS[c.status] ?? "bg-neutral-100 text-neutral-600"}`}>
                        {CLAIM_STATUS_LABELS[c.status as ClaimStatus] ?? c.status}
                      </span>
                      <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-semibold text-neutral-500">{c.paymentStatus}</span>
                    </div>
                    <p className="mt-1 text-sm text-neutral-700">{c.claimantName} · {c.claimantEmail}{c.claimantPhone ? ` · ${c.claimantPhone}` : ""}</p>
                    <p className="mt-0.5 text-xs text-neutral-400">account {c.user.email} · {c.createdAt.toLocaleDateString("en-GB")}</p>
                    {c.evidenceUrl && (
                      <p className="mt-1 text-xs"><a href={c.evidenceUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-700 hover:underline">Evidence ↗</a></p>
                    )}
                    {c.notes && <p className="mt-1 text-sm text-neutral-500">“{c.notes}”</p>}
                  </div>
                  {actionable && (
                    <div className="flex flex-wrap gap-1.5">
                      <AdminAction url={`/api/admin/claims/${c.id}`} body={{ action: "approve" }} label="Approve" variant="primary" />
                      <AdminAction url={`/api/admin/claims/${c.id}`} body={{ action: "request_more_evidence" }} label="Request evidence" />
                      <AdminAction url={`/api/admin/claims/${c.id}`} body={{ action: "reject" }} label="Reject" variant="danger" />
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
