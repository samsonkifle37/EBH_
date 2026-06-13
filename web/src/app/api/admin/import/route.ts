import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/adminGuard";
import { runImport } from "@/lib/import/pipeline";

const schema = z.object({
  type: z.enum(["google_places", "companies_house", "openstreetmap"]),
  query: z.string().max(120).optional(),
});

export async function POST(req: Request) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Provide a valid import type" }, { status: 400 });

  // OSM uses a fixed Overpass query; the others require a search term.
  const isOsm = parsed.data.type === "openstreetmap";
  const query = parsed.data.query?.trim();
  if (!isOsm && (!query || query.length < 2)) {
    return NextResponse.json({ error: "Provide a search query" }, { status: 400 });
  }

  const result = await runImport(parsed.data.type, isOsm ? "United Kingdom (Ethiopian/Eritrean)" : query!);
  return NextResponse.json(result, { status: result.status === "failed" ? 502 : 200 });
}
