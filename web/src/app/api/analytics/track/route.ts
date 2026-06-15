import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { z } from "zod";
import { recordPrideEvent } from "@/lib/analytics/record";
import { PRIDE_EVENTS, isShareChannel } from "@/lib/analytics/events";
import { VISITOR_COOKIE, ATTRIBUTION_COOKIE, parseAttribution } from "@/lib/analytics/attribution";

export const runtime = "nodejs"; // Prisma

const schema = z.object({
  action: z.enum(PRIDE_EVENTS),
  businessId: z.string().min(1).optional(),
  channel: z.string().max(32).optional(),
  asset: z.string().max(32).optional(),
  dedupeKey: z.string().max(200).optional(),
});

// Click events whose channel should default to the share attribution if present.
const ATTRIBUTABLE = new Set(["PROFILE_VIEW", "CONTACT_CLICK", "WEBSITE_CLICK", "DIRECTIONS_CLICK"]);

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const jar = await cookies();
  const visitorId = jar.get(VISITOR_COOKIE)?.value || "anon";
  const attribution = parseAttribution(jar.get(ATTRIBUTION_COOKIE)?.value);

  const h = await headers();
  const referrer = h.get("referer") ?? "";

  // Channel resolution: explicit body channel wins; otherwise credit the stored
  // share attribution for attributable interactions; else "direct".
  let channel = parsed.data.channel ?? "";
  if (!channel && ATTRIBUTABLE.has(parsed.data.action)) {
    channel = attribution?.channel && isShareChannel(attribution.channel) ? attribution.channel : "direct";
  }

  const wrote = await recordPrideEvent({
    action: parsed.data.action,
    businessId: parsed.data.businessId,
    visitorId,
    channel,
    asset: parsed.data.asset,
    referrer,
    dedupeKey: parsed.data.dedupeKey,
  });

  return NextResponse.json({ ok: true, recorded: wrote });
}
