"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import {
  demoAlerts,
  demoFleet,
  demoLoads,
  demoMatchLanes,
  demoStatusOrder,
  filterDemoLoads,
  getDemoAlertSummary,
  getDemoDispatchStats,
  getDemoDocumentCoverage,
  type DemoAlert,
  type DemoLoad,
  type DemoStatusFilter,
  type DemoTruck,
} from "@/lib/v2-demo";

type ViewKey = "dispatch" | "match" | "fleet" | "alerts";

const viewCopy: Record<
  ViewKey,
  { eyebrow: string; title: string; accent: string; sub: string; cta?: string }
> = {
  dispatch: {
    eyebrow: "I . Dispatch",
    title: "The board,",
    accent: "quietly.",
    sub: "Eight loads on the table. One driver out of hours by sundown, two PODs waiting on the phone.",
    cta: "New load",
  },
  match: {
    eyebrow: "II . Match",
    title: "The next load,",
    accent: "before the truck asks.",
    sub: "Ranked board pulls, deadhead-aware scoring, and booking-ready broker outreach.",
  },
  fleet: {
    eyebrow: "III . Fleet",
    title: "The people,",
    accent: "and the steel.",
    sub: "Seven drivers, seven tractors, seven trailers. Mostly Cascadias. All moving under one roof.",
    cta: "New truck",
  },
  alerts: {
    eyebrow: "IV . Alerts",
    title: "What looks off,",
    accent: "said plainly.",
    sub: "Outliers, not noise. Motion that stopped, permits that slipped, and shop problems before they turn into misses.",
    cta: "Acknowledge all",
  },
};

const viewTabs: Array<{ key: ViewKey; label: string; badge?: string }> = [
  { key: "dispatch", label: "Dispatch" },
  { key: "match", label: "Match", badge: "AI" },
  { key: "fleet", label: "Fleet" },
  { key: "alerts", label: "Alerts", badge: "5" },
];

function formatMoney(cents: number) {
  return (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

function statusTone(status: string) {
  switch (status) {
    case "Pending":
      return "border-amber-300 bg-amber-50 text-amber-800";
    case "Dispatched":
    case "Available":
      return "border-sky-300 bg-sky-50 text-sky-800";
    case "In Transit":
    case "On Load":
      return "border-indigo-300 bg-indigo-50 text-indigo-800";
    case "Delivered":
    case "Paid":
      return "border-emerald-300 bg-emerald-50 text-emerald-800";
    case "Invoiced":
      return "border-violet-300 bg-violet-50 text-violet-800";
    case "In Shop":
      return "border-rose-300 bg-rose-50 text-rose-800";
    default:
      return "border-slate-300 bg-slate-50 text-slate-700";
  }
}

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-2xl border border-stone-200 bg-white/90 shadow-sm ${className}`}>
      {children}
    </section>
  );
}

function StatCard({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <Card className="p-6">
      <p className="text-sm text-stone-500">{label}</p>
      <p className="mt-3 text-4xl font-semibold tracking-tight text-stone-950">{value}</p>
      <p className="mt-2 text-sm text-amber-700">{note}</p>
    </Card>
  );
}

function DocDots({ load }: { load: DemoLoad }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex gap-1.5">
        {getDemoDocumentCoverage(load).map((doc) => (
          <span
            key={doc.label}
            className={`h-2.5 w-2.5 rounded-full ${doc.present ? "bg-emerald-500" : "bg-stone-300"}`}
            title={doc.label}
          />
        ))}
      </div>
      <span className="text-[11px] uppercase tracking-[0.24em] text-stone-400">docs</span>
    </div>
  );
}

function DispatchView() {
  const [filter, setFilter] = useState<DemoStatusFilter>("All");
  const [query, setQuery] = useState("");
  const stats = useMemo(() => getDemoDispatchStats(demoLoads), []);
  const rows = useMemo(() => filterDemoLoads(demoLoads, filter, query), [filter, query]);
  const featuredLane = demoMatchLanes[0];

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Loads in motion"
          value={String(stats.inMotion)}
          note={`${stats.awaitingDriver} awaiting a driver`}
        />
        <StatCard
          label="PODs to invoice"
          value={String(stats.podsToInvoice)}
          note="auto-drafts ready"
        />
        <StatCard
          label="Revenue, this week"
          value={formatMoney(stats.weeklyRevenueCents)}
          note="+8.2% vs last week"
        />
        <StatCard
          label="On-time delivery"
          value={`${stats.onTimePct}%`}
          note="rolling delivery score"
        />
      </div>

      <Card className="overflow-hidden">
        <div className="border-b border-stone-200 bg-[#f7f5ef] px-5 py-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <span className="rounded-md border border-stone-300 bg-white px-2.5 py-1 text-[11px] uppercase tracking-[0.28em] text-stone-700">
                Next best load
              </span>
              <p className="text-xl italic text-stone-900">
                {featuredLane.driver} empties in Kansas City at 18:00.
              </p>
            </div>
            <div className="flex items-center gap-5 text-sm text-stone-600">
              <span>{featuredLane.hosLeftHours}h HOS left</span>
              <button className="font-medium text-stone-900">See all 14 boards</button>
            </div>
          </div>
        </div>
        <div className="divide-y divide-stone-200">
          {featuredLane.candidates.map((candidate) => (
            <div key={candidate.id} className="grid gap-4 bg-[#eff3fb] px-5 py-5 lg:grid-cols-[1.6fr_1fr]">
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-stone-500">{candidate.id}</p>
                    <h3 className="mt-2 text-4xl leading-none text-stone-950">
                      {candidate.origin.split(",")[0]}
                      <br />
                      <span className="italic text-stone-700">to {candidate.destination.split(",")[0]}.</span>
                    </h3>
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-semibold text-blue-600">{candidate.fitScore}</p>
                    <p className="text-xs uppercase tracking-[0.18em] text-stone-500">fit</p>
                  </div>
                </div>
                <div className="mt-6 grid gap-4 text-sm text-stone-700 md:grid-cols-4">
                  <div>
                    <p className="text-2xl font-semibold text-stone-950">{formatMoney(candidate.rateCents)}</p>
                    <p>rate</p>
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-stone-950">${candidate.rpm.toFixed(2)}</p>
                    <p>/mile</p>
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-stone-950">{candidate.deadheadMiles}mi</p>
                    <p>deadhead</p>
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-stone-950">{candidate.haulMiles}mi</p>
                    <p>haul</p>
                  </div>
                </div>
                <p className="mt-5 text-sm italic text-stone-700">{candidate.reason}</p>
              </div>
              <div className="flex flex-col justify-between gap-4">
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-1">
                  <button className="rounded-xl bg-[#31497b] px-5 py-3 text-sm font-semibold text-white">
                    Book
                  </button>
                  <button className="rounded-xl border border-stone-300 bg-white px-5 py-3 text-sm font-medium text-stone-900">
                    Decline
                  </button>
                </div>
                <div className="flex items-center justify-between text-sm text-stone-600">
                  <span>{candidate.broker}</span>
                  <span>{candidate.postedAgo}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <div className="flex flex-col gap-4 border-b border-stone-200 pb-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by load, customer, driver, or city"
              className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none ring-0 placeholder:text-stone-400"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {demoStatusOrder.map((option) => (
              <button
                key={option}
                onClick={() => setFilter(option)}
                className={`rounded-full px-3 py-1.5 text-sm transition ${
                  filter === option
                    ? "bg-stone-900 text-white"
                    : "border border-stone-300 bg-white text-stone-700"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-stone-200 text-sm">
            <thead>
              <tr className="text-left uppercase tracking-[0.18em] text-stone-500">
                <th className="px-2 py-3 font-medium">Load</th>
                <th className="px-2 py-3 font-medium">Route</th>
                <th className="px-2 py-3 font-medium">Window</th>
                <th className="px-2 py-3 font-medium">Driver</th>
                <th className="px-2 py-3 font-medium">Status</th>
                <th className="px-2 py-3 font-medium text-right">Rate</th>
                <th className="px-2 py-3 font-medium text-right">Docs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {rows.map((load) => (
                <tr key={load.id} className="align-top">
                  <td className="px-2 py-4">
                    <p className="font-semibold text-stone-950">{load.id}</p>
                    <p className="mt-1 text-stone-500">{load.customer}</p>
                  </td>
                  <td className="px-2 py-4 text-stone-700">
                    {load.origin}
                    <br />
                    <span className="text-stone-400">to</span> {load.destination}
                  </td>
                  <td className="px-2 py-4 text-stone-700">
                    {load.pickupWindow} - {load.deliverWindow}
                  </td>
                  <td className="px-2 py-4 text-stone-700">
                    {load.driver}
                    <br />
                    <span className="text-stone-400">{load.truck}</span>
                  </td>
                  <td className="px-2 py-4">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${statusTone(load.status)}`}
                    >
                      {load.status}
                    </span>
                  </td>
                  <td className="px-2 py-4 text-right font-semibold text-stone-950">
                    {formatMoney(load.rateCents)}
                  </td>
                  <td className="px-2 py-4 text-right">
                    <div className="flex justify-end">
                      <DocDots load={load} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function MatchView() {
  return (
    <div className="space-y-6">
      {demoMatchLanes.map((lane) => (
        <Card key={lane.truck} className="overflow-hidden">
          <div className="border-b border-stone-200 bg-stone-950 px-6 py-5 text-white">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-stone-300">Empty truck watch</p>
                <h2 className="mt-2 text-3xl italic">
                  {lane.driver} clears in {lane.emptyAt}.
                </h2>
              </div>
              <div className="text-sm text-stone-300">{lane.hosLeftHours} hours left on the clock</div>
            </div>
          </div>
          <div className="divide-y divide-stone-200">
            {lane.candidates.map((candidate) => (
              <div key={candidate.id} className="grid gap-6 px-6 py-6 lg:grid-cols-[1.5fr_1fr]">
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-stone-500">{candidate.id}</p>
                      <h3 className="mt-2 text-4xl text-stone-950">
                        {candidate.origin.split(",")[0]}
                        <br />
                        <span className="italic text-stone-700">to {candidate.destination.split(",")[0]}.</span>
                      </h3>
                    </div>
                    <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-right">
                      <p className="text-3xl font-semibold text-blue-600">{candidate.fitScore}</p>
                      <p className="text-xs uppercase tracking-[0.18em] text-blue-700">fit</p>
                    </div>
                  </div>
                  <div className="mt-6 grid gap-4 text-sm text-stone-700 md:grid-cols-4">
                    <div>
                      <p className="text-lg font-semibold text-stone-950">{formatMoney(candidate.rateCents)}</p>
                      <p>rate</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-stone-950">${candidate.rpm.toFixed(2)}</p>
                      <p>/mile</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-stone-950">{candidate.deadheadMiles}mi</p>
                      <p>deadhead</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-stone-950">{candidate.haulMiles}mi</p>
                      <p>haul</p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-stone-600">{candidate.reason}</p>
                </div>
                <div className="flex flex-col justify-between rounded-2xl border border-stone-200 bg-stone-50 p-5">
                  <div>
                    <p className="text-sm font-medium text-stone-900">{candidate.broker}</p>
                    <p className="mt-1 text-sm text-stone-500">Posted {candidate.postedAgo}</p>
                  </div>
                  <div className="mt-5 grid gap-3">
                    <button className="rounded-xl bg-[#2563eb] px-4 py-3 text-sm font-semibold text-white">
                      Book by message
                    </button>
                    <button className="rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm font-medium text-stone-900">
                      Decline
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}

function FleetView() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Trucks" value="7" note="5 rolling, 1 staged, 1 in shop" />
        <StatCard label="Trailers" value="7" note="Dry van heavy, two on reload watch" />
        <StatCard label="Drivers" value="7" note="One permit renewal due tomorrow" />
      </div>
      <Card className="overflow-hidden">
        <div className="border-b border-stone-200 px-6 py-4">
          <div className="flex flex-wrap gap-2">
            {["Trucks . 7", "Trailers . 7", "Drivers . 7"].map((tab, index) => (
              <span
                key={tab}
                className={`rounded-xl px-3 py-2 text-sm ${
                  index === 0 ? "bg-stone-900 text-white" : "border border-stone-300 bg-white text-stone-700"
                }`}
              >
                {tab}
              </span>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto px-6 py-2">
          <table className="min-w-full divide-y divide-stone-200 text-sm">
            <thead>
              <tr className="text-left uppercase tracking-[0.18em] text-stone-500">
                <th className="px-2 py-3 font-medium">Unit</th>
                <th className="px-2 py-3 font-medium">Make . Model</th>
                <th className="px-2 py-3 font-medium">Generation</th>
                <th className="px-2 py-3 font-medium">VIN</th>
                <th className="px-2 py-3 font-medium">Driver</th>
                <th className="px-2 py-3 font-medium text-right">Miles</th>
                <th className="px-2 py-3 font-medium text-right">MPG</th>
                <th className="px-2 py-3 font-medium">Fuel card</th>
                <th className="px-2 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {demoFleet.map((truck) => (
                <FleetTruckRow key={truck.unit} truck={truck} />
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function FleetTruckRow({ truck }: { truck: DemoTruck }) {
  return (
    <tr>
      <td className="px-2 py-4 font-semibold text-stone-950">{truck.unit}</td>
      <td className="px-2 py-4 text-stone-700">
        {truck.make}
        <br />
        <span className="text-stone-500">{truck.model}</span>
      </td>
      <td className="px-2 py-4 text-stone-700">{truck.generation}</td>
      <td className="px-2 py-4">
        <span className="rounded-lg border border-amber-200 bg-amber-50 px-2 py-1 font-mono text-xs text-stone-800">
          {truck.vinLast8}
        </span>
      </td>
      <td className="px-2 py-4 text-stone-700">{truck.driver}</td>
      <td className="px-2 py-4 text-right text-stone-700">{truck.miles.toLocaleString()}</td>
      <td className="px-2 py-4 text-right text-stone-700">{truck.mpg.toFixed(1)}</td>
      <td className="px-2 py-4">
        <span className="rounded-lg border border-stone-300 bg-stone-50 px-2 py-1 text-xs text-stone-700">
          {truck.fuelCard}
        </span>
      </td>
      <td className="px-2 py-4">
        <span
          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${statusTone(truck.status)}`}
        >
          {truck.status}
        </span>
      </td>
    </tr>
  );
}

function AlertRow({ alert }: { alert: DemoAlert }) {
  const tone =
    alert.kind === "Critical"
      ? "border-rose-200 bg-rose-50"
      : alert.kind === "Warning"
        ? "border-amber-200 bg-amber-50"
        : "border-stone-200 bg-stone-50";
  return (
    <div className={`rounded-2xl border p-5 ${tone}`}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-stone-500">{alert.kind}</p>
          <h3 className="mt-2 text-xl font-semibold text-stone-950">{alert.title}</h3>
          <p className="mt-2 text-sm text-stone-700">{alert.detail}</p>
        </div>
        <button className="rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-900">
          {alert.action}
        </button>
      </div>
    </div>
  );
}

function AlertsView() {
  const summary = getDemoAlertSummary(demoAlerts);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Critical" value={String(summary.critical)} note="need a decision today" />
        <StatCard label="Warnings" value={String(summary.warning)} note="will become critical" />
        <StatCard label="Info" value={String(summary.info)} note="already handled by the system" />
      </div>
      <div className="space-y-4">
        {demoAlerts.map((alert) => (
          <AlertRow key={alert.id} alert={alert} />
        ))}
      </div>
    </div>
  );
}

export function V2DemoApp() {
  const [view, setView] = useState<ViewKey>("dispatch");
  const copy = viewCopy[view];

  return (
    <main className="min-h-screen bg-[#f3efe6] text-stone-900">
      <div className="mx-auto max-w-7xl px-5 py-6 md:px-8 lg:px-10">
        <header className="border-b border-stone-300 pb-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-5">
              <Link href="/" className="text-3xl font-semibold tracking-tight text-stone-950">
                FleetFlow
              </Link>
              <div className="hidden text-xs uppercase tracking-[0.34em] text-stone-400 md:block">
                Northshore Trucking . 22 Trucks
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-stone-600">
              {viewTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setView(tab.key)}
                  className={`rounded-full px-3 py-2 transition ${
                    view === tab.key
                      ? "bg-stone-900 text-white"
                      : "bg-white/70 text-stone-700 ring-1 ring-inset ring-stone-200"
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.badge ? (
                    <span className="ml-2 rounded-md bg-emerald-100 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-800">
                      {tab.badge}
                    </span>
                  ) : null}
                </button>
              ))}
              <span className="ml-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-blue-700">
                V2 demo
              </span>
            </div>
          </div>
        </header>

        <section className="border-b border-stone-300 py-10">
          <div className="max-w-4xl">
            <p className="text-xs uppercase tracking-[0.3em] text-stone-500">{copy.eyebrow}</p>
            <h1 className="mt-3 text-5xl leading-tight text-stone-950 md:text-6xl">
              {copy.title} <span className="italic text-blue-600">{copy.accent}</span>
            </h1>
            <p className="mt-4 max-w-3xl text-lg text-stone-700">{copy.sub}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              {copy.cta ? (
                <button className="rounded-xl bg-[#31497b] px-5 py-3 text-sm font-semibold text-white">
                  {copy.cta}
                </button>
              ) : null}
              <Link
                href="/dispatch"
                className="rounded-xl border border-stone-300 bg-white px-5 py-3 text-sm font-medium text-stone-900"
              >
                Open current scaffold
              </Link>
            </div>
          </div>
        </section>

        <section className="py-8">
          {view === "dispatch" ? <DispatchView /> : null}
          {view === "match" ? <MatchView /> : null}
          {view === "fleet" ? <FleetView /> : null}
          {view === "alerts" ? <AlertsView /> : null}
        </section>
      </div>
    </main>
  );
}
