import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import BusinessForm from "@/components/BusinessForm";

export const metadata = { title: "Edit Listing" };

export default async function EditBusinessPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect("/auth/signin?next=/dashboard");

  const business = await db.business.findUnique({
    where: { id },
    include: { photos: { orderBy: { sortOrder: "asc" } } },
  });
  if (!business || business.ownerId !== session.userId) notFound();

  let socials: Record<string, string> = {};
  try {
    socials = JSON.parse(business.socials);
  } catch {}

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <nav className="text-sm text-neutral-400">
        <Link href="/dashboard" className="hover:text-emerald-700">Dashboard</Link>
        {" / "}
        <span className="text-neutral-600">Edit {business.name}</span>
      </nav>
      <h1 className="mt-2 text-2xl font-bold tracking-tight">Edit listing</h1>
      <div className="mt-8">
        <BusinessForm
          businessId={business.id}
          initial={{
            name: business.name,
            category: business.category,
            city: business.city,
            address: business.address,
            postcode: business.postcode,
            phone: business.phone,
            website: business.website,
            description: business.description,
            instagram: socials.instagram ?? "",
            facebook: socials.facebook ?? "",
            photoUrls: business.photos.map((p) => p.url),
          }}
        />
      </div>
    </main>
  );
}
