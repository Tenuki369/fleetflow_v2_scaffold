"use client";

import { LoadStatus } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

interface Props {
  loadId: string;
  status: LoadStatus;
  compact?: boolean;
}

const TRANSITIONS: Record<LoadStatus, { status: LoadStatus; label: string }[]> = {
  AVAILABLE: [{ status: LoadStatus.ASSIGNED, label: "Assign" }],
  ASSIGNED: [
    { status: LoadStatus.IN_TRANSIT, label: "Start" },
    { status: LoadStatus.AVAILABLE, label: "Unassign" },
  ],
  IN_TRANSIT: [
    { status: LoadStatus.DELIVERED, label: "Deliver" },
    { status: LoadStatus.ASSIGNED, label: "Back" },
  ],
  DELIVERED: [
    { status: LoadStatus.INVOICED, label: "Invoice" },
    { status: LoadStatus.IN_TRANSIT, label: "Reopen" },
  ],
  INVOICED: [],
};

export function LoadStatusActions({ loadId, status, compact = false }: Props) {
  const router = useRouter();
  const [pendingStatus, setPendingStatus] = useState<LoadStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, startTransition] = useTransition();
  const actions = TRANSITIONS[status];

  if (actions.length === 0) {
    return <span className="text-xs text-slate-400">No actions</span>;
  }

  async function updateStatus(nextStatus: LoadStatus) {
    setError(null);
    setPendingStatus(nextStatus);

    try {
      const response = await fetch(`/api/loads/${loadId}/status`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error ?? "Could not update status");
      }

      startTransition(() => {
        router.refresh();
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update status");
    } finally {
      setPendingStatus(null);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className={`flex flex-wrap justify-end gap-1.5 ${compact ? "max-w-36" : ""}`}>
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
      {error ? <p className="max-w-44 text-right text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
