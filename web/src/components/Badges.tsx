export function VerifiedBadge({ score, level }: { score: number; level: number }) {
  if (level < 1) return null;
  return (
    <span
      title={`Verification level ${level} of 4 — score ${score}/100`}
      className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700"
    >
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5" aria-hidden>
        <path
          fillRule="evenodd"
          d="M16.403 12.652a3 3 0 0 0 0-5.304 3 3 0 0 0-3.75-3.751 3 3 0 0 0-5.305 0 3 3 0 0 0-3.751 3.75 3 3 0 0 0 0 5.305 3 3 0 0 0 3.75 3.751 3 3 0 0 0 5.305 0 3 3 0 0 0 3.751-3.75Zm-2.546-4.46a.75.75 0 0 0-1.214-.883l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z"
          clipRule="evenodd"
        />
      </svg>
      Verified {score}
    </span>
  );
}

export function FeaturedBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
      ★ Featured Partner
    </span>
  );
}

export function OpenNowBadge({ open }: { open: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${open ? "bg-emerald-50 text-emerald-700" : "bg-neutral-100 text-neutral-500"}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${open ? "bg-emerald-500" : "bg-neutral-400"}`} />
      {open ? "Open now" : "Closed"}
    </span>
  );
}
