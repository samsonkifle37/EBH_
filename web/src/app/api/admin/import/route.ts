import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/adminGuard";
import { runImport } from "@/lib/import/pipeline";

const schema = z.object({
  type: z.enum(["google_places", "companies_house"]),
  query: z.string().min(2).max(120),
});

export async function POST(req: Request) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Provide a type and a search query" }, { status: 400 });

  const result = await runImport(parsed.data.type, parsed.data.query);
  return NextResponse.json(result, { status: result.status === "failed" ? 502 : 200 });
}
