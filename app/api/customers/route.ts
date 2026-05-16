import { NextRequest, NextResponse } from "next/server";
import { getOrgContext } from "@/lib/auth/tenancy";
import { ForbiddenError, requirePermission } from "@/lib/auth/rbac";
import { customerCreateSchema } from "@/lib/directory";

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
    requirePermission(ctx, "read", "customer");

    const customers = await ctx.db.customer.findMany({
      orderBy: [{ name: "asc" }],
      take: 200,
    });

    return NextResponse.json({ items: customers });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await getOrgContext();
    requirePermission(ctx, "create", "customer");

    const json = await req.json().catch(() => null);
    const parsed = customerCreateSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid body", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const customer = await ctx.db.customer.create({
      data: {
        ...parsed.data,
        orgId: ctx.orgId,
      },
    });

    await ctx.db.auditLog.create({
      data: {
        orgId: ctx.orgId,
        userId: ctx.userId,
        entityType: "Customer",
        entityId: customer.id,
        action: "create",
        after: customer as unknown as object,
      },
    });

    return NextResponse.json(customer, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}
