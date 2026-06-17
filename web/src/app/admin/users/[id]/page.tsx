import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdminPage } from "@/lib/adminGuard";
import { parseRoles } from "@/lib/auth";
import UserAdminActions from "@/components/UserAdminActions";

export const metadata = { title: "Admin — User" };

const STATUS_TONE: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700",
  suspended: "bg-amber-50 text-amber-700",
  deactivated: "bg-neutral-100 text-neutral-500",
};

export default async function AdminUserPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage();
  const { id } = await params;

  const user = await db.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, roles: true, status: true, suspendedReason: true, createdAt: true, _count: { select: { businesses: true, reviews: true, events: true } } },
  });
  if (!user) notFound();

  const audit = await db.adminAuditLog.findMany({
    where: { targetType: "user", targetId: id },
    orderBy: { createdAt: "desc" },
    take: 15,
  });

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <nav className="text-sm text-neutral-400">
        <Link href="/admin" className="hover:text-emerald-700">Admin</Link> /{" "}
        <Link href="/admin/users" className="hover:text-emerald-700">Users</Link> / <span className="text-neutral-600">{user.name}</span>
      </nav>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight">{user.name}</h1>
        <span className={`rounded-full px-3 py-1 text-sm font-semibold ${STATUS_TONE[user.status] ?? "bg-neutral-100 text-neutral-500"}`}>{user.status}</span>
      </div>
      <p className="mt-1 text-sm text-neutral-500">
        {user.email} · joined {user.createdAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })} ·{" "}
        {user._count.businesses} businesses · {user._count.events} events · {user._count.reviews} reviews
      </p>
      {user.status === "suspended" && user.suspendedReason && (
        <p className="mt-1 text-sm text-amber-700">Suspension reason: {user.suspendedReason}</p>
      )}

      <div className="mt-6">
        <UserAdminActions userId={user.id} initialRoles={parseRoles(user.roles)} status={user.status} />
      </div>

      <section className="mt-8">
        <h2 className="text-sm font-bold uppercase tracking-wide text-neutral-400">Audit trail</h2>
        {audit.length === 0 ? (
          <p className="mt-2 text-sm text-neutral-400">No admin actions recorded for this user yet.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {audit.map((a) => (
              <li key={a.id} className="rounded-xl border border-neutral-200 bg-white p-3 text-sm">
                <span className="font-semibold text-neutral-800">{a.action}</span>
                <span className="text-neutral-400"> · {a.createdAt.toLocaleString("en-GB")} · by {a.actorEmail || a.actorId}</span>
                {a.metadata && a.metadata !== "{}" && <span className="ml-1 font-mono text-xs text-neutral-400">{a.metadata}</span>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
