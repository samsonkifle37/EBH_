"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UpgradeButtons({ businessId, currentPlan }: { businessId: string; currentPlan: string }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function upgrade(product: "VERIFIED" | "FEATURED") {
    setBusy(true);
    setMessage(null);
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product, businessId }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.url) {
      window.location.href = data.url; // off to Stripe Checkout
      return;
    }
    setMessage(res.ok ? data.message : data.error ?? "Something went wrong");
    setBusy(false);
    router.refresh();
  }

  const btn = "rounded-lg px-3 py-1.5 text-xs font-semibold transition disabled:opacity-50";

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {currentPlan !== "VERIFIED" && (
          <button disabled={busy} onClick={() => upgrade("VERIFIED")} className={`${btn} bg-emerald-700 text-white hover:bg-emerald-800`}>
            Verify £2.99/mo
          </button>
        )}
        {currentPlan !== "FEATURED" && (
          <button disabled={busy} onClick={() => upgrade("FEATURED")} className={`${btn} bg-amber-500 text-white hover:bg-amber-600`}>
            Feature £4.99/mo
          </button>
        )}
      </div>
      {message && <p className="mt-2 rounded-lg bg-neutral-50 px-3 py-2 text-xs text-neutral-600">{message}</p>}
    </div>
  );
}
