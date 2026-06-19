"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isNative } from "@/lib/native/platform";

/**
 * Initializes native behaviours when running inside the Capacitor shell:
 * splash hide, status-bar style, Android hardware-back, deep-link routing, and
 * a native offline overlay with retry. Completely inert on the web (the effect
 * early-returns), so it never affects the browser build.
 */
export default function NativeBootstrap() {
  const router = useRouter();
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    if (!isNative()) return;
    const cleanups: Array<() => void> = [];

    (async () => {
      try {
        const { SplashScreen } = await import("@capacitor/splash-screen");
        await SplashScreen.hide();
      } catch {}
      try {
        const { StatusBar, Style } = await import("@capacitor/status-bar");
        await StatusBar.setStyle({ style: Style.Dark });
      } catch {}
      try {
        const { App } = await import("@capacitor/app");
        const backSub = await App.addListener("backButton", ({ canGoBack }) => {
          if (canGoBack) window.history.back();
          else App.exitApp();
        });
        const urlSub = await App.addListener("appUrlOpen", ({ url }) => {
          try {
            if (url.startsWith("ebh://")) {
              const path = "/" + url.slice("ebh://".length).replace(/^\/+/, "");
              router.push(path);
              return;
            }
            const u = new URL(url);
            router.push(u.pathname + u.search);
          } catch {
            /* ignore malformed deep link */
          }
        });
        cleanups.push(() => { backSub.remove(); urlSub.remove(); });
      } catch {}
      try {
        const { Network } = await import("@capacitor/network");
        const status = await Network.getStatus();
        setOffline(!status.connected);
        const netSub = await Network.addListener("networkStatusChange", (s) => setOffline(!s.connected));
        cleanups.push(() => netSub.remove());
      } catch {}
    })();

    return () => cleanups.forEach((fn) => fn());
  }, [router]);

  if (!offline) return null;

  return (
    <div className="fixed inset-0 z-[80] flex flex-col items-center justify-center gap-4 bg-ink px-6 text-center text-white" style={{ paddingTop: "env(safe-area-inset-top)" }}>
      <span className="text-3xl" aria-hidden>📡</span>
      <h1 className="text-xl font-bold">You&rsquo;re offline</h1>
      <p className="max-w-xs text-sm text-neutral-300">Check your connection — Ethiopian Business Hub needs internet to load the latest listings.</p>
      <button onClick={() => window.location.reload()} className="min-h-11 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500">
        Try again
      </button>
    </div>
  );
}
