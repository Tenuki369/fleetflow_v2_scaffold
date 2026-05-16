import { InvoiceStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getOrgContext } from "@/lib/auth/tenancy";
import { ForbiddenError, requirePermission } from "@/lib/auth/rbac";
import {
  InvoiceNotFoundError,
  InvoiceTransitionError,
  updateInvoiceStatus,
} from "@/lib/invoices";

const patchSchema = z.object({
  status: z.nativeEnum(InvoiceStatus),
});

function errorResponse(err: unknown) {
  if (err instanceof ForbiddenError) {
    return NextResponse.json({ error: err.message }, { status: 403 });
  }
  if (err instanceof InvoiceNotFoundError || err instanceof InvoiceTransitionError) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
  if (err instanceof Error && err.message === "UNAUTHENTICATED") {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }
  if (err instanceof Error && err.message === "NO_MEMBERSHIP") {
    return NextResponse.json({ error: "No org membership" }, { status: 403 });
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
    requirePermission(ctx, "update", "invoice");

    const parsed = patchSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid body", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const invoice = await updateInvoiceStatus(ctx, id, parsed.data.status);
    return NextResponse.json(invoice);
  } catch (err) {
    return errorResponse(err);
  }
}
