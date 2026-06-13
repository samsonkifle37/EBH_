import Link from "next/link";
import { requireAdminPage } from "@/lib/adminGuard";
import LeadCaptureForm from "@/components/LeadCaptureForm";

export const metadata = { title: "Manual Lead Capture" };

export default async function LeadsPage() {
  await requireAdminPage();

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <nav className="mb-4 text-sm text-neutral-400">
        <Link href="/admin" className="hover:text-emerald-700">Admin</Link> / Import / Manual Leads
      </nav>
      <h1 className="text-2xl font-bold tracking-tight">Manual Lead Capture</h1>
      <p className="mt-1 max-w-2xl text-sm text-neutral-500">
        Quickly add businesses discovered through outreach, social media, events, flyers and
        referrals. Each lead is created as <strong>pending</strong> with full source attribution and a
        starting trust score of +5 (manually sourced). Trust grows when the lead is later matched to
        Google Places, Companies House, OpenStreetMap, or claimed by its owner.
      </p>

      <div className="mt-8">
        <LeadCaptureForm />
      </div>
    </main>
  );
}
