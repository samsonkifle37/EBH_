"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // surface to server logs / monitoring without exposing details to the user
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-2xl">⚠️</div>
      <h1 className="mt-6 text-2xl font-bold tracking-tight text-ink">Something went wrong</h1>
      <p className="mt-2 text-neutral-600">
        That&rsquo;s on us, not you. Please try again — if it keeps happening, check your connection or come back shortly.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={reset}
          className="inline-flex min-h-11 items-center rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800"
        >
          Try again
        </button>
        <Link href="/" className="inline-flex min-h-11 items-center rounded-xl border border-neutral-300 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-700 hover:border-emerald-600 hover:text-emerald-700">
          Back to home
        </Link>
      </div>
    </main>
  );
}
