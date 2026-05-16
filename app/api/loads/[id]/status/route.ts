import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { LoadStatus } from "@prisma/client";
import { getOrgContext } from "@/lib/auth/tenancy";
import { requirePermission, ForbiddenError } from "@/lib/auth/rbac";
import { canUpdateAssignedLoadAsDriver } from "@/lib/drivers";

// State machine. Forward transitions follow the lifecycle; back-transitions
// exist for legitimate dispatcher corrections but you can't un-invoice a load.
const TRANSITIONS: Record<LoadStatus, LoadStatus[]> = {
  AVAILABLE:  [LoadStatus.ASSIGNED],
  ASSIGNED:   [LoadStatus.IN_TRANSIT, LoadStatus.AVAILABLE],
  IN_TRANSIT: [LoadStatus.DELIVERED, LoadStatus.ASSIGNED],
  DELIVERED:  [LoadStatus.INVOICED, LoadStatus.IN_TRANSIT],
  INVOICED:   [],
};

const bodySchema = z.object({
  status: z.nativeEnum(LoadStatus),
  reason: z.string().max(500).optional(),
});

async function emitWebhook(orgId: string, payload: Record<string, unknown>): Promise<void> {
  const url = process.env.WEBHOOK_URL;
  if (!url) return;
  try {
    await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-fleetflow-org": orgId,
        "x-fleetflow-event": "load.status_changed",
      },
      body: JSON.stringify(payload),
      // Fire-and-forget; a real deployment should push to a queue instead.
      signal: AbortSignal.timeout(2000),
    });
  } catch {
    // Swallow — webhook delivery failures must not fail the user's transition.
  }
}

function errorResponse(err: unknown) {
  if (err instanceof ForbiddenError) {
    return NextResponse.json({ error: err.message }, { status: 403 });
  }
  if (err instanceof Error && err.message === "UNAUTHENTICATED") {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }
  return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const ctx = await getOrgContext();
    requirePermission(ctx, "update", "load");

    const parsed = bodySchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid body", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const current = await ctx.db.load.findUnique({
      where: { id },
      include: {
        driver: { select: { userId: true } },
      },
    });
    if (!current) {
      return NextResponse.json({ error: "Load not found" }, { status: 404 });
    }

    // Drivers can only move loads assigned to their linked driver profile.
    if (ctx.role === "DRIVER") {
      if (
        !canUpdateAssignedLoadAsDriver({
          role: ctx.role,
          currentUserId: ctx.userId,
          assignedDriverUserId: current.driver?.userId,
        })
      ) {
        return NextResponse.json({ error: "Not your load" }, { status: 403 });
      }
    }

    const allowed = TRANSITIONS[current.status as LoadStatus];
    if (!allowed.includes(parsed.data.status)) {
      return NextResponse.json(
        {
          error: "Illegal status transition",
          from: current.status,
          to: parsed.data.status,
          allowed,
        },
        { status: 409 },
      );
    }

    const updated = await ctx.db.load.update({
      where: { id },
      data: { status: parsed.data.status },
    });

    await ctx.db.auditLog.create({
      data: {
        orgId: ctx.orgId,
        userId: ctx.userId,
        entityType: "Load",
        entityId: updated.id,
        action: `status:${current.status}->${updated.status}`,
        before: { status: current.status },
        after: { status: updated.status, reason: parsed.data.reason ?? null },
      },
    });

    await emitWebhook(ctx.orgId, {
      loadId: updated.id,
      from: current.status,
      to: updated.status,
      at: new Date().toISOString(),
      userId: ctx.userId,
    });

    return NextResponse.json(updated);
  } catch (err) {
    return errorResponse(err);
  }
}
