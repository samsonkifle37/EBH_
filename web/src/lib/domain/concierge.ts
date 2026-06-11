import { CITIES, type Category, type City } from "@/lib/types";

export interface ConciergeQuery {
  category?: Category;
  city?: City;
  keywords: string[];
  capacity?: number;
}

const CATEGORY_SYNONYMS: Record<string, Category> = {
  restaurant: "restaurants",
  restaurants: "restaurants",
  eat: "restaurants",
  food: "restaurants",
  dinner: "restaurants",
  lunch: "restaurants",
  injera: "restaurants",
  grocery: "grocery-stores",
  groceries: "grocery-stores",
  market: "grocery-stores",
  supermarket: "grocery-stores",
  cafe: "cafes",
  cafes: "cafes",
  coffee: "cafes",
  travel: "travel-agencies",
  flight: "travel-agencies",
  flights: "travel-agencies",
  holiday: "travel-agencies",
  lawyer: "lawyers",
  lawyers: "lawyers",
  solicitor: "lawyers",
  solicitors: "lawyers",
  legal: "lawyers",
  immigration: "lawyers",
  accountant: "accountants",
  accountants: "accountants",
  accounting: "accountants",
  tax: "accountants",
  bookkeeping: "accountants",
  beauty: "beauty-services",
  salon: "beauty-services",
  hair: "beauty-services",
  barber: "beauty-services",
  nails: "beauty-services",
  builder: "construction",
  builders: "construction",
  construction: "construction",
  renovation: "construction",
  cleaning: "cleaning-services",
  cleaner: "cleaning-services",
  cleaners: "cleaning-services",
  wedding: "wedding-services",
  weddings: "wedding-services",
  venue: "wedding-services",
  photographer: "wedding-services",
  church: "churches",
  churches: "churches",
  community: "community-organizations",
  charity: "community-organizations",
};

const STOPWORDS = new Set([
  "a","an","the","i","me","my","we","our","you","your","find","looking","look",
  "for","in","near","best","good","nice","want","need","please","is","are","to",
  "of","and","or","with","that","this","ethiopian","habesha","uk","around","some",
  "something","place","places","get","go","where","can","help",
]);

export function parseConciergeQuery(text: string): ConciergeQuery {
  const lower = text.toLowerCase();
  const words = lower.replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean);

  let category: Category | undefined;
  for (const w of words) {
    if (CATEGORY_SYNONYMS[w]) {
      category = CATEGORY_SYNONYMS[w];
      break;
    }
  }

  const city = CITIES.find((c) => lower.includes(c)) as City | undefined;

  const capMatch = lower.match(/(?:for\s+)?(\d{2,5})\s*(?:guests|people|attendees|seats)/);
  const capacity = capMatch ? parseInt(capMatch[1], 10) : undefined;

  const keywords = words.filter(
    (w) =>
      !STOPWORDS.has(w) &&
      !CATEGORY_SYNONYMS[w] &&
      !(CITIES as readonly string[]).includes(w) &&
      !/^\d+$/.test(w) &&
      w.length > 2
  );

  return { category, city, keywords, capacity };
}
