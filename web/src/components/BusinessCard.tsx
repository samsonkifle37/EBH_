import Link from "next/link";
import RatingStars from "@/components/RatingStars";
import { VerifiedBadge, FeaturedBadge, OpenNowBadge } from "@/components/Badges";
import { CATEGORY_LABELS, CITY_LABELS, isCategory, isCity, type Category, type City } from "@/lib/types";
import type { BusinessSummary } from "@/lib/queries/businesses";

export default function BusinessCard({ business }: { business: BusinessSummary }) {
  const categoryLabel = isCategory(business.category) ? CATEGORY_LABELS[business.category as Category] : business.category;
  const cityLabel = isCity(business.city) ? CITY_LABELS[business.city as City] : business.city;

  return (
    <Link
      href={`/business/${business.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
        {business.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={business.photoUrl}
            alt={business.name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-50 to-amber-50 text-4xl">🏪</div>
        )}
        {business.featured && (
          <div className="absolute left-3 top-3"><FeaturedBadge /></div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold leading-snug text-neutral-900 group-hover:text-emerald-800">{business.name}</h3>
        </div>
        <RatingStars rating={business.avg} count={business.count} />
        <div className="flex flex-wrap items-center gap-1.5">
          <VerifiedBadge score={business.verificationScore} level={business.verificationLevel} />
          <OpenNowBadge open={business.openNow} />
        </div>
        <p className="mt-auto pt-1 text-sm text-neutral-500">
          {categoryLabel} · 📍 {cityLabel}
        </p>
      </div>
    </Link>
  );
}
