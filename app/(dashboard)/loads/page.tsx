import Link from "next/link";
import { LoadStatus } from "@prisma/client";
import { getOrgContext } from "@/lib/auth/tenancy";
import { LoadStatusActions } from "@/components/loads/LoadStatusActions";
import { LoadStatusPill } from "@/components/loads/LoadStatusPill";

export const dynamic = "force-dynamic";

const STATUS_ORDER: LoadStatus[] = [
  LoadStatus.AVAILABLE,
  LoadStatus.ASSIGNED,
  LoadStatus.IN_TRANSIT,
  LoadStatus.DELIVERED,
  LoadStatus.INVOICED,
];

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatMoney(cents: number): string {
  return (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export default async function LoadsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const ctx = await getOrgContext();
  const { status } = await searchParams;
  const selectedStatus = STATUS_ORDER.includes(status as LoadStatus)
    ? (status as LoadStatus)
    : undefined;

  const [loads, counts] = await Promise.all([
    ctx.db.load.findMany({
      where: selectedStatus ? { status: selectedStatus } : {},
      orderBy: [{ pickupAt: "desc" }, { createdAt: "desc" }],
      include: {
        customer: { select: { name: true } },
        driver: { select: { firstName: true, lastName: true } },
        truck: { select: { unitNumber: true } },
      },
      take: 100,
    }),
    Promise.all(
      STATUS_ORDER.map(async (currentStatus) => ({
        status: currentStatus,
        count: await ctx.db.load.count({ where: { status: currentStatus } }),
      })),
    ),
  ]);
  const totalRevenue = loads.reduce((sum, load) => sum + load.rateCents, 0);

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Loads</h1>
          <p className="mt-1 text-sm text-slate-500">
            {loads.length} load{loads.length === 1 ? "" : "s"} in view
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Visible revenue
          </p>
          <p className="mt-1 text-xl font-semibold text-slate-900">
            {formatMoney(totalRevenue)}
          </p>
          <Link
            href="/loads/new"
            className="mt-3 inline-flex rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white"
          >
            Create load
          </Link>
        </div>
      </header>

      <div className="mb-6 flex flex-wrap gap-2">
        <Link
          href="/loads"
          className={`rounded-md px-3 py-2 text-sm ring-1 ring-inset ${
            selectedStatus
              ? "bg-white text-slate-600 ring-slate-200 hover:text-slate-900"
              : "bg-slate-900 text-white ring-slate-900"
          }`}
        >
          All
        </Link>
        {counts.map(({ status: currentStatus, count }) => (
          <Link
            key={currentStatus}
            href={`/loads?status=${currentStatus}`}
            className={`rounded-md px-3 py-2 text-sm ring-1 ring-inset ${
              selectedStatus === currentStatus
                ? "bg-slate-900 text-white ring-slate-900"
                : "bg-white text-slate-600 ring-slate-200 hover:text-slate-900"
            }`}
          >
            {currentStatus.replace("_", " ").toLowerCase()} - {count}
          </Link>
        ))}
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Ref</th>
              <th className="px-4 py-3">Status</th>
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
            {loads.map((load) => (
              <tr key={load.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">
                  <Link href={`/loads/${load.id}`} className="hover:underline">
                    {load.referenceNumber}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <LoadStatusPill status={load.status} />
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {load.customer?.name ?? "-"}
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {load.origin} <span className="text-slate-400">to</span>{" "}
                  {load.destination}
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {formatDate(load.pickupAt)}
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {load.driver
                    ? `${load.driver.firstName} ${load.driver.lastName}`
                    : "-"}
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {load.truck?.unitNumber ?? "-"}
                </td>
                <td className="px-4 py-3 text-right font-medium text-slate-900">
                  {formatMoney(load.rateCents)}
                </td>
                <td className="px-4 py-3">
                  <LoadStatusActions loadId={load.id} status={load.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
