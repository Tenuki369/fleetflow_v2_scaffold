"use client";

import { LoadStatus } from "@prisma/client";

interface Props {
  status: LoadStatus;
  className?: string;
}

const STYLES: Record<LoadStatus, { label: string; classes: string }> = {
  AVAILABLE:  { label: "Available",  classes: "bg-slate-100 text-slate-700 ring-slate-200" },
  ASSIGNED:   { label: "Assigned",   classes: "bg-blue-50 text-blue-700 ring-blue-200" },
  IN_TRANSIT: { label: "In transit", classes: "bg-amber-50 text-amber-800 ring-amber-200" },
  DELIVERED:  { label: "Delivered",  classes: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  INVOICED:   { label: "Invoiced",   classes: "bg-violet-50 text-violet-700 ring-violet-200" },
};

export function LoadStatusPill({ status, className = "" }: Props) {
  const style = STYLES[status];
  return (
    <span
      role="status"
      aria-label={`Load status: ${style.label}`}
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${style.classes} ${className}`}
    >
      {style.label}
    </span>
  );
}
