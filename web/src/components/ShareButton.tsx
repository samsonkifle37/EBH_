"use client";

import { useState } from "react";

export default function ShareButton({ businessId, title }: { businessId: string; title: string }) {
  const [done, setDone] = useState(false);

  async function share() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "SHARE_CLICK", businessId }),
    }).catch(() => {});
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
      } else {
        await navigator.clipboard.writeText(url);
        setDone(true);
        setTimeout(() => setDone(false), 2000);
      }
    } catch {
      /* user cancelled share */
    }
  }

  return (
    <button
      onClick={share}
      className="rounded-xl border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-700 hover:border-emerald-600 hover:text-emerald-700"
    >
      {done ? "Link copied ✓" : "↗ Share"}
    </button>
  );
}
