import { NU_URL } from "@/lib/nu";
import { getFeaturedBusinesses } from "@/lib/queries/businesses";
import { getUpcomingEvents } from "@/lib/queries/events";
import BusinessCard from "@/components/BusinessCard";
import EventCard from "@/components/EventCard";
import AdSlot from "@/components/AdSlot";
import SectionHeading from "@/components/SectionHeading";
import SearchBar from "@/components/ui/SearchBar";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import CityChips from "@/components/CityChips";
import CategoryChips from "@/components/CategoryChips";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

const TRUST_POINTS = [
  { icon: "🛡️", title: "Verified against real records", body: "Listings are cross-checked with Companies House, Google and official sources — not user-submitted guesses." },
  { icon: "📊", title: "An honest Trust Score", body: "Every business gets an evidence-based score from 0–100, so you can see at a glance who's established and verified." },
  { icon: "🤝", title: "Powered by the community", body: "Real reviews from real customers, and founders who proudly tell their own story." },
];

export default async function HomePage() {
  const [featured, events] = await Promise.all([
    getFeaturedBusinesses(6),
    getUpcomingEvents({ limit: 3 }),
  ]);

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd()) }} />

      {/* Section 1 — Hero */}
      <section className="relative overflow-hidden bg-ink text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.18]"
          style={{ background: "radial-gradient(60% 80% at 80% 0%, #e0a82e 0%, transparent 60%), radial-gradient(50% 70% at 0% 100%, #047857 0%, transparent 55%)" }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:py-24">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-gold-bright">
            🇪🇹 The verified home of Ethiopian businesses in the UK
          </span>
          <h1 className="mt-5 max-w-3xl text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
            Discover trusted <span className="text-gold-bright">Ethiopian businesses</span> across the UK.
          </h1>
          <p className="mt-4 max-w-xl text-base text-neutral-300 sm:text-lg">
            Restaurants, grocery stores, travel agencies, lawyers, beauty services, and more.
          </p>
          <div className="mt-8 max-w-2xl">
            <SearchBar variant="hero" />
          </div>
        </div>
      </section>

      {/* Section 2 — Browse by City */}
      <CityChips />

      {/* Section 3 — Browse by Category */}
      <CategoryChips />

      {/* Section 4 — Featured Businesses */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-14">
          <SectionHeading title="Featured businesses" subtitle="Trusted and verified partners across the UK" href="/businesses" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((b) => (
              <BusinessCard key={b.id} business={b} />
            ))}
          </div>
        </section>
      )}

      {/* Why trust EBH */}
      <section className="border-y border-neutral-200/70 bg-white/50">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <SectionHeading title="Why trust EBH?" subtitle="Not another directory — a reputation layer for our community" />
          <div className="grid gap-5 sm:grid-cols-3">
            {TRUST_POINTS.map((p) => (
              <Card key={p.title} className="p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold-soft text-xl">{p.icon}</div>
                <h3 className="mt-4 font-bold text-ink">{p.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-neutral-600">{p.body}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming events */}
      {events.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-6">
          <SectionHeading title="Upcoming events" subtitle="Concerts, culture, business and community" href="/events" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        </section>
      )}

      {/* For business owners */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-gold-soft/50 px-6 py-12 sm:px-12">
          <div className="grid items-center gap-8 lg:grid-cols-[1.3fr_1fr]">
            <div>
              <span className="text-sm font-bold text-emerald-700">For business owners</span>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-ink">Own a business? Claim your pride of place.</h2>
              <p className="mt-3 max-w-lg text-neutral-700">
                Claim your listing, get verified, tell your founder story, and download a ready-made share kit — &ldquo;Proud member of Ethiopian Business Hub UK.&rdquo; The more complete your profile, the more customers you reach.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button href="/pricing" size="lg">Claim or list your business</Button>
                <Button href="/advertise" variant="outline" size="lg">Advertise with us</Button>
              </div>
            </div>
            <ul className="space-y-3 text-sm">
              {[
                ["✅", "Get a verified badge and higher trust score"],
                ["📣", "Auto-generated share kit for WhatsApp, Instagram & a QR poster"],
                ["⭐", "Collect and respond to real customer reviews"],
                ["📈", "Pride Analytics — see how far your profile travels"],
              ].map(([icon, text]) => (
                <li key={text} className="flex items-start gap-3 rounded-xl bg-white/70 p-3">
                  <span className="text-lg">{icon}</span>
                  <span className="font-medium text-ink">{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* AI Concierge teaser */}
      <section className="mx-auto max-w-6xl px-4 pb-4">
        <div className="overflow-hidden rounded-3xl bg-ink px-6 py-10 text-white sm:px-10">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-semibold text-emerald-400">🤖 AI Concierge</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight">What are you looking for today?</h2>
              <p className="mt-2 max-w-lg text-sm text-neutral-300">
                Ask in plain English — &ldquo;Find me a wedding venue for 250 guests in London&rdquo; — and get instant recommendations from across the directory.
              </p>
            </div>
            <Button href="/concierge" variant="gold" size="lg" className="shrink-0">Ask AI →</Button>
          </div>
        </div>
      </section>

      {/* Sponsored */}
      <section className="mx-auto max-w-6xl px-4 py-8">
        <AdSlot placement="HOME_HERO" />
      </section>

      {/* NU band */}
      <section className="mx-auto max-w-6xl px-4 pb-14">
        <div className="flex flex-col items-start justify-between gap-4 rounded-3xl border border-neutral-200/80 bg-ivory-card px-6 py-8 sm:flex-row sm:items-center sm:px-10">
          <div>
            <p className="text-lg font-bold tracking-tight text-ink">Planning a trip back home?</p>
            <p className="mt-1 text-sm text-neutral-600">Discover trusted hotels, tours and experiences — and plan the whole journey with NU.</p>
          </div>
          <Button href={NU_URL} external variant="dark" size="lg" className="shrink-0">Explore Ethiopia with NU →</Button>
        </div>
      </section>
    </main>
  );
}
