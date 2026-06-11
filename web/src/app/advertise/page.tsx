import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Advertise — Reach Thousands of Ethiopian Consumers",
  description:
    "Banner advertising across Ethiopian Business Hub UK: home page, search results, business and event pages. From £50/month.",
};

const PLACEMENTS = [
  { name: "Home Page Hero", desc: "Premium slot on the busiest page of the platform.", price: "£100/month" },
  { name: "Search Results", desc: "Appears natively inside business search results.", price: "£75/month" },
  { name: "Business Detail Pages", desc: "Shown beside business contact details and reviews.", price: "£50/month" },
  { name: "Event Detail Pages", desc: "Shown beside ticket buttons on event pages.", price: "£50/month" },
];

export default function AdvertisePage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Promote your business to thousands of Ethiopian consumers</h1>
      <p className="mt-3 max-w-2xl text-neutral-500">
        Native image and video banner placements across the UK&apos;s Ethiopian
        business directory. Book daily, weekly or monthly — priced by impressions.
      </p>

      <div className="mt-8 space-y-4">
        {PLACEMENTS.map((p) => (
          <div key={p.name} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-neutral-200 bg-white p-5">
            <div>
              <p className="font-semibold text-neutral-900">{p.name}</p>
              <p className="text-sm text-neutral-500">{p.desc}</p>
            </div>
            <p className="font-bold text-emerald-700">{p.price}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-3xl bg-neutral-900 p-8 text-center text-white">
        <h2 className="text-xl font-bold">Ready to book a campaign?</h2>
        <p className="mt-2 text-sm text-neutral-300">
          Email <a href="mailto:ads@ethiopianbusinesshub.uk" className="font-semibold text-emerald-400 hover:underline">ads@ethiopianbusinesshub.uk</a> with
          your preferred placement and dates, or manage creatives in the admin panel if you&apos;re already a partner.
        </p>
        <Link href="/pricing" className="mt-5 inline-block rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-neutral-900 hover:bg-emerald-400">
          See all pricing
        </Link>
      </div>
    </main>
  );
}
