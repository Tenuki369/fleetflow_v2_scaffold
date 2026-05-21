import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { getOrgContext } from "@/lib/auth/tenancy";

export default async function Home() {
  const { userId } = await auth();

  if (userId) {
    try {
      await getOrgContext();
      redirect("/dispatch");
    } catch (error) {
      if (error instanceof Error && error.message === "NO_MEMBERSHIP") {
        redirect("/onboarding");
      }

      throw error;
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-24">
      <h1 className="text-4xl font-bold tracking-tight">FleetFlow TMS</h1>
      <p className="mt-3 text-slate-600">
        Dispatch, compliance, and same-day pay for 3-to-50-truck carriers.
      </p>
      <div className="mt-8 flex gap-3">
        <Link
          href="/login"
          className="rounded-lg bg-slate-900 px-5 py-2.5 text-white font-medium"
        >
          Sign in
        </Link>
        <Link
          href="/signup"
          className="rounded-lg border border-slate-300 px-5 py-2.5 font-medium"
        >
          Create account
        </Link>
        <Link
          href="/v2"
          className="rounded-lg border border-blue-300 bg-blue-50 px-5 py-2.5 font-medium text-blue-700"
        >
          View V2 demo
        </Link>
      </div>
    </main>
  );
}
