import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — List, Verify and Grow Your Business",
  description:
    "Free listings, Verified Business from £2.99/month, Featured placement, event promotion and banner advertising for Ethiopian businesses in the UK.",
};

const PLANS = [
  {
    name: "Free Listing",
    price: "£0",
    period: "forever",
    cta: "List My Business",
    href: "/dashboard/new",
    highlight: false,
    features: ["Basic business listing", "Photos and opening hours", "Customer reviews", "Appears in search and categories"],
  },
  {
    name: "Verified Business",
    price: "£2.99",
    period: "/month",
    cta: "Get Verified",
    href: "/dashboard",
    highlight: true,
    features: ["Everything in Free", "Verified badge and trust score", "Analytics dashboard", "Priority placement in search", "Respond to reviews"],
  },
  {
    name: "Featured Listing",
    price: "£4.99",
    period: "/month",
    cta: "Go Featured",
    href: "/dashboard",
    highlight: false,
    features: ["Everything in Verified", "Featured Partner badge", "Top placement on home page", "Top of search and category pages"],
  },
  {
    name: "AI Business Toolkit",
    price: "£29",
    period: "/month",
    cta: "Coming Soon",
    href: "/dashboard",
    highlight: false,
    features: ["AI content generation", "English ⇄ Amharic translation", "AI review summaries", "Social post generator"],
  },
];

export default function PricingPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Grow with the community</h1>
        <p className="mx-auto mt-3 max-w-xl text-neutral-500">
          Start free. Upgrade when you want more trust, more visibility and more customers.
        </p>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {PLANS.map((p) => (
          <div
            key={p.name}
            className={`flex flex-col rounded-3xl border bg-white p-6 shadow-sm ${p.highlight ? "border-emerald-600 ring-2 ring-emerald-600/20" : "border-neutral-200"}`}
          >
            {p.highlight && (
              <span className="mb-3 self-start rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                Most popular
              </span>
            )}
            <h2 className="text-lg font-bold">{p.name}</h2>
            <p className="mt-2">
              <span className="text-3xl font-extrabold tracking-tight">{p.price}</span>
              <span className="text-sm text-neutral-400"> {p.period}</span>
            </p>
            <ul className="mt-5 flex-1 space-y-2.5 text-sm text-neutral-600">
              {p.features.map((f) => (
                <li key={f} className="flex gap-2">
                  <span className="text-emerald-600">✓</span> {f}
                </li>
              ))}
            </ul>
            <Link
              href={p.href}
              className={`mt-6 rounded-xl px-4 py-2.5 text-center text-sm font-semibold ${p.highlight ? "bg-emerald-700 text-white hover:bg-emerald-800" : "border border-neutral-300 text-neutral-700 hover:border-emerald-600 hover:text-emerald-700"}`}
            >
              {p.cta}
            </Link>
          </div>
        ))}
      </div>

      <div className="mt-12 grid gap-5 md:grid-cols-2">
        <div className="rounded-3xl border border-neutral-200 bg-white p-7">
          <h2 className="text-lg font-bold">🎟 Event Promotion</h2>
          <p className="mt-1 text-2xl font-extrabold">£25–£250 <span className="text-sm font-normal text-neutral-400">per campaign</span></p>
          <p className="mt-3 text-sm text-neutral-600">
            Promote your event on the home page, event listings and city pages.
            Packages sized for community nights through to arena concerts.
          </p>
          <Link href="/dashboard/events" className="mt-5 inline-block rounded-xl border border-neutral-300 px-4 py-2.5 text-sm font-semibold text-neutral-700 hover:border-emerald-600 hover:text-emerald-700">
            Promote an event
          </Link>
        </div>
        <div className="rounded-3xl border border-neutral-200 bg-white p-7">
          <h2 className="text-lg font-bold">📣 Banner Advertising</h2>
          <p className="mt-1 text-2xl font-extrabold">£50–£100 <span className="text-sm font-normal text-neutral-400">/month</span></p>
          <p className="mt-3 text-sm text-neutral-600">
            Native banner placements on the home page, search results, business
            and event pages. Priced by impressions — daily, weekly or monthly.
          </p>
          <Link href="/advertise" className="mt-5 inline-block rounded-xl border border-neutral-300 px-4 py-2.5 text-sm font-semibold text-neutral-700 hover:border-emerald-600 hover:text-emerald-700">
            Advertise with us
          </Link>
        </div>
      </div>
    </main>
  );
}
