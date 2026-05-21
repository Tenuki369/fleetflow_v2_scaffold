import { InvoiceStatus } from "@prisma/client";
import { getOrgContext } from "@/lib/auth/tenancy";
import { InvoiceStatusActions } from "@/components/invoices/InvoiceStatusActions";

export const dynamic = "force-dynamic";

const STATUS_STYLES: Record<InvoiceStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-700 ring-slate-200",
  SENT: "bg-blue-50 text-blue-700 ring-blue-200",
  PAID: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  OVERDUE: "bg-rose-50 text-rose-700 ring-rose-200",
  VOID: "bg-zinc-100 text-zinc-600 ring-zinc-200",
};

function formatDate(d: Date | null): string {
  if (!d) return "-";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatMoney(cents: number): string {
  return (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export default async function InvoicesPage() {
  const ctx = await getOrgContext();
  const invoices = await ctx.db.invoice.findMany({
    orderBy: [{ createdAt: "desc" }],
    include: {
      load: {
        select: {
          referenceNumber: true,
          origin: true,
          destination: true,
          customer: { select: { name: true } },
        },
      },
    },
    take: 100,
  });

  const openAmount = invoices
    .filter((invoice) => invoice.status === "SENT" || invoice.status === "OVERDUE")
    .reduce((sum, invoice) => sum + invoice.amountCents, 0);
  const paidAmount = invoices
    .filter((invoice) => invoice.status === "PAID")
    .reduce((sum, invoice) => sum + invoice.amountCents, 0);

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900">Invoices</h1>
        <p className="mt-1 text-sm text-slate-500">
          Billing status for delivered and invoiced work.
        </p>
      </header>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Total invoices
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {invoices.length}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Open receivables
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {formatMoney(openAmount)}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Paid
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {formatMoney(paidAmount)}
          </p>
        </div>
      </div>

      {invoices.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-12 text-center">
          <h2 className="text-base font-medium text-slate-700">
            No invoices yet
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Invoices generated from delivered loads will appear here.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Invoice</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Load</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Route</th>
                <th className="px-4 py-3">Due</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {invoice.number}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${STATUS_STYLES[invoice.status]}`}
                    >
                      {invoice.status.toLowerCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {invoice.load.referenceNumber}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {invoice.load.customer?.name ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {invoice.load.origin} <span className="text-slate-400">to</span>{" "}
                    {invoice.load.destination}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {formatDate(invoice.dueAt)}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-slate-900">
                    {formatMoney(invoice.amountCents)}
                  </td>
                  <td className="px-4 py-3">
                    <InvoiceStatusActions invoiceId={invoice.id} status={invoice.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
