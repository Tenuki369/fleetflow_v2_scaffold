import { NextRequest, NextResponse } from "next/server";
import { getOrgContext } from "@/lib/auth/tenancy";
import { ForbiddenError, requirePermission } from "@/lib/auth/rbac";
import {
  generateInvoiceForLoad,
  getInvoiceForLoad,
  LoadNotFoundError,
  LoadNotInvoiceableError,
} from "@/lib/invoices";

function errorResponse(err: unknown) {
  if (err instanceof ForbiddenError) {
    return NextResponse.json({ error: err.message }, { status: 403 });
  }
  if (err instanceof LoadNotFoundError || err instanceof LoadNotInvoiceableError) {
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

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const ctx = await getOrgContext();
    requirePermission(ctx, "read", "invoice");

    const invoice = await getInvoiceForLoad(ctx, id);

    return NextResponse.json(invoice);
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const ctx = await getOrgContext();
    requirePermission(ctx, "create", "invoice");

    const result = await generateInvoiceForLoad(ctx, id);

    return NextResponse.json(result.invoice, { status: result.created ? 201 : 200 });
  } catch (err) {
    return errorResponse(err);
  }
}
