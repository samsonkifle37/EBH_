export const CATEGORIES = [
  "restaurants",
  "grocery-stores",
  "cafes",
  "travel-agencies",
  "lawyers",
  "accountants",
  "beauty-services",
  "construction",
  "cleaning-services",
  "wedding-services",
  "churches",
  "community-organizations",
] as const;
export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_LABELS: Record<Category, string> = {
  restaurants: "Restaurants",
  "grocery-stores": "Grocery Stores",
  cafes: "Cafes",
  "travel-agencies": "Travel Agencies",
  lawyers: "Lawyers",
  accountants: "Accountants",
  "beauty-services": "Beauty & Wellness",
  construction: "Construction",
  "cleaning-services": "Cleaning Services",
  "wedding-services": "Wedding Services",
  churches: "Churches",
  "community-organizations": "Community Organizations",
};

export const CATEGORY_ICONS: Record<Category, string> = {
  restaurants: "🍽️",
  "grocery-stores": "🛒",
  cafes: "☕",
  "travel-agencies": "✈️",
  lawyers: "⚖️",
  accountants: "📊",
  "beauty-services": "💄",
  construction: "🏗️",
  "cleaning-services": "🧹",
  "wedding-services": "📸",
  churches: "⛪",
  "community-organizations": "🤝",
};

export const CITIES = [
  "london",
  "birmingham",
  "manchester",
  "leicester",
  "sheffield",
] as const;
export type City = (typeof CITIES)[number];

export const CITY_LABELS: Record<City, string> = {
  london: "London",
  birmingham: "Birmingham",
  manchester: "Manchester",
  leicester: "Leicester",
  sheffield: "Sheffield",
};

export const EVENT_TYPES = [
  "music",
  "community",
  "business",
  "cultural",
  "religious",
  "networking",
  "education",
] as const;
export type EventType = (typeof EVENT_TYPES)[number];

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  music: "Music",
  community: "Community",
  business: "Business",
  cultural: "Cultural",
  religious: "Religious",
  networking: "Networking",
  education: "Education",
};

export type Role = "USER" | "BUSINESS_OWNER" | "EVENT_ORGANIZER" | "ADMIN";

export type Plan = "FREE" | "VERIFIED" | "FEATURED";

export type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
export const DAY_KEYS: DayKey[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
export const DAY_LABELS: Record<DayKey, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

export interface TimeRange {
  open: string; // "09:00"
  close: string; // "17:30"
}
export type OpeningHours = Partial<Record<DayKey, TimeRange[]>>;

export const AD_PLACEMENTS = [
  "HOME_HERO",
  "SEARCH_RESULTS",
  "BUSINESS_DETAIL",
  "EVENT_DETAIL",
] as const;
export type AdPlacement = (typeof AD_PLACEMENTS)[number];

export function isCategory(v: string): v is Category {
  return (CATEGORIES as readonly string[]).includes(v);
}
export function isCity(v: string): v is City {
  return (CITIES as readonly string[]).includes(v);
}
export function isEventType(v: string): v is EventType {
  return (EVENT_TYPES as readonly string[]).includes(v);
}
