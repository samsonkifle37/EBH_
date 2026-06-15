import Link from "next/link";
import type { BusinessShareMetrics } from "@/lib/analytics/prideMetrics";

interface Props {
  businessId: string;
  share: BusinessShareMetrics;
  platformShareRate: number;
  categoryShareRate: number | null;
  completion: number;
  insights: string[];
}

function Stat({ label, value, hint }: { label: string; value: number | string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4">
      <p className="text-2xl font-bold tracking-tight text-neutral-900">{value}</p>
      <p className="mt-0.5 text-xs font-medium text-neutral-500">{label}</p>
      {hint && <p className="mt-0.5 text-[11px] text-neutral-400">{hint}</p>}
    </div>
  );
}

export default function PrideAnalytics({ businessId, share, platformShareRate, categoryShareRate, completion, insights }: Props) {
  const maxChannel = share.byChannel[0]?.count ?? 1;

  return (
    <section className="mt-6 rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-amber-900">📣 Pride Analytics</h2>
          <p className="text-sm text-amber-800/80">How far your pride in your business is travelling.</p>
        </div>
        <Link
          href={`/owner/business/${businessId}/share`}
          className="rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
        >
          {share.hasShared ? "Share again" : "Get your share kit"}
        </Link>
      </div>

      <div className="mt-5 flex items-center gap-3 rounded-2xl bg-white/70 p-4">
        <span className="text-2xl">{share.hasShared ? "✅" : "🟡"}</span>
        <p className="text-sm font-semibold text-neutral-800">
          {share.hasShared
            ? `You've shared your profile ${share.totalShares} ${share.totalShares === 1 ? "time" : "times"}.`
            : "You haven't shared your profile yet — your first share is the biggest growth lever you have."}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Total shares" value={share.totalShares} />
        <Stat label="Share-driven views" value={share.shareViews} hint="people who opened your profile from a share" />
        <Stat label="Share-driven contacts" value={share.shareContacts} hint="calls, website & directions from shares" />
        <Stat label="Profile completion" value={`${completion}%`} hint={completion >= 80 ? "looking great" : "finish it to convert more"} />
      </div>

      {share.byChannel.length > 0 && (
        <div className="mt-5 rounded-2xl border border-neutral-200 bg-white p-5">
          <h3 className="text-sm font-bold text-neutral-700">Where you share</h3>
          <ul className="mt-3 space-y-2">
            {share.byChannel.map((c) => (
              <li key={c.channel}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-700">{c.label}</span>
                  <span className="font-semibold text-neutral-500">{c.count}</span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
                  <div className="h-full rounded-full bg-amber-500" style={{ width: `${Math.round((c.count / maxChannel) * 100)}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <h3 className="text-sm font-bold text-neutral-700">How you compare</h3>
          <p className="mt-2 text-sm text-neutral-600">
            <span className="font-bold text-neutral-900">{platformShareRate}%</span> of all claimed businesses share their profile.
          </p>
          {categoryShareRate != null && (
            <p className="mt-1 text-sm text-neutral-600">
              <span className="font-bold text-neutral-900">{categoryShareRate}%</span> do in your category.
            </p>
          )}
          <p className="mt-2 text-xs font-semibold text-amber-700">
            {share.hasShared ? "You're one of them — nice work." : "Be one of the businesses that gets seen."}
          </p>
        </div>

        {insights.length > 0 && (
          <div className="rounded-2xl border border-neutral-200 bg-white p-5">
            <h3 className="text-sm font-bold text-neutral-700">What to do next</h3>
            <ul className="mt-2 space-y-2">
              {insights.map((t, i) => (
                <li key={i} className="flex gap-2 text-sm text-neutral-600">
                  <span className="text-amber-500">→</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
