import type { WebsitePerformance } from "@/lib/analytics/prideMetrics";
import type { WebsiteScoreResult } from "@/lib/website";

function Stat({ label, value, hint }: { label: string; value: number | string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4">
      <p className="text-2xl font-bold tracking-tight text-ink">{value}</p>
      <p className="mt-0.5 text-xs font-medium text-neutral-500">{label}</p>
      {hint && <p className="mt-0.5 text-[11px] text-neutral-400">{hint}</p>}
    </div>
  );
}

/** "Website Performance" — the owner-facing answer to "is my EBH profile working
 * as my website?" Headlined by the PrimaryWebsiteScore. */
export default function WebsitePerformancePanel({ perf, score }: { perf: WebsitePerformance; score: WebsiteScoreResult }) {
  return (
    <section className="mt-6 rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-emerald-900">🌐 Website performance</h2>
          <p className="text-sm text-emerald-800/80">Last 30 days · how your EBH profile is working as your website.</p>
        </div>
        <div className="flex items-center gap-2 rounded-2xl bg-white/80 px-4 py-2">
          <span className="text-2xl font-black text-emerald-700">{score.score}</span>
          <span className="text-xs font-semibold text-neutral-500">/100<br />website score</span>
        </div>
      </div>

      <p className="mt-4 text-sm font-medium text-neutral-700">
        {perf.totalViews > 0
          ? `${perf.totalViews} ${perf.totalViews === 1 ? "customer" : "customers"} visited your website this month.`
          : "No visits yet this month — share your website to get seen."}
        {perf.contacts > 0 && ` ${perf.contacts} contacted you.`}
        {perf.returnVisitors > 0 && ` ${perf.returnVisitors} came back.`}
        {perf.percentile != null && ` Your profile performs better than ${perf.percentile}% of similar businesses.`}
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Visitors" value={perf.uniqueVisitors} hint={`${perf.totalViews} views`} />
        <Stat label="Direct visits" value={perf.directVisits} hint="typed/saved your link" />
        <Stat label="Return visitors" value={perf.returnVisitors} />
        <Stat label="Contacts" value={perf.contacts} hint="WhatsApp, call, site, directions" />
        <Stat label="Instagram-bio visits" value={perf.igReferrals} />
        <Stat label="QR poster downloads" value={perf.qrDownloads} />
        <Stat label="Shares" value={perf.shares} />
      </div>

      <div className="mt-5 rounded-2xl border border-neutral-200 bg-white p-5">
        <h3 className="text-sm font-bold text-neutral-700">
          {score.qualifies ? "✅ You're using EBH as your website" : "Make EBH your primary website"}
        </h3>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {score.criteria.map((c) => (
            <li key={c.key} className="flex items-center gap-2 text-sm">
              <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${c.met ? "bg-emerald-100 text-emerald-700" : "bg-neutral-100 text-neutral-400"}`} aria-hidden>{c.met ? "✓" : "○"}</span>
              <span className={c.met ? "text-neutral-700" : "text-neutral-500"}>{c.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
