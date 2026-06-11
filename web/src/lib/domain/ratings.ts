export interface RatingInput {
  rating: number;
  status: string;
}

export function aggregateRating(reviews: RatingInput[]): { avg: number; count: number } {
  const visible = reviews.filter((r) => r.status === "VISIBLE");
  if (visible.length === 0) return { avg: 0, count: 0 };
  const sum = visible.reduce((acc, r) => acc + r.rating, 0);
  return { avg: Math.round((sum / visible.length) * 10) / 10, count: visible.length };
}
