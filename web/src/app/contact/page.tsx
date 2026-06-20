import type { Metadata } from "next";
import Link from "next/link";
import { contactPointJsonLd, socialMeta } from "@/lib/seo";
import Breadcrumbs from "@/components/Breadcrumbs";
import ContactSupport from "@/components/ContactSupport";

const TITLE = "Contact Ethiopian Business Hub UK";
const DESC = "Get support: business owners, listing corrections, verification, privacy requests, technical help and abuse reports.";

export const metadata: Metadata = {
  title: "Contact",
  description: DESC,
  ...socialMeta({ title: TITLE, description: DESC, path: "/contact" }),
};

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(contactPointJsonLd()) }} />
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Contact", path: "/contact" }]} />

      <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink">Contact us</h1>
      <p className="mt-3 text-[15px] leading-relaxed text-neutral-700">
        We&rsquo;re a small team supporting the Ethiopian business community in the UK. Pick the option that fits and we&rsquo;ll do our best to help.
      </p>

      <ContactSupport />

      <div className="mt-8 flex flex-wrap gap-3 border-t border-neutral-200 pt-6 text-sm">
        <Link href="/report" className="font-semibold text-emerald-700 hover:underline">Report a problem →</Link>
        <Link href="/help" className="font-semibold text-emerald-700 hover:underline">Help centre →</Link>
        <Link href="/safety" className="font-semibold text-emerald-700 hover:underline">Safety &amp; moderation →</Link>
      </div>
    </main>
  );
}
