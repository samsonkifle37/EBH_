import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import { getSession, hasRole } from "@/lib/session";
import { validateUpload, storageKey } from "@/lib/upload";

export const runtime = "nodejs";

/** Authenticated image upload → Vercel Blob. Owners can upload to their own
 * businesses; admins to any. Validates type/size; never trusts the filename. */
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: "Image storage isn't configured yet. Add a Vercel Blob store, then try again." }, { status: 503 });
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  const kind = String(form?.get("kind") || "misc");
  const businessId = form?.get("businessId") ? String(form.get("businessId")) : null;

  if (!(file instanceof File)) return NextResponse.json({ error: "No file provided." }, { status: 400 });

  const valid = validateUpload(file.type, file.size);
  if (!valid.ok) return NextResponse.json({ error: valid.error }, { status: 400 });

  // Ownership: uploading against an existing business requires ownership/admin.
  if (businessId) {
    const b = await db.business.findUnique({ where: { id: businessId }, select: { ownerId: true, submittedById: true } });
    if (!b) return NextResponse.json({ error: "Business not found." }, { status: 404 });
    const manages = b.ownerId === session.userId || b.submittedById === session.userId || hasRole(session, "ADMIN");
    if (!manages) return NextResponse.json({ error: "You don't manage this business." }, { status: 403 });
  }

  const key = storageKey(kind, valid.ext, businessId, randomUUID());
  try {
    const blob = await put(key, file, { access: "public", contentType: file.type, addRandomSuffix: false });
    return NextResponse.json({ url: blob.url });
  } catch (e) {
    console.error("[upload] failed", e);
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 });
  }
}
