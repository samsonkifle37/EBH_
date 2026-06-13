interface Props {
  values: number[];
  label: string;
}

/** Minimal inline SVG sparkline — no client JS, no chart library. */
export default function TrendChart({ values, label }: Props) {
  const w = 640;
  const h = 120;
  const pad = 6;
  const max = Math.max(1, ...values);
  const n = values.length;
  const x = (i: number) => (n <= 1 ? pad : pad + (i * (w - 2 * pad)) / (n - 1));
  const y = (v: number) => h - pad - (v / max) * (h - 2 * pad);

  const line = values.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const area = `${line} L${x(n - 1).toFixed(1)},${h - pad} L${x(0).toFixed(1)},${h - pad} Z`;

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-neutral-700">{label}</p>
        <p className="text-xs text-neutral-400">peak {max}</p>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="mt-2 h-28 w-full" preserveAspectRatio="none">
        <path d={area} fill="rgb(5 150 105 / 0.10)" />
        <path d={line} fill="none" stroke="rgb(5 150 105)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
    </div>
  );
}
