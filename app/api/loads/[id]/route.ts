import { NextRequest, NextResponse } from "next/server";
import { getOrgContext } from "@/lib/auth/tenancy";
import { ForbiddenError, requirePermission } from "@/lib/auth/rbac";
import { deriveLoadStatusForWrite, loadWriteSchema } from "@/lib/loads";

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

    const load = await ctx.db.load.findUnique({
      where: { id },
      include: {
        customer: { select: { id: true, name: true } },
        driver: { select: { id: true, firstName: true, lastName: true } },
        truck: { select: { id: true, unitNumber: true } },
      },
    });

    if (!load) {
      return NextResponse.json({ error: "Load not found" }, { status: 404 });
    }

    return NextResponse.json(load);
  } catch (err) {
    return errorResponse(err);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const ctx = await getOrgContext();
    requirePermission(ctx, "update", "load");

    const current = await ctx.db.load.findUnique({ where: { id } });
    if (!current) {
      return NextResponse.json({ error: "Load not found" }, { status: 404 });
    }

    const json = await req.json().catch(() => null);
    const parsed = loadWriteSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid body", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    if (parsed.data.deliverBy < parsed.data.pickupAt) {
      return NextResponse.json(
        { error: "deliverBy must be on or after pickupAt" },
        { status: 422 },
      );
    }

    const load = await ctx.db.load.update({
      where: { id },
      data: {
        ...parsed.data,
        status: deriveLoadStatusForWrite(current.status, parsed.data.driverId),
      },
      include: {
        customer: { select: { id: true, name: true } },
        driver: { select: { id: true, firstName: true, lastName: true } },
        truck: { select: { id: true, unitNumber: true } },
      },
    });

    await ctx.db.auditLog.create({
      data: {
        orgId: ctx.orgId,
        userId: ctx.userId,
        entityType: "Load",
        entityId: load.id,
        action: "update",
        before: current as unknown as object,
        after: load as unknown as object,
      },
    });

    return NextResponse.json(load);
  } catch (err) {
    if (err && typeof err === "object" && "code" in err && (err as { code: string }).code === "P2002") {
      return NextResponse.json(
        { error: "referenceNumber already exists for this org" },
        { status: 409 },
      );
    }
    return errorResponse(err);
  }
}
