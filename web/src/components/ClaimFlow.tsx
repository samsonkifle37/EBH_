"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ClaimFlow({ businessId, businessName }: { businessId: string; businessName: string }) {
  const router = useRouter();
  const [step, setStep] = useState<"method" | "code" | "done">("method");
  const [requestId, setRequestId] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function start(method: "EMAIL" | "PHONE") {
    setBusy(true);
    setError(null);
    const res = await fetch("/api/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "start", businessId, method }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setRequestId(data.requestId);
      setDevCode(data.devCode ?? null);
      setStep("code");
    } else {
      setError(data.error ?? "Something went wrong");
    }
    setBusy(false);
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "verify", requestId, code }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setStep("done");
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 1500);
    } else {
      setError(data.error ?? "Something went wrong");
    }
    setBusy(false);
  }

  if (step === "done") {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <p className="text-3xl">🎉</p>
        <p className="mt-2 font-semibold text-emerald-800">You now manage {businessName}!</p>
        <p className="mt-1 text-sm text-emerald-700">Taking you to your dashboard…</p>
      </div>
    );
  }

  if (step === "code") {
    return (
      <form onSubmit={verify} className="space-y-4">
        <p className="text-sm text-neutral-600">
          Enter the 6-digit verification code{devCode ? "" : " we sent to the business's registered contact"}.
        </p>
        {devCode && (
          <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <span className="font-semibold">Dev mode:</span> no email/SMS provider configured, so here&apos;s your code: <span className="font-mono text-base font-bold">{devCode}</span>
          </p>
        )}
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          inputMode="numeric"
          placeholder="123456"
          className="w-40 rounded-xl border border-neutral-300 px-3 py-2.5 text-center font-mono text-lg tracking-widest outline-none focus:border-emerald-600"
        />
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <div>
          <button disabled={busy || code.length !== 6} className="rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50">
            {busy ? "Verifying…" : "Verify and claim"}
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="space-y-3">
      <button
        onClick={() => start("EMAIL")}
        disabled={busy}
        className="flex w-full items-center justify-between rounded-2xl border border-neutral-200 bg-white p-5 text-left transition hover:border-emerald-600 disabled:opacity-50"
      >
        <span>
          <span className="font-semibold text-neutral-900">📧 Verify by email</span>
          <span className="mt-0.5 block text-sm text-neutral-500">We send a code to the business&apos;s registered email address.</span>
        </span>
        <span className="text-emerald-700">→</span>
      </button>
      <button
        onClick={() => start("PHONE")}
        disabled={busy}
        className="flex w-full items-center justify-between rounded-2xl border border-neutral-200 bg-white p-5 text-left transition hover:border-emerald-600 disabled:opacity-50"
      >
        <span>
          <span className="font-semibold text-neutral-900">📱 Verify by phone</span>
          <span className="mt-0.5 block text-sm text-neutral-500">We text a code to the business&apos;s listed phone number. Unlocks Level 2 verification.</span>
        </span>
        <span className="text-emerald-700">→</span>
      </button>
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
    </div>
  );
}
