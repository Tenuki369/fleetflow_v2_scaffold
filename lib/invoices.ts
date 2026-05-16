import { InvoiceStatus, LoadStatus } from "@prisma/client";
import type { Invoice } from "@prisma/client";
import type { OrgContext } from "@/lib/auth/tenancy";

const ALLOWED_INVOICE_LOAD_STATUSES = new Set<LoadStatus>([
  LoadStatus.DELIVERED,
  LoadStatus.INVOICED,
]);

export class LoadNotFoundError extends Error {
  status = 404;

  constructor() {
    super("Load not found");
    this.name = "LoadNotFoundError";
  }
}

export class LoadNotInvoiceableError extends Error {
  status = 409;

  constructor(status: LoadStatus) {
    super(`Cannot invoice load with status ${status}`);
    this.name = "LoadNotInvoiceableError";
  }
}

export interface InvoiceGenerationResult {
  invoice: Invoice;
  created: boolean;
}

function isUniqueConstraintError(err: unknown): boolean {
  return (
    !!err &&
    typeof err === "object" &&
    "code" in err &&
    (err as { code: string }).code === "P2002"
  );
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function invoiceNumberBase(referenceNumber: string): string {
  const sanitized = referenceNumber
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

  return `INV-${sanitized || "LOAD"}`;
}

async function nextInvoiceNumber(ctx: OrgContext, referenceNumber: string): Promise<string> {
  const base = invoiceNumberBase(referenceNumber);

  for (let attempt = 0; attempt < 100; attempt += 1) {
    const number = attempt === 0 ? base : `${base}-${attempt + 1}`;
    const existing = await ctx.db.invoice.findFirst({
      where: { number },
      select: { id: true },
    });

    if (!existing) return number;
  }

  throw new Error("Unable to generate unique invoice number");
}

export async function getInvoiceForLoad(
  ctx: OrgContext,
  loadId: string,
): Promise<Invoice | null> {
  const load = await ctx.db.load.findUnique({
    where: { id: loadId },
    select: { id: true },
  });

  if (!load) throw new LoadNotFoundError();

  return ctx.db.invoice.findFirst({ where: { loadId } });
}

export async function generateInvoiceForLoad(
  ctx: OrgContext,
  loadId: string,
): Promise<InvoiceGenerationResult> {
  const load = await ctx.db.load.findUnique({
    where: { id: loadId },
    include: { invoice: true },
  });

  if (!load) throw new LoadNotFoundError();
  if (load.invoice) return { invoice: load.invoice, created: false };
  if (!ALLOWED_INVOICE_LOAD_STATUSES.has(load.status)) {
    throw new LoadNotInvoiceableError(load.status);
  }

  const issuedAt = new Date();
  const dueAt = addDays(issuedAt, 30);

  for (let attempt = 0; attempt < 10; attempt += 1) {
    try {
      const invoice = await ctx.db.invoice.create({
        data: {
          orgId: ctx.orgId,
          loadId: load.id,
          number: await nextInvoiceNumber(ctx, load.referenceNumber),
          amountCents: load.rateCents,
          issuedAt,
          dueAt,
          status: InvoiceStatus.DRAFT,
        },
      });

      await ctx.db.auditLog.create({
        data: {
          orgId: ctx.orgId,
          userId: ctx.userId,
          entityType: "Invoice",
          entityId: invoice.id,
          action: "create",
          after: invoice as unknown as object,
        },
      });

      return { invoice, created: true };
    } catch (err) {
      if (!isUniqueConstraintError(err)) throw err;

      const existing = await ctx.db.invoice.findFirst({ where: { loadId } });
      if (existing) return { invoice: existing, created: false };
    }
  }

  throw new Error("Unable to create invoice");
}
