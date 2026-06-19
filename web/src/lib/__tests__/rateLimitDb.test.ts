import { describe, it, expect } from "vitest";
import { evaluateWindow } from "../rateLimitDb";

describe("evaluateWindow", () => {
  const windowMs = 15 * 60 * 1000;
  const start = new Date(1_000_000);

  it("allows while under the limit within the window", () => {
    const r = evaluateWindow(3, start, start.getTime() + 1000, 5, windowMs);
    expect(r).toEqual({ expired: false, blocked: false });
  });
  it("blocks at/over the limit within the window", () => {
    expect(evaluateWindow(5, start, start.getTime() + 1000, 5, windowMs).blocked).toBe(true);
    expect(evaluateWindow(9, start, start.getTime() + 1000, 5, windowMs).blocked).toBe(true);
  });
  it("expires (resets) once the window has elapsed", () => {
    const r = evaluateWindow(99, start, start.getTime() + windowMs, 5, windowMs);
    expect(r.expired).toBe(true);
    expect(r.blocked).toBe(false);
  });
});
