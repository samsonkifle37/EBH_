// Trust & safety report domain. Pure validation lives here so it is unit-tested
// and shared by the API route and the form.

export const REPORT_REASONS = [
  { value: "incorrect_info", label: "Incorrect information" },
  { value: "duplicate", label: "Duplicate listing" },
  { value: "fake_review", label: "Fake or paid reviews" },
  { value: "inappropriate", label: "Inappropriate content" },
  { value: "impersonation", label: "Impersonation" },
  { value: "fraud", label: "Fraud or scam" },
  { value: "safety", label: "Safety concern" },
  { value: "other", label: "Something else" },
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number]["value"];

const REASON_SET = new Set<string>(REPORT_REASONS.map((r) => r.value));

export interface ReportInput {
  reason?: unknown;
  details?: unknown;
  reporterEmail?: unknown;
  businessId?: unknown;
}

export interface ValidatedReport {
  reason: ReportReason;
  details: string;
  reporterEmail: string;
  businessId: string | null;
}

export type ReportValidation = { ok: true; value: ValidatedReport } | { ok: false; error: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Validate a report submission. Anonymous allowed; email optional but must be well-formed if given. */
export function validateReport(input: ReportInput): ReportValidation {
  const reason = typeof input.reason === "string" ? input.reason : "";
  if (!REASON_SET.has(reason)) return { ok: false, error: "Please choose a reason." };

  const details = typeof input.details === "string" ? input.details.trim() : "";
  if (details.length > 2000) return { ok: false, error: "Details are too long (max 2000 characters)." };
  // Free-text reasons should carry some explanation.
  if ((reason === "other" || reason === "safety") && details.length < 10) {
    return { ok: false, error: "Please add a short description so we can act on this." };
  }

  const reporterEmail = typeof input.reporterEmail === "string" ? input.reporterEmail.trim() : "";
  if (reporterEmail && !EMAIL_RE.test(reporterEmail)) return { ok: false, error: "That email address doesn&rsquo;t look right." };

  const businessId = typeof input.businessId === "string" && input.businessId ? input.businessId : null;

  return { ok: true, value: { reason: reason as ReportReason, details, reporterEmail, businessId } };
}
