import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdminPage } from "@/lib/adminGuard";
import AdminAction from "@/components/AdminAction";

export const metadata = { title: "Admin — Events" };

const DATE_FMT = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });

export default async function AdminEventsPage() {
  await requireAdminPage();

  const events = await db.event.findMany({
    orderBy: [{ status: "desc" }, { startsAt: "asc" }],
    include: { organizer: { select: { email: true } } },
  });
  const pending = events.filter((e) => e.status === "PENDING");
  const rest = events.filter((e) => e.status !== "PENDING");

  function row(e: (typeof events)[number]) {
    return (
      <li key={e.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-neutral-200 bg-white p-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Link href={`/event/${e.slug}`} className="font-semibold text-neutral-900 hover:text-emerald-700">{e.title}</Link>
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${e.status === "APPROVED" ? "bg-emerald-50 text-emerald-700" : e.status === "PENDING" ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"}`}>
              {e.status}
            </span>
            {e.featured && <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">★ Featured</span>}
          </div>
          <p className="mt-0.5 text-xs text-neutral-400">
            {DATE_FMT.format(e.startsAt)} · {e.venueName}, {e.city} · {e.organizer.email}
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {e.status !== "APPROVED" && <AdminAction url={`/api/admin/events/${e.id}`} body={{ action: "approve" }} label="Approve" variant="primary" />}
          {e.status !== "REJECTED" && <AdminAction url={`/api/admin/events/${e.id}`} body={{ action: "reject" }} label="Reject" variant="danger" />}
          {e.featured
            ? <AdminAction url={`/api/admin/events/${e.id}`} body={{ action: "unfeature" }} label="Unfeature" />
            : <AdminAction url={`/api/admin/events/${e.id}`} body={{ action: "feature" }} label="Feature" />}
        </div>
      </li>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <nav className="text-sm text-neutral-400">
        <Link href="/admin" className="hover:text-emerald-700">Admin</Link> / <span className="text-neutral-600">Events</span>
      </nav>
      <h1 className="mt-2 text-2xl font-bold tracking-tight">Events</h1>

      <h2 className="mt-8 text-lg font-bold">Awaiting approval ({pending.length})</h2>
      {pending.length === 0 ? (
        <p className="mt-2 text-sm text-neutral-400">Queue is clear 🎉</p>
      ) : (
        <ul className="mt-3 space-y-3">{pending.map(row)}</ul>
      )}

      <h2 className="mt-10 text-lg font-bold">All events ({rest.length})</h2>
      <ul className="mt-3 space-y-3">{rest.map(row)}</ul>
    </main>
  );
}
