import { describe, it, expect } from "vitest";
import { validateReport } from "../report";

describe("validateReport", () => {
  it("accepts a known reason", () => {
    const r = validateReport({ reason: "incorrect_info", details: "Phone is wrong" });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.reason).toBe("incorrect_info");
  });

  it("rejects an unknown/empty reason", () => {
    expect(validateReport({ reason: "nonsense" }).ok).toBe(false);
    expect(validateReport({}).ok).toBe(false);
  });

  it("requires a description for safety/other", () => {
    expect(validateReport({ reason: "safety", details: "" }).ok).toBe(false);
    expect(validateReport({ reason: "other", details: "short?" }).ok).toBe(false);
    expect(validateReport({ reason: "safety", details: "Owner is impersonating a real shop." }).ok).toBe(true);
  });

  it("validates an optional email", () => {
    expect(validateReport({ reason: "duplicate", reporterEmail: "not-an-email" }).ok).toBe(false);
    expect(validateReport({ reason: "duplicate", reporterEmail: "a@b.co" }).ok).toBe(true);
  });

  it("passes through businessId and rejects over-long details", () => {
    const ok = validateReport({ reason: "fraud", businessId: "biz_1", details: "x" });
    expect(ok.ok).toBe(true);
    if (ok.ok) expect(ok.value.businessId).toBe("biz_1");
    expect(validateReport({ reason: "fraud", details: "x".repeat(2001) }).ok).toBe(false);
  });
});
