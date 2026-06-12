import Link from "next/link";
import { requireAdminPage } from "@/lib/adminGuard";
import { googlePlacesKey } from "@/lib/import/googlePlaces";
import ImportRunner from "@/components/ImportRunner";
import ImportJobsTable from "@/components/ImportJobsTable";

export const metadata = { title: "Import — Google Places" };

const PRESETS = [
  "Ethiopian restaurant London",
  "Ethiopian restaurant Birmingham",
  "Ethiopian restaurant Manchester",
  "Ethiopian restaurant Leicester",
  "Ethiopian restaurant Sheffield",
  "Ethiopian grocery London",
  "Ethiopian cafe London",
  "Ethiopian church London",
  "Habesha restaurant London",
  "Habesha market UK",
  "Injera London",
  "Addis restaurant UK",
  "Abyssinia restaurant UK",
];

export default async function GooglePlacesImportPage() {
  await requireAdminPage();
  const hasKey = !!googlePlacesKey();

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <nav className="mb-4 text-sm text-neutral-400">
        <Link href="/admin" className="hover:text-emerald-700">Admin</Link> / Import / Google Places
      </nav>
      <h1 className="text-2xl font-bold tracking-tight">Google Places Importer</h1>
      <p className="mt-1 max-w-2xl text-sm text-neutral-500">
        Imports real trading businesses from Google Places into the <strong>pending approval queue</strong>.
        Nothing is published until you approve it. Ratings come from Google or are not shown at all.
      </p>

      {!hasKey && (
        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
          <p className="font-bold">GOOGLE_PLACES_API_KEY is not configured</p>
          <ol className="mt-2 list-decimal space-y-1 pl-5">
            <li>Create a Google Cloud project with billing enabled</li>
            <li>Enable the <strong>Places API (New)</strong></li>
            <li>Create an API key and add <code className="rounded bg-amber-100 px-1">GOOGLE_PLACES_API_KEY=&quot;...&quot;</code> to <code className="rounded bg-amber-100 px-1">web/.env</code></li>
            <li>Restart the dev server</li>
          </ol>
          <p className="mt-2">Imports below will fail with a clear error until the key is set.</p>
        </div>
      )}

      <div className="mt-6">
        <ImportRunner type="google_places" presets={PRESETS} />
      </div>

      <h2 className="mt-10 text-lg font-bold tracking-tight">Recent jobs</h2>
      <div className="mt-3">
        <ImportJobsTable type="google_places" />
      </div>
    </main>
  );
}
