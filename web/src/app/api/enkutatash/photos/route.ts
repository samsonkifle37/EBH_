import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import { validateUpload } from "@/lib/upload";
import { rateLimitDb, HOUR } from "@/lib/rateLimitDb";

export const runtime = "nodejs";

/** Community photo submission for the Enkutatash 2026 photo wall.
 *  No auth required — rate-limited by IP (3 photos per hour).
 *  Photos are created as PENDING and require admin approval before going live.
 */
export async function POST(req: Request) {
  // IP-based rate limit: 3 photos per hour
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";
  const allowed = await rateLimitDb(`enkutatash_photo:ip:${ip}`, 3, HOUR);
  if (!allowed) {
    return NextResponse.json(
      { error: "You've submitted too many photos. Please try again later." },
      { status: 429 },
    );
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "Photo uploads aren't configured yet." },
      { status: 503 },
    );
  }

  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No image provided." }, { status: 400 });

  const submitterName = String(form.get("submitterName") || "Community member").trim().slice(0, 80);
  const caption = String(form.get("caption") || "").trim().slice(0, 200);
  const city = String(form.get("city") || "").trim().slice(0, 80);

  const valid = validateUpload(file.type, file.size);
  if (!valid.ok) return NextResponse.json({ error: valid.error }, { status: 400 });

  const key = `enkutatash/photos/${randomUUID()}.${valid.ext}`;
  let imageUrl: string;
  try {
    const blob = await put(key, file, { access: "public", contentType: file.type, addRandomSuffix: false });
    imageUrl = blob.url;
  } catch (e) {
    console.error("[enkutatash/photos] upload failed", e);
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 });
  }

  await db.enkutatashPhoto.create({
    data: { submitterName, imageUrl, caption, city, status: "PENDING" },
  });

  return NextResponse.json({ success: true });
}
