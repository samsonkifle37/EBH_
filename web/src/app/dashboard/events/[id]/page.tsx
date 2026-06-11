import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import EventForm from "@/components/EventForm";

export const metadata = { title: "Edit Event" };

function toLocalInputValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect("/auth/signin?next=/dashboard/events");

  const event = await db.event.findUnique({ where: { id } });
  if (!event || event.organizerId !== session.userId) notFound();

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <nav className="text-sm text-neutral-400">
        <Link href="/dashboard/events" className="hover:text-emerald-700">My Events</Link>
        {" / "}
        <span className="text-neutral-600">{event.title}</span>
      </nav>
      <h1 className="mt-2 text-2xl font-bold tracking-tight">Edit event</h1>
      <div className="mt-8">
        <EventForm
          eventId={event.id}
          initial={{
            title: event.title,
            type: event.type,
            city: event.city,
            venueName: event.venueName,
            address: event.address,
            startsAt: toLocalInputValue(event.startsAt),
            description: event.description,
            ticketUrl: event.ticketUrl,
            priceFrom: event.priceFrom === null ? "" : String(event.priceFrom),
            imageUrl: event.imageUrl,
          }}
        />
      </div>
    </main>
  );
}
