import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { recordPrideEvent } from "@/lib/analytics/record";
import { VISITOR_COOKIE, ATTRIBUTION_COOKIE, parseAttribution } from "@/lib/analytics/attribution";
import { isShareChannel } from "@/lib/analytics/events";
import { aggregateRating } from "@/lib/domain/ratings";
import { isOpenNow, parseOpeningHours } from "@/lib/domain/hours";
import { trustV2ForBusiness } from "@/lib/trust";
import { summarizeReviews } from "@/lib/domain/reviewSummary";
import { allowDemoData } from "@/lib/flags";
import Gallery from "@/components/Gallery";
import RatingStars from "@/components/RatingStars";
import { VerifiedBadge, FeaturedBadge, OpenNowBadge } from "@/components/Badges";
import OpeningHoursTable from "@/components/OpeningHoursTable";
import MapEmbed from "@/components/MapEmbed";
import ReviewList from "@/components/ReviewList";
import ReviewSummaryCard from "@/components/ReviewSummaryCard";
import TrackedLink from "@/components/TrackedLink";
import FavoriteButton from "@/components/FavoriteButton";
import ShareButton from "@/components/ShareButton";
import AdSlot from "@/components/AdSlot";
import NuCallout from "@/components/NuCallout";
import BadgeRail from "@/components/BadgeRail";
import BusinessIdentity from "@/components/BusinessIdentity";
import { earnedBadges } from "@/lib/domain/badges";
import { breadcrumbJsonLd, faqJsonLd } from "@/lib/seo";
import { parseServices, parseFaqs, whatsappLink, trustBreakdownRows } from "@/lib/website";
import { profileCompletion } from "@/lib/domain/profileCompletion";
import BusinessLogo from "@/components/BusinessLogo";
import WhatsAppButton from "@/components/WhatsAppButton";
import BusinessFaq from "@/components/BusinessFaq";
import TrustBreakdown from "@/components/TrustBreakdown";
import { CATEGORY_LABELS, CITY_LABELS, isCategory, isCity, type Category, type City } from "@/lib/types";

interface Props {
  params: Promise<{ slug: string }>;
}

/** True if either date is within the last `days` (module-scope keeps render pure). */
function recentlyActive(a: Date | null, b: Date, days = 30, now: number = Date.now()): boolean {
  const cutoff = now - days * 86_400_000;
  return (a?.getTime() ?? 0) >= cutoff || b.getTime() >= cutoff;
}

/** Short "updated N days ago" string for the freshness signal. */
function ago(d: Date, now: number = Date.now()): string {
  const days = Math.floor((now - d.getTime()) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} week${days < 14 ? "" : "s"} ago`;
  if (days < 365) return `${Math.floor(days / 30)} month${days < 60 ? "" : "s"} ago`;
  return `${Math.floor(days / 365)} year${days < 730 ? "" : "s"} ago`;
}

async function getBusiness(slug: string) {
  return db.business.findUnique({
    where: { slug },
    include: {
      photos: { orderBy: { sortOrder: "asc" } },
      sources: { select: { sourceType: true } },
      reviews: {
        where: { status: "VISIBLE" },
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true } } },
      },
    },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const business = await getBusiness(slug);
  if (!business || business.status !== "APPROVED") return {};
  const cityLabel = isCity(business.city) ? CITY_LABELS[business.city as City] : business.city;
  return {
    title: `${business.name} — ${cityLabel}`,
    description: business.description.slice(0, 160),
    alternates: { canonical: `/business/${business.slug}` },
    openGraph: { images: business.photos[0] ? [business.photos[0].url] : [] },
  };
}

export default async function BusinessPage({ params }: Props) {
  const { slug } = await params;
  const [business, session] = await Promise.all([getBusiness(slug), getSession()]);
  if (!business || business.status !== "APPROVED") notFound();
  if (business.sourceType === "demo" && !allowDemoData()) notFound();

  // record listing view (fire and forget) — legacy analytics dashboard feed
  void db.analyticsEvent.create({ data: { type: "LISTING_VIEW", businessId: business.id } }).catch(() => {});

  // pride loop: attributed profile view (+ inbound QR scan when applicable)
  {
    const jar = await cookies();
    const visitorId = jar.get(VISITOR_COOKIE)?.value || "anon";
    const attribution = parseAttribution(jar.get(ATTRIBUTION_COOKIE)?.value);
    const channel = attribution && isShareChannel(attribution.channel) ? attribution.channel : "direct";
    void recordPrideEvent({ action: "PROFILE_VIEW", businessId: business.id, visitorId, channel });
    if (attribution?.channel === "qr") {
      void recordPrideEvent({ action: "SHARE_QR_SCAN", businessId: business.id, visitorId, channel: "qr" });
    }
  }

  const { avg, count } = aggregateRating(business.reviews);
  const hours = parseOpeningHours(business.openingHours);
  const openNow = isOpenNow(hours);
  const score = trustV2ForBusiness({
    plan: business.plan,
    ownerId: business.ownerId,
    sourceType: business.sourceType,
    companyNumber: business.companyNumber,
    mapsUrl: business.mapsUrl,
    phone: business.phone,
    website: business.website,
    email: business.email,
    description: business.description,
    address: business.address,
    openingHours: business.openingHours,
    socials: business.socials,
    lastSourceCheckedAt: business.lastSourceCheckedAt,
    photos: business.photos,
    reviews: business.reviews,
    sources: business.sources,
  }).score;
  const summary = summarizeReviews(business.reviews.map((r) => `${r.title}. ${r.body}`));

  const badges = earnedBadges({
    ownerId: business.ownerId,
    claimedAt: business.claimedAt,
    verificationLevel: business.verificationLevel,
    plan: business.plan,
  });
  const sourceTypeList = business.sources.map((s) => s.sourceType);
  let signatureItems: { title?: string; description?: string; imageUrl?: string }[] = [];
  try {
    const parsed = JSON.parse(business.signatureItems);
    if (Array.isArray(parsed)) signatureItems = parsed;
  } catch {}
  const categoryLabel = isCategory(business.category) ? CATEGORY_LABELS[business.category as Category] : business.category;
  const cityLabel = isCity(business.city) ? CITY_LABELS[business.city as City] : business.city;

  // --- website essentials ---
  const services = parseServices(business.services);
  const faqs = parseFaqs(business.faqs);
  const waLink = business.whatsapp ? whatsappLink(business.whatsapp, `Hi ${business.name}, I found you on Ethiopian Business Hub`) : null;
  const companiesHouse = business.companyNumber.length > 0 || sourceTypeList.includes("companies_house");
  const googleVerified = business.mapsUrl.length > 0 || sourceTypeList.includes("google_places");
  const recentActivity = recentlyActive(business.lastSourceCheckedAt, business.updatedAt);
  const completion = profileCompletion({
    coverImageUrl: business.coverImageUrl,
    founderPhotoUrl: business.founderPhotoUrl,
    founderStory: business.founderStory,
    brandStory: business.brandStory,
    signatureCount: signatureItems.filter((s) => s.title || s.imageUrl).length,
    phone: business.phone,
    website: business.website,
    hoursJson: business.openingHours,
    photoCount: business.photos.length,
  }).score;
  const trustRows = trustBreakdownRows({
    ownerClaimed: !!business.ownerId,
    companiesHouse,
    google: googleVerified,
    photos: business.photos.length,
    reviews: count,
    recentActivity,
    completion,
  });

  let socials: Record<string, string> = {};
  try {
    socials = JSON.parse(business.socials);
  } catch {}

  const [favorite, follow, myReview] = session
    ? await Promise.all([
        db.favorite.findUnique({ where: { userId_businessId: { userId: session.userId, businessId: business.id } } }),
        db.follow.findUnique({ where: { userId_businessId: { userId: session.userId, businessId: business.id } } }),
        db.review.findUnique({ where: { businessId_userId: { businessId: business.id, userId: session.userId } } }),
      ])
    : [null, null, null];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: business.name,
    description: business.description,
    address: {
      "@type": "PostalAddress",
      streetAddress: business.address,
      addressLocality: cityLabel,
      postalCode: business.postcode,
      addressCountry: "GB",
    },
    telephone: business.phone || undefined,
    url: business.website || undefined,
    image: business.photos.map((p) => p.url),
    ...(count > 0 && {
      aggregateRating: { "@type": "AggregateRating", ratingValue: avg, reviewCount: count },
      review: business.reviews.slice(0, 5).map((r) => ({
        "@type": "Review",
        reviewRating: { "@type": "Rating", ratingValue: r.rating },
        author: { "@type": "Person", name: r.user.name },
        reviewBody: r.body,
      })),
    }),
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              ...(isCategory(business.category) && isCity(business.city)
                ? [{ name: `${categoryLabel} in ${cityLabel}`, path: `/${business.category}/${business.city}` }]
                : []),
              { name: business.name, path: `/business/${business.slug}` },
            ]),
          ),
        }}
      />
      {faqs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(faqs.map((f) => ({ q: f.question, a: f.answer })))) }}
        />
      )}

      <nav className="mb-4 text-sm text-neutral-400">
        <Link href="/" className="hover:text-emerald-700">Home</Link>
        {" / "}
        {isCategory(business.category) && isCity(business.city) ? (
          <Link href={`/${business.category}/${business.city}`} className="hover:text-emerald-700">
            {categoryLabel} in {cityLabel}
          </Link>
        ) : (
          <span>{categoryLabel}</span>
        )}
        {" / "}
        <span className="text-neutral-600">{business.name}</span>
      </nav>

      {business.coverImageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={business.coverImageUrl} alt={`${business.name} cover`} className="mb-6 aspect-[3/1] w-full rounded-3xl object-cover" />
      )}

      <Gallery photos={business.photos} name={business.name} />

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px]">
        <div>
          <div className="flex items-start gap-4">
            <BusinessLogo name={business.name} logoUrl={business.logoUrl} className="h-16 w-16 shrink-0 text-2xl sm:h-20 sm:w-20" />
            <div className="min-w-0">
              {badges.length > 0 && <div className="mb-2"><BadgeRail badges={badges} /></div>}
              <div className="flex flex-wrap items-center gap-2">
                {business.featured && <FeaturedBadge />}
                <VerifiedBadge score={score} level={business.verificationLevel} />
                <OpenNowBadge open={openNow} />
              </div>
              <h1 className="mt-2 text-3xl font-bold tracking-tight">{business.name}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-neutral-500">
                {count > 0 ? (
                  <RatingStars rating={avg} count={count} size="lg" />
                ) : business.googleRating == null ? (
                  <span className="font-medium text-neutral-400">No rating yet</span>
                ) : null}
                {business.googleRating != null && (
                  <a
                    href={business.mapsUrl || undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-neutral-600 hover:text-emerald-700"
                  >
                    ⭐ {business.googleRating.toFixed(1)} on Google ({business.googleReviewCount ?? 0})
                  </a>
                )}
                <span>·</span>
                <span>{categoryLabel}</span>
                <span>·</span>
                <span>📍 {business.address}, {cityLabel} {business.postcode}</span>
              </div>
            </div>
          </div>

          {/* Freshness signals */}
          <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-neutral-400">
            <span>🕓 Updated {ago(business.updatedAt)}</span>
            {!!business.ownerId && <span>· <span className="text-emerald-700">✓ Owner verified</span></span>}
            {companiesHouse && <span>· <span className="text-emerald-700">✓ Companies House matched</span></span>}
            {googleVerified && <span>· <span className="text-emerald-700">✓ On Google</span></span>}
          </p>

          <p className="mt-5 max-w-2xl leading-relaxed text-neutral-700">{business.description}</p>

          <div className="mt-6 flex flex-wrap gap-2">
            {waLink && (
              <WhatsAppButton businessId={business.id} href={waLink} className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-4 py-2 text-sm font-semibold text-white hover:brightness-95" />
            )}
            {business.phone && (
              <TrackedLink href={`tel:${business.phone.replace(/\s/g, "")}`} type="PHONE_CLICK" businessId={business.id} className="inline-flex items-center gap-2 rounded-xl border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-700 hover:border-emerald-600 hover:text-emerald-700">
                📞 Call
              </TrackedLink>
            )}
            <FavoriteButton businessId={business.id} kind="favorite" initial={!!favorite} signedIn={!!session} />
            <FavoriteButton businessId={business.id} kind="follow" initial={!!follow} signedIn={!!session} />
            {!myReview && (
              <Link
                href={session ? `/business/${business.slug}/review` : `/auth/signin?next=/business/${business.slug}/review`}
                className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
              >
                ✍ Write a review
              </Link>
            )}
            <ShareButton businessId={business.id} title={business.name} slug={business.slug} />
            {business.lat && business.lng && (
              <TrackedLink
                href={`https://www.openstreetmap.org/directions?to=${business.lat}%2C${business.lng}`}
                type="DIRECTION_CLICK"
                businessId={business.id}
                className="rounded-xl border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-700 hover:border-emerald-600 hover:text-emerald-700"
              >
                🧭 Directions
              </TrackedLink>
            )}
          </div>

          <div className="mt-6">
            <TrustBreakdown businessId={business.id} score={score} rows={trustRows} />
          </div>

          {!business.ownerId && (
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm text-amber-800">
                <span className="font-semibold">Is this your business?</span> Claim your free EBH business website — add your logo, WhatsApp, services and get verified.
              </p>
              <Link href={`/claim/${business.slug}`} className="shrink-0 rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700">
                Claim your website
              </Link>
            </div>
          )}

          <BusinessIdentity
            founderName={business.founderName}
            founderPhotoUrl={business.founderPhotoUrl}
            founderStory={business.founderStory}
            brandStory={business.brandStory}
            yearFounded={business.yearFounded}
            signatureItems={signatureItems}
            verification={{
              ownerClaimed: !!business.ownerId,
              companiesHouse: business.companyNumber.length > 0 || sourceTypeList.includes("companies_house"),
              google: business.mapsUrl.length > 0 || sourceTypeList.includes("google_places"),
              level: business.verificationLevel,
              lastVerified: business.lastSourceCheckedAt,
              trustScore: score,
            }}
          />

          {services.length > 0 && (
            <section className="mt-10">
              <h2 className="text-sm font-bold uppercase tracking-wide text-neutral-400">Services</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {services.map((s, i) => (
                  <div key={i} className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
                    {s.imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={s.imageUrl} alt={s.name} className="aspect-[4/3] w-full object-cover" loading="lazy" />
                    )}
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-neutral-900">{s.name}</p>
                        {s.priceRange && <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">{s.priceRange}</span>}
                      </div>
                      {s.description && <p className="mt-1 text-sm text-neutral-500">{s.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <BusinessFaq faqs={faqs} />

          <section className="mt-10">
            <h2 className="text-xl font-bold tracking-tight">Reviews</h2>
            <div className="mt-4 space-y-5">
              {business.reviews.length === 0 && (
                <p className="rounded-2xl border border-dashed border-neutral-200 p-6 text-sm text-neutral-500">
                  No reviews yet. Be the first to review.
                </p>
              )}
              <ReviewSummaryCard loves={summary.loves} dislikes={summary.dislikes} />
              <ReviewList
                reviews={business.reviews.map((r) => ({
                  id: r.id,
                  rating: r.rating,
                  title: r.title,
                  body: r.body,
                  createdAt: r.createdAt,
                  userName: r.user.name,
                  ownerResponse: r.ownerResponse,
                }))}
              />
            </div>
          </section>
        </div>

        <aside className="space-y-5">
          <div className="rounded-2xl border border-neutral-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-neutral-900">Contact</h2>
            <div className="mt-3 space-y-2.5 text-sm">
              {waLink && (
                <WhatsAppButton businessId={business.id} href={waLink} label={`WhatsApp ${business.whatsapp}`} className="flex items-center gap-2 font-medium text-[#1da851] hover:underline" />
              )}
              {business.phone && (
                <TrackedLink href={`tel:${business.phone.replace(/\s/g, "")}`} type="PHONE_CLICK" businessId={business.id} className="flex items-center gap-2 font-medium text-emerald-700 hover:underline">
                  📞 {business.phone}
                </TrackedLink>
              )}
              {business.website && (
                <TrackedLink href={business.website} type="WEBSITE_CLICK" businessId={business.id} className="flex items-center gap-2 font-medium text-emerald-700 hover:underline">
                  🌐 Visit website
                </TrackedLink>
              )}
              {Object.entries(socials).map(([k, v]) => (
                <a key={k} href={v} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 capitalize text-neutral-500 hover:text-emerald-700">
                  🔗 {k}
                </a>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-neutral-900">Opening hours</h2>
              <OpenNowBadge open={openNow} />
            </div>
            <div className="mt-3">
              <OpeningHoursTable hours={hours} />
            </div>
          </div>

          {business.lat && business.lng && (
            <MapEmbed lat={business.lat} lng={business.lng} name={business.name} />
          )}

          <NuCallout title="Visiting Ethiopia?" body="Discover trusted hotels, tours and experiences — and plan the whole trip with NU." cta="Explore with NU" />

          <AdSlot placement="BUSINESS_DETAIL" />

          <p className="text-center text-xs text-neutral-400">
            <Link href={`/report?business=${business.slug}`} className="hover:text-emerald-700 hover:underline">
              ⚑ Report this listing
            </Link>
          </p>
        </aside>
      </div>
    </main>
  );
}
