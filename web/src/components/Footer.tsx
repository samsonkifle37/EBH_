import Link from "next/link";
import { NU_URL, NU_APP_STORE_URL } from "@/lib/nu";
import { CATEGORIES, CATEGORY_LABELS, CITIES, CITY_LABELS } from "@/lib/types";
import Logo from "@/components/Logo";

export default function Footer() {
  return (
    <footer data-ebh-chrome className="mt-16 border-t border-neutral-200 bg-white">
      {/* NU conversion band — primary goal */}
      <div className="bg-neutral-900 text-white">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-4 py-8 sm:flex-row sm:items-center">
          <div>
            <p className="text-lg font-bold tracking-tight">Planning your next trip to Ethiopia?</p>
            <p className="mt-1 text-sm text-neutral-300">Download NU — plan, book and explore Ethiopia with trusted local partners.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <a href={NU_APP_STORE_URL} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-white px-4 py-2 font-semibold text-neutral-900 hover:bg-neutral-100">📱 App Store</a>
            <span className="rounded-xl border border-neutral-700 px-4 py-2 font-medium text-neutral-400">🤖 Google Play — coming soon</span>
            <a href={NU_URL} target="_blank" rel="noopener noreferrer" className="font-semibold text-emerald-400 hover:text-emerald-300">🌐 nu-discoverethiopia.com</a>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-5">
        <div>
          <Logo showTagline />
          <p className="mt-4 text-sm text-neutral-500">
            The verified home of Ethiopian businesses, events and community
            across the United Kingdom.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-neutral-900">Popular categories</p>
          <ul className="mt-3 space-y-2 text-sm text-neutral-500">
            {CATEGORIES.slice(0, 6).map((c) => (
              <li key={c}>
                <Link href={`/${c}/london`} className="hover:text-emerald-700">
                  {CATEGORY_LABELS[c]}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-neutral-900">Cities</p>
          <ul className="mt-3 space-y-2 text-sm text-neutral-500">
            {CITIES.map((c) => (
              <li key={c}>
                <Link href={`/businesses?city=${c}`} className="hover:text-emerald-700">
                  Ethiopian businesses in {CITY_LABELS[c]}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-neutral-900">For businesses</p>
          <ul className="mt-3 space-y-2 text-sm text-neutral-500">
            <li><Link href="/pricing" className="hover:text-emerald-700">List your business</Link></li>
            <li><Link href="/pricing" className="hover:text-emerald-700">Get verified</Link></li>
            <li><Link href="/advertise" className="hover:text-emerald-700">Advertise with us</Link></li>
            <li><Link href="/dashboard/events" className="hover:text-emerald-700">Promote an event</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-neutral-900">Support &amp; trust</p>
          <ul className="mt-3 space-y-2 text-sm text-neutral-500">
            <li><Link href="/about" className="hover:text-emerald-700">About EBH</Link></li>
            <li><Link href="/help" className="hover:text-emerald-700">Help centre</Link></li>
            <li><Link href="/safety" className="hover:text-emerald-700">Safety &amp; moderation</Link></li>
            <li><Link href="/report" className="hover:text-emerald-700">Report a problem</Link></li>
            <li><Link href="/contact" className="hover:text-emerald-700">Contact us</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-neutral-100 py-4 text-center text-xs text-neutral-400">
        <div className="mb-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          <Link href="/privacy" className="hover:text-emerald-700">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-emerald-700">Terms of Service</Link>
        </div>
        © {new Date().getFullYear()} Ethiopian Business Hub UK · Discover, Support, and Grow Ethiopian Businesses Across the UK
      </div>
    </footer>
  );
}
