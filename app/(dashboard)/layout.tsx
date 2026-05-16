import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 h-14 flex items-center justify-between">
          <Link href="/dispatch" className="font-semibold tracking-tight">
            FleetFlow
          </Link>
          <nav className="flex items-center gap-6 text-sm text-slate-600">
            <Link href="/dispatch" className="hover:text-slate-900">Dispatch</Link>
            <Link href="/loads" className="hover:text-slate-900">Loads</Link>
            <Link href="/invoices" className="hover:text-slate-900">Invoices</Link>
            <UserButton />
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}
