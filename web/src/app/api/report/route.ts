import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { validateReport } from "@/lib/report";
import { recordPrideEvent } from "@/lib/analytics/record";
import { cookies } from "next/headers";
import { VISITOR_COOKIE } from "@/lib/analytics/attribution";
import { rateLimitDb, clientIp, HOUR } from "@/lib/rateLimitDb";

export const runtime = "nodejs"; // Prisma

export async function POST(req: Request) {
  // Abuse prevention: 5 reports per IP per hour, DB-backed (survives cold starts).
  const session_early = await getSession();
  const rlKey = session_early
    ? `report:user:${session_early.userId}`
    : `report:ip:${clientIp(req)}`;
  if (!(await rateLimitDb(rlKey, 5, HOUR))) {
    return NextResponse.json({ error: "Too many reports. Please try again later." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const result = validateReport(body ?? {});
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
  const { reason, details, reporterEmail, businessId } = result.value;

  // Authenticated reporting preferred (but anonymous allowed).
  const session = session_early;

  // If a business is referenced, make sure it exists (ignore otherwise).
  let validBusinessId: string | null = null;
  if (businessId) {
    const exists = await db.business.findUnique({ where: { id: businessId }, select: { id: true } });
    validBusinessId = exists?.id ?? null;
  }

  await db.report.create({
    data: {
      businessId: validBusinessId,
      reason,
      details,
      reporterId: session?.userId ?? null,
      reporterEmail: session ? "" : reporterEmail,
    },
  });

  const jar = await cookies();
  const visitorId = jar.get(VISITOR_COOKIE)?.value || "anon";
  void recordPrideEvent({ action: "REPORT_SUBMITTED", businessId: validBusinessId, visitorId, channel: reason });

  return NextResponse.json({ ok: true });
}
