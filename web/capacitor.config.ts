import type { CapacitorConfig } from "@capacitor/cli";

// Hybrid architecture: the native shell loads the production web app in the
// WebView; native features are bridged in via plugins. No static export, no
// localhost, no secrets here.
// NOTE: switch PROD_URL to https://ethiopianbh.com once the custom domain +
// Universal/App Links (AASA / assetlinks.json) are live.
const PROD_URL = "https://ethiopianbh.vercel.app";

const config: CapacitorConfig = {
  appId: "uk.ebh.app",
  appName: "Ethiopian Business Hub",
  webDir: "public", // required by the CLI; unused for remote-URL loading
  server: {
    url: PROD_URL,
    cleartext: false,
    androidScheme: "https",
  },
  // Lets the web app (client + server via UA header) detect the native context.
  appendUserAgent: "EBHApp",
  backgroundColor: "#0f3d28",
  ios: { contentInset: "always", backgroundColor: "#0f3d28", limitsNavigationsToAppBoundDomains: false },
  android: { backgroundColor: "#0f3d28" },
  plugins: {
    SplashScreen: { launchShowDuration: 1200, backgroundColor: "#0f3d28", showSpinner: false },
    PushNotifications: { presentationOptions: ["badge", "sound", "alert"] },
  },
};

export default config;
