import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdminPage } from "@/lib/adminGuard";
import AdminAction from "@/components/AdminAction";
import AdForm from "@/components/AdForm";

export const metadata = { title: "Admin — Advertising" };

export default async function AdminAdsPage() {
  await requireAdminPage();

  const ads = await db.ad.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <nav className="text-sm text-neutral-400">
        <Link href="/admin" className="hover:text-emerald-700">Admin</Link> / <span className="text-neutral-600">Advertising</span>
      </nav>
      <h1 className="mt-2 text-2xl font-bold tracking-tight">Banner campaigns</h1>
      <p className="mt-1 text-sm text-neutral-500">One active ad per placement is shown (newest first). £50–£100/month per slot.</p>

      <div className="mt-6">
        <AdForm />
      </div>

      <ul className="mt-8 space-y-3">
        {ads.map((ad) => (
          <li key={ad.id} className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-white p-4 ${ad.active ? "border-neutral-200" : "border-neutral-200 opacity-60"}`}>
            <div className="flex min-w-0 items-center gap-3">
              {ad.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={ad.imageUrl} alt={ad.headline} className="h-12 w-20 rounded-lg object-cover" />
              )}
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-neutral-900">{ad.headline}</p>
                  <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-semibold text-neutral-500">{ad.placement}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${ad.active ? "bg-emerald-50 text-emerald-700" : "bg-neutral-100 text-neutral-500"}`}>
                    {ad.active ? "ACTIVE" : "PAUSED"}
                  </span>
                </div>
                <p className="mt-0.5 truncate text-xs text-neutral-400">→ {ad.targetUrl}</p>
              </div>
            </div>
            <div className="flex gap-1.5">
              <AdminAction url="/api/admin/ads" body={{ action: "toggle", id: ad.id }} label={ad.active ? "Pause" : "Activate"} />
              <AdminAction url="/api/admin/ads" body={{ action: "delete", id: ad.id }} label="Delete" variant="danger" />
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
