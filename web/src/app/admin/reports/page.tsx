import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdminPage } from "@/lib/adminGuard";
import AdminAction from "@/components/AdminAction";
import { REPORT_REASONS } from "@/lib/report";

export const metadata = { title: "Admin — Reports" };

const REASON_LABEL: Record<string, string> = Object.fromEntries(REPORT_REASONS.map((r) => [r.value, r.label]));
const STATUS_TONE: Record<string, string> = {
  open: "bg-amber-50 text-amber-700",
  reviewing: "bg-blue-50 text-blue-700",
  resolved: "bg-emerald-50 text-emerald-700",
  dismissed: "bg-neutral-100 text-neutral-500",
};

export default async function AdminReportsPage() {
  await requireAdminPage();

  const reports = await db.report.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    include: { business: { select: { name: true, slug: true } } },
    take: 300,
  });

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <nav className="text-sm text-neutral-400">
        <Link href="/admin" className="hover:text-emerald-700">Admin</Link> / <span className="text-neutral-600">Reports</span>
      </nav>
      <h1 className="mt-2 text-2xl font-bold tracking-tight">Report queue</h1>
      <p className="mt-1 text-sm text-neutral-500">User-submitted trust &amp; safety reports. Prioritise safety, impersonation and fraud.</p>

      {reports.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-neutral-200 p-8 text-center text-sm text-neutral-400">No reports — all clear.</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {reports.map((r) => (
            <li key={r.id} className={`rounded-2xl border bg-white p-4 ${r.status === "open" ? "border-amber-200" : "border-neutral-200 opacity-80"}`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="font-semibold text-neutral-800">{REASON_LABEL[r.reason] ?? r.reason}</span>
                  {r.business && (
                    <>
                      <span className="text-neutral-400">on</span>
                      <Link href={`/business/${r.business.slug}`} className="font-semibold text-emerald-700 hover:underline">{r.business.name}</Link>
                    </>
                  )}
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${STATUS_TONE[r.status] ?? "bg-neutral-100 text-neutral-500"}`}>{r.status}</span>
                </div>
                <div className="flex gap-1.5">
                  {r.status !== "resolved" && <AdminAction url={`/api/admin/reports/${r.id}`} body={{ action: "resolved" }} label="Resolve" variant="primary" />}
                  {r.status !== "dismissed" && <AdminAction url={`/api/admin/reports/${r.id}`} body={{ action: "dismissed" }} label="Dismiss" variant="neutral" />}
                </div>
              </div>
              {r.details && <p className="mt-2 text-sm text-neutral-600">{r.details}</p>}
              <p className="mt-2 text-xs text-neutral-400">
                {r.reporterId ? "Signed-in reporter" : r.reporterEmail ? `Reporter: ${r.reporterEmail}` : "Anonymous"} ·{" "}
                {r.createdAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
