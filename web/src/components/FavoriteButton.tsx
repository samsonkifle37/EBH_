"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  businessId: string;
  kind: "favorite" | "follow";
  initial: boolean;
  signedIn: boolean;
}

export default function FavoriteButton({ businessId, kind, initial, signedIn }: Props) {
  const router = useRouter();
  const [active, setActive] = useState(initial);
  const [busy, setBusy] = useState(false);

  const labels =
    kind === "favorite"
      ? { on: "♥ Saved", off: "♡ Save" }
      : { on: "✓ Following", off: "+ Follow" };

  async function toggle() {
    if (!signedIn) {
      router.push(`/auth/signin?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    setBusy(true);
    const res = await fetch(`/api/businesses/${businessId}/${kind}`, { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      setActive(data.active);
    }
    setBusy(false);
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      className={`rounded-xl border px-4 py-2 text-sm font-semibold transition disabled:opacity-50 ${
        active
          ? "border-emerald-600 bg-emerald-50 text-emerald-700"
          : "border-neutral-300 bg-white text-neutral-700 hover:border-emerald-600 hover:text-emerald-700"
      }`}
    >
      {active ? labels.on : labels.off}
    </button>
  );
}
