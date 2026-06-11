export default function RatingStars({ rating, count, size = "sm" }: { rating: number; count?: number; size?: "sm" | "lg" }) {
  const full = Math.round(rating);
  return (
    <span className={`inline-flex items-center gap-1 ${size === "lg" ? "text-base" : "text-sm"}`}>
      <span className="text-amber-500" aria-hidden>
        {"★".repeat(Math.min(5, full))}
        <span className="text-neutral-300">{"★".repeat(Math.max(0, 5 - full))}</span>
      </span>
      <span className="font-semibold text-neutral-800">{rating > 0 ? rating.toFixed(1) : "New"}</span>
      {count !== undefined && count > 0 && <span className="text-neutral-400">({count})</span>}
    </span>
  );
}
