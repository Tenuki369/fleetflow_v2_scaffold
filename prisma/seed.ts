/**
 * Seed script for local dev and CI smoke tests.
 *
 * Creates one org with a full operational shape: owner + dispatcher + driver
 * memberships, two customers, two drivers, two trucks, and ten loads spanning
 * every status. Idempotent — safe to re-run.
 */
import { PrismaClient, Role, LoadStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const org = await prisma.org.upsert({
    where: { slug: "acme-trucking" },
    create: { name: "Acme Trucking", slug: "acme-trucking" },
    update: {},
  });

  const owner = await prisma.user.upsert({
    where: { email: "owner@acme.test" },
    create: { clerkId: "user_local_owner", email: "owner@acme.test", name: "Anna Owner" },
    update: {},
  });
  const dispatcher = await prisma.user.upsert({
    where: { email: "amy@acme.test" },
    create: { clerkId: "user_local_dispatcher", email: "amy@acme.test", name: "Amy Dispatcher" },
    update: {},
  });
  const driverUser = await prisma.user.upsert({
    where: { email: "dan@acme.test" },
    create: { clerkId: "user_local_driver", email: "dan@acme.test", name: "Dan Driver" },
    update: {},
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
    ].map((c) =>
      prisma.customer.upsert({
        where: { id: `seed-cust-${c.name.replace(/\s+/g, "-").toLowerCase()}` },
        create: { ...c, orgId: org.id, id: `seed-cust-${c.name.replace(/\s+/g, "-").toLowerCase()}` },
        update: {},
      }),
    ),
  );

  const trucks = await Promise.all(
    ["T-204", "T-307"].map((unitNumber) =>
      prisma.truck.upsert({
        where: { orgId_unitNumber: { orgId: org.id, unitNumber } },
        create: { orgId: org.id, unitNumber },
        update: {},
      }),
    ),
  );

  const drivers = await Promise.all(
    [
      { firstName: "Dan", lastName: "Driver", licenseNumber: "IL-D-1234" },
      { firstName: "Maria", lastName: "Lopez", licenseNumber: "IL-D-5678" },
    ].map((d, i) =>
      prisma.driver.upsert({
        where: { id: `seed-drv-${d.lastName.toLowerCase()}` },
        create: { ...d, orgId: org.id, truckId: trucks[i]?.id, id: `seed-drv-${d.lastName.toLowerCase()}` },
        update: {},
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

  for (let i = 0; i < 10; i++) {
    const status = statuses[i % statuses.length];
    const refNum = `L-2026-${String(140 + i).padStart(4, "0")}`;
    const pickup = new Date(today);
    pickup.setHours(8 + (i % 8), 0, 0, 0);
    const deliver = new Date(pickup);
    deliver.setDate(deliver.getDate() + 1);

    await prisma.load.upsert({
      where: { orgId_referenceNumber: { orgId: org.id, referenceNumber: refNum } },
      create: {
        orgId: org.id,
        referenceNumber: refNum,
        status,
        customerId: customers[i % customers.length].id,
        driverId: status === LoadStatus.AVAILABLE ? null : drivers[i % drivers.length].id,
        truckId: status === LoadStatus.AVAILABLE ? null : trucks[i % trucks.length].id,
        origin: ["Chicago, IL", "Indianapolis, IN", "St. Louis, MO"][i % 3],
        destination: ["Cleveland, OH", "Detroit, MI", "Nashville, TN"][i % 3],
        pickupAt: pickup,
        deliverBy: deliver,
        rateCents: 150_000 + (i * 25_000),
        miles: 250 + i * 30,
      },
      update: {},
    });
  }

  console.log("Seeded org:", org.slug);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
