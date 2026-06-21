import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

const PETAL_COLOURS: Record<string, string[]> = {
  gold: ["#f59e0b", "#fbbf24", "#f97316"],
  white: ["#e5e7eb", "#f9fafb", "#d1d5db"],
  pink: ["#f472b6", "#fb7185", "#e879f9"],
  purple: ["#a78bfa", "#c084fc", "#818cf8"],
};

export async function GET(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  // Fetch flower data from the same origin
  let senderName = "Someone special";
  let recipientName = "You";
  let message = "";
  let colour = "gold";

  try {
    const url = new URL(`/api/enkutatash/flowers/${token}`, req.url);
    const res = await fetch(url.toString());
    if (res.ok) {
      const data = await res.json();
      senderName = data.senderName ?? senderName;
      recipientName = data.recipientName ?? recipientName;
      message = data.message ?? "";
      colour = data.colour ?? "gold";
    }
  } catch { /* render generic card */ }

  const petals = PETAL_COLOURS[colour] ?? PETAL_COLOURS.gold;
  const size = 120;
  const r = size / 2;
  const pr = r * 0.38;
  const cr = r * 0.22;
  const off = r * 0.36;
  const angles = [0, 45, 90, 135, 180, 225, 270, 315];

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: "linear-gradient(135deg, #fefce8 0%, #fff7ed 50%, #f0fdf4 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          gap: 32,
          position: "relative",
        }}
      >
        {/* Decorative corner flowers */}
        {[0, 1].map((i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              [i === 0 ? "top" : "bottom"]: 20,
              [i === 0 ? "left" : "right"]: 20,
              opacity: 0.15,
              fontSize: 80,
            }}
          >
            🌸
          </div>
        ))}

        {/* Flower */}
        <div style={{ position: "relative", width: size, height: size, display: "flex" }}>
          {angles.map((a, i) => {
            const rad = (a * Math.PI) / 180;
            const cx = r + off * Math.cos(rad);
            const cy = r + off * Math.sin(rad);
            return (
              <div
                key={a}
                style={{
                  position: "absolute",
                  width: pr * 2,
                  height: pr * 1.1,
                  borderRadius: "50%",
                  background: petals[i % petals.length],
                  opacity: 0.9,
                  left: cx - pr,
                  top: cy - pr * 0.55,
                  transform: `rotate(${a}deg)`,
                  transformOrigin: "center",
                }}
              />
            );
          })}
          {/* Centre */}
          <div
            style={{
              position: "absolute",
              width: cr * 2,
              height: cr * 2,
              borderRadius: "50%",
              background: "#f59e0b",
              left: r - cr,
              top: r - cr,
            }}
          />
          <div
            style={{
              position: "absolute",
              width: cr * 1.1,
              height: cr * 1.1,
              borderRadius: "50%",
              background: "#fde68a",
              left: r - cr * 0.55,
              top: r - cr * 0.55,
            }}
          />
        </div>

        {/* Text */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, maxWidth: 900, textAlign: "center" }}>
          <div style={{ fontSize: 28, color: "#78716c", fontWeight: 600 }}>
            {senderName} sent you an Adey Abeba bouquet
          </div>
          <div style={{ fontSize: 72, color: "#15613e", fontWeight: 900, lineHeight: 1.1 }}>
            {recipientName}
          </div>
          {message && (
            <div style={{ fontSize: 28, color: "#57534e", fontStyle: "italic", maxWidth: 800 }}>
              &quot;{message}&quot;
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            fontSize: 22,
            color: "#15613e",
            fontWeight: 700,
            background: "#dcfce7",
            borderRadius: 24,
            padding: "10px 28px",
          }}
        >
          🌸 Melkam Addis Amet · Ethiopian Business Hub UK
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
