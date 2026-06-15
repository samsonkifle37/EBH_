import { NextResponse, type NextRequest } from "next/server";
import {
  VISITOR_COOKIE,
  ATTRIBUTION_COOKIE,
  ATTRIBUTION_MAX_AGE,
  attributionFromParams,
  serializeAttribution,
} from "@/lib/analytics/attribution";

/**
 * Two anonymous, first-party analytics concerns handled at the edge so capture
 * is reliable and cookies can actually be written (Server Components can't set
 * cookies):
 *   1. ensure every visitor has a stable anonymous id (ebh_vid)
 *   2. when a share link is opened (?ref=share&...), persist the attribution
 *      for 30 days (ebh_attr) so downstream views/contacts can be credited.
 * No PII; no third parties.
 */
export function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const secure = process.env.NODE_ENV === "production";

  if (!req.cookies.get(VISITOR_COOKIE)?.value) {
    res.cookies.set(VISITOR_COOKIE, crypto.randomUUID(), {
      httpOnly: true,
      sameSite: "lax",
      secure,
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: "/",
    });
  }

  const sp = req.nextUrl.searchParams;
  const attr = attributionFromParams({
    ref: sp.get("ref"),
    channel: sp.get("channel"),
    business: sp.get("business"),
  });
  if (attr) {
    res.cookies.set(ATTRIBUTION_COOKIE, serializeAttribution(attr), {
      httpOnly: true,
      sameSite: "lax",
      secure,
      maxAge: ATTRIBUTION_MAX_AGE,
      path: "/",
    });
  }

  return res;
}

export const config = {
  // Skip static assets and API routes (API reads cookies directly).
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};
