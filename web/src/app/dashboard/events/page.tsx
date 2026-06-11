import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

export const metadata = { title: "My Events" };

const DATE_FMT = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

export default async function MyEventsPage() {
  const session = await getSession();
  if (!session) redirect("/auth/signin?next=/dashboard/events");

  const events = await db.event.findMany({
    where: { organizerId: session.userId },
    orderBy: { startsAt: "asc" },
  });

  const since = new Date(Date.now() - 30 * 24 * 3600 * 1000);
  const stats = await Promise.all(
    events.map(async (e) => ({
      id: e.id,
      views: await db.analyticsEvent.count({ where: { eventId: e.id, type: "EVENT_VIEW", createdAt: { gte: since } } }),
      tickets: await db.analyticsEvent.count({ where: { eventId: e.id, type: "TICKET_CLICK", createdAt: { gte: since } } }),
    }))
  );
  const statById = new Map(stats.map((s) => [s.id, s]));

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">My Events</h1>
          <p className="mt-1 text-sm text-neutral-500">Create, promote and track your events.</p>
        </div>
        <Link href="/dashboard/events/new" className="rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800">
          + Create event
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-dashed border-neutral-300 bg-white px-6 py-16 text-center">
          <p className="text-3xl">🎟</p>
          <p className="mt-3 font-semibold text-neutral-700">No events yet</p>
          <p className="mt-1 text-sm text-neutral-500">Create your first event and reach the Habesha community across the UK.</p>
          <Link href="/dashboard/events/new" className="mt-5 inline-block rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800">
            Create event
          </Link>
        </div>
      ) : (
        <ul className="mt-8 space-y-4">
          {events.map((e) => {
            const s = statById.get(e.id);
            return (
              <li key={e.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-4">
                {e.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={e.imageUrl} alt={e.title} className="h-16 w-24 rounded-xl object-cover" />
                ) : (
                  <div className="flex h-16 w-24 items-center justify-center rounded-xl bg-neutral-100 text-2xl">🎟</div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-neutral-900">{e.title}</p>
                    {e.status !== "APPROVED" && (
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                        {e.status === "PENDING" ? "Awaiting approval" : "Rejected"}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm text-neutral-500">
                    {DATE_FMT.format(e.startsAt)} · {e.venueName}, {e.city}
                  </p>
                  <p className="mt-1 text-xs text-neutral-400">
                    Last 30 days: {s?.views ?? 0} views · {s?.tickets ?? 0} ticket clicks
                  </p>
                </div>
                <div className="flex shrink-0 flex-col gap-1.5 text-sm font-semibold">
                  <Link href={`/dashboard/events/${e.id}`} className="text-emerald-700 hover:underline">Edit →</Link>
                  {e.status === "APPROVED" && (
                    <Link href={`/event/${e.slug}`} className="text-neutral-500 hover:underline">View public page</Link>
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
