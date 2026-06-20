// Contact Centre logic — pure helpers + the canonical support-category catalogue.
// All support routes to a single inbox so nothing is dropped.
import { SUPPORT_EMAIL } from "@/lib/seo";

export { SUPPORT_EMAIL };

export type ContactCategoryId =
  | "business-owners"
  | "listing-corrections"
  | "verification-support"
  | "privacy-requests"
  | "technical-support"
  | "abuse-reports";

export interface ContactCategory {
  id: ContactCategoryId;
  title: string;
  body: string;
  icon: string;
  subject: string;
  /** Static intro lines for the email body. Device/URL context is appended at click time. */
  template: string;
  /** Abuse reports route to the in-app report flow instead of opening email. */
  action: "email" | "report";
}

export const CONTACT_CATEGORIES: ContactCategory[] = [
  {
    id: "business-owners",
    title: "Business owners",
    body: "Claiming, verifying or updating your listing.",
    icon: "🏪",
    subject: "[EBH] Business owner enquiry",
    template:
      "Hi EBH team,\n\nI'm a business owner and need help with my listing.\n\nBusiness name:\nListing URL (if any):\nWhat I need:\n",
    action: "email",
  },
  {
    id: "listing-corrections",
    title: "Listing corrections",
    body: "Something wrong on a profile? Tell us what to fix.",
    icon: "✏️",
    subject: "[EBH] Listing correction",
    template:
      "Hi EBH team,\n\nThere's something to correct on a listing.\n\nListing name / URL:\nWhat's wrong:\nWhat it should say:\n",
    action: "email",
  },
  {
    id: "verification-support",
    title: "Verification support",
    body: "Questions about badges, Trust Score or evidence.",
    icon: "🛡️",
    subject: "[EBH] Verification support",
    template:
      "Hi EBH team,\n\nI have a question about verification / Trust Score.\n\nBusiness name / URL:\nMy question:\n",
    action: "email",
  },
  {
    id: "privacy-requests",
    title: "Privacy requests (GDPR)",
    body: "Access, correction or erasure of your data.",
    icon: "🔒",
    subject: "[EBH] Privacy request (GDPR)",
    template:
      "Hi EBH team,\n\nI'd like to make a data-protection request under UK GDPR.\n\nRequest type (access / correction / erasure / portability):\nAccount email:\nDetails:\n",
    action: "email",
  },
  {
    id: "technical-support",
    title: "Technical support",
    body: "Something not working? We'll help.",
    icon: "🛠️",
    subject: "[EBH] Technical support",
    template:
      "Hi EBH team,\n\nI've hit a technical problem.\n\nWhat I was doing:\nWhat went wrong:\n",
    action: "email",
  },
  {
    id: "abuse-reports",
    title: "Abuse reports",
    body: "Report a listing, review or user that breaks our rules.",
    icon: "🚩",
    subject: "[EBH] Abuse report",
    template:
      "Hi EBH team,\n\nI'd like to report abuse or a safety concern.\n\nListing / user involved:\nWhat happened:\n",
    action: "report",
  },
];

export function getContactCategory(id: ContactCategoryId): ContactCategory | undefined {
  return CONTACT_CATEGORIES.find((c) => c.id === id);
}

export interface MailtoContext {
  /** Page the user came from, e.g. window.location.href. */
  url?: string;
  /** User agent string, for technical reports. */
  userAgent?: string;
  /** When true, append device + URL diagnostics (technical support). */
  includeDiagnostics?: boolean;
}

/** RFC-6068 mailto: encode subject + body. Pure + deterministic for testing. */
export function buildMailto(
  email: string,
  subject: string,
  bodyTemplate: string,
  ctx: MailtoContext = {},
): string {
  const lines = [bodyTemplate];
  if (ctx.url) lines.push(`\n---\nPage: ${ctx.url}`);
  if (ctx.includeDiagnostics && ctx.userAgent) lines.push(`Device: ${ctx.userAgent}`);
  const body = lines.join("\n");
  const params = `subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  return `mailto:${email}?${params}`;
}
