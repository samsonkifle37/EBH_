import { describe, it, expect } from "vitest";
import { buttonClass, BUTTON_VARIANTS } from "../Button";
import { cn } from "@/lib/cn";

describe("cn", () => {
  it("joins truthy parts and drops falsy ones", () => {
    expect(cn("a", false, null, undefined, "b")).toBe("a b");
    expect(cn()).toBe("");
  });
});

describe("buttonClass", () => {
  it("includes the variant + size classes and base", () => {
    const c = buttonClass("primary", "md");
    expect(c).toContain("bg-emerald-700");
    expect(c).toContain("rounded-xl");
    expect(c).toContain("text-sm");
  });
  it("appends custom className last", () => {
    expect(buttonClass("gold", "lg", "w-full").endsWith("w-full")).toBe(true);
  });
  it("exposes a class for every variant", () => {
    for (const v of Object.keys(BUTTON_VARIANTS)) {
      expect(buttonClass(v as keyof typeof BUTTON_VARIANTS).length).toBeGreaterThan(0);
    }
  });
});
