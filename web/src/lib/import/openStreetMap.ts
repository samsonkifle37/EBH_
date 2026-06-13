import type { OsmElement } from "@/lib/domain/importMap";

export function overpassUrl(): string {
  return process.env.OVERPASS_API_URL ?? "https://overpass-api.de/api/interpreter";
}

/** Exact PRD Overpass query: Ethiopian/Eritrean businesses across the UK. */
export const OVERPASS_QUERY = `[out:json][timeout:120];

area["ISO3166-1"="GB"][admin_level=2]->.uk;

(
  nwr["cuisine"~"ethiopian|eritrean",i](area.uk);

  nwr["name"~"Ethiopian|Eritrean|Habesha|Abyssinia|Addis|Injera|Lalibela|Axum|Sheba|Walia|Nyala",i](area.uk);
);

out center tags;`;

// Shared rate limiter: enforce a 2s gap between Overpass requests across all jobs.
const MIN_GAP_MS = 2000;
let lastRequestAt = 0;
let queue: Promise<unknown> = Promise.resolve();

async function throttle<T>(fn: () => Promise<T>): Promise<T> {
  const run = async (): Promise<T> => {
    const wait = MIN_GAP_MS - (Date.now() - lastRequestAt);
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    lastRequestAt = Date.now();
    return fn();
  };
  const result = queue.then(run, run);
  queue = result.then(
    () => undefined,
    () => undefined
  );
  return result;
}

/** Fetch Ethiopian/Eritrean OSM elements. Throws a descriptive error on failure. */
export async function fetchOverpass(): Promise<OsmElement[]> {
  return throttle(async () => {
    let res: Response;
    try {
      res = await fetch(overpassUrl(), {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          // Overpass/Apache rejects requests without a descriptive User-Agent.
          "User-Agent": "EthiopianBusinessHubUK/1.0 (admin import; +https://ethiopianbusinesshub.uk)",
          Accept: "application/json",
        },
        body: `data=${encodeURIComponent(OVERPASS_QUERY)}`,
      });
    } catch (e) {
      throw new Error(`Overpass network failure: ${e instanceof Error ? e.message : String(e)}`);
    }
    if (res.status === 429) {
      throw new Error("Overpass rate limit (HTTP 429). Wait a moment and retry, or set OVERPASS_API_URL to a mirror.");
    }
    if (res.status === 504) {
      throw new Error("Overpass timeout (HTTP 504). The server is busy; retry shortly.");
    }
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`Overpass API error ${res.status}: ${body.slice(0, 300)}`);
    }
    let data: { elements?: OsmElement[] };
    try {
      data = (await res.json()) as { elements?: OsmElement[] };
    } catch {
      throw new Error("Overpass returned invalid JSON (likely an HTML error or timeout page).");
    }
    return data.elements ?? [];
  });
}
