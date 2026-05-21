import Link from "next/link";
import { redirect } from "next/navigation";

import { demoPersonas, getDemoSeedUser, getDemoSession, isDemoAccessEnabled } from "@/lib/demo-access";

const personaCopy = {
  owner: {
    title: "Owner",
    detail: "Full walk-through across dispatch, fleet, invoices, and ops controls.",
  },
  dispatcher: {
    title: "Dispatcher",
    detail: "Best for showing the board, match flow, and load movement end to end.",
  },
  driver: {
    title: "Driver",
    detail: "Role-limited view for status updates and assigned-work testing.",
  },
} as const;

export default async function DemoAccessPage() {
  if (!isDemoAccessEnabled()) {
    redirect("/");
  }

  const demoSession = await getDemoSession();

  return (
    <main className="min-h-screen bg-[#f3efe6] px-6 py-12 text-stone-900">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-[28px] border border-stone-200 bg-white/90 p-8 shadow-sm">
          <div className="flex flex-col gap-4 border-b border-stone-200 pb-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.32em] text-stone-500">Client access</p>
              <h1 className="mt-3 text-5xl leading-tight tracking-tight">
                Step straight into the working version.
              </h1>
              <p className="mt-4 max-w-3xl text-lg text-stone-700">
                Pick a role and we&apos;ll open the seeded FleetFlow workspace with live loads,
                invoices, drivers, and trucks already in place.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/v2"
                className="rounded-xl border border-stone-300 bg-stone-50 px-4 py-2.5 text-sm font-medium text-stone-900"
              >
                Back to preview
              </Link>
              {demoSession ? (
                <form action="/api/demo/session" method="post">
                  <input type="hidden" name="intent" value="clear" />
                  <button
                    type="submit"
                    className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-medium text-rose-700"
                  >
                    Exit demo session
                  </button>
                </form>
              ) : null}
            </div>
          </div>

          {demoSession ? (
            <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-900">
              Demo session active as <span className="font-semibold">{personaCopy[demoSession.persona].title}</span>.
              Use any workspace link below, or jump straight into{" "}
              <Link href="/dispatch" className="font-semibold underline underline-offset-4">
                Dispatch
              </Link>
              .
            </div>
          ) : null}

          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {demoPersonas.map((persona) => {
              const user = getDemoSeedUser(persona);
              return (
                <section
                  key={persona}
                  className="rounded-3xl border border-stone-200 bg-[#fbfaf7] p-6 shadow-sm"
                >
                  <p className="text-xs uppercase tracking-[0.28em] text-stone-500">
                    {personaCopy[persona].title}
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight text-stone-950">
                    {user.name}
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-stone-700">{personaCopy[persona].detail}</p>
                  <div className="mt-5 rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700">
                    <p className="font-medium text-stone-900">Demo identity</p>
                    <p className="mt-1">{user.email}</p>
                  </div>
                  <form action="/api/demo/session" method="post" className="mt-5">
                    <input type="hidden" name="persona" value={persona} />
                    <button
                      type="submit"
                      className="w-full rounded-xl bg-[#31497b] px-4 py-3 text-sm font-semibold text-white"
                    >
                      Continue as {personaCopy[persona].title}
                    </button>
                  </form>
                </section>
              );
            })}
          </div>

          <div className="mt-8 rounded-2xl border border-stone-200 bg-stone-50 px-5 py-4 text-sm text-stone-700">
            This is meant for preview and client review. Production sign-in still runs through Clerk.
          </div>
        </div>
      </div>
    </main>
  );
}
