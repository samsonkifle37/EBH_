import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import EventForm from "@/components/EventForm";

export const metadata = { title: "Create Event" };

export default async function NewEventPage() {
  const session = await getSession();
  if (!session) redirect("/auth/signin?next=/dashboard/events/new");

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold tracking-tight">Create an event</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Free to list. Promotion packages (£25–£250) boost your event across the platform.
      </p>
      <div className="mt-8">
        <EventForm />
      </div>
    </main>
  );
}
