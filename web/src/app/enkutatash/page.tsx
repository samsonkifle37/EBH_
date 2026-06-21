import Link from "next/link";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import BusinessLogo from "@/components/BusinessLogo";
import EnkutatashCountdown from "@/components/EnkutatashCountdown";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Enkutatash 2026 — Ethiopian New Year | Ethiopian Business Hub UK",
  description:
    "Celebrate Enkutatash — the Ethiopian New Year — with the UK's Ethiopian business community. Find special offers, events, and partners for Ethiopian New Year 2026.",
  openGraph: {
    title: "Enkutatash 2026 🌸 Ethiopian New Year — EBH UK",
    description:
      "The Ethiopian New Year is coming. Celebrate with the best Ethiopian businesses across the UK. Discover Enkutatash Partners with exclusive offers.",
    type: "website",
    images: [
      {
        url: "https://ethiopianbh.vercel.app/og/enkutatash-2026.png",
        width: 1200,
        height: 630,
        alt: "Enkutatash 2026 — Ethiopian New Year | Ethiopian Business Hub UK",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Enkutatash 2026 🌸 Ethiopian New Year — EBH UK",
    description:
      "Celebrate the Ethiopian New Year with the UK's best Ethiopian businesses. Find partners, offers, and events for Enkutatash 2026.",
  },
};

// WhatsApp share link for this page
const WHATSAPP_SHARE =
  "https://wa.me/?text=" +
  encodeURIComponent(
    "🌸 Enkutatash 2026 is coming!\n\nCelebrate the Ethiopian New Year with the best Ethiopian businesses across the UK.\n\n👉 https://ethiopianbh.co.uk/enkutatash"
  );

const CULTURAL_FACTS = [
  {
    emoji: "🌸",
    title: "Flowers everywhere",
    body: "Children greet neighbours with bouquets of yellow Adey Abeba (African daisies), the symbol of Enkutatash — meaning 'gift of jewels.'",
  },
  {
    emoji: "📅",
    title: "1 Meskerem",
    body: "Enkutatash falls on the 1st of Meskerem in the Ethiopian calendar — 11 September in the Gregorian calendar. Ethiopia has 13 months and a calendar 7–8 years behind the world.",
  },
  {
    emoji: "🎶",
    title: "Songs & feasts",
    body: "Children sing traditional songs (nimsas) door to door. Families slaughter a sheep, cook injera and wot, and share food with neighbours.",
  },
  {
    emoji: "⛪",
    title: "Timkat & church",
    body: "Ethiopian Orthodox Christians attend an overnight church service starting New Year's Eve, dressed in traditional white habesha kemis.",
  },
  {
    emoji: "🇬🇧",
    title: "Enkutatash in the UK",
    body: "Tens of thousands of Ethiopian diaspora across London, Manchester, Birmingham and beyond celebrate together — from restaurant pop-ups to community events.",
  },
  {
    emoji: "🎊",
    title: "Melkam Addis Amet!",
    body: "The traditional New Year greeting: መልካም አዲስ ዓመት — 'Happy New Year!' in Amharic.",
  },
];

async function getEnkutatashPartners() {
  return db.business.findMany({
    where: { enkutatashPartner: true, status: "APPROVED" },
    include: {
      photos: { take: 1, orderBy: { sortOrder: "asc" } },
    },
    orderBy: [{ featured: "desc" }, { name: "asc" }],
    take: 12,
  });
}

async function getFeaturedFallback() {
  return db.business.findMany({
    where: { featured: true, status: "APPROVED" },
    include: {
      photos: { take: 1, orderBy: { sortOrder: "asc" } },
    },
    orderBy: { name: "asc" },
    take: 6,
  });
}

export default async function EnkutatashPage() {
  const partners = await getEnkutatashPartners();
  // Fall back to featured businesses if no Enkutatash partners registered yet
  const fallbackBusinesses =
    partners.length === 0 ? await getFeaturedFallback() : [];
  const showFallback = partners.length === 0;

  return (
    <main>
      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden text-white"
        style={{
          background:
            "linear-gradient(135deg, #0f3d28 0%, #15613e 45%, #1a7a4e 100%)",
        }}
      >
        {/* Ethiopian flag colour accents */}
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 90% 0%, rgba(224,168,46,0.2) 0%, transparent 60%), radial-gradient(ellipse 50% 50% at 10% 100%, rgba(218,18,26,0.12) 0%, transparent 55%)",
          }}
        />

        <div className="relative mx-auto max-w-4xl px-4 py-16 text-center sm:py-24">
          {/* Amharic + English label */}
          <p className="text-sm font-semibold uppercase tracking-widest text-emerald-300">
            🇪🇹 Ethiopian New Year · 11 September 2026
          </p>

          <h1 className="mt-4 text-5xl font-extrabold tracking-tight sm:text-7xl">
            <span className="block text-[var(--color-gold-bright)]">Enkutatash</span>
            <span className="block text-2xl font-bold text-emerald-100 sm:text-3xl">
               እንኩዋን ለዘመን መለወጫ በዓል አደረሳችሁ
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-emerald-100 sm:text-lg">
            The Ethiopian New Year brings flowers, feasts, and community together.
            Discover Enkutatash Partners — businesses celebrating with special
            offers across the UK.
          </p>

          {/* Countdown */}
          <div className="mt-10">
            <p className="mb-6 text-xs font-semibold uppercase tracking-widest text-emerald-400">
              Countdown to Enkutatash 2026
            </p>
            <EnkutatashCountdown />
          </div>

          {/* CTA */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <a
              href={WHATSAPP_SHARE}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-[#1fba58]"
            >
              📲 Share on WhatsApp
            </a>
            <Link
              href="#partners"
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              🌸 See Partners
            </Link>
          </div>
        </div>
      </section>

      {/* ── What is Enkutatash ──────────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-4 py-16">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
            What is Enkutatash?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-neutral-600">
            A celebration of culture, community, and a new beginning — rooted in
            thousands of years of Ethiopian tradition.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CULTURAL_FACTS.map((fact) => (
            <div
              key={fact.title}
              className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-xl">
                {fact.emoji}
              </div>
              <h3 className="mt-3 font-semibold text-neutral-900">{fact.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-neutral-600">
                {fact.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Enkutatash Partners ─────────────────────────────────────────────── */}
      <section id="partners" className="bg-amber-50/60 py-16">
        <div className="mx-auto max-w-5xl px-4">
          <div className="mb-10 text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800 ring-1 ring-amber-300/70">
              🌸 Enkutatash Partner 2026
            </span>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
              {showFallback
                ? "Featured businesses celebrating with you"
                : "Enkutatash Partners across the UK"}
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-neutral-600">
              {showFallback
                ? "Partner registrations are opening soon. In the meantime, discover our top verified businesses."
                : "These businesses have registered as Enkutatash Partners and may be offering specials, events, or traditional New Year menus."}
            </p>
          </div>

          {(showFallback ? fallbackBusinesses : partners).length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-amber-200 bg-white p-12 text-center">
              <p className="text-4xl">🌸</p>
              <p className="mt-3 text-lg font-semibold text-neutral-800">
                Partners coming soon
              </p>
              <p className="mt-1 text-sm text-neutral-500">
                Be the first to register your business as an Enkutatash Partner 2026.
              </p>
              <Link
                href="/contact"
                className="mt-5 inline-block rounded-xl bg-ebh-green px-5 py-3 text-sm font-bold text-white hover:bg-ebh-green-dark transition-colors"
              >
                Register my business →
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(showFallback ? fallbackBusinesses : partners).map((b) => {
                const photoUrl = b.photos[0]?.url ?? null;
                const offerText = !showFallback
                  ? (b as { enkutatashOffer: string }).enkutatashOffer
                  : "";
                return (
                  <Link
                    key={b.id}
                    href={`/business/${b.slug}`}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    {/* Photo */}
                    <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
                      {photoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={photoUrl}
                          alt={b.name}
                          loading="lazy"
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-50 to-amber-50 text-4xl">
                          🏪
                        </div>
                      )}
                      {/* Enkutatash badge ribbon */}
                      {!showFallback && (
                        <div className="absolute left-0 right-0 top-0 bg-gradient-to-r from-amber-500 to-yellow-400 px-3 py-1 text-center text-[10px] font-bold uppercase tracking-wider text-white">
                          🌸 Enkutatash Partner 2026
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex flex-1 flex-col p-4">
                      <div className="-mt-5 mb-2">
                        <BusinessLogo
                          name={b.name}
                          logoUrl={b.logoUrl}
                          className="h-10 w-10 text-sm shadow-sm ring-2 ring-white"
                        />
                      </div>
                      <h3 className="font-semibold text-neutral-900 group-hover:text-emerald-800">
                        {b.name}
                      </h3>
                      <p className="mt-1 text-xs text-neutral-500">
                        {b.category} · 📍 {b.city}
                      </p>
                      {offerText && (
                        <div className="mt-3 rounded-xl bg-amber-50 p-3 text-xs leading-relaxed text-amber-900 ring-1 ring-amber-200">
                          🎁 <span className="font-semibold">Special offer:</span>{" "}
                          {offerText}
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Browse all */}
          <div className="mt-8 text-center">
            <Link
              href="/businesses"
              className="inline-flex items-center gap-2 rounded-xl border border-neutral-300 bg-white px-5 py-3 text-sm font-semibold text-neutral-700 shadow-sm transition hover:border-emerald-400 hover:text-emerald-700"
            >
              Browse all Ethiopian businesses →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Business CTA ────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-4 py-16">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 to-emerald-800 px-6 py-12 text-center text-white sm:px-12">
          <p className="text-sm font-semibold text-emerald-300">For businesses</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Is your business celebrating Enkutatash?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-emerald-100">
            Register as an Enkutatash Partner 2026 and get featured on this page,
            a special 🌸 badge on your listing, and a WhatsApp share card to
            promote your New Year offer across the community.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/contact"
              className="inline-block rounded-xl bg-white px-6 py-3 text-sm font-bold text-emerald-900 shadow-lg transition hover:bg-emerald-50"
            >
              Register as Enkutatash Partner →
            </Link>
            <Link
              href="/pricing"
              className="inline-block rounded-xl border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              List your business free
            </Link>
          </div>
          <p className="mt-5 text-xs text-emerald-400">
            Free for all listed businesses · deadline 1 September 2026
          </p>
        </div>
      </section>

      {/* ── WhatsApp share ──────────────────────────────────────────────────── */}
      <section className="border-t border-neutral-100 bg-white py-12 text-center">
        <p className="text-lg font-bold text-neutral-900">
          Spread the word 🌸
        </p>
        <p className="mt-1 text-sm text-neutral-500">
          Share this page with your family and friends on WhatsApp.
        </p>
        <a
          href={WHATSAPP_SHARE}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#1fba58]"
        >
          📲 Share on WhatsApp
        </a>
        <p className="mt-6 text-xs text-neutral-400">
          Ethiopian New Year · 11 September 2026 · መልካም አዲስ ዓመት
        </p>
      </section>
    </main>
  );
}
