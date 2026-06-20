import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "For Businesses — Ethiopian Business Hub UK",
  description:
    "Everything Ethiopian business owners need: list your business, get verified, manage your profile, access analytics, advertise, and promote events.",
};

const SECTIONS = [
  {
    heading: "Your business on EBH",
    items: [
      {
        icon: "🏪",
        title: "List your business",
        desc: "Add your business to the UK's leading Ethiopian directory.",
        href: "/pricing",
      },
      {
        icon: "🏷️",
        title: "Claim your listing",
        desc: "Already listed? Take control of your profile.",
        href: "/businesses",
      },
      {
        icon: "✅",
        title: "Get verified",
        desc: "Earn a trust badge and unlock premium features.",
        href: "/pricing",
      },
    ],
  },
  {
    heading: "Manage & grow",
    items: [
      {
        icon: "📊",
        title: "Owner dashboard",
        desc: "Edit your profile, view analytics, and manage your listing.",
        href: "/owner",
      },
      {
        icon: "💳",
        title: "Plans & pricing",
        desc: "Free and premium plans to suit every stage of growth.",
        href: "/pricing",
      },
      {
        icon: "📣",
        title: "Advertise with us",
        desc: "Reach Ethiopian communities across the UK with targeted ads.",
        href: "/advertise",
      },
      {
        icon: "🎟️",
        title: "Promote an event",
        desc: "List and promote your community events.",
        href: "/dashboard/events",
      },
    ],
  },
  {
    heading: "Trust & verification",
    items: [
      {
        icon: "🛡️",
        title: "How trust scores work",
        desc: "Understand how EBH builds verified trust for your business.",
        href: "/about",
      },
      {
        icon: "🌐",
        title: "Your business website",
        desc: "Turn your profile into a standalone website at no extra cost.",
        href: "/pricing",
      },
    ],
  },
  {
    heading: "Help & support",
    items: [
      {
        icon: "❓",
        title: "Help centre",
        desc: "Guides, FAQs and answers for business owners.",
        href: "/help",
      },
      {
        icon: "💬",
        title: "Contact us",
        desc: "Speak to the EBH team directly.",
        href: "/contact",
      },
      {
        icon: "🔒",
        title: "Safety & moderation",
        desc: "How we keep EBH safe and trustworthy.",
        href: "/safety",
      },
    ],
  },
] as const;

export default function ForBusinessesPage() {
  return (
    <main>
      {/* Hero */}
      <section className="bg-ebh-green px-5 py-14 text-center text-white">
        <h1 className="text-3xl font-bold tracking-tight">
          Built for Ethiopian business owners
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-emerald-100">
          List your business, get verified, reach thousands of customers, and
          manage everything in one place.
        </p>
        <Link
          href="/list-business"
          className="mt-6 inline-block rounded-xl bg-white px-6 py-3 text-sm font-bold text-ebh-green shadow hover:bg-emerald-50 transition-colors"
        >
          Get started — it&apos;s free
        </Link>
      </section>

      {/* Sections */}
      <div className="mx-auto max-w-2xl space-y-10 px-5 py-10">
        {SECTIONS.map((section) => (
          <section key={section.heading}>
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-neutral-400">
              {section.heading}
            </h2>
            <ul className="space-y-2">
              {section.items.map((item) => (
                <li key={item.title}>
                  <Link
                    href={item.href}
                    className="flex items-start gap-3.5 rounded-xl border border-neutral-150 bg-white p-4 hover:shadow-sm transition-shadow"
                  >
                    <span className="mt-0.5 text-xl">{item.icon}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink">{item.title}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-neutral-500">
                        {item.desc}
                      </p>
                    </div>
                    <span className="ml-auto shrink-0 text-neutral-300 self-center">›</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}
