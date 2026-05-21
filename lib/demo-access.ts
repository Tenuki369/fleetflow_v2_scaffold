import { InvoiceStatus, LoadStatus, PrismaClient, Role } from "@prisma/client";
import { cookies } from "next/headers";

import { prismaForOrg, type OrgContext } from "./auth/tenancy";
import { basePrisma } from "./db";

export const DEMO_SESSION_COOKIE = "fleetflow_demo_session";

export const demoPersonas = ["owner", "dispatcher", "driver"] as const;

export type DemoPersona = (typeof demoPersonas)[number];

type DemoSeedUser = {
  email: string;
  clerkId: string;
  name: string;
  role: Role;
};

const demoSeedUsers: Record<DemoPersona, DemoSeedUser> = {
  owner: {
    email: "owner@acme.test",
    clerkId: "user_local_owner",
    name: "Anna Owner",
    role: Role.OWNER,
  },
  dispatcher: {
    email: "amy@acme.test",
    clerkId: "user_local_dispatcher",
    name: "Amy Dispatcher",
    role: Role.DISPATCHER,
  },
  driver: {
    email: "dan@acme.test",
    clerkId: "user_local_driver",
    name: "Dan Driver",
    role: Role.DRIVER,
  },
};

export function parseDemoPersona(value: string | null | undefined): DemoPersona | null {
  if (!value) return null;
  return demoPersonas.includes(value as DemoPersona) ? (value as DemoPersona) : null;
}

export function getDemoSeedUser(persona: DemoPersona) {
  return demoSeedUsers[persona];
}

export function isDemoAccessEnabled(env?: {
  enableDemoAccess?: string | undefined;
  vercelEnv?: string | undefined;
  nodeEnv?: string | undefined;
}) {
  const explicit = env?.enableDemoAccess ?? process.env.ENABLE_DEMO_ACCESS;
  if (explicit === "true") return true;
  if (explicit === "false") return false;

  const vercelEnv = env?.vercelEnv ?? process.env.VERCEL_ENV;
  const nodeEnv = env?.nodeEnv ?? process.env.NODE_ENV;

  return nodeEnv !== "production" || vercelEnv === "preview";
}

export async function getDemoSession() {
  if (!isDemoAccessEnabled()) return null;

  const store = await cookies();
  const persona = parseDemoPersona(store.get(DEMO_SESSION_COOKIE)?.value);

  if (!persona) return null;

  return {
    persona,
    ...getDemoSeedUser(persona),
  };
}

export async function getDemoOrgContext(): Promise<OrgContext | null> {
  const demoSession = await getDemoSession();
  if (!demoSession) return null;

  const user = await basePrisma.user.findUnique({
    where: { email: demoSession.email },
    include: { memberships: true },
  });

  if (!user) return null;

  const membership = user.memberships.find((item) => item.role === demoSession.role) ?? user.memberships[0];
  if (!membership) return null;

  return {
    orgId: membership.orgId,
    userId: user.id,
    role: membership.role,
    db: prismaForOrg(membership.orgId),
  };
}

export async function ensureDemoWorkspace(prisma: PrismaClient = basePrisma) {
  const org = await prisma.org.upsert({
    where: { slug: "acme-trucking" },
    create: { name: "Acme Trucking", slug: "acme-trucking" },
    update: {},
  });

  const owner = await prisma.user.upsert({
    where: { email: demoSeedUsers.owner.email },
    create: {
      clerkId: demoSeedUsers.owner.clerkId,
      email: demoSeedUsers.owner.email,
      name: demoSeedUsers.owner.name,
    },
    update: {
      clerkId: demoSeedUsers.owner.clerkId,
      name: demoSeedUsers.owner.name,
    },
  });

  const dispatcher = await prisma.user.upsert({
    where: { email: demoSeedUsers.dispatcher.email },
    create: {
      clerkId: demoSeedUsers.dispatcher.clerkId,
      email: demoSeedUsers.dispatcher.email,
      name: demoSeedUsers.dispatcher.name,
    },
    update: {
      clerkId: demoSeedUsers.dispatcher.clerkId,
      name: demoSeedUsers.dispatcher.name,
    },
  });

  const driverUser = await prisma.user.upsert({
    where: { email: demoSeedUsers.driver.email },
    create: {
      clerkId: demoSeedUsers.driver.clerkId,
      email: demoSeedUsers.driver.email,
      name: demoSeedUsers.driver.name,
    },
    update: {
      clerkId: demoSeedUsers.driver.clerkId,
      name: demoSeedUsers.driver.name,
    },
  });

  for (const [user, role] of [
    [owner, Role.OWNER],
    [dispatcher, Role.DISPATCHER],
    [driverUser, Role.DRIVER],
  ] as const) {
    await prisma.membership.upsert({
      where: { orgId_userId: { orgId: org.id, userId: user.id } },
      create: { orgId: org.id, userId: user.id, role },
      update: { role },
    });
  }

  const customers = await Promise.all(
    [
      { name: "Midwest Foods", email: "ap@midwestfoods.test" },
      { name: "Great Plains Brokerage", email: "ap@greatplains.test" },
    ].map((customer) =>
      prisma.customer.upsert({
        where: { id: `seed-cust-${customer.name.replace(/\s+/g, "-").toLowerCase()}` },
        create: {
          ...customer,
          orgId: org.id,
          id: `seed-cust-${customer.name.replace(/\s+/g, "-").toLowerCase()}`,
        },
        update: {},
      }),
    ),
  );

  const trucks = await Promise.all(
    ["T-204", "T-307"].map((unitNumber) =>
      prisma.truck.upsert({
        where: { orgId_unitNumber: { orgId: org.id, unitNumber } },
        create: {
          orgId: org.id,
          unitNumber,
          make: "Freightliner",
          model: "Cascadia",
          year: unitNumber === "T-204" ? 2023 : 2022,
          plate: unitNumber === "T-204" ? "IL-2049" : "IL-3072",
          vin: unitNumber === "T-204" ? "1FUJA6CK57LMC4421" : "3AKJHHDR6NSNP2184",
        },
        update: {},
      }),
    ),
  );

  const drivers = await Promise.all(
    [
      {
        firstName: "Dan",
        lastName: "Driver",
        licenseNumber: "IL-D-1234",
        email: demoSeedUsers.driver.email,
      },
      {
        firstName: "Maria",
        lastName: "Lopez",
        licenseNumber: "IL-D-5678",
        email: "maria@acme.test",
      },
    ].map((driver, index) =>
      prisma.driver.upsert({
        where: { id: `seed-drv-${driver.lastName.toLowerCase()}` },
        create: {
          ...driver,
          orgId: org.id,
          truckId: trucks[index]?.id,
          userId: index === 0 ? driverUser.id : null,
          id: `seed-drv-${driver.lastName.toLowerCase()}`,
        },
        update: {
          email: driver.email,
          truckId: trucks[index]?.id,
          userId: index === 0 ? driverUser.id : null,
        },
      }),
    ),
  );

  const today = new Date();
  const statuses: LoadStatus[] = [
    LoadStatus.AVAILABLE,
    LoadStatus.ASSIGNED,
    LoadStatus.IN_TRANSIT,
    LoadStatus.DELIVERED,
    LoadStatus.INVOICED,
  ];

  for (let index = 0; index < 10; index += 1) {
    const status = statuses[index % statuses.length];
    const referenceNumber = `L-2026-${String(140 + index).padStart(4, "0")}`;
    const pickupAt = new Date(today);
    pickupAt.setHours(8 + (index % 8), 0, 0, 0);
    const deliverBy = new Date(pickupAt);
    deliverBy.setDate(deliverBy.getDate() + 1);

    const load = await prisma.load.upsert({
      where: { orgId_referenceNumber: { orgId: org.id, referenceNumber } },
      create: {
        orgId: org.id,
        referenceNumber,
        status,
        customerId: customers[index % customers.length].id,
        driverId: status === LoadStatus.AVAILABLE ? null : drivers[index % drivers.length].id,
        truckId: status === LoadStatus.AVAILABLE ? null : trucks[index % trucks.length].id,
        origin: ["Chicago, IL", "Indianapolis, IN", "St. Louis, MO"][index % 3],
        destination: ["Cleveland, OH", "Detroit, MI", "Nashville, TN"][index % 3],
        pickupAt,
        deliverBy,
        rateCents: 150_000 + (index * 25_000),
        miles: 250 + index * 30,
      },
      update: {
        status,
        customerId: customers[index % customers.length].id,
        driverId: status === LoadStatus.AVAILABLE ? null : drivers[index % drivers.length].id,
        truckId: status === LoadStatus.AVAILABLE ? null : trucks[index % trucks.length].id,
      },
    });

    if (status === LoadStatus.DELIVERED || status === LoadStatus.INVOICED) {
      const issuedAt = new Date(deliverBy);
      const dueAt = new Date(deliverBy);
      dueAt.setDate(dueAt.getDate() + 30);

      await prisma.invoice.upsert({
        where: { loadId: load.id },
        create: {
          orgId: org.id,
          loadId: load.id,
          number: `INV-${referenceNumber.replace("L-", "")}`,
          status: status === LoadStatus.INVOICED ? InvoiceStatus.SENT : InvoiceStatus.DRAFT,
          amountCents: load.rateCents,
          issuedAt,
          dueAt,
        },
        update: {
          status: status === LoadStatus.INVOICED ? InvoiceStatus.SENT : InvoiceStatus.DRAFT,
          amountCents: load.rateCents,
          issuedAt,
          dueAt,
        },
      });
    }
  }

  return {
    org,
    users: {
      owner,
      dispatcher,
      driver: driverUser,
    },
  };
}
