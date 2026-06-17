// UK location standardization. A curated dataset powers autocomplete; free-text
// is always allowed (EBH covers the whole UK, not a fixed city list). Pure +
// unit-tested. Default country is the United Kingdom.

export interface UkLocation {
  city: string;
  county: string;
  region: string; // England | Scotland | Wales | Northern Ireland
  country: string; // United Kingdom
}

const UK = "United Kingdom";
const ENG = "England";
const SCO = "Scotland";
const WAL = "Wales";
const NI = "Northern Ireland";

// [city, county, region] — country is always United Kingdom.
const RAW: [string, string, string][] = [
  ["London", "Greater London", ENG],
  ["Enfield", "Greater London", ENG],
  ["Barnet", "Greater London", ENG],
  ["Croydon", "Greater London", ENG],
  ["Ilford", "Greater London", ENG],
  ["Romford", "Greater London", ENG],
  ["Wembley", "Greater London", ENG],
  ["Tottenham", "Greater London", ENG],
  ["Hackney", "Greater London", ENG],
  ["Walthamstow", "Greater London", ENG],
  ["Wood Green", "Greater London", ENG],
  ["Potters Bar", "Hertfordshire", ENG],
  ["Watford", "Hertfordshire", ENG],
  ["St Albans", "Hertfordshire", ENG],
  ["Luton", "Bedfordshire", ENG],
  ["Milton Keynes", "Buckinghamshire", ENG],
  ["Slough", "Berkshire", ENG],
  ["Reading", "Berkshire", ENG],
  ["Oxford", "Oxfordshire", ENG],
  ["Cambridge", "Cambridgeshire", ENG],
  ["Peterborough", "Cambridgeshire", ENG],
  ["Northampton", "Northamptonshire", ENG],
  ["Birmingham", "West Midlands", ENG],
  ["Coventry", "West Midlands", ENG],
  ["Wolverhampton", "West Midlands", ENG],
  ["Leicester", "Leicestershire", ENG],
  ["Nottingham", "Nottinghamshire", ENG],
  ["Derby", "Derbyshire", ENG],
  ["Stoke-on-Trent", "Staffordshire", ENG],
  ["Manchester", "Greater Manchester", ENG],
  ["Bolton", "Greater Manchester", ENG],
  ["Oldham", "Greater Manchester", ENG],
  ["Rochdale", "Greater Manchester", ENG],
  ["Wigan", "Greater Manchester", ENG],
  ["Liverpool", "Merseyside", ENG],
  ["Preston", "Lancashire", ENG],
  ["Blackburn", "Lancashire", ENG],
  ["Leeds", "West Yorkshire", ENG],
  ["Bradford", "West Yorkshire", ENG],
  ["Sheffield", "South Yorkshire", ENG],
  ["Hull", "East Yorkshire", ENG],
  ["York", "North Yorkshire", ENG],
  ["Newcastle upon Tyne", "Tyne and Wear", ENG],
  ["Sunderland", "Tyne and Wear", ENG],
  ["Middlesbrough", "North Yorkshire", ENG],
  ["Bristol", "Bristol", ENG],
  ["Bath", "Somerset", ENG],
  ["Gloucester", "Gloucestershire", ENG],
  ["Swindon", "Wiltshire", ENG],
  ["Southampton", "Hampshire", ENG],
  ["Portsmouth", "Hampshire", ENG],
  ["Bournemouth", "Dorset", ENG],
  ["Brighton", "East Sussex", ENG],
  ["Plymouth", "Devon", ENG],
  ["Exeter", "Devon", ENG],
  ["Norwich", "Norfolk", ENG],
  ["Ipswich", "Suffolk", ENG],
  ["Glasgow", "Glasgow City", SCO],
  ["Edinburgh", "City of Edinburgh", SCO],
  ["Aberdeen", "Aberdeen City", SCO],
  ["Dundee", "Dundee City", SCO],
  ["Inverness", "Highland", SCO],
  ["Paisley", "Renfrewshire", SCO],
  ["Cardiff", "South Glamorgan", WAL],
  ["Swansea", "West Glamorgan", WAL],
  ["Newport", "Gwent", WAL],
  ["Wrexham", "Clwyd", WAL],
  ["Belfast", "County Antrim", NI],
  ["Londonderry", "County Londonderry", NI],
  ["Lisburn", "County Antrim", NI],
];

export const UK_LOCATIONS: UkLocation[] = RAW.map(([city, county, region]) => ({ city, county, region, country: UK }));

const SMALL_WORDS = new Set(["on", "upon", "under", "of", "the", "and", "le"]);

/** Title-case a UK place name, keeping connector words lowercase (except first). */
export function normalizeCity(raw: string): string {
  const cleaned = (raw ?? "").trim().replace(/\s+/g, " ");
  if (!cleaned) return "";
  return cleaned
    .split(" ")
    .map((word) =>
      word
        .split("-")
        .map((part, pi) => {
          const lower = part.toLowerCase();
          if (pi > 0 && SMALL_WORDS.has(lower)) return lower;
          return lower.charAt(0).toUpperCase() + lower.slice(1);
        })
        .join("-"),
    )
    .map((word, wi) => (wi > 0 && SMALL_WORDS.has(word.toLowerCase()) ? word.toLowerCase() : word))
    .join(" ");
}

const BY_KEY = new Map(UK_LOCATIONS.map((l) => [l.city.toLowerCase(), l]));

/** Exact (case-insensitive) dataset lookup, or null. */
export function findLocation(city: string): UkLocation | null {
  return BY_KEY.get((city ?? "").trim().toLowerCase()) ?? null;
}

/**
 * Resolve any input to a full, normalized location. Known places get their
 * county/region; unknown places are accepted as free text (UK by default).
 */
export function resolveLocation(raw: string): UkLocation {
  const found = findLocation(raw);
  if (found) return found;
  return { city: normalizeCity(raw), county: "", region: "", country: UK };
}

/** Autocomplete suggestions: prefix matches first, then substring matches. */
export function searchLocations(query: string, limit = 8): UkLocation[] {
  const q = (query ?? "").trim().toLowerCase();
  if (!q) return UK_LOCATIONS.slice(0, limit);
  const prefix: UkLocation[] = [];
  const contains: UkLocation[] = [];
  for (const loc of UK_LOCATIONS) {
    const c = loc.city.toLowerCase();
    if (c.startsWith(q)) prefix.push(loc);
    else if (c.includes(q)) contains.push(loc);
  }
  return [...prefix, ...contains].slice(0, limit);
}
