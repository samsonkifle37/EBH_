import { CITIES, type City, type DayKey, type OpeningHours } from "@/lib/types";
import { parseConciergeQuery } from "@/lib/domain/concierge";

/** Subset of a Places API (New) searchText result we consume. */
export interface GooglePlace {
  id: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  location?: { latitude?: number; longitude?: number };
  nationalPhoneNumber?: string;
  websiteUri?: string;
  rating?: number;
  userRatingCount?: number;
  businessStatus?: string;
  googleMapsUri?: string;
  regularOpeningHours?: {
    periods?: {
      open?: { day?: number; hour?: number; minute?: number };
      close?: { day?: number; hour?: number; minute?: number };
    }[];
  };
  photos?: { name: string }[];
}

export interface MappedPlace {
  placeId: string;
  name: string;
  address: string;
  postcode: string;
  city: City | "";
  category: string;
  lat: number | null;
  lng: number | null;
  phone: string;
  website: string;
  openingHours: string; // JSON
  googleRating: number | null;
  googleReviewCount: number | null;
  businessStatus: string;
  mapsUrl: string;
  photoNames: string[];
}

const GOOGLE_DAYS: DayKey[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function detectCity(text: string): City | "" {
  const lower = text.toLowerCase();
  return (CITIES.find((c) => lower.includes(c)) as City | undefined) ?? "";
}

const UK_POSTCODE = /\b([A-Z]{1,2}\d[A-Z\d]?)\s*(\d[A-Z]{2})\b/i;

function extractPostcode(address: string): string {
  const m = address.match(UK_POSTCODE);
  return m ? `${m[1].toUpperCase()} ${m[2].toUpperCase()}` : "";
}

export function mapPlaceToBusiness(place: GooglePlace, query: string): MappedPlace {
  const address = place.formattedAddress ?? "";
  const hours: OpeningHours = {};
  for (const p of place.regularOpeningHours?.periods ?? []) {
    if (p.open?.day == null || p.close == null) continue;
    const day = GOOGLE_DAYS[p.open.day];
    if (!day) continue;
    (hours[day] ??= []).push({
      open: `${pad(p.open.hour ?? 0)}:${pad(p.open.minute ?? 0)}`,
      close: `${pad(p.close.hour ?? 0)}:${pad(p.close.minute ?? 0)}`,
    });
  }

  return {
    placeId: place.id,
    name: place.displayName?.text ?? "",
    address,
    postcode: extractPostcode(address),
    city: detectCity(address),
    category: parseConciergeQuery(query).category ?? "restaurants",
    lat: place.location?.latitude ?? null,
    lng: place.location?.longitude ?? null,
    phone: place.nationalPhoneNumber ?? "",
    website: place.websiteUri ?? "",
    openingHours: JSON.stringify(hours),
    googleRating: place.rating ?? null,
    googleReviewCount: place.userRatingCount ?? null,
    businessStatus: place.businessStatus ?? "",
    mapsUrl: place.googleMapsUri ?? "",
    photoNames: (place.photos ?? []).map((p) => p.name),
  };
}

/** Subset of a Companies House /search/companies item we consume. */
export interface CompanySearchItem {
  title: string;
  company_number: string;
  company_status?: string;
  date_of_creation?: string;
  company_type?: string;
  address_snippet?: string;
  address?: { address_line_1?: string; locality?: string; postal_code?: string };
}

export interface MappedCompany {
  name: string;
  companyNumber: string;
  companyStatus: string;
  dateOfCreation: string;
  companyType: string;
  address: string;
  postcode: string;
  city: City | "";
  sourceUrl: string;
}

export function mapCompanyToBusiness(item: CompanySearchItem): MappedCompany {
  return {
    name: item.title,
    companyNumber: item.company_number,
    companyStatus: item.company_status ?? "",
    dateOfCreation: item.date_of_creation ?? "",
    companyType: item.company_type ?? "",
    address: item.address?.address_line_1 ?? item.address_snippet ?? "",
    postcode: item.address?.postal_code ?? "",
    city: detectCity(item.address?.locality ?? ""),
    sourceUrl: `https://find-and-update.company-information.service.gov.uk/company/${item.company_number}`,
  };
}

/** A raw OpenStreetMap element from an Overpass `out center tags` response. */
export interface OsmElement {
  type: string; // node | way | relation
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat?: number; lon?: number };
  tags?: Record<string, string>;
}

export interface MappedOsm {
  name: string;
  sourceId: string; // {type}/{id}
  sourceUrl: string;
  lat: number | null;
  lng: number | null;
  address: string;
  postcode: string;
  city: City | "";
  phone: string;
  website: string;
  email: string;
  imageUrl: string;
  category: string;
  openingHoursRaw: string;
  categorySignals: { cuisine?: string; amenity?: string; shop?: string };
}

function osmCategory(tags: Record<string, string>): string {
  const cuisine = (tags.cuisine ?? "").toLowerCase();
  const amenity = (tags.amenity ?? "").toLowerCase();
  const shop = (tags.shop ?? "").toLowerCase();
  if (amenity === "place_of_worship") return "churches";
  if (amenity === "cafe" || shop === "coffee") return "cafes";
  if (shop) return "grocery-stores"; // convenience, supermarket, etc.
  if (amenity === "restaurant" || amenity === "fast_food" || cuisine) return "restaurants";
  return "restaurants";
}

export function mapOsmElement(el: OsmElement): MappedOsm | null {
  const tags = el.tags ?? {};
  const name = tags.name;
  if (!name) return null;

  const lat = el.type === "node" ? el.lat ?? null : el.center?.lat ?? null;
  const lng = el.type === "node" ? el.lon ?? null : el.center?.lon ?? null;

  const addressParts = [
    [tags["addr:housenumber"], tags["addr:street"]].filter(Boolean).join(" "),
    tags["addr:city"],
    tags["addr:postcode"],
  ].filter(Boolean);

  return {
    name,
    sourceId: `${el.type}/${el.id}`,
    sourceUrl: `https://www.openstreetmap.org/${el.type}/${el.id}`,
    lat,
    lng,
    address: addressParts.join(", "),
    postcode: tags["addr:postcode"] ?? "",
    city: detectCity(`${tags["addr:city"] ?? ""} ${tags["addr:street"] ?? ""}`),
    phone: tags.phone ?? tags["contact:phone"] ?? "",
    website: tags.website ?? tags["contact:website"] ?? "",
    email: tags.email ?? tags["contact:email"] ?? "",
    imageUrl: tags.image ?? tags["image:0"] ?? "",
    category: osmCategory(tags),
    openingHoursRaw: tags.opening_hours ?? "",
    categorySignals: { cuisine: tags.cuisine, amenity: tags.amenity, shop: tags.shop },
  };
}
