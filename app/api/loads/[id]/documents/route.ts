import { NextRequest, NextResponse } from "next/server";
import { getOrgContext } from "@/lib/auth/tenancy";
import { ForbiddenError, requirePermission } from "@/lib/auth/rbac";
import { documentCreateSchema, isValidDocumentKey } from "@/lib/documents";

function errorResponse(err: unknown) {
  if (err instanceof ForbiddenError) {
    return NextResponse.json({ error: err.message }, { status: 403 });
  }
  if (err instanceof Error && err.message === "UNAUTHENTICATED") {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }
  if (err instanceof Error && err.message === "NO_MEMBERSHIP") {
    return NextResponse.json({ error: "No org membership" }, { status: 403 });
  }
  return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const ctx = await getOrgContext();
    requirePermission(ctx, "read", "load");

    const load = await ctx.db.load.findUnique({ where: { id }, select: { id: true } });
    if (!load) {
      return NextResponse.json({ error: "Load not found" }, { status: 404 });
    }

    const items = await ctx.db.document.findMany({
      where: { loadId: id },
      orderBy: [{ createdAt: "desc" }],
      take: 100,
    });

    return NextResponse.json({ items });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const ctx = await getOrgContext();
    requirePermission(ctx, "update", "load");

    const load = await ctx.db.load.findUnique({ where: { id }, select: { id: true } });
    if (!load) {
      return NextResponse.json({ error: "Load not found" }, { status: 404 });
    }

    const parsed = documentCreateSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid body", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    if (!isValidDocumentKey(ctx.orgId, id, parsed.data.s3Key)) {
      return NextResponse.json({ error: "Invalid document key" }, { status: 422 });
    }

    const document = await ctx.db.document.create({
      data: {
        orgId: ctx.orgId,
        loadId: id,
        kind: parsed.data.kind,
        fileName: parsed.data.fileName,
        s3Key: parsed.data.s3Key,
        sizeBytes: parsed.data.sizeBytes ?? null,
        mimeType: parsed.data.mimeType ?? null,
      },
    });

    await ctx.db.auditLog.create({
      data: {
        orgId: ctx.orgId,
        userId: ctx.userId,
        entityType: "Document",
        entityId: document.id,
        action: "create",
        after: document as unknown as object,
      },
    });

    return NextResponse.json(document, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}
