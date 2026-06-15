import { NU_URL } from "@/lib/nu";

/**
 * Contextual NU conversion module dropped into EBH pages (event, business, etc.).
 * Trust-led, dark card to stand apart from EBH chrome. NU is the primary goal.
 */
export default function NuCallout({
  title,
  body,
  cta = "Explore Ethiopia with NU",
  variant = "card",
}: {
  title: string;
  body: string;
  cta?: string;
  variant?: "card" | "inline";
}) {
  if (variant === "inline") {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
        <div>
          <p className="text-sm font-semibold text-emerald-900">{title}</p>
          <p className="mt-0.5 text-sm text-emerald-800">{body}</p>
        </div>
        <a
          href={NU_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
        >
          {cta}
        </a>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl bg-neutral-900 p-6 text-white sm:p-8">
      <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-emerald-400">NU · Discover Ethiopia</p>
          <h3 className="mt-2 text-xl font-bold tracking-tight">{title}</h3>
          <p className="mt-1 max-w-lg text-sm text-neutral-300">{body}</p>
        </div>
        <a
          href={NU_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-neutral-900 hover:bg-emerald-400"
        >
          {cta} →
        </a>
      </div>
    </div>
  );
}
