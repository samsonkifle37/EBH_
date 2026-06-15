import Link from "next/link";
import { requireOwner, getOwnedBusiness } from "@/lib/ownerGuard";
import { db } from "@/lib/db";
import { trustV2ForBusiness } from "@/lib/trust";
import { earnedBadges } from "@/lib/domain/badges";
import { profileCompletion } from "@/lib/domain/profileCompletion";
import BadgeRail from "@/components/BadgeRail";

export const metadata = { title: "Manage business" };

function signatureCount(json: string): number {
  try {
    const v = JSON.parse(json);
    return Array.isArray(v) ? v.filter((s) => s && (s.title || s.imageUrl)).length : 0;
  } catch {
    return 0;
  }
}

export default async function OwnerBusiness({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireOwner(`/owner/business/${id}`);
  await getOwnedBusiness(id, session.userId);

  const business = await db.business.findUniqueOrThrow({
    where: { id },
    include: {
      photos: { select: { id: true } },
      reviews: { select: { rating: true, status: true } },
      sources: { select: { sourceType: true } },
    },
  });
  const { score } = trustV2ForBusiness({ ...business });
  const badges = earnedBadges(business);
  const completion = profileCompletion({
    coverImageUrl: business.coverImageUrl,
    founderPhotoUrl: business.founderPhotoUrl,
    founderStory: business.founderStory,
    brandStory: business.brandStory,
    signatureCount: signatureCount(business.signatureItems),
    phone: business.phone,
    website: business.website,
    hoursJson: business.openingHours,
    photoCount: business.photos.length,
  });

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <nav className="text-sm text-neutral-400">
        <Link href="/owner" className="hover:text-emerald-700">Owner</Link> / <span className="text-neutral-600">{business.name}</span>
      </nav>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight">{business.name}</h1>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">Trust {score}/100</span>
      </div>
      <p className="mt-1 text-sm text-neutral-500">{business.category} · {business.city} · plan {business.plan}</p>

      {badges.length > 0 && <div className="mt-4"><BadgeRail badges={badges} /></div>}

      {/* Profile completion — celebration, not a chore */}
      <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5">
        <div className="flex items-center gap-4">
          <div
            className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full"
            style={{ background: `conic-gradient(#047857 ${completion.score * 3.6}deg, #e5e7eb 0deg)` }}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-sm font-bold text-neutral-800">{completion.score}%</div>
          </div>
          <div className="min-w-0">
            {completion.complete ? (
              <>
                <p className="font-semibold text-emerald-700">🎉 Your profile is complete!</p>
                <p className="text-sm text-neutral-500">It looks great — share it and start collecting reviews.</p>
              </>
            ) : (
              <>
                <p className="font-semibold text-neutral-900">Your profile is {completion.score}% complete</p>
                {completion.nextAction && (
                  <p className="mt-0.5 text-sm text-neutral-500">
                    Next step: <Link href={`/dashboard/business/${id}/edit`} className="font-semibold text-emerald-700 hover:underline">{completion.nextAction.label}</Link> — {completion.nextAction.hint}
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <Link href={`/owner/business/${id}/analytics`} className="rounded-2xl border border-neutral-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-emerald-600 hover:shadow-md">
          <p className="font-bold text-neutral-900">Analytics</p>
          <p className="mt-1 text-sm text-neutral-500">Views and clicks over 7/30/90 days</p>
        </Link>
        <Link href={`/owner/business/${id}/reviews`} className="rounded-2xl border border-neutral-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-emerald-600 hover:shadow-md">
          <p className="font-bold text-neutral-900">Reviews</p>
          <p className="mt-1 text-sm text-neutral-500">Read and respond to customer reviews</p>
        </Link>
        <Link href={`/dashboard/business/${id}/edit`} className="rounded-2xl border border-neutral-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-emerald-600 hover:shadow-md">
          <p className="font-bold text-neutral-900">Edit listing</p>
          <p className="mt-1 text-sm text-neutral-500">Details, photos, hours and contact</p>
        </Link>
        <Link href={`/business/${business.slug}`} className="rounded-2xl border border-neutral-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-emerald-600 hover:shadow-md">
          <p className="font-bold text-neutral-900">View public listing ↗</p>
          <p className="mt-1 text-sm text-neutral-500">See what customers see</p>
        </Link>
        <Link href={`/owner/business/${id}/share`} className="rounded-2xl border border-amber-200 bg-amber-50 p-5 transition hover:-translate-y-0.5 hover:border-amber-500 hover:shadow-md sm:col-span-2">
          <p className="font-bold text-amber-900">📣 Get your share kit</p>
          <p className="mt-1 text-sm text-amber-800">Download a ready-made profile card, Instagram story and QR poster — &ldquo;Proud member of Ethiopian Business Hub UK.&rdquo;</p>
        </Link>
      </div>

      <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
        <p className="text-sm font-semibold text-emerald-900">Grow with EBH</p>
        <p className="mt-1 text-sm text-emerald-800">Verified and Featured plans boost your trust score and search placement. Paid plans go live soon.</p>
        <Link href="/pricing" className="mt-3 inline-block rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800">See plans</Link>
      </div>
    </main>
  );
}
