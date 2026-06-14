"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ClaimActivateButton({ claimId }: { claimId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function activate() {
    setBusy(true);
    setMessage(null);
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product: "CLAIM", claimId }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.url) {
      window.location.href = data.url;
      return;
    }
    setMessage(res.ok ? data.message : data.error ?? "Something went wrong");
    setBusy(false);
    router.refresh();
  }

  return (
    <div>
      <button onClick={activate} disabled={busy} className="rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50">
        {busy ? "Starting…" : "Activate ownership — £9.99"}
      </button>
      {message && <p className="mt-2 text-sm text-neutral-600">{message}</p>}
    </div>
  );
}
