"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type Customer = {
  id: string;
  name: string;
  contact: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
};

type Driver = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  licenseNumber: string | null;
  active: boolean;
  truck: { id: string; unitNumber: string } | null;
};

type Truck = {
  id: string;
  unitNumber: string;
  vin: string | null;
  plate: string | null;
  make: string | null;
  model: string | null;
  year: number | null;
  active: boolean;
  drivers: Array<{ id: string; firstName: string; lastName: string }>;
};

function sectionHeading(title: string, subtitle: string) {
  return (
    <div>
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
    </div>
  );
}

async function postJson(url: string, body: Record<string, unknown>) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.error ?? "Request failed");
  }
}

export function DirectoryWorkspace({
  customers,
  drivers,
  trucks,
}: {
  customers: Customer[];
  drivers: Driver[];
  trucks: Truck[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [customerError, setCustomerError] = useState<string | null>(null);
  const [driverError, setDriverError] = useState<string | null>(null);
  const [truckError, setTruckError] = useState<string | null>(null);

  const activeDriverCount = useMemo(
    () => drivers.filter((driver) => driver.active).length,
    [drivers],
  );
  const activeTruckCount = useMemo(
    () => trucks.filter((truck) => truck.active).length,
    [trucks],
  );

  function refresh() {
    startTransition(() => {
      router.refresh();
    });
  }

  async function handleCustomerSubmit(formData: FormData) {
    setCustomerError(null);
    try {
      await postJson("/api/customers", {
        name: formData.get("name"),
        contact: formData.get("contact"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        address: formData.get("address"),
      });
      refresh();
    } catch (error) {
      setCustomerError(error instanceof Error ? error.message : "Unable to create customer");
    }
  }

  async function handleDriverSubmit(formData: FormData) {
    setDriverError(null);
    try {
      await postJson("/api/drivers", {
        firstName: formData.get("firstName"),
        lastName: formData.get("lastName"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        licenseNumber: formData.get("licenseNumber"),
        truckId: formData.get("truckId"),
      });
      refresh();
    } catch (error) {
      setDriverError(error instanceof Error ? error.message : "Unable to create driver");
    }
  }

  async function handleTruckSubmit(formData: FormData) {
    setTruckError(null);
    try {
      await postJson("/api/trucks", {
        unitNumber: formData.get("unitNumber"),
        plate: formData.get("plate"),
        vin: formData.get("vin"),
        make: formData.get("make"),
        model: formData.get("model"),
        year: formData.get("year"),
      });
      refresh();
    } catch (error) {
      setTruckError(error instanceof Error ? error.message : "Unable to create truck");
    }
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Customers
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{customers.length}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Active drivers
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{activeDriverCount}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Active trucks
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{activeTruckCount}</p>
        </div>
      </div>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-5 py-4">
            {sectionHeading("Customers", "Shippers, brokers, and billing contacts.")}
          </div>
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customers.map((customer) => (
                <tr key={customer.id}>
                  <td className="px-4 py-3 font-medium text-slate-900">{customer.name}</td>
                  <td className="px-4 py-3 text-slate-700">{customer.contact ?? "-"}</td>
                  <td className="px-4 py-3 text-slate-700">{customer.email ?? "-"}</td>
                  <td className="px-4 py-3 text-slate-700">{customer.phone ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <form
          action={handleCustomerSubmit}
          className="rounded-lg border border-slate-200 bg-white p-5"
        >
          {sectionHeading("Add customer", "Create a bill-to record for future loads.")}
          <div className="mt-4 grid gap-3">
            <input name="name" placeholder="Company name" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
            <input name="contact" placeholder="Contact name" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
            <input name="email" type="email" placeholder="billing@company.com" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
            <input name="phone" placeholder="Phone" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
            <textarea name="address" placeholder="Address" rows={3} className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
          </div>
          {customerError ? <p className="mt-3 text-sm text-rose-600">{customerError}</p> : null}
          <button
            type="submit"
            disabled={isPending}
            className="mt-4 inline-flex rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            Add customer
          </button>
        </form>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-5 py-4">
            {sectionHeading("Drivers", "Driver roster and assigned equipment.")}
          </div>
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Truck</th>
                <th className="px-4 py-3">License</th>
                <th className="px-4 py-3">Phone</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {drivers.map((driver) => (
                <tr key={driver.id}>
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {driver.firstName} {driver.lastName}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{driver.truck?.unitNumber ?? "-"}</td>
                  <td className="px-4 py-3 text-slate-700">{driver.licenseNumber ?? "-"}</td>
                  <td className="px-4 py-3 text-slate-700">{driver.phone ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <form
          action={handleDriverSubmit}
          className="rounded-lg border border-slate-200 bg-white p-5"
        >
          {sectionHeading("Add driver", "Create a dispatchable driver record.")}
          <div className="mt-4 grid gap-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <input name="firstName" placeholder="First name" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
              <input name="lastName" placeholder="Last name" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
            </div>
            <input name="email" type="email" placeholder="driver@fleetflow.test" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
            <input name="phone" placeholder="Phone" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
            <input name="licenseNumber" placeholder="License number" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
            <select name="truckId" className="rounded-md border border-slate-300 px-3 py-2 text-sm">
              <option value="">No truck assigned</option>
              {trucks.map((truck) => (
                <option key={truck.id} value={truck.id}>
                  {truck.unitNumber}
                </option>
              ))}
            </select>
          </div>
          {driverError ? <p className="mt-3 text-sm text-rose-600">{driverError}</p> : null}
          <button
            type="submit"
            disabled={isPending}
            className="mt-4 inline-flex rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            Add driver
          </button>
        </form>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-5 py-4">
            {sectionHeading("Trucks", "Power units available for assignment.")}
          </div>
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Unit</th>
                <th className="px-4 py-3">Plate</th>
                <th className="px-4 py-3">Vehicle</th>
                <th className="px-4 py-3">Assigned driver</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {trucks.map((truck) => (
                <tr key={truck.id}>
                  <td className="px-4 py-3 font-medium text-slate-900">{truck.unitNumber}</td>
                  <td className="px-4 py-3 text-slate-700">{truck.plate ?? "-"}</td>
                  <td className="px-4 py-3 text-slate-700">
                    {[truck.year, truck.make, truck.model].filter(Boolean).join(" ") || "-"}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {truck.drivers[0]
                      ? `${truck.drivers[0].firstName} ${truck.drivers[0].lastName}`
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <form
          action={handleTruckSubmit}
          className="rounded-lg border border-slate-200 bg-white p-5"
        >
          {sectionHeading("Add truck", "Register equipment before dispatch assignment.")}
          <div className="mt-4 grid gap-3">
            <input name="unitNumber" placeholder="Unit number" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
            <div className="grid gap-3 sm:grid-cols-2">
              <input name="plate" placeholder="Plate" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
              <input name="vin" placeholder="VIN" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <input name="year" placeholder="Year" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
              <input name="make" placeholder="Make" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
              <input name="model" placeholder="Model" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
            </div>
          </div>
          {truckError ? <p className="mt-3 text-sm text-rose-600">{truckError}</p> : null}
          <button
            type="submit"
            disabled={isPending}
            className="mt-4 inline-flex rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            Add truck
          </button>
        </form>
      </section>
    </div>
  );
}
