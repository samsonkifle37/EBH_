import { describe, it, expect } from "vitest";
import { isOpenNow } from "../hours";
import type { OpeningHours } from "@/lib/types";

// 2026-06-10 is a Wednesday
const wed = (h: number, m = 0) => new Date(2026, 5, 10, h, m);

const standard: OpeningHours = {
  wed: [{ open: "09:00", close: "17:30" }],
};

describe("isOpenNow", () => {
  it("is open within hours", () => {
    expect(isOpenNow(standard, wed(12))).toBe(true);
  });
  it("is closed before opening and after closing", () => {
    expect(isOpenNow(standard, wed(8, 59))).toBe(false);
    expect(isOpenNow(standard, wed(17, 30))).toBe(false);
  });
  it("is closed on days with no entry", () => {
    expect(isOpenNow({ mon: [{ open: "09:00", close: "17:00" }] }, wed(12))).toBe(false);
  });
  it("handles multiple ranges in a day", () => {
    const split: OpeningHours = {
      wed: [
        { open: "09:00", close: "12:00" },
        { open: "14:00", close: "18:00" },
      ],
    };
    expect(isOpenNow(split, wed(13))).toBe(false);
    expect(isOpenNow(split, wed(15))).toBe(true);
  });
  it("handles overnight ranges (close before open)", () => {
    const late: OpeningHours = { wed: [{ open: "18:00", close: "02:00" }] };
    expect(isOpenNow(late, wed(23))).toBe(true);
    expect(isOpenNow(late, wed(1))).toBe(true); // after midnight, same calendar day
    expect(isOpenNow(late, wed(12))).toBe(false);
  });
  it("returns false for empty hours", () => {
    expect(isOpenNow({}, wed(12))).toBe(false);
  });
});
