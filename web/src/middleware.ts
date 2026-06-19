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
const MUTATING = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // CSRF defense-in-depth for API mutations. Browsers send an Origin header on
  // same-origin non-GET requests; a cross-site forgery would carry a foreign
  // Origin → rejected. The Stripe webhook is cross-origin + signature-verified,
  // so it's exempt. (Requests with no Origin — server-to-server/tools — aren't a
  // browser CSRF vector and are allowed.)
  if (pathname.startsWith("/api/")) {
    if (MUTATING.has(req.method.toUpperCase()) && !pathname.startsWith("/api/webhooks/")) {
      const origin = req.headers.get("origin");
      if (origin) {
        try {
          if (new URL(origin).host !== req.headers.get("host")) return new NextResponse("Bad origin", { status: 403 });
        } catch {
          return new NextResponse("Bad origin", { status: 403 });
        }
      }
    }
    return NextResponse.next(); // don't set analytics cookies on API responses
  }

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
  // Run on pages (analytics cookies) and API routes (CSRF check); skip static.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
