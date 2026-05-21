import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

import { getDemoSession } from "@/lib/demo-access";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const demoSession = await getDemoSession();

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-4 lg:h-16 lg:flex-row lg:items-center lg:justify-between lg:py-0">
          <Link href="/dispatch" className="font-semibold tracking-tight">
            FleetFlow
          </Link>
          <nav className="flex flex-wrap items-center gap-4 text-sm text-slate-600 lg:gap-6">
            <Link href="/dispatch" className="hover:text-slate-900">
              Dispatch
            </Link>
            <Link href="/match" className="hover:text-slate-900">
              Match
            </Link>
            <Link href="/fleet" className="hover:text-slate-900">
              Fleet
            </Link>
            <Link href="/alerts" className="hover:text-slate-900">
              Alerts
            </Link>
            <Link href="/loads" className="hover:text-slate-900">
              Loads
            </Link>
            <Link href="/directory" className="hover:text-slate-900">
              Directory
            </Link>
            <Link href="/invoices" className="hover:text-slate-900">
              Invoices
            </Link>
            <Link
              href="/v2"
              className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-blue-700"
            >
              Public demo
            </Link>
            {demoSession ? (
              <>
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-emerald-700">
                  Demo . {demoSession.role.toLowerCase()}
                </span>
                <form action="/api/demo/session" method="post">
                  <input type="hidden" name="intent" value="clear" />
                  <button
                    type="submit"
                    className="rounded-full border border-slate-300 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-slate-700 hover:text-slate-900"
                  >
                    Exit demo
                  </button>
                </form>
              </>
            ) : (
              <UserButton />
            )}
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}
