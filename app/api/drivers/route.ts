import { NextRequest, NextResponse } from "next/server";
import { getOrgContext } from "@/lib/auth/tenancy";
import { ForbiddenError, requirePermission } from "@/lib/auth/rbac";
import { driverCreateSchema } from "@/lib/directory";

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
    requirePermission(ctx, "read", "driver");

    const drivers = await ctx.db.driver.findMany({
      orderBy: [{ active: "desc" }, { lastName: "asc" }, { firstName: "asc" }],
      include: {
        truck: {
          select: { id: true, unitNumber: true },
        },
      },
      take: 200,
    });

    return NextResponse.json({ items: drivers });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await getOrgContext();
    requirePermission(ctx, "create", "driver");

    const json = await req.json().catch(() => null);
    const parsed = driverCreateSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid body", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const driver = await ctx.db.driver.create({
      data: {
        ...parsed.data,
        orgId: ctx.orgId,
      },
      include: {
        truck: {
          select: { id: true, unitNumber: true },
        },
      },
    });

    await ctx.db.auditLog.create({
      data: {
        orgId: ctx.orgId,
        userId: ctx.userId,
        entityType: "Driver",
        entityId: driver.id,
        action: "create",
        after: driver as unknown as object,
      },
    });

    return NextResponse.json(driver, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}
