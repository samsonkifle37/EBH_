import { ImageResponse } from "next/og";
import QRCode from "qrcode";
import { db } from "@/lib/db";
import { earnedBadges } from "@/lib/domain/badges";
import { CITY_LABELS, isCity, type City } from "@/lib/types";
import { siteUrl } from "@/lib/payments/stripe";
import { recordPrideEvent } from "@/lib/analytics/record";
import { shareParams } from "@/lib/analytics/attribution";

export const runtime = "nodejs"; // Prisma + qrcode need Node

const SIZES: Record<string, { w: number; h: number }> = {
  card: { w: 1200, h: 630 },
  story: { w: 1080, h: 1920 },
  poster: { w: 1080, h: 1350 },
};

export async function GET(req: Request, { params }: { params: Promise<{ slug: string; type: string }> }) {
  const { slug, type } = await params;
  const size = SIZES[type] ?? SIZES.card;

  const business = await db.business.findUnique({
    where: { slug },
    select: { id: true, name: true, city: true, status: true, ownerId: true, claimedAt: true, verificationLevel: true, plan: true },
  });
  if (!business || business.status !== "APPROVED") {
    return new Response("Not found", { status: 404 });
  }

  // An asset was generated — funnel signal (intent), not a distribution share.
  void recordPrideEvent({ action: "SHARE_IMAGE_GENERATED", businessId: business.id, visitorId: "system", asset: type });

  const cityLabel = isCity(business.city) ? CITY_LABELS[business.city as City] : business.city;
  const topBadge = earnedBadges(business)[0]?.label ?? "On Ethiopian Business Hub";
  // QR carries share attribution so scans land as channel=qr and convert to views.
  const profileUrl = `${siteUrl()}/business/${slug}?${shareParams(slug, "qr")}`;
  const qr = await QRCode.toDataURL(profileUrl, { margin: 1, width: 320, color: { dark: "#0a0a0a", light: "#ffffff" } });

  const vertical = type !== "card";
  const nameSize = vertical ? 84 : 64;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #0a0a0a 0%, #1c1917 100%)",
          color: "#ffffff",
          padding: vertical ? 90 : 70,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", height: 56, width: 56, alignItems: "center", justifyContent: "center", borderRadius: 14, background: "linear-gradient(135deg,#047857,#FCDD09,#DA1212)", fontSize: 28, fontWeight: 900 }}>EB</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: "#d6d3d1" }}>Ethiopian Business Hub UK</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "flex", alignSelf: "flex-start", borderRadius: 999, border: "2px solid #FCDD09", padding: "8px 20px", fontSize: 26, fontWeight: 700, color: "#FCDD09" }}>
            ★ {topBadge}
          </div>
          <div style={{ display: "flex", fontSize: nameSize, fontWeight: 900, lineHeight: 1.05, maxWidth: vertical ? 900 : 760 }}>{business.name}</div>
          <div style={{ display: "flex", fontSize: 32, color: "#a8a29e" }}>📍 {cityLabel}, United Kingdom</div>
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div style={{ display: "flex", flexDirection: "column", maxWidth: vertical ? 640 : 720 }}>
            <div style={{ display: "flex", fontSize: vertical ? 40 : 34, fontWeight: 800, color: "#FCDD09" }}>Proud member of</div>
            <div style={{ display: "flex", fontSize: vertical ? 40 : 34, fontWeight: 800 }}>Ethiopian Business Hub UK</div>
            <div style={{ display: "flex", marginTop: 14, fontSize: 24, color: "#a8a29e" }}>Scan to view our profile</div>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qr} width={vertical ? 260 : 200} height={vertical ? 260 : 200} alt="" style={{ borderRadius: 16, background: "#fff", padding: 10 }} />
        </div>
      </div>
    ),
    { width: size.w, height: size.h }
  );
}
