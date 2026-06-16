import type { Metadata } from "next";
import Link from "next/link";
import { faqJsonLd, socialMeta } from "@/lib/seo";
import Breadcrumbs from "@/components/Breadcrumbs";
import HelpCenter, { type HelpArticle } from "@/components/HelpCenter";

const TITLE = "Help Centre — Ethiopian Business Hub UK";
const DESC = "Answers on finding businesses, claiming listings, Trust Scores, reviews, share kits, your account, privacy and reporting content.";

export const metadata: Metadata = {
  title: "Help Centre",
  description: DESC,
  ...socialMeta({ title: TITLE, description: DESC, path: "/help" }),
};

const ARTICLES: HelpArticle[] = [
  { id: "find", topic: "Discovery", q: "How do I find a business?", a: "Use the search bar or browse by city and category. Filter by rating, open-now and verified-only, and sort by trust, rating or featured." },
  { id: "claim", topic: "Owners", q: "How do I claim my listing?", a: "Open your business profile and tap &ldquo;Claim this listing&rdquo;. Tell us your founder story and confirm you&rsquo;re authorised to represent the business. An admin reviews claims before ownership is granted." },
  { id: "trust", topic: "Trust", q: "What is the Trust Score?", a: "An evidence-based score from 0&ndash;100 reflecting verifiable signals such as a claimed owner, company records, Google presence, complete contact details, photos and genuine reviews. It&rsquo;s an indicator, not a guarantee." },
  { id: "reviews", topic: "Reviews", q: "How do reviews work?", a: "Signed-in users can leave one review per business. Reviews must reflect genuine experiences. Owners can respond, and our team removes fake or abusive reviews." },
  { id: "sharekit", topic: "Owners", q: "What is the share kit?", a: "Claimed businesses get an auto-generated profile card, Instagram story and printable QR poster — &ldquo;Proud member of Ethiopian Business Hub UK&rdquo; — to share on WhatsApp, Instagram and in your window." },
  { id: "account", topic: "Account", q: "How do I manage my account?", a: "Visit your <a href='/account' class='text-emerald-700 underline'>account page</a> to see saved businesses, follows and reviews, and to manage settings." },
  { id: "delete", topic: "Account", q: "How do I delete my account?", a: "Go to <a href='/account' class='text-emerald-700 underline'>Account &rarr; Settings &rarr; Delete account</a>, type your email to confirm, and your account and personal data are removed. No email request needed." },
  { id: "privacy", topic: "Privacy", q: "What data do you collect?", a: "Account details, content you create, and privacy-respecting first-party analytics (no third-party trackers). See our <a href='/privacy' class='text-emerald-700 underline'>Privacy Policy</a>." },
  { id: "report", topic: "Safety", q: "How do I report content?", a: "Use <a href='/report' class='text-emerald-700 underline'>Report a problem</a> or the &ldquo;Report this listing&rdquo; link on any profile. You can report anonymously; signing in helps us follow up." },
];

export default function HelpPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(ARTICLES.map((a) => ({ q: a.q, a: a.a.replace(/<[^>]+>/g, "") })))) }} />
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Help Centre", path: "/help" }]} />

      <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink">Help Centre</h1>
      <p className="mt-3 text-[15px] leading-relaxed text-neutral-700">
        Search common questions, or <Link href="/contact" className="text-emerald-700 underline">contact support</Link> if you can&rsquo;t find an answer.
      </p>

      <div className="mt-6">
        <HelpCenter articles={ARTICLES} />
      </div>
    </main>
  );
}
