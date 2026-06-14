import { describe, it, expect } from "vitest";
import { claimTransition, CLAIM_STATUSES, type ClaimAction } from "../claim";

describe("claimTransition", () => {
  it("moves a pending claim to each valid target", () => {
    expect(claimTransition("pending", "approve")).toBe("approved");
    expect(claimTransition("pending", "reject")).toBe("rejected");
    expect(claimTransition("pending", "request_more_evidence")).toBe("needs_more_evidence");
  });

  it("allows acting on a needs_more_evidence claim", () => {
    expect(claimTransition("needs_more_evidence", "approve")).toBe("approved");
    expect(claimTransition("needs_more_evidence", "reject")).toBe("rejected");
  });

  it("treats approved as terminal", () => {
    expect(() => claimTransition("approved", "reject" as ClaimAction)).toThrow();
  });

  it("rejects unknown actions", () => {
    expect(() => claimTransition("pending", "explode" as ClaimAction)).toThrow();
  });

  it("exposes the canonical status set", () => {
    expect(CLAIM_STATUSES).toEqual(["pending", "approved", "rejected", "needs_more_evidence"]);
  });
});
