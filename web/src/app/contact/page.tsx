import type { Metadata } from "next";
import Link from "next/link";
import { contactPointJsonLd, socialMeta } from "@/lib/seo";
import Breadcrumbs from "@/components/Breadcrumbs";
import ObfuscatedEmail from "@/components/ObfuscatedEmail";

const TITLE = "Contact Ethiopian Business Hub UK";
const DESC = "Get support: business owners, listing corrections, verification, privacy requests, technical help and abuse reports.";

export const metadata: Metadata = {
  title: "Contact",
  description: DESC,
  ...socialMeta({ title: TITLE, description: DESC, path: "/contact" }),
};

const CHANNELS = [
  { title: "Business owners", body: "Claiming, verifying or updating your listing." },
  { title: "Listing corrections", body: "Something wrong on a profile? Tell us what to fix." },
  { title: "Verification support", body: "Questions about badges, Trust Score or evidence." },
  { title: "Privacy requests", body: "Access, correction or erasure of your data." },
  { title: "Technical support", body: "Something not working? We&rsquo;ll help." },
  { title: "Abuse reports", body: "For urgent safety issues, use the report flow." },
];

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(contactPointJsonLd()) }} />
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Contact", path: "/contact" }]} />

      <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink">Contact us</h1>
      <p className="mt-3 text-[15px] leading-relaxed text-neutral-700">
        We&rsquo;re a small team supporting the Ethiopian business community in the UK. Email us and we&rsquo;ll do our best to help.
      </p>

      <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5">
        <p className="text-sm font-semibold text-emerald-900">Email support</p>
        <p className="mt-1 text-lg font-bold text-ink">
          <ObfuscatedEmail user="support" domain="ethiopianbh.uk" className="text-emerald-700 underline" />
        </p>
        <p className="mt-2 text-sm text-emerald-800">
          We aim to respond within <span className="font-semibold">2&ndash;3 working days</span>. Urgent safety or abuse issues are prioritised.
        </p>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {CHANNELS.map((c) => (
          <div key={c.title} className="rounded-2xl border border-neutral-200/80 bg-ivory-card p-4">
            <p className="font-semibold text-ink">{c.title}</p>
            <p className="mt-1 text-sm text-neutral-600" dangerouslySetInnerHTML={{ __html: c.body }} />
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-neutral-200 bg-white p-5 text-sm text-neutral-600">
        <p className="font-semibold text-ink">Escalation path</p>
        <p className="mt-1">
          If your issue isn&rsquo;t resolved, reply to our email and ask to escalate — it will be reviewed by a senior team member.
          For data-protection complaints you may also contact the UK Information Commissioner&rsquo;s Office (ico.org.uk).
        </p>
      </div>

      <div className="mt-8 flex flex-wrap gap-3 border-t border-neutral-200 pt-6 text-sm">
        <Link href="/report" className="font-semibold text-emerald-700 hover:underline">Report a problem →</Link>
        <Link href="/help" className="font-semibold text-emerald-700 hover:underline">Help centre →</Link>
        <Link href="/safety" className="font-semibold text-emerald-700 hover:underline">Safety &amp; moderation →</Link>
      </div>
    </main>
  );
}
