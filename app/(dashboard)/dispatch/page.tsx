import Link from "next/link";
import { LoadStatus } from "@prisma/client";
import { getOrgContext } from "@/lib/auth/tenancy";
import { LoadStatusActions } from "@/components/loads/LoadStatusActions";
import { LoadStatusPill } from "@/components/loads/LoadStatusPill";

export const dynamic = "force-dynamic";

// Status order matches the operational flow a dispatcher scans top-to-bottom.
const STATUS_ORDER: LoadStatus[] = [
  LoadStatus.AVAILABLE,
  LoadStatus.ASSIGNED,
  LoadStatus.IN_TRANSIT,
  LoadStatus.DELIVERED,
  LoadStatus.INVOICED,
];

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

function formatTime(d: Date): string {
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function formatMoney(cents: number): string {
  return (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export default async function DispatchPage() {
  const ctx = await getOrgContext();
  const today = new Date();

  const loads = await ctx.db.load.findMany({
    where: {
      pickupAt: { gte: startOfDay(today), lte: endOfDay(today) },
    },
    orderBy: [{ status: "asc" }, { pickupAt: "asc" }],
    include: {
      customer: { select: { name: true } },
      driver: { select: { firstName: true, lastName: true } },
      truck: { select: { unitNumber: true } },
    },
  });

  const grouped = STATUS_ORDER.map((status) => ({
    status,
    loads: loads.filter((load) => load.status === status),
  }));

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <header className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Dispatch</h1>
          <p className="mt-1 text-sm text-slate-500">
            {today.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}{" "}
            - {loads.length} load{loads.length === 1 ? "" : "s"}
          </p>
        </div>
      </header>

      {loads.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-12 text-center">
          <h2 className="text-base font-medium text-slate-700">No loads today</h2>
          <p className="mt-1 text-sm text-slate-500">
            Loads scheduled for pickup today will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {grouped.map(({ status, loads: rows }) =>
            rows.length === 0 ? null : (
              <section key={status}>
                <div className="mb-2 flex items-center gap-3">
                  <LoadStatusPill status={status} />
                  <span className="text-sm text-slate-500">
                    {rows.length} load{rows.length === 1 ? "" : "s"}
                  </span>
                </div>
                <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                  <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-4 py-3">Ref</th>
                        <th className="px-4 py-3">Customer</th>
                        <th className="px-4 py-3">Route</th>
                        <th className="px-4 py-3">Pickup</th>
                        <th className="px-4 py-3">Driver</th>
                        <th className="px-4 py-3">Truck</th>
                        <th className="px-4 py-3 text-right">Rate</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {rows.map((load) => (
                        <tr key={load.id} className="hover:bg-slate-50">
                          <td className="p-0 font-medium text-slate-900">
                            <Link href={`/loads/${load.id}`} className="block px-4 py-3">
                              {load.referenceNumber}
                            </Link>
                          </td>
                          <td className="p-0 text-slate-700">
                            <Link href={`/loads/${load.id}`} className="block px-4 py-3">
                              {load.customer?.name ?? "-"}
                            </Link>
                          </td>
                          <td className="p-0 text-slate-700">
                            <Link href={`/loads/${load.id}`} className="block px-4 py-3">
                              {load.origin} <span className="text-slate-400">to</span>{" "}
                              {load.destination}
                            </Link>
                          </td>
                          <td className="p-0 text-slate-700">
                            <Link href={`/loads/${load.id}`} className="block px-4 py-3">
                              {formatTime(load.pickupAt)}
                            </Link>
                          </td>
                          <td className="p-0 text-slate-700">
                            <Link href={`/loads/${load.id}`} className="block px-4 py-3">
                              {load.driver
                                ? `${load.driver.firstName} ${load.driver.lastName}`
                                : "-"}
                            </Link>
                          </td>
                          <td className="p-0 text-slate-700">
                            <Link href={`/loads/${load.id}`} className="block px-4 py-3">
                              {load.truck?.unitNumber ?? "-"}
                            </Link>
                          </td>
                          <td className="p-0 text-right font-medium text-slate-900">
                            <Link href={`/loads/${load.id}`} className="block px-4 py-3">
                              {formatMoney(load.rateCents)}
                            </Link>
                          </td>
                          <td className="px-4 py-3">
                            <LoadStatusActions
                              loadId={load.id}
                              status={load.status}
                              compact
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            ),
          )}
        </div>
      )}
    </main>
  );
}
