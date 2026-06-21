"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { safeNextPath } from "@/lib/safeNext";

export default function AuthForm({ mode }: { mode: "signin" | "signup" }) {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNextPath(params.get("next"));
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const body: Record<string, string> = {
      email: String(form.get("email") || ""),
      password: String(form.get("password") || ""),
    };
    if (mode === "signup") body.name = String(form.get("name") || "");
    const res = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      router.push(next);
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong");
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <h1 className="text-2xl font-bold tracking-tight">
        {mode === "signin" ? "Welcome back" : "Create your account"}
      </h1>
      <p className="mt-1 text-sm text-neutral-500">
        {mode === "signin"
          ? "Sign in to review, save favourites and manage your listings."
          : "Join to rate businesses, save favourites and follow events."}
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        {mode === "signup" && (
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium">Full name</label>
            <input id="name" name="name" required minLength={2} className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-600" placeholder="Samson Gezahegn" />
          </div>
        )}
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">Email</label>
          <input id="email" name="email" type="email" required className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-600" placeholder="you@nudicoverEthiopia.com" />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium">Password</label>
          <input id="password" name="password" type="password" required minLength={mode === "signup" ? 8 : 1} className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-600" placeholder={mode === "signup" ? "At least 8 characters" : "Your password"} />
        </div>
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <button disabled={busy} className="w-full rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50">
          {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
        </button>
      </form>

      <p className="mt-4 text-sm text-neutral-500">
        {mode === "signin" ? (
          <>No account? <Link href={`/auth/signup?next=${encodeURIComponent(next)}`} className="font-medium text-emerald-700 hover:underline">Sign up</Link></>
        ) : (
          <>Already a member? <Link href={`/auth/signin?next=${encodeURIComponent(next)}`} className="font-medium text-emerald-700 hover:underline">Sign in</Link></>
        )}
      </p>

      {mode === "signup" && (
        <p className="mt-4 text-xs text-neutral-400">
          By creating an account you agree to our{" "}
          <Link href="/terms" className="underline hover:text-emerald-700">Terms</Link> and{" "}
          <Link href="/privacy" className="underline hover:text-emerald-700">Privacy Policy</Link>.
        </p>
      )}
    </div>
  );
}
