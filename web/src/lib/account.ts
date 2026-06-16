import { db } from "@/lib/db";

/**
 * True when the user has correctly confirmed deletion by re-typing their own
 * email (case-insensitive, trimmed). Pure — unit tested.
 */
export function confirmDeletionInput(input: string, email: string): boolean {
  const a = (input ?? "").trim().toLowerCase();
  const b = (email ?? "").trim().toLowerCase();
  return a.length > 0 && a === b;
}

/**
 * Permanently delete a user and their personal data (GDPR erasure).
 *
 * Retention policy for orphaned business records: public business listings are
 * directory data (often sourced from Companies House / Google / OpenStreetMap),
 * so the listing is RETAINED but returned to an unclaimed state — ownership and
 * any founder personal data the user added are removed. Cascades handle the
 * user's reviews, favourites, follows and claim requests. Events authored by the
 * user are deleted (the organizer FK is required). Analytics ownership is
 * anonymised. Financial records (Payment/Subscription), where present, are
 * retained under legal obligation and are not linked to the user by FK.
 */
export async function deleteUserAccount(userId: string): Promise<void> {
  await db.$transaction(async (tx) => {
    // un-claim businesses + erase founder personal data this user contributed
    await tx.business.updateMany({
      where: { ownerId: userId },
      data: { ownerId: null, claimedAt: null, founderName: "", founderStory: "", founderPhotoUrl: "" },
    });
    // also drop submitter linkage for any owner-submitted (still-pending) listings
    await tx.business.updateMany({ where: { submittedById: userId }, data: { submittedById: null } });
    // anonymise analytics ownership
    await tx.prideEvent.updateMany({ where: { ownerUserId: userId }, data: { ownerUserId: null } });
    // delete events authored by the user (organizer relation is required → no cascade)
    await tx.event.deleteMany({ where: { organizerId: userId } });
    // delete the user — cascades reviews, favourites, follows, claim requests
    await tx.user.delete({ where: { id: userId } });
  });
}
