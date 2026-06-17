import Link from "next/link";

export interface Stat {
  label: string;
  value: number | string;
  hint?: string;
  href?: string; // when set, the whole card becomes a navigation link
}

const cardCls = "block rounded-2xl border border-neutral-200 bg-white p-4";
const linkCls =
  "transition hover:-translate-y-0.5 hover:border-emerald-600 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600";

function CardInner({ s }: { s: Stat }) {
  return (
    <>
      <p className="text-2xl font-extrabold tracking-tight text-neutral-900">{s.value}</p>
      <p className="mt-0.5 text-xs font-medium text-neutral-500">{s.label}</p>
      {s.hint && <p className="mt-0.5 text-[11px] text-neutral-400">{s.hint}</p>}
    </>
  );
}

export default function AnalyticsCards({ stats }: { stats: Stat[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {stats.map((s) =>
        s.href ? (
          <Link key={s.label} href={s.href} className={`${cardCls} ${linkCls}`} aria-label={`${s.label}: ${s.value}`}>
            <CardInner s={s} />
          </Link>
        ) : (
          <div key={s.label} className={cardCls}>
            <CardInner s={s} />
          </div>
        ),
      )}
    </div>
  );
}
