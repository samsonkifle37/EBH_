"use client";

import { useEffect, useState } from "react";
import { isNative, nativePlatform } from "@/lib/native/platform";

const DISMISS_KEY = "ebh_push_prompt_v1";

/**
 * Soft-ask for push permission (Apple 4.5.4 / Play): a dismissible in-app card
 * shown only on native and only once; the OS prompt is requested only after the
 * user taps Enable. The app works fully if notifications are denied/ignored.
 */
export default function NativePushPrompt() {
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isNative()) return;
    try {
      if (localStorage.getItem(DISMISS_KEY)) return;
    } catch {}
    const t = setTimeout(() => setShow(true), 4000); // not on first paint
    return () => clearTimeout(t);
  }, []);

  function dismiss() {
    try { localStorage.setItem(DISMISS_KEY, "1"); } catch {}
    setShow(false);
  }

  async function enable() {
    setBusy(true);
    try {
      const { PushNotifications } = await import("@capacitor/push-notifications");
      const perm = await PushNotifications.requestPermissions();
      if (perm.receive === "granted") {
        await new Promise<void>((resolve) => {
          PushNotifications.addListener("registration", async (token) => {
            try {
              await fetch("/api/devices", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: token.value, platform: nativePlatform() }),
              });
            } catch {}
            resolve();
          });
          PushNotifications.addListener("registrationError", () => resolve());
          void PushNotifications.register();
        });
      }
    } catch {
      /* push unavailable */
    } finally {
      dismiss();
      setBusy(false);
    }
  }

  if (!show) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[70] border-t border-neutral-200 bg-ivory-card p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] lg:hidden" style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}>
      <div className="mx-auto max-w-md">
        <p className="text-sm font-semibold text-ink">Stay in the loop?</p>
        <p className="mt-0.5 text-sm text-neutral-600">Get notified when your claim is approved, someone replies to a review, or an event you follow is coming up.</p>
        <div className="mt-3 flex gap-2">
          <button onClick={enable} disabled={busy} className="min-h-11 rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50">
            {busy ? "Enabling…" : "Enable notifications"}
          </button>
          <button onClick={dismiss} disabled={busy} className="min-h-11 rounded-xl border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-600">
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
