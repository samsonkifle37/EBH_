import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdminPage } from "@/lib/adminGuard";

export const metadata = { title: "Admin — Search" };

const ci = (q: string) => ({ contains: q, mode: "insensitive" as const });

export default async function AdminSearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requireAdminPage();
  const q = ((await searchParams).q ?? "").trim();

  const [businesses, users, events, reports] = q
    ? await Promise.all([
        db.business.findMany({
          where: { OR: [{ name: ci(q) }, { city: ci(q) }, { phone: ci(q) }, { website: ci(q) }, { email: ci(q) }] },
          select: { id: true, name: true, city: true, status: true, slug: true },
          take: 10,
        }),
        db.user.findMany({
          where: { OR: [{ name: ci(q) }, { email: ci(q) }] },
          select: { id: true, name: true, email: true, status: true },
          take: 10,
        }),
        db.event.findMany({
          where: { OR: [{ title: ci(q) }, { city: ci(q) }, { venueName: ci(q) }] },
          select: { id: true, title: true, city: true, status: true, slug: true },
          take: 10,
        }),
        db.report.findMany({
          where: { OR: [{ details: ci(q) }, { reason: ci(q) }, { reporterEmail: ci(q) }] },
          select: { id: true, reason: true, status: true, business: { select: { name: true, slug: true } } },
          take: 10,
        }),
      ])
    : [[], [], [], []];

  const total = businesses.length + users.length + events.length + reports.length;

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <nav className="text-sm text-neutral-400">
        <Link href="/admin" className="hover:text-emerald-700">Admin</Link> / <span className="text-neutral-600">Search</span>
      </nav>
      <h1 className="mt-2 text-2xl font-bold tracking-tight">Admin search</h1>

      <form action="/admin/search" method="get" role="search" className="mt-4 flex gap-2">
        <input
          type="search"
          name="q"
          defaultValue={q}
          autoFocus
          aria-label="Search across businesses, users, events and reports"
          placeholder="Search businesses, users, events, reports…"
          className="min-h-11 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600"
        />
        <button className="min-h-11 shrink-0 rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800">Search</button>
      </form>

      {q && <p className="mt-4 text-sm text-neutral-500">{total} result{total === 1 ? "" : "s"} for &ldquo;{q}&rdquo;</p>}

      {q && total === 0 && (
        <p className="mt-4 rounded-2xl border border-dashed border-neutral-200 p-8 text-center text-sm text-neutral-400">Nothing matched. Try a different term.</p>
      )}

      {businesses.length > 0 && (
        <Group title="Businesses">
          {businesses.map((b) => (
            <Row key={b.id} href={`/admin/business/${b.id}`} title={b.name} meta={`${b.city} · ${b.status}`} extra={<a href={`/business/${b.slug}`} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-700 hover:underline">view ↗</a>} />
          ))}
        </Group>
      )}
      {users.length > 0 && (
        <Group title="Users">
          {users.map((u) => (
            <Row key={u.id} href={`/admin/users/${u.id}`} title={u.name} meta={`${u.email} · ${u.status}`} />
          ))}
        </Group>
      )}
      {events.length > 0 && (
        <Group title="Events">
          {events.map((e) => (
            <Row key={e.id} href={`/event/${e.slug}`} title={e.title} meta={`${e.city} · ${e.status}`} />
          ))}
        </Group>
      )}
      {reports.length > 0 && (
        <Group title="Reports">
          {reports.map((r) => (
            <Row key={r.id} href="/admin/reports" title={`${r.reason}${r.business ? ` · ${r.business.name}` : ""}`} meta={r.status} />
          ))}
        </Group>
      )}
    </main>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="text-sm font-bold uppercase tracking-wide text-neutral-400">{title}</h2>
      <ul className="mt-2 space-y-2">{children}</ul>
    </section>
  );
}

function Row({ href, title, meta, extra }: { href: string; title: string; meta: string; extra?: React.ReactNode }) {
  return (
    <li className="flex items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-white p-3">
      <div className="min-w-0">
        <Link href={href} className="font-semibold text-neutral-900 hover:text-emerald-700">{title}</Link>
        <p className="text-xs text-neutral-400">{meta}</p>
      </div>
      {extra}
    </li>
  );
}
