import type { Metadata } from "next";
import Link from "next/link";
import { socialMeta } from "@/lib/seo";
import { trackServerView } from "@/lib/analytics/serverTrack";
import Breadcrumbs from "@/components/Breadcrumbs";

const TITLE = "Safety & Moderation — Ethiopian Business Hub UK";
const DESC = "How EBH moderates listings and reviews, verifies businesses, handles reports and protects your privacy — with clear response times.";

export const metadata: Metadata = {
  title: "Safety & Moderation",
  description: DESC,
  ...socialMeta({ title: TITLE, description: DESC, path: "/safety" }),
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-bold tracking-tight text-ink">{title}</h2>
      <div className="mt-2 space-y-3 text-[15px] leading-relaxed text-neutral-700">{children}</div>
    </section>
  );
}

export default async function SafetyPage() {
  await trackServerView("SAFETY_VIEW");

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Safety", path: "/safety" }]} />

      <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink">Safety &amp; moderation</h1>
      <p className="mt-3 text-[15px] leading-relaxed text-neutral-700">
        Safety is a product feature at EBH. Here&rsquo;s how we keep the directory trustworthy and what to expect when you raise an issue.
      </p>

      <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <span className="font-semibold">Disclaimer:</span> EBH is a discovery platform and does not directly provide listed services.
        We help you find and assess businesses; any transaction or service is between you and the business.
      </div>

      <Section title="Moderation workflow">
        <p>Reports go into a moderation queue and are triaged by our team. We review the listing or content, take action (correct, hide, remove or unclaim), and record the outcome. Repeat or severe violations can remove a listing or account.</p>
      </Section>

      <Section title="Review guidelines">
        <p>Reviews must be genuine, first-hand and respectful. We remove fake, incentivised, defamatory or abusive reviews. Owners may respond publicly but cannot remove honest criticism.</p>
      </Section>

      <Section title="Verification process">
        <p>Listings are cross-checked against public sources (Companies House, Google, OpenStreetMap) and strengthened when an owner claims and completes their profile. Claims are reviewed by an admin before ownership and verified badges are granted.</p>
      </Section>

      <Section title="Reporting process">
        <p>Anyone can <Link href="/report" className="text-emerald-700 underline">report a problem</Link> — anonymously or signed in. Every business profile has a &ldquo;Report this listing&rdquo; link. Reports are rate-limited to prevent abuse.</p>
      </Section>

      <Section title="Escalation">
        <p>Urgent safety, impersonation or fraud reports are prioritised. If you disagree with an outcome, reply to our response to <Link href="/contact" className="text-emerald-700 underline">escalate</Link> to a senior reviewer.</p>
      </Section>

      <Section title="Privacy handling">
        <p>We handle personal data under UK GDPR and never sell it. Reporter details (if provided) are used only to follow up. See our <Link href="/privacy" className="text-emerald-700 underline">Privacy Policy</Link>.</p>
      </Section>

      <Section title="Response times (targets)">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Safety / impersonation / fraud: reviewed within <span className="font-semibold">1 working day</span>.</li>
          <li>Incorrect info, duplicates, fake reviews: within <span className="font-semibold">2&ndash;3 working days</span>.</li>
          <li>General enquiries: within <span className="font-semibold">2&ndash;3 working days</span>.</li>
        </ul>
      </Section>

      <Section title="Transparency">
        <p>We aim to act consistently and explain our decisions when asked. Our verification signals and Trust Score methodology are described on the <Link href="/about" className="text-emerald-700 underline">About page</Link>.</p>
      </Section>
    </main>
  );
}
