/**
 * Enkutatash Partner 2026 badge.
 * Shown on business cards and profiles for enkutatashPartner=true businesses.
 */
export default function EnkutatashBadge({ offer }: { offer?: string }) {
  return (
    <span
      title={offer?.trim() ? `Special offer: ${offer}` : "Enkutatash Partner 2026"}
      className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 ring-1 ring-amber-300/70"
    >
      🌸 Enkutatash Partner 2026
    </span>
  );
}
