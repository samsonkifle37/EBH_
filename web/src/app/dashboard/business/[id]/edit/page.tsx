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
  let signatureItems: { title: string; description: string; imageUrl: string }[] = [];
  try {
    const v = JSON.parse(business.signatureItems);
    if (Array.isArray(v)) signatureItems = v;
  } catch {}
  let services: { name: string; description: string; priceRange: string; imageUrl: string }[] = [];
  try {
    const v = JSON.parse(business.services);
    if (Array.isArray(v)) services = v;
  } catch {}
  let faqs: { question: string; answer: string }[] = [];
  try {
    const v = JSON.parse(business.faqs);
    if (Array.isArray(v)) faqs = v;
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
            coverImageUrl: business.coverImageUrl,
            logoUrl: business.logoUrl,
            founderName: business.founderName,
            founderPhotoUrl: business.founderPhotoUrl,
            founderStory: business.founderStory,
            brandStory: business.brandStory,
            yearFounded: business.yearFounded,
            signatureItems,
            whatsapp: business.whatsapp,
            services,
            faqs,
          }}
        />
      </div>
    </main>
  );
}
