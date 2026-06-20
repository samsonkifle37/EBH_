import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "List Your Business — Ethiopian Business Hub UK",
  description:
    "Add your Ethiopian business to the UK's leading directory. Get verified, build trust, and reach thousands of customers.",
};

const OPTIONS = [
  {
    icon: "➕",
    title: "Add a new business",
    description:
      "List your Ethiopian restaurant, grocery store, salon, law firm, or any other business — free to start.",
    href: "/pricing",
    cta: "Get started",
    primary: true,
  },
  {
    icon: "🏷️",
    title: "Claim an existing listing",
    description:
      "Your business is already listed but you don't manage it? Claim it to take control of your profile.",
    href: "/businesses",
    cta: "Find your listing",
    primary: false,
  },
  {
    icon: "✅",
    title: "Get verified",
    description:
      "Already listed? Upgrade to a verified profile — includes a trust badge, priority placement, and your own digital website.",
    href: "/pricing",
    cta: "See plans",
    primary: false,
  },
] as const;

export default function ListBusinessPage() {
  return (
    <main className="mx-auto max-w-xl px-5 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-ink">
          Grow your business with EBH
        </h1>
        <p className="mt-3 text-base text-neutral-600">
          Join hundreds of Ethiopian-owned businesses across the UK — trusted,
          verified, and discovered every day.
        </p>
      </div>

      <ul className="space-y-4">
        {OPTIONS.map((opt) => (
          <li key={opt.title}>
            <Link
              href={opt.href}
              className={`block rounded-2xl border p-5 transition-shadow hover:shadow-md ${
                opt.primary
                  ? "border-ebh-green bg-ebh-green text-white"
                  : "border-neutral-200 bg-white text-ink"
              }`}
            >
              <span className="text-2xl">{opt.icon}</span>
              <h2
                className={`mt-2 text-lg font-semibold ${
                  opt.primary ? "text-white" : "text-ink"
                }`}
              >
                {opt.title}
              </h2>
              <p
                className={`mt-1 text-sm leading-relaxed ${
                  opt.primary ? "text-emerald-100" : "text-neutral-500"
                }`}
              >
                {opt.description}
              </p>
              <span
                className={`mt-3 inline-block text-sm font-semibold underline underline-offset-2 ${
                  opt.primary ? "text-white" : "text-ebh-green"
                }`}
              >
                {opt.cta} →
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <p className="mt-8 text-center text-xs text-neutral-400">
        Questions?{" "}
        <Link href="/help" className="underline hover:text-ink">
          Visit our help centre
        </Link>{" "}
        or{" "}
        <Link href="/contact" className="underline hover:text-ink">
          contact us
        </Link>
        .
      </p>
    </main>
  );
}
