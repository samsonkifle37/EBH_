import type { GooglePlace } from "@/lib/domain/importMap";

const FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.location",
  "places.nationalPhoneNumber",
  "places.websiteUri",
  "places.rating",
  "places.userRatingCount",
  "places.businessStatus",
  "places.googleMapsUri",
  "places.regularOpeningHours",
  "places.photos",
].join(",");

export function googlePlacesKey(): string | null {
  return process.env.GOOGLE_PLACES_API_KEY ?? null;
}

export async function searchPlaces(query: string): Promise<GooglePlace[]> {
  const key = googlePlacesKey();
  if (!key) {
    throw new Error(
      "GOOGLE_PLACES_API_KEY is not set. Add it to web/.env (requires a billing-enabled Google Cloud project with Places API (New) enabled)."
    );
  }
  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": key,
      "X-Goog-FieldMask": FIELD_MASK,
    },
    body: JSON.stringify({ textQuery: query, regionCode: "GB", maxResultCount: 20 }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Google Places API error ${res.status}: ${body.slice(0, 300)}`);
  }
  const data = (await res.json()) as { places?: GooglePlace[] };
  return data.places ?? [];
}

/** Server-side photo URL via our proxy so the API key is never exposed. */
export function photoProxyUrl(photoName: string): string {
  return `/api/photos/google?name=${encodeURIComponent(photoName)}`;
}
