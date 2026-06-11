/** Deterministic photo placeholder; replace with real uploads later. */
export function photoUrl(seed: string, w = 800, h = 600): string {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`;
}
