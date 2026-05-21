export const demoStatusOrder = [
  "All",
  "Pending",
  "Dispatched",
  "In Transit",
  "Delivered",
  "Invoiced",
  "Paid",
] as const;

export type DemoStatusFilter = (typeof demoStatusOrder)[number];
export type DemoLoadStatus = Exclude<DemoStatusFilter, "All">;

export type DemoLoad = {
  id: string;
  customer: string;
  origin: string;
  destination: string;
  driver: string;
  truck: string;
  pickupWindow: string;
  deliverWindow: string;
  status: DemoLoadStatus;
  rateCents: number;
  miles: number;
  rateCon: boolean;
  bol: boolean;
  pod: boolean;
  onTime: boolean;
  notes?: string;
};

export type DemoMatchCandidate = {
  id: string;
  broker: string;
  origin: string;
  destination: string;
  fitScore: number;
  rateCents: number;
  rpm: number;
  deadheadMiles: number;
  haulMiles: number;
  reason: string;
  postedAgo: string;
};

export type DemoMatchLane = {
  truck: string;
  driver: string;
  emptyAt: string;
  hosLeftHours: number;
  candidates: DemoMatchCandidate[];
};

export type DemoTruck = {
  unit: string;
  make: string;
  model: string;
  generation: string;
  driver: string;
  miles: number;
  mpg: number;
  fuelCard: string;
  status: "Available" | "On Load" | "In Shop";
  vinLast8: string;
};

export type DemoAlert = {
  id: string;
  kind: "Critical" | "Warning" | "Info";
  title: string;
  detail: string;
  action: string;
};

export const demoLoads: DemoLoad[] = [
  {
    id: "L-1042",
    customer: "Northshore Foods",
    origin: "Kansas City, MO",
    destination: "Chicago, IL",
    driver: "M. Coombs",
    truck: "T-1042",
    pickupWindow: "08:30",
    deliverWindow: "18:00",
    status: "In Transit",
    rateCents: 198000,
    miles: 512,
    rateCon: true,
    bol: true,
    pod: false,
    onTime: true,
    notes: "Receiver wants photo set before dock release.",
  },
  {
    id: "L-1061",
    customer: "Midwest Cold Chain",
    origin: "Indianapolis, IN",
    destination: "Cleveland, OH",
    driver: "S. Ortega",
    truck: "T-8821",
    pickupWindow: "10:15",
    deliverWindow: "21:00",
    status: "Dispatched",
    rateCents: 214000,
    miles: 311,
    rateCon: true,
    bol: false,
    pod: false,
    onTime: true,
  },
  {
    id: "L-1074",
    customer: "Great Plains Freight",
    origin: "Joliet, IL",
    destination: "Detroit, MI",
    driver: "Unassigned",
    truck: "-",
    pickupWindow: "13:00",
    deliverWindow: "06:00",
    status: "Pending",
    rateCents: 243000,
    miles: 287,
    rateCon: true,
    bol: false,
    pod: false,
    onTime: false,
  },
  {
    id: "L-1018",
    customer: "Coyote Logistics",
    origin: "Cleveland, OH",
    destination: "St. Louis, MO",
    driver: "J. Wright",
    truck: "T-1177",
    pickupWindow: "07:00",
    deliverWindow: "15:45",
    status: "Delivered",
    rateCents: 176500,
    miles: 548,
    rateCon: true,
    bol: true,
    pod: true,
    onTime: true,
  },
  {
    id: "L-0994",
    customer: "Pilot Direct",
    origin: "Columbus, OH",
    destination: "Memphis, TN",
    driver: "D. Patel",
    truck: "T-6610",
    pickupWindow: "05:45",
    deliverWindow: "17:10",
    status: "Invoiced",
    rateCents: 298000,
    miles: 673,
    rateCon: true,
    bol: true,
    pod: true,
    onTime: true,
  },
  {
    id: "L-0950",
    customer: "Blue Rock Produce",
    origin: "Nashville, TN",
    destination: "Atlanta, GA",
    driver: "R. Graham",
    truck: "T-7302",
    pickupWindow: "06:20",
    deliverWindow: "14:30",
    status: "Paid",
    rateCents: 153000,
    miles: 255,
    rateCon: true,
    bol: true,
    pod: true,
    onTime: false,
  },
];

export const demoMatchLanes: DemoMatchLane[] = [
  {
    truck: "T-1042",
    driver: "M. Coombs",
    emptyAt: "Kansas City at 18:00",
    hosLeftHours: 8.5,
    candidates: [
      {
        id: "DAT-883201",
        broker: "Coyote Logistics",
        origin: "Kansas City, MO",
        destination: "Chicago, IL",
        fitScore: 96,
        rateCents: 198000,
        rpm: 3.87,
        deadheadMiles: 12,
        haulMiles: 512,
        reason: "On the way home. Deadhead stays under 15 miles and prior broker history is clean.",
        postedAgo: "12 min ago",
      },
      {
        id: "DAT-883415",
        broker: "CH Robinson",
        origin: "Lawrence, KS",
        destination: "Indianapolis, IN",
        fitScore: 88,
        rateCents: 214000,
        rpm: 3.6,
        deadheadMiles: 42,
        haulMiles: 594,
        reason: "Longer deadhead, but strong lane and net-15 broker pay.",
        postedAgo: "34 min ago",
      },
    ],
  },
];

export const demoFleet: DemoTruck[] = [
  {
    unit: "T-1042",
    make: "Freightliner",
    model: "Cascadia 126",
    generation: "New Cascadia Gen 5",
    driver: "M. Coombs",
    miles: 284120,
    mpg: 7.4,
    fuelCard: "RELAY-8821",
    status: "On Load",
    vinLast8: "7LMC4421",
  },
  {
    unit: "T-8821",
    make: "Freightliner",
    model: "Cascadia 126",
    generation: "New Cascadia Gen 4",
    driver: "S. Ortega",
    miles: 247880,
    mpg: 7.2,
    fuelCard: "RELAY-2217",
    status: "Available",
    vinLast8: "4KTR1180",
  },
  {
    unit: "T-1177",
    make: "Volvo",
    model: "VNL 760",
    generation: "2024 refresh",
    driver: "J. Wright",
    miles: 198440,
    mpg: 7.7,
    fuelCard: "RELAY-4419",
    status: "Available",
    vinLast8: "1ATX9014",
  },
  {
    unit: "T-6610",
    make: "Freightliner",
    model: "Cascadia 126",
    generation: "New Cascadia Gen 5",
    driver: "D. Patel",
    miles: 311904,
    mpg: 6.9,
    fuelCard: "RELAY-7730",
    status: "In Shop",
    vinLast8: "8PKD7720",
  },
];

export const demoAlerts: DemoAlert[] = [
  {
    id: "ALT-2001",
    kind: "Critical",
    title: "Work permit expires tomorrow for S. Ortega",
    detail: "Driver can finish the current move, but dispatch needs a replacement plan by 16:00.",
    action: "Reassign and collect renewal packet",
  },
  {
    id: "ALT-2002",
    kind: "Critical",
    title: "Truck T-6610 failed regen twice today",
    detail: "Active Memphis lane should clear after current unload, then route to shop.",
    action: "Schedule shop intake",
  },
  {
    id: "ALT-2003",
    kind: "Warning",
    title: "Idle on T-1042 is 2.1x fleet median",
    detail: "KCI receiver delay likely explains it, but trend is still red.",
    action: "Review after POD lands",
  },
  {
    id: "ALT-2004",
    kind: "Warning",
    title: "Two PODs are ready to invoice",
    detail: "Accounting can draft as soon as image review clears.",
    action: "Open invoice queue",
  },
  {
    id: "ALT-2005",
    kind: "Info",
    title: "Pilot Plus tier moved up for J. Wright",
    detail: "Discounted fuel lane is now active for the rest of the week.",
    action: "No action needed",
  },
];

const demoDispatchSnapshot = {
  weekRevenueCents: 1440000,
  onTimePct: 94.6,
};

export function filterDemoLoads(
  loads: DemoLoad[],
  filter: DemoStatusFilter,
  query: string,
): DemoLoad[] {
  const normalized = query.trim().toLowerCase();

  return loads.filter((load) => {
    if (filter !== "All" && load.status !== filter) {
      return false;
    }

    if (!normalized) {
      return true;
    }

    const haystack = [
      load.id,
      load.customer,
      load.origin,
      load.destination,
      load.driver,
      load.truck,
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalized);
  });
}

export function getDemoDispatchStats(loads: DemoLoad[]) {
  const inMotion = loads.filter(
    (load) => load.status === "Dispatched" || load.status === "In Transit",
  ).length;
  const awaitingDriver = loads.filter((load) => load.status === "Pending").length;
  const podsToInvoice = loads.filter(
    (load) => load.status === "Delivered" && load.pod,
  ).length;

  return {
    inMotion,
    awaitingDriver,
    podsToInvoice,
    weeklyRevenueCents: demoDispatchSnapshot.weekRevenueCents,
    onTimePct: demoDispatchSnapshot.onTimePct,
  };
}

export function getDemoAlertSummary(alerts: DemoAlert[]) {
  return alerts.reduce(
    (summary, alert) => {
      if (alert.kind === "Critical") summary.critical += 1;
      if (alert.kind === "Warning") summary.warning += 1;
      if (alert.kind === "Info") summary.info += 1;
      return summary;
    },
    { critical: 0, warning: 0, info: 0 },
  );
}

export function getDemoDocumentCoverage(load: DemoLoad) {
  return [
    { label: "Rate con", present: load.rateCon },
    { label: "BOL", present: load.bol },
    { label: "POD", present: load.pod },
  ];
}
