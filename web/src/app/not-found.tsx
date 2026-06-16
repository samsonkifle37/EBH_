import Link from "next/link";
import BrandMark from "@/components/BrandMark";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 py-16 text-center">
      <BrandMark className="h-14 w-14" />
      <h1 className="mt-6 text-2xl font-bold tracking-tight text-ink">We couldn&rsquo;t find that page</h1>
      <p className="mt-2 text-neutral-600">
        The link may be broken or the listing may have moved. Let&rsquo;s get you back to discovering great Ethiopian businesses.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link href="/" className="inline-flex min-h-11 items-center rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800">
          Back to home
        </Link>
        <Link href="/businesses" className="inline-flex min-h-11 items-center rounded-xl border border-neutral-300 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-700 hover:border-emerald-600 hover:text-emerald-700">
          Browse the directory
        </Link>
      </div>
    </main>
  );
}
