"use client";

import { InvoiceStatus } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

const ACTIONS: Record<InvoiceStatus, Array<{ status: InvoiceStatus; label: string }>> = {
  DRAFT: [
    { status: InvoiceStatus.SENT, label: "Send" },
    { status: InvoiceStatus.VOID, label: "Void" },
  ],
  SENT: [
    { status: InvoiceStatus.PAID, label: "Paid" },
    { status: InvoiceStatus.OVERDUE, label: "Overdue" },
    { status: InvoiceStatus.VOID, label: "Void" },
  ],
  OVERDUE: [
    { status: InvoiceStatus.PAID, label: "Paid" },
    { status: InvoiceStatus.VOID, label: "Void" },
  ],
  PAID: [],
  VOID: [],
};

export function InvoiceStatusActions({
  invoiceId,
  status,
  align = "right",
}: {
  invoiceId: string;
  status: InvoiceStatus;
  align?: "left" | "right";
}) {
  const router = useRouter();
  const [pendingStatus, setPendingStatus] = useState<InvoiceStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, startTransition] = useTransition();
  const actions = ACTIONS[status];

  if (actions.length === 0) {
    return <span className="text-xs text-slate-400">No actions</span>;
  }

  async function updateStatus(nextStatus: InvoiceStatus) {
    setError(null);
    setPendingStatus(nextStatus);

    try {
      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.error ?? "Could not update invoice");
      }

      startTransition(() => router.refresh());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update invoice");
    } finally {
      setPendingStatus(null);
    }
  }

  return (
    <div className={`flex flex-col gap-1 ${align === "right" ? "items-end" : "items-start"}`}>
      <div className={`flex flex-wrap gap-1.5 ${align === "right" ? "justify-end" : "justify-start"}`}>
        {actions.map((action) => {
          const busy = pendingStatus === action.status || isRefreshing;
          return (
            <button
              key={action.status}
              type="button"
              onClick={() => updateStatus(action.status)}
              disabled={busy}
              className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-50 disabled:cursor-wait disabled:opacity-60"
            >
              {busy && pendingStatus === action.status ? "Saving" : action.label}
            </button>
          );
        })}
      </div>
      {error ? <p className="max-w-48 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
