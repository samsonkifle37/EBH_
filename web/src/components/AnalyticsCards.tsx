export interface Stat {
  label: string;
  value: number | string;
  hint?: string;
}

export default function AnalyticsCards({ stats }: { stats: Stat[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {stats.map((s) => (
        <div key={s.label} className="rounded-2xl border border-neutral-200 bg-white p-4">
          <p className="text-2xl font-extrabold tracking-tight text-neutral-900">{s.value}</p>
          <p className="mt-0.5 text-xs font-medium text-neutral-500">{s.label}</p>
          {s.hint && <p className="mt-0.5 text-[11px] text-neutral-400">{s.hint}</p>}
        </div>
      ))}
    </div>
  );
}
