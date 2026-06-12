import { NextResponse } from "next/server";
import { googlePlacesKey } from "@/lib/import/googlePlaces";

/** Proxies Google Place photos so the API key never reaches the browser. */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name");
  const key = googlePlacesKey();
  if (!name || !/^places\/[^/]+\/photos\/[^/]+$/.test(name)) {
    return NextResponse.json({ error: "Invalid photo reference" }, { status: 400 });
  }
  if (!key) {
    return NextResponse.json({ error: "Google Places not configured" }, { status: 503 });
  }
  const upstream = await fetch(
    `https://places.googleapis.com/v1/${name}/media?maxWidthPx=800&key=${key}`,
    { redirect: "follow" }
  );
  if (!upstream.ok) {
    return NextResponse.json({ error: "Photo unavailable" }, { status: 502 });
  }
  return new NextResponse(upstream.body, {
    headers: {
      "Content-Type": upstream.headers.get("Content-Type") ?? "image/jpeg",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
