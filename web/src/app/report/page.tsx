import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { socialMeta } from "@/lib/seo";
import Breadcrumbs from "@/components/Breadcrumbs";
import ReportForm from "@/components/ReportForm";

const TITLE = "Report a problem — Ethiopian Business Hub UK";
const DESC = "Report incorrect information, duplicates, fake reviews, impersonation, fraud or safety concerns. Anonymous reporting supported.";

export const metadata: Metadata = {
  title: "Report a problem",
  description: DESC,
  ...socialMeta({ title: TITLE, description: DESC, path: "/report" }),
};

export default async function ReportPage({ searchParams }: { searchParams: Promise<{ business?: string }> }) {
  const { business: slug } = await searchParams;
  const session = await getSession();

  let businessId: string | undefined;
  let businessName: string | undefined;
  if (slug) {
    const b = await db.business.findUnique({ where: { slug }, select: { id: true, name: true } });
    if (b) {
      businessId = b.id;
      businessName = b.name;
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Report a problem", path: "/report" }]} />

      <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink">Report a problem</h1>
      <p className="mt-3 text-[15px] leading-relaxed text-neutral-700">
        Help us keep EBH trustworthy. Tell us about incorrect information, duplicate listings, fake reviews, inappropriate
        content, impersonation, fraud or a safety concern. See how we handle reports on our{" "}
        <Link href="/safety" className="text-emerald-700 underline">Safety page</Link>.
      </p>

      <div className="mt-6">
        <ReportForm businessId={businessId} businessName={businessName} signedIn={!!session} />
      </div>
    </main>
  );
}
