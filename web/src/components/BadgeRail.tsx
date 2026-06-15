import type { Badge } from "@/lib/domain/badges";

/** Gold recognition chips shown under the business name. Pride first. */
export default function BadgeRail({ badges }: { badges: Badge[] }) {
  if (badges.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((b) => (
        <span
          key={b.key}
          title={b.explanation}
          className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-gradient-to-b from-amber-50 to-amber-100 px-3 py-1 text-xs font-semibold text-amber-900 shadow-sm"
        >
          <span aria-hidden>★</span>
          {b.label}
        </span>
      ))}
    </div>
  );
}
