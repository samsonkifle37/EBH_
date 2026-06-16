import { describe, it, expect } from "vitest";
import { confirmDeletionInput } from "../account";

describe("confirmDeletionInput", () => {
  it("matches the user's email case-insensitively and trimmed", () => {
    expect(confirmDeletionInput("user@ebh.uk", "user@ebh.uk")).toBe(true);
    expect(confirmDeletionInput("  USER@EBH.UK ", "user@ebh.uk")).toBe(true);
  });
  it("rejects a mismatch", () => {
    expect(confirmDeletionInput("someone@else.com", "user@ebh.uk")).toBe(false);
  });
  it("rejects empty input even if the account email is empty", () => {
    expect(confirmDeletionInput("", "")).toBe(false);
    expect(confirmDeletionInput("   ", "user@ebh.uk")).toBe(false);
  });
});
