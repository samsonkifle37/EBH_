"use client";

import { useState } from "react";

export default function DeleteAccount({ email }: { email: string }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function remove() {
    setBusy(true);
    setError(null);
    const res = await fetch("/api/account", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirmEmail: value }),
    });
    if (res.ok) {
      window.location.href = "/"; // full reload — clears all client state
      return;
    }
    const data = await res.json().catch(() => ({}));
    setError(data.error ?? "Something went wrong. Please try again.");
    setBusy(false);
  }

  return (
    <div className="rounded-2xl border border-red-200 bg-red-50/50 p-5">
      <h3 className="text-sm font-bold text-red-800">Delete account</h3>
      <p className="mt-1 text-sm text-red-700/90">
        Permanently delete your account, reviews, saved businesses and pending claims. Any business you claimed is returned to an
        unclaimed state. This cannot be undone.
      </p>

      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="mt-4 inline-flex min-h-11 items-center rounded-xl border border-red-300 bg-white px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100"
        >
          Delete my account
        </button>
      ) : (
        <div className="mt-4 space-y-3">
          <label htmlFor="confirm-email" className="block text-sm font-medium text-red-800">
            Type <span className="font-mono">{email}</span> to confirm
          </label>
          <input
            id="confirm-email"
            type="email"
            autoComplete="off"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="min-h-11 w-full rounded-xl border border-red-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-red-500"
            placeholder={email}
          />
          {error && <p className="rounded-lg bg-red-100 px-3 py-2 text-sm text-red-700" role="alert">{error}</p>}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={remove}
              disabled={busy || value.trim().toLowerCase() !== email.trim().toLowerCase()}
              className="inline-flex min-h-11 items-center rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
            >
              {busy ? "Deleting…" : "Permanently delete"}
            </button>
            <button
              onClick={() => { setOpen(false); setValue(""); setError(null); }}
              disabled={busy}
              className="inline-flex min-h-11 items-center rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-100"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
