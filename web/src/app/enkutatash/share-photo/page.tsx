import Link from "next/link";
import type { Metadata } from "next";
import EnkutatashPhotoForm from "@/components/EnkutatashPhotoForm";

export const metadata: Metadata = {
  title: "Share your Enkutatash moment | EBH UK",
  description: "Add your photo to the Enkutatash 2026 community photo wall.",
  robots: { index: false },
};

export default function SharePhotoPage() {
  return (
    <main className="mx-auto max-w-lg px-4 py-10">
      <nav className="text-sm text-neutral-400">
        <Link href="/" className="hover:text-emerald-700">Home</Link>
        {" / "}
        <Link href="/enkutatash" className="hover:text-emerald-700">Enkutatash 2026</Link>
        {" / "}
        <span className="text-neutral-600">Share a photo</span>
      </nav>

      <div className="mt-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Share your Enkutatash moment</h1>
        <p className="mt-2 text-neutral-500">
          Upload a photo celebrating Ethiopian New Year — family, food, flowers, or festivities.
          It will appear on the community wall once reviewed.
        </p>
      </div>

      <div className="mt-8 rounded-2xl border border-neutral-200 bg-white p-6">
        <EnkutatashPhotoForm />
      </div>
    </main>
  );
}
