import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { LoadStatus } from "@prisma/client";
import { getOrgContext } from "@/lib/auth/tenancy";
import { requirePermission, ForbiddenError } from "@/lib/auth/rbac";
import { deriveLoadStatusForWrite, loadWriteSchema } from "@/lib/loads";
import { validateOrgRelations } from "@/lib/relations";

const listQuerySchema = z.object({
  status: z.nativeEnum(LoadStatus).optional(),
  driverId: z.string().cuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
});

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

export async function GET(req: NextRequest) {
  try {
    const ctx = await getOrgContext();
    requirePermission(ctx, "read", "load");

    const parsed = listQuerySchema.safeParse(
      Object.fromEntries(req.nextUrl.searchParams.entries()),
    );
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid query", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const status: LoadStatus | undefined = parsed.data.status;
    const driverId: string | undefined = parsed.data.driverId;
    const page: number = parsed.data.page;
    const pageSize: number = parsed.data.pageSize;

    const where = {
      ...(status ? { status } : {}),
      ...(driverId ? { driverId } : {}),
    };

    const [items, total] = await Promise.all([
      ctx.db.load.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          customer: { select: { id: true, name: true } },
          driver:   { select: { id: true, firstName: true, lastName: true } },
          truck:    { select: { id: true, unitNumber: true } },
        },
      }),
      ctx.db.load.count({ where }),
    ]);

    return NextResponse.json({
      items,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await getOrgContext();
    requirePermission(ctx, "create", "load");

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

    const relationError = await validateOrgRelations(ctx.db, [
      { field: "customerId", id: parsed.data.customerId },
      { field: "driverId", id: parsed.data.driverId },
      { field: "truckId", id: parsed.data.truckId },
    ]);
    if (relationError) {
      return NextResponse.json({ error: relationError }, { status: 422 });
    }

    const load = await ctx.db.load.create({
      data: {
        ...parsed.data,
        orgId: ctx.orgId,
        status: deriveLoadStatusForWrite(null, parsed.data.driverId),
      },
      include: {
        customer: { select: { id: true, name: true } },
        driver:   { select: { id: true, firstName: true, lastName: true } },
        truck:    { select: { id: true, unitNumber: true } },
      },
    });

    await ctx.db.auditLog.create({
      data: {
        orgId: ctx.orgId,
        userId: ctx.userId,
        entityType: "Load",
        entityId: load.id,
        action: "create",
        after: load as unknown as object,
      },
    });

    return NextResponse.json(load, { status: 201 });
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
