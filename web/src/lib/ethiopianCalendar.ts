/**
 * Ethiopian (Ge'ez) calendar utilities.
 *
 * The Ethiopian calendar has 13 months: 12 months of 30 days each
 * and Pagume (5 or 6 days). Ethiopian New Year (Enkutatash) falls on
 * 11 September in a non-Gregorian-leap year, and 12 September in a
 * Gregorian leap year.
 *
 * Ethiopian year ≈ Gregorian year − 7 (after 11 Sep) or − 8 (before).
 */

export const ET_MONTHS = [
  "Meskerem",
  "Tikimt",
  "Hidar",
  "Tahsas",
  "Tir",
  "Yekatit",
  "Megabit",
  "Miazia",
  "Ginbot",
  "Sene",
  "Hamle",
  "Nehase",
  "Pagume",
] as const;

export type EtMonth = (typeof ET_MONTHS)[number];

export interface EthiopianDate {
  year: number;
  month: number; // 1–13
  day: number;   // 1–30 (1–5/6 for Pagume)
  monthName: EtMonth;
}

function isGregorianLeap(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/** Gregorian → Ethiopian date */
export function toEthiopian(gYear: number, gMonth: number, gDay: number): EthiopianDate {
  // New Year day in September of this Gregorian year
  const nyDay = isGregorianLeap(gYear) ? 12 : 11;
  const afterNewYear = gMonth > 9 || (gMonth === 9 && gDay >= nyDay);

  // Ethiopian year
  const etYear = afterNewYear ? gYear - 7 : gYear - 8;

  // Gregorian date of the start of this Ethiopian year
  let nyGYear: number, nyGDay: number;
  if (afterNewYear) {
    nyGYear = gYear;
    nyGDay = nyDay;
  } else {
    nyGYear = gYear - 1;
    nyGDay = isGregorianLeap(gYear - 1) ? 12 : 11;
  }

  const nyDate = new Date(nyGYear, 8, nyGDay); // month index 8 = September
  const currentDate = new Date(gYear, gMonth - 1, gDay);
  const daysDiff = Math.round((currentDate.getTime() - nyDate.getTime()) / 86_400_000);

  const etMonthIdx = Math.min(Math.floor(daysDiff / 30), 12); // cap at 12 (Pagume)
  const etDay = daysDiff - etMonthIdx * 30 + 1;

  return {
    year: etYear,
    month: etMonthIdx + 1,
    day: etDay,
    monthName: ET_MONTHS[etMonthIdx],
  };
}

/** Ethiopian zodiac (Evangelist cycle, repeats every 4 years) */
export function ethiopianZodiac(etYear: number): { name: string; amharic: string; symbol: string } {
  const zodiacs = [
    { name: "Marqos (Mark)", amharic: "ማርቆስ", symbol: "🦁" },
    { name: "Luqas (Luke)", amharic: "ሉቃስ", symbol: "🐂" },
    { name: "Yohannes (John)", amharic: "ዮሐንስ", symbol: "🦅" },
    { name: "Hamlak (Matthew)", amharic: "ሐምላክ", symbol: "👼" },
  ];
  return zodiacs[etYear % 4];
}

/** Days until next Enkutatash (11 or 12 Sep) from a given date */
export function daysUntilEnkutatash(from: Date = new Date()): number {
  const year = from.getFullYear();
  const nyDay = isGregorianLeap(year) ? 12 : 11;
  let next = new Date(year, 8, nyDay); // September
  if (next <= from) {
    const nextYear = year + 1;
    next = new Date(nextYear, 8, isGregorianLeap(nextYear) ? 12 : 11);
  }
  return Math.ceil((next.getTime() - from.getTime()) / 86_400_000);
}

/** Ethiopian age: how many Enkutatash celebrations since birth */
export function ethiopianAge(birthGYear: number, birthGMonth: number, birthGDay: number): number {
  const today = new Date();
  const birthEt = toEthiopian(birthGYear, birthGMonth, birthGDay);
  const todayEt = toEthiopian(today.getFullYear(), today.getMonth() + 1, today.getDate());
  let age = todayEt.year - birthEt.year;
  if (
    todayEt.month < birthEt.month ||
    (todayEt.month === birthEt.month && todayEt.day < birthEt.day)
  ) {
    age -= 1;
  }
  return Math.max(0, age);
}
