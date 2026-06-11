"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  url: string;
  body: Record<string, unknown>;
  label: string;
  variant?: "primary" | "danger" | "neutral";
}

const STYLES = {
  primary: "bg-emerald-700 text-white hover:bg-emerald-800",
  danger: "bg-red-600 text-white hover:bg-red-700",
  neutral: "border border-neutral-300 text-neutral-600 hover:border-emerald-600 hover:text-emerald-700",
};

export default function AdminAction({ url, body, label, variant = "neutral" }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  return (
    <button
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        router.refresh();
        setBusy(false);
      }}
      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition disabled:opacity-50 ${STYLES[variant]}`}
    >
      {busy ? "…" : label}
    </button>
  );
}
