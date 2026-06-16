import type { Metadata } from "next";
import Link from "next/link";
import { organizationJsonLd, socialMeta } from "@/lib/seo";
import { trackServerView } from "@/lib/analytics/serverTrack";
import Breadcrumbs from "@/components/Breadcrumbs";

const TITLE = "About Ethiopian Business Hub UK";
const DESC = "EBH is the trust and reputation layer for Ethiopian-owned businesses in the UK — built on verification, transparency and owner pride.";

export const metadata: Metadata = {
  title: "About",
  description: DESC,
  ...socialMeta({ title: TITLE, description: DESC, path: "/about" }),
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-bold tracking-tight text-ink">{title}</h2>
      <div className="mt-2 space-y-3 text-[15px] leading-relaxed text-neutral-700">{children}</div>
    </section>
  );
}

export default async function AboutPage() {
  await trackServerView("ABOUT_VIEW");

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }} />
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "About", path: "/about" }]} />

      <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink">About EBH</h1>
      <p className="mt-3 text-[15px] leading-relaxed text-neutral-700">
        Ethiopian Business Hub UK isn&rsquo;t just a directory — it&rsquo;s the trust and reputation layer for Ethiopian-owned
        businesses across the United Kingdom. We help people discover, trust and support our community&rsquo;s businesses with dignity.
      </p>

      <Section title="Our mission">
        <p>To give every Ethiopian-owned business in the UK a credible, beautiful home online — and to make it effortless for the community to find and champion them.</p>
      </Section>

      <Section title="Why trust matters">
        <p>Trust drives discovery; transparency builds credibility. Rather than asking you to take listings at face value, we show the evidence behind them and let owners tell their own story.</p>
      </Section>

      <Section title="Owner pride">
        <p>When an owner is proud of their profile, they share it — and sharing brings new customers. We give owners a boutique profile, day-one recognition and a ready-made share kit so pride turns into reach.</p>
      </Section>

      <Section title="How verification works">
        <p>Listings are compiled and cross-checked against public sources — Companies House, Google and OpenStreetMap — and enriched by owners who claim their listing. A claimed, verified listing carries a badge so you know a real owner stands behind it.</p>
      </Section>

      <Section title="Trust Score methodology">
        <p>
          Each business has an evidence-based Trust Score from 0&ndash;100. It rewards verifiable signals — a claimed owner, matching company records, a Google presence, complete contact details, opening hours, photos and genuine reviews — and recent activity. It is an indicator, not a guarantee, and it updates as evidence changes.
        </p>
      </Section>

      <Section title="Moderation principles">
        <p>We moderate to keep the directory trustworthy: reviews must reflect genuine experiences, listings must be accurate, and impersonation, fraud and abuse are removed. Anyone can <Link href="/report" className="text-emerald-700 underline">report a problem</Link>, and we act on reports.</p>
      </Section>

      <Section title="Community guidelines">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Be honest — reviews and claims must be truthful and your own.</li>
          <li>Be respectful — no abuse, harassment or discrimination.</li>
          <li>Be accurate — only claim a business you&rsquo;re authorised to represent.</li>
          <li>Report problems rather than retaliating.</li>
        </ul>
      </Section>

      <div className="mt-10 flex flex-wrap gap-3 border-t border-neutral-200 pt-6 text-sm">
        <Link href="/safety" className="font-semibold text-emerald-700 hover:underline">How we keep EBH safe →</Link>
        <Link href="/help" className="font-semibold text-emerald-700 hover:underline">Help centre →</Link>
        <Link href="/contact" className="font-semibold text-emerald-700 hover:underline">Contact us →</Link>
      </div>
    </main>
  );
}
