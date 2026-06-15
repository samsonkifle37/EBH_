"use client";

import { useState } from "react";
import { track } from "@/lib/analytics/client";
import { shareParams } from "@/lib/analytics/attribution";

export default function ShareButton({ businessId, title, slug }: { businessId: string; title: string; slug?: string }) {
  const [done, setDone] = useState(false);

  async function share() {
    const base = typeof window !== "undefined" ? window.location.href.split("?")[0] : "";
    // legacy feed
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "SHARE_CLICK", businessId }),
    }).catch(() => {});

    try {
      if (navigator.share) {
        const url = slug ? `${base}?${shareParams(slug, "web_share")}` : base;
        await navigator.share({ title, url });
        // a completed device share is a real distribution
        track("SHARE_COPY_LINK", { businessId, channel: "web_share" });
      } else {
        const url = slug ? `${base}?${shareParams(slug, "copy_link")}` : base;
        await navigator.clipboard.writeText(url);
        track("SHARE_COPY_LINK", { businessId, channel: "copy_link" });
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
