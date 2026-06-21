import Link from "next/link";
import { redirect } from "next/navigation";
import { del } from "@vercel/blob";
import { db } from "@/lib/db";
import { requireAdminPage } from "@/lib/adminGuard";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin — Enkutatash Photos" };

export default async function EnkutatashPhotosAdminPage() {
  await requireAdminPage();

  const pending = await db.enkutatashPhoto.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
  });
  const approved = await db.enkutatashPhoto.findMany({
    where: { status: "APPROVED" },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <nav className="text-sm text-neutral-400">
        <Link href="/admin" className="hover:text-emerald-700">Admin</Link> /{" "}
        <span className="text-neutral-600">Enkutatash Photos</span>
      </nav>
      <h1 className="mt-3 text-2xl font-bold tracking-tight">🌸 Enkutatash Photo Wall</h1>

      {/* Pending */}
      <section className="mt-8">
        <h2 className="text-sm font-bold uppercase tracking-wide text-amber-700">
          Pending Review ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <p className="mt-3 text-sm text-neutral-400">No photos awaiting review.</p>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pending.map((photo) => (
              <div key={photo.id} className="overflow-hidden rounded-2xl border border-amber-200 bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.imageUrl} alt={photo.caption || "Submission"} className="aspect-square w-full object-cover" />
                <div className="p-4">
                  <p className="text-sm font-semibold text-neutral-800">{photo.submitterName}</p>
                  {photo.city && <p className="text-xs text-neutral-500">📍 {photo.city}</p>}
                  {photo.caption && <p className="mt-1 text-xs text-neutral-600 italic">&ldquo;{photo.caption}&rdquo;</p>}
                  <p className="mt-1 text-[10px] text-neutral-400">{new Date(photo.createdAt).toLocaleDateString("en-GB")}</p>

                  <div className="mt-3 flex gap-2">
                    <form action={async () => {
                      "use server";
                      await requireAdminPage();
                      await db.enkutatashPhoto.update({ where: { id: photo.id }, data: { status: "APPROVED" } });
                      redirect("/admin/enkutatash-photos");
                    }}>
                      <button type="submit" className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700">
                        ✓ Approve
                      </button>
                    </form>
                    <form action={async () => {
                      "use server";
                      await requireAdminPage();
                      const rec = await db.enkutatashPhoto.findUnique({ where: { id: photo.id }, select: { imageUrl: true } });
                      await db.enkutatashPhoto.update({ where: { id: photo.id }, data: { status: "REJECTED" } });
                      // Delete from Vercel Blob so rejected content doesn't linger
                      if (rec?.imageUrl) await del(rec.imageUrl).catch(() => {});
                      redirect("/admin/enkutatash-photos");
                    }}>
                      <button type="submit" className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-100">
                        ✕ Reject
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Approved */}
      <section className="mt-12">
        <h2 className="text-sm font-bold uppercase tracking-wide text-emerald-700">
          Live on Wall ({approved.length} shown)
        </h2>
        {approved.length === 0 ? (
          <p className="mt-3 text-sm text-neutral-400">No approved photos yet.</p>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {approved.map((photo) => (
              <div key={photo.id} className="group relative overflow-hidden rounded-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.imageUrl} alt={photo.caption || "Approved"} className="aspect-square w-full object-cover" />
                <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 transition group-hover:opacity-100">
                  <p className="text-xs font-semibold text-white">{photo.submitterName}</p>
                  {photo.city && <p className="text-[10px] text-white/70">{photo.city}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
