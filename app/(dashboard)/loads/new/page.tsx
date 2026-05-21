import { LoadEditor } from "@/components/loads/LoadEditor";
import { getOrgContext } from "@/lib/auth/tenancy";

export const dynamic = "force-dynamic";

function toDatetimeLocal(date: Date): string {
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

export default async function NewLoadPage() {
  const ctx = await getOrgContext();
  const [customers, drivers, trucks] = await Promise.all([
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

  const pickupAt = new Date();
  pickupAt.setMinutes(0, 0, 0);
  pickupAt.setHours(pickupAt.getHours() + 1);
  const deliverBy = new Date(pickupAt);
  deliverBy.setDate(deliverBy.getDate() + 1);

  return (
    <main className="mx-auto max-w-5xl px-6 py-8">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900">Create load</h1>
        <p className="mt-1 text-sm text-slate-500">
          Add a shipment, assign equipment, and set the dispatch timeline.
        </p>
      </header>

      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <LoadEditor
          mode="create"
          defaults={{
            referenceNumber: "",
            customerId: "",
            driverId: "",
            truckId: "",
            origin: "",
            destination: "",
            pickupAt: toDatetimeLocal(pickupAt),
            deliverBy: toDatetimeLocal(deliverBy),
            rateCents: "",
            miles: "",
            notes: "",
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
