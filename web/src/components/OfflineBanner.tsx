"use client";

import { useEffect, useState } from "react";

/**
 * Lightweight connectivity guard. Shows a dignified, dismissible-on-reconnect
 * banner when the device goes offline, with a retry action. Keeps cached
 * content visible underneath rather than ever showing a blank screen.
 */
export default function OfflineBanner() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const update = () => setOffline(!navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  if (!offline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-0 top-0 z-[60] flex items-center justify-center gap-3 bg-ink px-4 py-2.5 text-sm text-white"
      style={{ paddingTop: "max(0.625rem, env(safe-area-inset-top))" }}
    >
      <span className="h-2 w-2 shrink-0 rounded-full bg-amber-400" aria-hidden />
      <span className="font-medium">You&rsquo;re offline — some features may not work.</span>
      <button
        onClick={() => { if (navigator.onLine) setOffline(false); else window.location.reload(); }}
        className="min-h-9 rounded-lg bg-white/15 px-3 py-1 font-semibold hover:bg-white/25"
      >
        Retry
      </button>
    </div>
  );
}
