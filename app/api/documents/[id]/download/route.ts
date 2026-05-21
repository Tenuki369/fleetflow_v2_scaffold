import { NextResponse } from "next/server";
import { getOrgContext } from "@/lib/auth/tenancy";
import { ForbiddenError, requirePermission } from "@/lib/auth/rbac";
import { createDownloadUrl } from "@/lib/storage/documents";

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
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const ctx = await getOrgContext();
    requirePermission(ctx, "read", "load");

    const document = await ctx.db.document.findUnique({
      where: { id },
      select: {
        id: true,
        fileName: true,
        s3Key: true,
      },
    });

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const url = await createDownloadUrl({
      key: document.s3Key,
      fileName: document.fileName,
    });

    return NextResponse.redirect(url);
  } catch (err) {
    return errorResponse(err);
  }
}
