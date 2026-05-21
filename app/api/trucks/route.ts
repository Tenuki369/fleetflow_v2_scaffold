import { NextRequest, NextResponse } from "next/server";
import { getOrgContext } from "@/lib/auth/tenancy";
import { ForbiddenError, requirePermission } from "@/lib/auth/rbac";
import { truckCreateSchema } from "@/lib/directory";

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

export async function GET() {
  try {
    const ctx = await getOrgContext();
    requirePermission(ctx, "read", "truck");

    const trucks = await ctx.db.truck.findMany({
      orderBy: [{ active: "desc" }, { unitNumber: "asc" }],
      include: {
        drivers: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
      take: 200,
    });

    return NextResponse.json({ items: trucks });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await getOrgContext();
    requirePermission(ctx, "create", "truck");

    const json = await req.json().catch(() => null);
    const parsed = truckCreateSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid body", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const truck = await ctx.db.truck.create({
      data: {
        ...parsed.data,
        orgId: ctx.orgId,
      },
      include: {
        drivers: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    await ctx.db.auditLog.create({
      data: {
        orgId: ctx.orgId,
        userId: ctx.userId,
        entityType: "Truck",
        entityId: truck.id,
        action: "create",
        after: truck as unknown as object,
      },
    });

    return NextResponse.json(truck, { status: 201 });
  } catch (err) {
    if (err && typeof err === "object" && "code" in err && (err as { code: string }).code === "P2002") {
      return NextResponse.json(
        { error: "unitNumber already exists for this org" },
        { status: 409 },
      );
    }
    return errorResponse(err);
  }
}
