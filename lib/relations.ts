import type { TenantPrisma } from "@/lib/auth/tenancy";

type RelationCheck = {
  field: "customerId" | "driverId" | "truckId";
  id: string | null | undefined;
};

export async function validateOrgRelations(
  db: TenantPrisma,
  checks: RelationCheck[],
): Promise<string | null> {
  for (const check of checks) {
    if (!check.id) continue;

    const exists = await relationExists(db, check);
    if (!exists) {
      return `${check.field} does not belong to this org`;
    }
  }

  return null;
}

async function relationExists(
  db: TenantPrisma,
  check: RelationCheck,
): Promise<boolean> {
  switch (check.field) {
    case "customerId":
      return Boolean(
        await db.customer.findUnique({ where: { id: check.id as string } }),
      );
    case "driverId":
      return Boolean(
        await db.driver.findUnique({ where: { id: check.id as string } }),
      );
    case "truckId":
      return Boolean(
        await db.truck.findUnique({ where: { id: check.id as string } }),
      );
  }
}
