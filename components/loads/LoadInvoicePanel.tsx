"use client";

import { InvoiceStatus, LoadStatus } from "@prisma/client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type InvoiceSummary = {
  id: string;
  number: string;
  status: InvoiceStatus;
  amountCents: number;
  issuedAt: string | null;
  dueAt: string | null;
};

const STATUS_STYLES: Record<InvoiceStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-700 ring-slate-200",
  SENT: "bg-blue-50 text-blue-700 ring-blue-200",
  PAID: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  OVERDUE: "bg-rose-50 text-rose-700 ring-rose-200",
  VOID: "bg-zinc-100 text-zinc-600 ring-zinc-200",
};

function formatMoney(cents: number): string {
  return (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

function formatDate(value: string | null): string {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function LoadInvoicePanel({
  loadId,
  loadStatus,
  invoice: initialInvoice,
}: {
  loadId: string;
  loadStatus: LoadStatus;
  invoice: InvoiceSummary | null;
}) {
  const router = useRouter();
  const [invoice, setInvoice] = useState(initialInvoice);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const canGenerate = loadStatus === "DELIVERED" || loadStatus === "INVOICED";

  async function handleGenerate() {
    setError(null);

    try {
      const response = await fetch(`/api/loads/${loadId}/invoice`, {
        method: "POST",
      });
      const data = (await response.json().catch(() => null)) as
        | ({ error?: string } & Partial<InvoiceSummary>)
        | null;

      if (!response.ok || !data?.id || !data.number || !data.status || typeof data.amountCents !== "number") {
        throw new Error(data?.error ?? "Unable to generate invoice");
      }

      setInvoice(data as InvoiceSummary);
      startTransition(() => router.refresh());
    } catch (invoiceError) {
      setError(invoiceError instanceof Error ? invoiceError.message : "Unable to generate invoice");
    }
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Invoice</h2>
          <p className="mt-1 text-sm text-slate-500">
            Generate receivables once the load is delivered.
          </p>
        </div>

        {invoice ? (
          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${STATUS_STYLES[invoice.status]}`}>
            {invoice.status.toLowerCase()}
          </span>
        ) : null}
      </div>

      {invoice ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Number</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{invoice.number}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Amount</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{formatMoney(invoice.amountCents)}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Issued</p>
            <p className="mt-1 text-sm text-slate-700">{formatDate(invoice.issuedAt)}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Due</p>
            <p className="mt-1 text-sm text-slate-700">{formatDate(invoice.dueAt)}</p>
          </div>
        </div>
      ) : (
        <div className="mt-6 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5">
          <p className="text-sm font-medium text-slate-700">No invoice generated</p>
          <p className="mt-1 text-sm text-slate-500">
            {canGenerate
              ? "Create a draft invoice from this load rate."
              : "Move the load to delivered before generating an invoice."}
          </p>
        </div>
      )}

      {error ? (
        <div className="mt-4 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="mt-5 flex justify-end">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={!canGenerate || isPending}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {invoice ? "Refresh invoice" : isPending ? "Generating..." : "Generate invoice"}
        </button>
      </div>
    </section>
  );
}
