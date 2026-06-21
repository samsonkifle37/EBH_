import Link from "next/link";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import BusinessLogo from "@/components/BusinessLogo";
import EnkutatashCountdown from "@/components/EnkutatashCountdown";
import FlowerCard from "@/components/enkutatash/FlowerCard";
import CalendarCard from "@/components/enkutatash/CalendarCard";
import QuizCard from "@/components/enkutatash/QuizCard";
import TraditionCard from "@/components/enkutatash/TraditionCard";
import NearMeCard from "@/components/enkutatash/NearMeCard";
import GreetingCard from "@/components/enkutatash/GreetingCard";
import ProgressTracker from "@/components/enkutatash/ProgressTracker";

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

async function getNearMeData() {
  const [businesses, events] = await Promise.all([
    db.business.findMany({
      where: { enkutatashPartner: true, status: "APPROVED" },
      select: { id: true, name: true, category: true, city: true, enkutatashOffer: true, slug: true,
        photos: { take: 1, select: { url: true } } },
      orderBy: { name: "asc" },
      take: 20,
    }),
    db.event.findMany({
      where: { startsAt: { gte: new Date() }, status: "APPROVED" },
      select: { id: true, title: true, city: true, startsAt: true, venueName: true, slug: true },
      orderBy: { startsAt: "asc" },
      take: 8,
    }).catch(() => [] as any[]),
  ]);
  return {
    businesses: businesses.map((b) => ({ ...b, imageUrl: b.photos[0]?.url ?? null })),
    // Normalise to the shape NearMeCard expects
    events: (events as any[]).map((e) => ({
      id: e.id,
      title: e.title,
      city: e.city,
      startDate: e.startsAt instanceof Date ? e.startsAt.toISOString() : String(e.startsAt),
      venue: e.venueName || null,
      slug: e.slug || null,
    })),
  };
}

async function getApprovedPhotos() {
  return db.enkutatashPhoto.findMany({
    where: { status: "APPROVED" },
    orderBy: { createdAt: "desc" },
    take: 16,
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
  const [partners, communityPhotos, nearMe] = await Promise.all([
    getEnkutatashPartners(),
    getApprovedPhotos(),
    getNearMeData(),
  ]);
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

      {/* ── Interactive Cultural Experiences ────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-4 py-16">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
            Experience Enkutatash
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-neutral-600">
            Six ways to connect with Ethiopian New Year culture — send a flower,
            find your Ethiopian birthday, test your knowledge, and more.
          </p>
        </div>

        {/* Progress tracker (shows only after first interaction) */}
        <ProgressTracker />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Card 1 — Digital Flower */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-xl">🌸</div>
              <div>
                <h3 className="font-bold text-neutral-900">Send an Adey Abeba</h3>
                <p className="text-xs text-neutral-500">Gift a digital bouquet</p>
              </div>
            </div>
            <FlowerCard />
          </div>

          {/* Card 2 — Calendar converter */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-xl">🗓️</div>
              <div>
                <h3 className="font-bold text-neutral-900">Find Your Ethiopian Birthday</h3>
                <p className="text-xs text-neutral-500">Convert to Ge&apos;ez calendar</p>
              </div>
            </div>
            <CalendarCard />
          </div>

          {/* Card 3 — Quiz */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-xl">🧠</div>
              <div>
                <h3 className="font-bold text-neutral-900">Enkutatash Challenge</h3>
                <p className="text-xs text-neutral-500">8-question culture quiz</p>
              </div>
            </div>
            <QuizCard />
          </div>

          {/* Card 4 — Tradition Explorer */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-xl">📖</div>
              <div>
                <h3 className="font-bold text-neutral-900">Tradition Explorer</h3>
                <p className="text-xs text-neutral-500">Discover 4 cultural stories</p>
              </div>
            </div>
            <TraditionCard />
          </div>

          {/* Card 5 — Celebrate Near Me */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-xl">📍</div>
              <div>
                <h3 className="font-bold text-neutral-900">Celebrate Near Me</h3>
                <p className="text-xs text-neutral-500">Events &amp; partners by city</p>
              </div>
            </div>
            <NearMeCard businesses={nearMe.businesses} events={nearMe.events} />
          </div>

          {/* Card 6 — Greeting Vote */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-50 text-xl">🗣️</div>
              <div>
                <h3 className="font-bold text-neutral-900">Favourite Greeting</h3>
                <p className="text-xs text-neutral-500">Vote &amp; share yours</p>
              </div>
            </div>
            <GreetingCard />
          </div>
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
              href="/owner"
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

      {/* ── Community Photo Wall ────────────────────────────────────────────── */}
      {communityPhotos.length > 0 && (
        <section className="mx-auto max-w-5xl px-4 py-16">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
              Community moments 📸
            </h2>
            <p className="mt-2 text-sm text-neutral-500">
              {communityPhotos.length} photo{communityPhotos.length !== 1 ? "s" : ""} from the community
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {communityPhotos.map((photo) => (
              <div key={photo.id} className="group relative aspect-square overflow-hidden rounded-2xl bg-neutral-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.imageUrl}
                  alt={photo.caption || `Photo by ${photo.submitterName}`}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 transition group-hover:opacity-100">
                  <p className="text-xs font-semibold text-white">{photo.submitterName}</p>
                  {photo.city && <p className="text-[10px] text-white/70">{photo.city}</p>}
                  {photo.caption && <p className="mt-0.5 text-[10px] italic text-white/80 line-clamp-2">{photo.caption}</p>}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/enkutatash/share-photo"
              className="inline-flex items-center gap-2 rounded-xl border border-neutral-300 bg-white px-5 py-3 text-sm font-semibold text-neutral-700 shadow-sm transition hover:border-emerald-400 hover:text-emerald-700"
            >
              📷 Add your photo
            </Link>
          </div>
        </section>
      )}

      {/* ── Share-a-photo CTA (shown when wall is empty) ────────────────────── */}
      {communityPhotos.length === 0 && (
        <section className="mx-auto max-w-5xl px-4 py-16">
          <div className="overflow-hidden rounded-3xl border-2 border-dashed border-amber-200 bg-amber-50/50 px-6 py-12 text-center">
            <p className="text-4xl">📸</p>
            <h2 className="mt-4 text-xl font-bold text-neutral-900">
              Share your Enkutatash moment
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-neutral-600">
              Upload a photo of your celebrations — family, food, flowers, or festivities.
              Be the first to add to the community wall!
            </p>
            <Link
              href="/enkutatash/share-photo"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#15613e] px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#0f3d28]"
            >
              📷 Upload a photo
            </Link>
          </div>
        </section>
      )}

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
