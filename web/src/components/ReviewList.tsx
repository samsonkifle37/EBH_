import RatingStars from "@/components/RatingStars";

export interface ReviewItem {
  id: string;
  rating: number;
  title: string;
  body: string;
  createdAt: Date;
  userName: string;
  ownerResponse: string | null;
  businessName?: string;
}

const DATE_FMT = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" });

export default function ReviewList({ reviews }: { reviews: ReviewItem[] }) {
  if (reviews.length === 0) {
    return <p className="text-sm text-neutral-400">No reviews yet — be the first to share your experience.</p>;
  }
  return (
    <ul className="space-y-6">
      {reviews.map((r) => (
        <li key={r.id} className="rounded-2xl border border-neutral-200 bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-800">
                {r.userName.charAt(0)}
              </span>
              <div>
                <p className="text-sm font-semibold text-neutral-800">{r.userName}</p>
                <p className="text-xs text-neutral-400">{DATE_FMT.format(r.createdAt)}</p>
              </div>
            </div>
            <RatingStars rating={r.rating} />
          </div>
          {r.title && <p className="mt-3 font-semibold text-neutral-900">{r.title}</p>}
          <p className="mt-1 text-sm leading-relaxed text-neutral-600">{r.body}</p>
          {r.ownerResponse && (
            <div className="mt-4 rounded-xl bg-neutral-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Response from the owner</p>
              <p className="mt-1 text-sm text-neutral-600">{r.ownerResponse}</p>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
