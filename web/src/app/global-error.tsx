"use client";

import { useEffect } from "react";

// Catches errors in the root layout itself; must render its own <html>/<body>.
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", margin: 0, background: "#faf7f0", color: "#1a1613" }}>
        <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "2rem" }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>Something went wrong</h1>
          <p style={{ marginTop: 12, color: "#57534e", maxWidth: 420 }}>
            The app hit an unexpected error. Please try again.
          </p>
          <button
            onClick={reset}
            style={{ marginTop: 24, minHeight: 44, padding: "0 20px", borderRadius: 12, border: "none", background: "#047857", color: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer" }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
