import Link from "next/link";
import { requireAdminPage } from "@/lib/adminGuard";
import AdminBusinessCreateForm from "@/components/AdminBusinessCreateForm";

export const metadata = { title: "Admin — New business" };

export default async function AdminNewBusinessPage() {
  await requireAdminPage();
  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <nav className="text-sm text-neutral-400">
        <Link href="/admin" className="hover:text-emerald-700">Admin</Link> /{" "}
        <Link href="/admin/businesses" className="hover:text-emerald-700">Businesses</Link> / <span className="text-neutral-600">New</span>
      </nav>
      <h1 className="mt-2 text-2xl font-bold tracking-tight">Create a business</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Add a listing directly. Leave auto-approve off to create it as pending and preview it before publishing.
      </p>
      <div className="mt-8">
        <AdminBusinessCreateForm />
      </div>
    </main>
  );
}
