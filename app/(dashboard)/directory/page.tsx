import { getOrgContext } from "@/lib/auth/tenancy";
import { DirectoryWorkspace } from "@/components/directory/DirectoryWorkspace";

export const dynamic = "force-dynamic";

export default async function DirectoryPage() {
  const ctx = await getOrgContext();

  const [customers, drivers, trucks] = await Promise.all([
    ctx.db.customer.findMany({
      orderBy: [{ name: "asc" }],
      take: 200,
    }),
    ctx.db.driver.findMany({
      orderBy: [{ active: "desc" }, { lastName: "asc" }, { firstName: "asc" }],
      include: {
        truck: {
          select: { id: true, unitNumber: true },
        },
      },
      take: 200,
    }),
    ctx.db.truck.findMany({
      orderBy: [{ active: "desc" }, { unitNumber: "asc" }],
      include: {
        drivers: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
      take: 200,
    }),
  ]);

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900">Directory</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage customers, drivers, and trucks that power dispatch.
        </p>
      </header>

      <DirectoryWorkspace
        customers={customers}
        drivers={drivers}
        trucks={trucks}
      />
    </main>
  );
}
