import Link from "next/link";
import { CATEGORIES, CATEGORY_LABELS, CITIES, CITY_LABELS } from "@/lib/types";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-neutral-200 bg-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-sm font-bold">Ethiopian Business Hub UK</p>
          <p className="mt-2 text-sm text-neutral-500">
            Discover • Connect • Support. The home of Ethiopian businesses,
            events and community across the United Kingdom.
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
      </div>
      <div className="border-t border-neutral-100 py-4 text-center text-xs text-neutral-400">
        © {new Date().getFullYear()} Ethiopian Business Hub UK · Discover, Support, and Grow Ethiopian Businesses Across the UK
      </div>
    </footer>
  );
}
