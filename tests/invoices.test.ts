import { describe, expect, it } from "vitest";

import { InvoiceStatus } from "@prisma/client";
import { canTransitionInvoiceStatus, invoiceNumberBase } from "../lib/invoices";

describe("invoiceNumberBase", () => {
  it("normalizes load references into invoice numbers", () => {
    expect(invoiceNumberBase("ff-1001")).toBe("INV-FF-1001");
    expect(invoiceNumberBase("  tx load / 42  ")).toBe("INV-TX-LOAD-42");
    expect(invoiceNumberBase("Load_ABC.#7")).toBe("INV-LOAD-ABC-7");
  });

  it("falls back when the reference contains no letters or numbers", () => {
    expect(invoiceNumberBase(" --- ")).toBe("INV-LOAD");
  });

  it("limits the sanitized reference segment to 48 characters", () => {
    const base = invoiceNumberBase("abcdefghijklmnopqrstuvwxyz-0123456789-extra-long-ref");

    expect(base).toBe("INV-ABCDEFGHIJKLMNOPQRSTUVWXYZ-0123456789-EXTRA-LONG");
    expect(base.replace("INV-", "")).toHaveLength(48);
  });
});

describe("canTransitionInvoiceStatus", () => {
  it("allows the normal accounting lifecycle", () => {
    expect(canTransitionInvoiceStatus(InvoiceStatus.DRAFT, InvoiceStatus.SENT)).toBe(true);
    expect(canTransitionInvoiceStatus(InvoiceStatus.SENT, InvoiceStatus.PAID)).toBe(true);
    expect(canTransitionInvoiceStatus(InvoiceStatus.SENT, InvoiceStatus.OVERDUE)).toBe(true);
    expect(canTransitionInvoiceStatus(InvoiceStatus.OVERDUE, InvoiceStatus.PAID)).toBe(true);
  });

  it("allows voiding open invoices but not paid invoices", () => {
    expect(canTransitionInvoiceStatus(InvoiceStatus.DRAFT, InvoiceStatus.VOID)).toBe(true);
    expect(canTransitionInvoiceStatus(InvoiceStatus.SENT, InvoiceStatus.VOID)).toBe(true);
    expect(canTransitionInvoiceStatus(InvoiceStatus.OVERDUE, InvoiceStatus.VOID)).toBe(true);
    expect(canTransitionInvoiceStatus(InvoiceStatus.PAID, InvoiceStatus.VOID)).toBe(false);
  });

  it("blocks reopening terminal states", () => {
    expect(canTransitionInvoiceStatus(InvoiceStatus.PAID, InvoiceStatus.SENT)).toBe(false);
    expect(canTransitionInvoiceStatus(InvoiceStatus.VOID, InvoiceStatus.SENT)).toBe(false);
  });
});
