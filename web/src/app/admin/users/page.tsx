import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdminPage } from "@/lib/adminGuard";

export const metadata = { title: "Admin — Users" };

const ROLE_TONE: Record<string, string> = {
  ADMIN: "bg-red-50 text-red-700",
  BUSINESS_OWNER: "bg-emerald-50 text-emerald-700",
  EVENT_ORGANIZER: "bg-blue-50 text-blue-700",
  USER: "bg-neutral-100 text-neutral-500",
};

export default async function AdminUsersPage() {
  await requireAdminPage();

  const users = await db.user.findMany({
    // Hide any legacy anonymized tombstones (deleted+<id>@ebh.invalid) left by the
    // old admin-delete behaviour; admin delete is now a true hard-delete.
    where: { NOT: { email: { endsWith: "@ebh.invalid" } } },
    orderBy: { createdAt: "desc" },
    take: 500,
    select: { id: true, name: true, email: true, roles: true, createdAt: true, _count: { select: { businesses: true, reviews: true } } },
  });

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <nav className="text-sm text-neutral-400">
        <Link href="/admin" className="hover:text-emerald-700">Admin</Link> / <span className="text-neutral-600">Users</span>
      </nav>
      <h1 className="mt-2 text-2xl font-bold tracking-tight">Users</h1>
      <p className="mt-1 text-sm text-neutral-500">{users.length} most recent users.</p>

      {users.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-neutral-200 p-8 text-center text-sm text-neutral-400">No users yet.</p>
      ) : (
        <ul className="mt-6 space-y-2">
          {users.map((u) => (
            <li key={u.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-neutral-200 bg-white p-4">
              <div className="min-w-0">
                <Link href={`/admin/users/${u.id}`} className="font-semibold text-neutral-900 hover:text-emerald-700">{u.name}</Link>
                <p className="text-xs text-neutral-400">{u.email} · joined {u.createdAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</p>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {u.roles.split(",").filter(Boolean).map((r) => (
                  <span key={r} className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${ROLE_TONE[r] ?? "bg-neutral-100 text-neutral-500"}`}>{r}</span>
                ))}
                <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-semibold text-neutral-500">{u._count.businesses} biz · {u._count.reviews} reviews</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
