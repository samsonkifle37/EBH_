import { describe, it, expect } from "vitest";
import { safeNextPath } from "../safeNext";

describe("safeNextPath", () => {
  it("allows same-origin relative paths", () => {
    expect(safeNextPath("/owner")).toBe("/owner");
    expect(safeNextPath("/business/x?ref=y")).toBe("/business/x?ref=y");
  });
  it("rejects absolute and protocol-relative URLs", () => {
    expect(safeNextPath("https://evil.com")).toBe("/");
    expect(safeNextPath("//evil.com")).toBe("/");
    expect(safeNextPath("/\\evil.com")).toBe("/");
    expect(safeNextPath("http://x")).toBe("/");
  });
  it("rejects empty/relative-without-slash and uses fallback", () => {
    expect(safeNextPath(null)).toBe("/");
    expect(safeNextPath("")).toBe("/");
    expect(safeNextPath("dashboard")).toBe("/");
    expect(safeNextPath("javascript:alert(1)")).toBe("/");
    expect(safeNextPath("/ok", "/home")).toBe("/ok");
    expect(safeNextPath(undefined, "/home")).toBe("/home");
  });
  it("rejects control characters", () => {
    expect(safeNextPath("/foo\nbar")).toBe("/");
  });
});
