import Link from "next/link";
import { requireAdminPage } from "@/lib/adminGuard";
import { companiesHouseKey } from "@/lib/import/companiesHouse";
import ImportRunner from "@/components/ImportRunner";
import ImportJobsTable from "@/components/ImportJobsTable";

export const metadata = { title: "Import — Companies House" };

const PRESETS = [
  "Ethiopian",
  "Habesha",
  "Abyssinia",
  "Addis",
  "Injera",
  "Eritrean",
  "East African",
  "Sheba",
  "Lalibela",
  "Axum",
];

export default async function CompaniesHouseImportPage() {
  await requireAdminPage();
  const hasKey = !!companiesHouseKey();

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <nav className="mb-4 text-sm text-neutral-400">
        <Link href="/admin" className="hover:text-emerald-700">Admin</Link> / Import / Companies House
      </nav>
      <h1 className="text-2xl font-bold tracking-tight">Companies House Importer</h1>
      <p className="mt-1 max-w-2xl text-sm text-neutral-500">
        Searches official UK company records. Matches corroborate existing listings (+15 trust);
        unmatched companies import as <strong>pending</strong> and never auto-publish — approve manually
        only if they are a real trading business.
      </p>

      {!hasKey && (
        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
          <p className="font-bold">COMPANIES_HOUSE_API_KEY is not configured</p>
          <ol className="mt-2 list-decimal space-y-1 pl-5">
            <li>Register (free) at <strong>developer.company-information.service.gov.uk</strong></li>
            <li>Create an application → REST API key</li>
            <li>Add <code className="rounded bg-amber-100 px-1">COMPANIES_HOUSE_API_KEY=&quot;...&quot;</code> to <code className="rounded bg-amber-100 px-1">web/.env</code></li>
            <li>Restart the dev server</li>
          </ol>
        </div>
      )}

      <div className="mt-6">
        <ImportRunner type="companies_house" presets={PRESETS} />
      </div>

      <h2 className="mt-10 text-lg font-bold tracking-tight">Recent jobs</h2>
      <div className="mt-3">
        <ImportJobsTable type="companies_house" />
      </div>
    </main>
  );
}
