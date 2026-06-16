import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Ethiopian Business Hub UK collects, uses and protects your data, and how to delete your account.",
  alternates: { canonical: "/privacy" },
};

const SUPPORT_EMAIL = "support@ethiopianbh.uk";
const UPDATED = "16 June 2026";

function H({ children }: { children: React.ReactNode }) {
  return <h2 className="mt-8 text-lg font-bold tracking-tight text-ink">{children}</h2>;
}

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight text-ink">Privacy Policy</h1>
      <p className="mt-2 text-sm text-neutral-500">Last updated {UPDATED}</p>

      <div className="mt-6 space-y-3 text-[15px] leading-relaxed text-neutral-700">
        <p>
          Ethiopian Business Hub UK (&ldquo;EBH&rdquo;, &ldquo;we&rdquo;) is the data controller for personal data processed
          through <Link href="/" className="text-emerald-700 underline">ethiopianbh.uk</Link> and our mobile apps. This
          policy explains what we collect, why, how long we keep it, and your rights under UK GDPR and the Data Protection Act 2018.
        </p>

        <H>Data we collect</H>
        <ul className="list-disc space-y-1.5 pl-5">
          <li><span className="font-semibold">Account data:</span> your name, email address, and a securely hashed password.</li>
          <li><span className="font-semibold">Content you create:</span> reviews, ratings, saved/followed businesses, and listing claims.</li>
          <li><span className="font-semibold">Business owner data:</span> if you claim a listing, the founder name and founder story you provide, and any business details, photos and contact information you add. This information is shown publicly on your business profile.</li>
          <li><span className="font-semibold">Usage analytics:</span> see &ldquo;Analytics &amp; cookies&rdquo; below.</li>
        </ul>

        <H>Analytics &amp; cookies</H>
        <p>
          We run our own first-party analytics (&ldquo;PrideEvent&rdquo;) to understand how listings are discovered and shared.
          We do <span className="font-semibold">not</span> use third-party advertising or tracking services, and we do not sell your data.
        </p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li><span className="font-mono text-sm">ebh_session</span> — an essential, signed cookie that keeps you logged in.</li>
          <li><span className="font-mono text-sm">ebh_vid</span> — an anonymous, randomly-generated visitor ID (no name or email) used to measure unique views and shares. Stored up to 12 months.</li>
          <li><span className="font-mono text-sm">ebh_attr</span> — records that you arrived from a shared link (channel and business), so we can credit shares. Stored up to 30 days.</li>
        </ul>
        <p>
          PrideEvent records anonymous events such as profile views, contact clicks and shares, along with non-identifying
          context (city, category, a business&rsquo;s trust and completion scores). These events are tied to the anonymous
          visitor ID, never to your name or email.
        </p>

        <H>Why we process your data (lawful bases)</H>
        <ul className="list-disc space-y-1.5 pl-5">
          <li><span className="font-semibold">Contract:</span> to provide your account, listings and reviews.</li>
          <li><span className="font-semibold">Legitimate interests:</span> to keep the directory trustworthy and to measure and improve the service with privacy-respecting analytics.</li>
          <li><span className="font-semibold">Legal obligation:</span> to retain transaction records where required.</li>
        </ul>

        <H>Retention</H>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Account and content: kept until you delete your account.</li>
          <li>Anonymous analytics: aggregated/anonymous and retained for trend analysis; not linked to you.</li>
          <li>Payment/transaction records (if any): retained for up to 7 years to meet UK accounting and tax obligations.</li>
        </ul>

        <H>Deleting your account</H>
        <p>
          You can permanently delete your account at any time from{" "}
          <Link href="/account" className="text-emerald-700 underline">your account page</Link> &rarr; Delete account — no email request needed.
          Deletion removes your profile, reviews, saved businesses, follows and pending claims, and disassociates you from any
          analytics. Business listings themselves are public directory records (often sourced from public registers such as
          Companies House, Google or OpenStreetMap) and are retained, but any founder name/story you personally added is removed
          and the listing is returned to an unclaimed state. Transaction records may be retained where legally required.
        </p>

        <H>Your rights</H>
        <p>
          You have the right to access, correct, delete, restrict or object to processing of your data, and to data portability.
          To exercise any right, use the in-app controls or contact us at{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="text-emerald-700 underline">{SUPPORT_EMAIL}</a>. You may also complain to the UK Information Commissioner&rsquo;s Office (ico.org.uk).
        </p>

        <H>Contact</H>
        <p>
          Questions about this policy or your data: <a href={`mailto:${SUPPORT_EMAIL}`} className="text-emerald-700 underline">{SUPPORT_EMAIL}</a>.
          See also our <Link href="/terms" className="text-emerald-700 underline">Terms of Service</Link>.
        </p>
      </div>
    </main>
  );
}
