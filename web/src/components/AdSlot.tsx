import { db } from "@/lib/db";
import type { AdPlacement } from "@/lib/types";

export default async function AdSlot({ placement, className = "" }: { placement: AdPlacement; className?: string }) {
  const now = new Date();
  const ad = await db.ad.findFirst({
    where: {
      placement,
      active: true,
      startsAt: { lte: now },
      OR: [{ endsAt: null }, { endsAt: { gte: now } }],
    },
    orderBy: { createdAt: "desc" },
  });
  if (!ad) return null;

  return (
    <a
      href={ad.targetUrl}
      className={`group relative block overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition hover:shadow-md ${className}`}
    >
      <div className="flex items-center gap-4 p-4 sm:p-5">
        {ad.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={ad.imageUrl} alt={ad.headline} loading="lazy" className="hidden h-20 w-32 rounded-xl object-cover sm:block" />
        )}
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">Sponsored</p>
          <p className="mt-0.5 font-semibold text-neutral-900 group-hover:text-emerald-800">{ad.headline}</p>
          {ad.body && <p className="mt-0.5 truncate text-sm text-neutral-500">{ad.body}</p>}
        </div>
        <span className="hidden shrink-0 text-sm font-semibold text-emerald-700 sm:block">Learn more →</span>
      </div>
    </a>
  );
}
