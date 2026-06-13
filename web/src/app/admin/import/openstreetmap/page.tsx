import Link from "next/link";
import { requireAdminPage } from "@/lib/adminGuard";
import { overpassUrl } from "@/lib/import/openStreetMap";
import ImportRunner from "@/components/ImportRunner";
import ImportJobsTable from "@/components/ImportJobsTable";

export const metadata = { title: "Import — OpenStreetMap" };

export default async function OpenStreetMapImportPage() {
  await requireAdminPage();

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <nav className="mb-4 text-sm text-neutral-400">
        <Link href="/admin" className="hover:text-emerald-700">Admin</Link> / Import / OpenStreetMap
      </nav>
      <h1 className="text-2xl font-bold tracking-tight">OpenStreetMap Importer</h1>
      <p className="mt-1 max-w-2xl text-sm text-neutral-500">
        Imports Ethiopian &amp; Eritrean businesses from OpenStreetMap via the Overpass API —
        free, no API key, no billing. Everything lands in the <strong>pending approval queue</strong>;
        nothing auto-publishes. OSM evidence adds +10 to a listing&apos;s trust score (it corroborates
        rather than primary-verifies). Records matching existing listings attach OSM evidence instead
        of duplicating.
      </p>

      <div className="mt-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-xs text-neutral-500">
        <p>Endpoint: <code className="rounded bg-neutral-200 px-1">{overpassUrl()}</code> (override with <code className="rounded bg-neutral-200 px-1">OVERPASS_API_URL</code>)</p>
        <p className="mt-1">Requests are throttled to one every 2 seconds. A run can take up to 2 minutes.</p>
        <p className="mt-1">Data © OpenStreetMap contributors, licensed under the ODbL. Source links are retained on every imported record.</p>
      </div>

      <div className="mt-6">
        <ImportRunner
          type="openstreetmap"
          singleRun
          singleRunLabel="Import Ethiopian & Eritrean businesses from OSM"
        />
      </div>

      <h2 className="mt-10 text-lg font-bold tracking-tight">Recent jobs</h2>
      <div className="mt-3">
        <ImportJobsTable type="openstreetmap" />
      </div>
    </main>
  );
}
