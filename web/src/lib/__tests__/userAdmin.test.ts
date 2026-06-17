import { describe, it, expect } from "vitest";
import { normalizeRoles, isValidRole, roleChangeBlocked, deleteBlocked, suspendBlocked } from "../userAdmin";

describe("roles", () => {
  it("validates roles", () => {
    expect(isValidRole("ADMIN")).toBe(true);
    expect(isValidRole("SUPERADMIN")).toBe(false);
  });
  it("normalizes + always includes USER, dedupes, drops junk, stable order", () => {
    expect(normalizeRoles(["ADMIN", "ADMIN", "nope"])).toEqual(["USER", "ADMIN"]);
    expect(normalizeRoles([])).toEqual(["USER"]);
    expect(normalizeRoles(["EVENT_ORGANIZER", "BUSINESS_OWNER"])).toEqual(["USER", "BUSINESS_OWNER", "EVENT_ORGANIZER"]);
  });
});

describe("roleChangeBlocked", () => {
  const base = { actorId: "a", targetId: "b", targetHasAdmin: true, nextHasAdmin: false, otherActiveAdmins: 1 };
  it("blocks self-demotion", () => {
    expect(roleChangeBlocked({ ...base, actorId: "x", targetId: "x" }).blocked).toBe(true);
  });
  it("blocks removing the last active admin", () => {
    expect(roleChangeBlocked({ ...base, otherActiveAdmins: 0 }).blocked).toBe(true);
  });
  it("allows demoting another admin when others remain", () => {
    expect(roleChangeBlocked(base).blocked).toBe(false);
  });
  it("allows adding admin (no removal)", () => {
    expect(roleChangeBlocked({ ...base, targetHasAdmin: false, nextHasAdmin: true, otherActiveAdmins: 0 }).blocked).toBe(false);
  });
});

describe("deleteBlocked / suspendBlocked", () => {
  it("blocks deleting self and the last admin", () => {
    expect(deleteBlocked({ isSelf: true, targetActiveAdmin: false, otherActiveAdmins: 5 }).blocked).toBe(true);
    expect(deleteBlocked({ isSelf: false, targetActiveAdmin: true, otherActiveAdmins: 0 }).blocked).toBe(true);
    expect(deleteBlocked({ isSelf: false, targetActiveAdmin: false, otherActiveAdmins: 0 }).blocked).toBe(false);
  });
  it("blocks suspending self", () => {
    expect(suspendBlocked(true).blocked).toBe(true);
    expect(suspendBlocked(false).blocked).toBe(false);
  });
});
