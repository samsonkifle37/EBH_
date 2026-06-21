import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0f3d28 0%, #15613e 60%, #1a7a4e 100%)",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative circles */}
        <div
          style={{
            position: "absolute",
            top: "-80px",
            right: "-80px",
            width: "340px",
            height: "340px",
            borderRadius: "50%",
            background: "rgba(224, 168, 46, 0.08)",
            border: "2px solid rgba(224, 168, 46, 0.15)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-60px",
            left: "-60px",
            width: "260px",
            height: "260px",
            borderRadius: "50%",
            background: "rgba(224, 168, 46, 0.06)",
            border: "2px solid rgba(224, 168, 46, 0.12)",
          }}
        />

        {/* Top label */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "28px",
          }}
        >
          <div
            style={{
              background: "rgba(224, 168, 46, 0.18)",
              border: "1px solid rgba(224, 168, 46, 0.4)",
              borderRadius: "999px",
              padding: "6px 20px",
              fontSize: "18px",
              fontWeight: "600",
              color: "#e0a82e",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            Ethiopian Business Hub UK
          </div>
        </div>

        {/* Flower + year */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "24px",
            marginBottom: "16px",
          }}
        >
          <span style={{ fontSize: "80px", lineHeight: 1 }}>🌸</span>
          <span
            style={{
              fontSize: "100px",
              fontWeight: "800",
              color: "#ffffff",
              letterSpacing: "-0.02em",
              lineHeight: 1,
            }}
          >
            2026
          </span>
          <span style={{ fontSize: "80px", lineHeight: 1 }}>🌸</span>
        </div>

        {/* Enkutatash title */}
        <div
          style={{
            fontSize: "72px",
            fontWeight: "800",
            color: "#e0a82e",
            letterSpacing: "-0.01em",
            lineHeight: 1,
            marginBottom: "20px",
          }}
        >
          Enkutatash
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: "28px",
            fontWeight: "500",
            color: "rgba(255,255,255,0.75)",
            letterSpacing: "0.01em",
            marginBottom: "40px",
          }}
        >
          Ethiopian New Year · 11 September 2026
        </div>

        {/* Divider */}
        <div
          style={{
            width: "120px",
            height: "2px",
            background: "rgba(224, 168, 46, 0.5)",
            borderRadius: "1px",
            marginBottom: "28px",
          }}
        />

        {/* Bottom tagline */}
        <div
          style={{
            fontSize: "22px",
            fontWeight: "500",
            color: "rgba(255,255,255,0.55)",
            letterSpacing: "0.02em",
          }}
        >
          ethiopianbh.co.uk/enkutatash
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
