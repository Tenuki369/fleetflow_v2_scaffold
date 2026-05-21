"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type Option = {
  id: string;
  label: string;
};

type LoadValues = {
  referenceNumber: string;
  customerId: string;
  driverId: string;
  truckId: string;
  origin: string;
  destination: string;
  pickupAt: string;
  deliverBy: string;
  rateCents: string;
  miles: string;
  notes: string;
};

type Props = {
  mode: "create" | "edit";
  loadId?: string;
  defaults: LoadValues;
  customers: Option[];
  drivers: Option[];
  trucks: Option[];
};

function inputClassName() {
  return "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200";
}

function normalizePayload(values: LoadValues) {
  return {
    referenceNumber: values.referenceNumber.trim(),
    customerId: values.customerId || undefined,
    driverId: values.driverId || undefined,
    truckId: values.truckId || undefined,
    origin: values.origin.trim(),
    destination: values.destination.trim(),
    pickupAt: new Date(values.pickupAt).toISOString(),
    deliverBy: new Date(values.deliverBy).toISOString(),
    rateCents: Number(values.rateCents),
    miles: values.miles ? Number(values.miles) : undefined,
    notes: values.notes.trim() || undefined,
  };
}

export function LoadEditor({ mode, loadId, defaults, customers, drivers, trucks }: Props) {
  const router = useRouter();
  const [values, setValues] = useState<LoadValues>(defaults);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function update<K extends keyof LoadValues>(key: K, value: LoadValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const endpoint = mode === "create" ? "/api/loads" : `/api/loads/${loadId}`;
    const method = mode === "create" ? "POST" : "PATCH";

    try {
      const response = await fetch(endpoint, {
        method,
        headers: { "content-type": "application/json" },
        body: JSON.stringify(normalizePayload(values)),
      });

      const data = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;

      if (!response.ok) {
        setError(data?.error ?? "Unable to save load");
        return;
      }

      startTransition(() => {
        router.push("/loads");
        router.refresh();
      });
    } catch {
      setError("Unable to save load");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Reference number</span>
          <input
            value={values.referenceNumber}
            onChange={(event) => update("referenceNumber", event.target.value)}
            className={inputClassName()}
            required
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Customer</span>
          <select
            value={values.customerId}
            onChange={(event) => update("customerId", event.target.value)}
            className={inputClassName()}
          >
            <option value="">Unassigned</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.label}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Driver</span>
          <select
            value={values.driverId}
            onChange={(event) => update("driverId", event.target.value)}
            className={inputClassName()}
          >
            <option value="">Unassigned</option>
            {drivers.map((driver) => (
              <option key={driver.id} value={driver.id}>
                {driver.label}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Truck</span>
          <select
            value={values.truckId}
            onChange={(event) => update("truckId", event.target.value)}
            className={inputClassName()}
          >
            <option value="">Unassigned</option>
            {trucks.map((truck) => (
              <option key={truck.id} value={truck.id}>
                {truck.label}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Pickup</span>
          <input
            type="datetime-local"
            value={values.pickupAt}
            onChange={(event) => update("pickupAt", event.target.value)}
            className={inputClassName()}
            required
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Deliver by</span>
          <input
            type="datetime-local"
            value={values.deliverBy}
            onChange={(event) => update("deliverBy", event.target.value)}
            className={inputClassName()}
            required
          />
        </label>

        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-medium text-slate-700">Origin</span>
          <input
            value={values.origin}
            onChange={(event) => update("origin", event.target.value)}
            className={inputClassName()}
            required
          />
        </label>

        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-medium text-slate-700">Destination</span>
          <input
            value={values.destination}
            onChange={(event) => update("destination", event.target.value)}
            className={inputClassName()}
            required
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Rate cents</span>
          <input
            type="number"
            min="0"
            value={values.rateCents}
            onChange={(event) => update("rateCents", event.target.value)}
            className={inputClassName()}
            required
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Miles</span>
          <input
            type="number"
            min="0"
            value={values.miles}
            onChange={(event) => update("miles", event.target.value)}
            className={inputClassName()}
          />
        </label>
      </div>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-slate-700">Notes</span>
        <textarea
          value={values.notes}
          onChange={(event) => update("notes", event.target.value)}
          className={`${inputClassName()} min-h-28`}
        />
      </label>

      {error ? (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="flex items-center justify-between gap-3 border-t border-slate-200 pt-4">
        <button
          type="button"
          onClick={() => router.push("/loads")}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Saving..." : mode === "create" ? "Create load" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
