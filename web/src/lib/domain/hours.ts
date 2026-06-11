import type { DayKey, OpeningHours } from "@/lib/types";

const DAY_BY_INDEX: DayKey[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export function isOpenNow(hours: OpeningHours, now: Date = new Date()): boolean {
  const day = DAY_BY_INDEX[now.getDay()];
  const t = now.getHours() * 60 + now.getMinutes();
  const ranges = hours[day] ?? [];
  return ranges.some(({ open, close }) => {
    const o = toMinutes(open);
    const c = toMinutes(close);
    if (c < o) return t >= o || t < c; // overnight span
    return t >= o && t < c;
  });
}

export function parseOpeningHours(json: string): OpeningHours {
  try {
    const parsed = JSON.parse(json);
    return parsed && typeof parsed === "object" ? (parsed as OpeningHours) : {};
  } catch {
    return {};
  }
}
