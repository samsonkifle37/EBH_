export default function ReviewSummaryCard({ loves, dislikes }: { loves: string[]; dislikes: string[] }) {
  if (loves.length === 0 && dislikes.length === 0) return null;
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
        ✨ AI review summary
      </p>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        {loves.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-emerald-700">Customers love</p>
            <ul className="mt-1.5 space-y-1 text-sm text-neutral-600">
              {loves.map((l) => (
                <li key={l}>👍 {l}</li>
              ))}
            </ul>
          </div>
        )}
        {dislikes.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-red-700">Customers mention</p>
            <ul className="mt-1.5 space-y-1 text-sm text-neutral-600">
              {dislikes.map((d) => (
                <li key={d}>👎 {d}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
