import { notFound } from "next/navigation";
import { LoadEditor } from "@/components/loads/LoadEditor";
import { getOrgContext } from "@/lib/auth/tenancy";

export const dynamic = "force-dynamic";

function toDatetimeLocal(date: Date): string {
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

export default async function EditLoadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ctx = await getOrgContext();

  const [load, customers, drivers, trucks] = await Promise.all([
    ctx.db.load.findUnique({
      where: { id },
      select: {
        id: true,
        referenceNumber: true,
        customerId: true,
        driverId: true,
        truckId: true,
        origin: true,
        destination: true,
        pickupAt: true,
        deliverBy: true,
        rateCents: true,
        miles: true,
        notes: true,
      },
    }),
    ctx.db.customer.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
      take: 100,
    }),
    ctx.db.driver.findMany({
      where: { active: true },
      orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
      select: { id: true, firstName: true, lastName: true },
      take: 100,
    }),
    ctx.db.truck.findMany({
      where: { active: true },
      orderBy: { unitNumber: "asc" },
      select: { id: true, unitNumber: true },
      take: 100,
    }),
  ]);

  if (!load) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-8">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900">Edit load</h1>
        <p className="mt-1 text-sm text-slate-500">
          {load.referenceNumber} - update route, assignment, and timing.
        </p>
      </header>

      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <LoadEditor
          mode="edit"
          loadId={load.id}
          defaults={{
            referenceNumber: load.referenceNumber,
            customerId: load.customerId ?? "",
            driverId: load.driverId ?? "",
            truckId: load.truckId ?? "",
            origin: load.origin,
            destination: load.destination,
            pickupAt: toDatetimeLocal(load.pickupAt),
            deliverBy: toDatetimeLocal(load.deliverBy),
            rateCents: String(load.rateCents),
            miles: load.miles ? String(load.miles) : "",
            notes: load.notes ?? "",
          }}
          customers={customers.map((customer) => ({
            id: customer.id,
            label: customer.name,
          }))}
          drivers={drivers.map((driver) => ({
            id: driver.id,
            label: `${driver.firstName} ${driver.lastName}`,
          }))}
          trucks={trucks.map((truck) => ({
            id: truck.id,
            label: truck.unitNumber,
          }))}
        />
      </div>
    </main>
  );
}
