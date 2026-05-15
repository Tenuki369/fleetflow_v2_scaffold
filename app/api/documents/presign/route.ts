import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getOrgContext } from "@/lib/auth/tenancy";
import { requirePermission, ForbiddenError } from "@/lib/auth/rbac";
import { createUploadUrl } from "@/lib/storage/documents";

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "application/pdf",
]);

const bodySchema = z.object({
  loadId: z.string().cuid(),
  fileName: z.string().min(1).max(256),
  mimeType: z.string(),
  sizeBytes: z.number().int().positive().max(25 * 1024 * 1024),
});

export async function POST(req: NextRequest) {
  try {
    const ctx = await getOrgContext();
    requirePermission(ctx, "update", "load");

    const parsed = bodySchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid body", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    if (!ALLOWED_MIME.has(parsed.data.mimeType)) {
      return NextResponse.json(
        { error: "MIME type not allowed", allowed: [...ALLOWED_MIME] },
        { status: 415 },
      );
    }

    // Confirm the load belongs to this org and the user can write to it.
    // The tenancy extension already forces orgId; this is defense in depth.
    const load = await ctx.db.load.findUnique({ where: { id: parsed.data.loadId } });
    if (!load) {
      return NextResponse.json({ error: "Load not found" }, { status: 404 });
    }

    const presign = await createUploadUrl({
      orgId: ctx.orgId,
      loadId: parsed.data.loadId,
      fileName: parsed.data.fileName,
      mimeType: parsed.data.mimeType,
      sizeBytes: parsed.data.sizeBytes,
    });

    return NextResponse.json(presign);
  } catch (err) {
    if (err instanceof ForbiddenError) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    if (err instanceof Error && err.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
