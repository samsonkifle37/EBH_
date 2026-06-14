import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdminPage } from "@/lib/adminGuard";
import { gbp } from "@/lib/revenue";

export const metadata = { title: "Admin — Payments" };

export default async function PaymentsPage() {
  await requireAdminPage();
  const payments = await db.payment.findMany({ orderBy: { createdAt: "desc" }, take: 200 });

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <nav className="text-sm text-neutral-400">
        <Link href="/admin" className="hover:text-emerald-700">Admin</Link> / <span className="text-neutral-600">Payments</span>
      </nav>
      <h1 className="mt-2 text-2xl font-bold tracking-tight">Payments</h1>
      <p className="mt-1 text-sm text-neutral-500">Every payment across subscriptions, claims, ads and promotions.</p>

      {payments.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-neutral-300 bg-white p-8 text-center">
          <p className="text-sm font-semibold text-neutral-700">No payments yet.</p>
          <p className="mt-1 text-sm text-neutral-500">Payments will appear here once Stripe billing (Milestone B) is enabled.</p>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-neutral-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-neutral-100 text-xs uppercase tracking-wide text-neutral-400">
              <tr>
                <th className="px-4 py-3">Kind</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">When</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-b border-neutral-50 last:border-0">
                  <td className="px-4 py-3 font-medium text-neutral-800">{p.kind}</td>
                  <td className="px-4 py-3 text-neutral-500">{p.planType || "—"}</td>
                  <td className="px-4 py-3">{gbp(p.amount)}</td>
                  <td className="px-4 py-3">{p.paymentStatus}</td>
                  <td className="px-4 py-3 text-neutral-400">{p.createdAt.toLocaleDateString("en-GB")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
