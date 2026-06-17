"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const ASSIGNABLE: [string, string][] = [
  ["BUSINESS_OWNER", "Business owner"],
  ["EVENT_ORGANIZER", "Event organizer"],
  ["ADMIN", "Admin"],
];

export default function UserAdminActions({
  userId,
  initialRoles,
  status,
}: {
  userId: string;
  initialRoles: string[];
  status: string;
}) {
  const router = useRouter();
  const [roles, setRoles] = useState<string[]>(initialRoles.filter((r) => r !== "USER"));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [temp, setTemp] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  async function call(method: "PATCH" | "DELETE", body?: object): Promise<Record<string, unknown> | null> {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError((data as { error?: string }).error ?? "Something went wrong."); return null; }
      return data as Record<string, unknown>;
    } finally {
      setBusy(false);
    }
  }

  const btn = "inline-flex min-h-10 items-center rounded-xl px-4 py-2 text-sm font-semibold disabled:opacity-50";

  return (
    <div className="space-y-6">
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{error}</p>}

      <section className="rounded-2xl border border-neutral-200 bg-white p-5">
        <h2 className="text-sm font-bold text-neutral-700">Roles</h2>
        <p className="mt-0.5 text-xs text-neutral-400">Every account keeps the USER role. Guards prevent removing the last admin or your own admin role.</p>
        <div className="mt-3 flex flex-wrap gap-3">
          {ASSIGNABLE.map(([value, label]) => (
            <label key={value} className="flex min-h-10 cursor-pointer items-center gap-2 rounded-xl border border-neutral-300 px-3 py-2 text-sm">
              <input type="checkbox" className="h-4 w-4 accent-emerald-700" checked={roles.includes(value)} onChange={() => setRoles((c) => (c.includes(value) ? c.filter((x) => x !== value) : [...c, value]))} />
              {label}
            </label>
          ))}
        </div>
        <button disabled={busy} onClick={() => call("PATCH", { action: "set_roles", roles: ["USER", ...roles] }).then((d) => d && router.refresh())} className={`${btn} mt-3 bg-emerald-700 text-white hover:bg-emerald-800`}>
          Save roles
        </button>
      </section>

      <section className="rounded-2xl border border-neutral-200 bg-white p-5">
        <h2 className="text-sm font-bold text-neutral-700">Account status — <span className="font-mono">{status}</span></h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {status === "active" ? (
            <>
              <button
                disabled={busy}
                onClick={async () => { const reason = window.prompt("Reason for suspension (optional):"); if (reason === null) return; const d = await call("PATCH", { action: "suspend", reason }); if (d) router.refresh(); }}
                className={`${btn} bg-amber-600 text-white hover:bg-amber-700`}
              >
                Suspend
              </button>
              <button
                disabled={busy}
                onClick={async () => { if (!window.confirm("Deactivate this account? They won't be able to use it until reactivated.")) return; const d = await call("PATCH", { action: "deactivate" }); if (d) router.refresh(); }}
                className={`${btn} border border-neutral-300 text-neutral-700 hover:border-emerald-600`}
              >
                Deactivate
              </button>
            </>
          ) : (
            <button disabled={busy} onClick={() => call("PATCH", { action: "reactivate" }).then((d) => d && router.refresh())} className={`${btn} bg-emerald-700 text-white hover:bg-emerald-800`}>
              Reactivate
            </button>
          )}
          <button
            disabled={busy}
            onClick={async () => { if (!window.confirm("Reset this user's password? You'll get a one-time temporary password to share with them.")) return; const d = await call("PATCH", { action: "reset_password" }); if (d?.tempPassword) setTemp(String(d.tempPassword)); }}
            className={`${btn} border border-neutral-300 text-neutral-700 hover:border-emerald-600`}
          >
            Reset password
          </button>
        </div>
        {temp && (
          <p className="mt-3 rounded-lg bg-neutral-100 px-3 py-2 text-sm">
            Temporary password (shown once): <span className="font-mono font-semibold">{temp}</span>
          </p>
        )}
      </section>

      <section className="rounded-2xl border border-red-200 bg-red-50/50 p-5">
        <h2 className="text-sm font-bold text-red-800">Delete account</h2>
        <p className="mt-0.5 text-xs text-red-700/90">Anonymizes the account (scrubs name, email and login) while preserving business-ownership records. Cannot be undone.</p>
        {confirmingDelete ? (
          <div className="mt-3 flex flex-wrap gap-2">
            <button disabled={busy} onClick={() => call("DELETE").then((d) => { if (d) { router.push("/admin/users"); router.refresh(); } })} className={`${btn} bg-red-600 text-white hover:bg-red-700`}>
              Yes, anonymize this account
            </button>
            <button disabled={busy} onClick={() => setConfirmingDelete(false)} className={`${btn} border border-neutral-300 text-neutral-700`}>Cancel</button>
          </div>
        ) : (
          <button onClick={() => setConfirmingDelete(true)} className={`${btn} mt-3 border border-red-300 bg-white text-red-700 hover:bg-red-100`}>Delete user</button>
        )}
      </section>
    </div>
  );
}
