export interface BadgeInput {
  ownerId: string | null;
  claimedAt: Date | null;
  verificationLevel: number;
  plan: string;
}

export type BadgeTier = "starter" | "earned";

export interface Badge {
  key: string;
  label: string;
  explanation: string; // owner-facing
  tier: BadgeTier;
}

// Every business claimed on or before this date is an Early Supporter — the
// window keeps the badge scarce later while granting pride on day one now.
export const EARLY_SUPPORTER_CUTOFF = new Date("2027-01-01");

/**
 * Day-one recognition badges (Phase 1). Derived from existing data — no
 * evaluation job needed. A claimed business always earns at least one (dignity).
 */
export function earnedBadges(b: BadgeInput): Badge[] {
  const badges: Badge[] = [];
  const claimed = !!b.ownerId;

  if (claimed) {
    badges.push({
      key: "founder_verified",
      label: "Founder Verified",
      explanation: "You've verified you own and run this business.",
      tier: "starter",
    });
  }

  if (claimed && b.claimedAt && b.claimedAt.getTime() <= EARLY_SUPPORTER_CUTOFF.getTime()) {
    badges.push({
      key: "early_supporter",
      label: "Early Supporter",
      explanation: "You were one of the first to join Ethiopian Business Hub.",
      tier: "starter",
    });
  }

  if (b.verificationLevel >= 2 || (b.plan && b.plan !== "FREE")) {
    badges.push({
      key: "verified_business",
      label: "Verified Business",
      explanation: "Your business details have been verified.",
      tier: "earned",
    });
  }

  return badges;
}
