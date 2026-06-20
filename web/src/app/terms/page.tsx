import type { Metadata } from "next";
import Link from "next/link";
import { SUPPORT_EMAIL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms governing your use of Ethiopian Business Hub UK.",
  alternates: { canonical: "/terms" },
};
const UPDATED = "16 June 2026";

function H({ children }: { children: React.ReactNode }) {
  return <h2 className="mt-8 text-lg font-bold tracking-tight text-ink">{children}</h2>;
}

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight text-ink">Terms of Service</h1>
      <p className="mt-2 text-sm text-neutral-500">Last updated {UPDATED}</p>

      <div className="mt-6 space-y-3 text-[15px] leading-relaxed text-neutral-700">
        <p>
          These terms govern your use of Ethiopian Business Hub UK (&ldquo;EBH&rdquo;). By creating an account or using the
          service you agree to them. If you do not agree, please do not use the service.
        </p>

        <H>Using EBH</H>
        <p>
          EBH is a directory to discover and support Ethiopian-owned businesses in the UK. You must be at least 16 to create an
          account. You are responsible for activity under your account and for keeping your password secure.
        </p>

        <H>Reviews &amp; content</H>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Reviews must reflect genuine experiences and must not be false, defamatory, abusive or paid-for.</li>
          <li>You retain ownership of content you post but grant EBH a licence to display it within the service.</li>
          <li>We may moderate or remove content that breaches these terms or applicable law.</li>
        </ul>

        <H>Business listings &amp; claims</H>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Listings may be compiled from public sources (e.g. Companies House, Google, OpenStreetMap) and from owner submissions.</li>
          <li>If you claim a listing, you confirm you are authorised to represent that business and that the information you provide is accurate.</li>
          <li>Trust scores and verification badges are indicative signals based on available evidence, not a guarantee.</li>
        </ul>

        <H>Acceptable use</H>
        <p>You agree not to misuse the service, including scraping at scale, attempting to gain unauthorised access, submitting fraudulent listings or reviews, or infringing others&rsquo; rights.</p>

        <H>Your account</H>
        <p>
          You may delete your account at any time from{" "}
          <Link href="/account" className="text-emerald-700 underline">your account page</Link>. See our{" "}
          <Link href="/privacy" className="text-emerald-700 underline">Privacy Policy</Link> for what is removed and retained.
        </p>

        <H>Disclaimers &amp; liability</H>
        <p>
          EBH is provided &ldquo;as is&rdquo;. We do not warrant that listings are complete or error-free, and we are not party to any
          dealings between you and a business. To the extent permitted by law, EBH is not liable for indirect or consequential loss.
        </p>

        <H>Changes &amp; governing law</H>
        <p>
          We may update these terms; material changes will be reflected by the &ldquo;last updated&rdquo; date. These terms are
          governed by the laws of England and Wales. Questions:{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="text-emerald-700 underline">{SUPPORT_EMAIL}</a>.
        </p>
      </div>
    </main>
  );
}
