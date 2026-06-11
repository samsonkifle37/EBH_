import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import BusinessForm from "@/components/BusinessForm";

export const metadata = { title: "List Your Business" };

export default async function NewBusinessPage() {
  const session = await getSession();
  if (!session) redirect("/auth/signin?next=/dashboard/new");

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold tracking-tight">List your business</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Free forever. Complete profiles earn a higher trust score and rank better in search.
      </p>
      <div className="mt-8">
        <BusinessForm />
      </div>
    </main>
  );
}
