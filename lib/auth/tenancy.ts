import { Prisma, PrismaClient, Role } from "@prisma/client";
import { auth, currentUser } from "@clerk/nextjs/server";

// Models that carry orgId. Anything not in this set is treated as global
// (e.g. User) and is NOT auto-scoped. Mistakes here are dangerous, so the
// list is explicit.
const TENANT_MODELS = new Set<string>([
  "Org",
  "Membership",
  "Customer",
  "Driver",
  "Truck",
  "Load",
  "Document",
  "Invoice",
  "AuditLog",
]);

const basePrisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
});

type WhereArg = { where?: Record<string, unknown> } & Record<string, unknown>;

function injectOrgId(args: WhereArg | undefined, orgId: string): WhereArg {
  const next = args ?? {};
  next.where = { ...(next.where ?? {}), orgId };
  return next;
}

function injectOrgIdOnCreate(args: WhereArg | undefined, orgId: string): WhereArg {
  const next = args ?? {};
  const data = (next as { data?: Record<string, unknown> }).data;
  if (Array.isArray(data)) {
    (next as { data: unknown }).data = data.map((row) => ({ ...row, orgId }));
  } else if (data && typeof data === "object") {
    (next as { data: Record<string, unknown> }).data = { ...data, orgId };
  }
  return next;
}

/**
 * Build a Prisma client bound to a single org. Every read/update/delete on a
 * tenant model is forced to filter by orgId; every create stamps orgId on the
 * payload. This is the only safe way to talk to the database from request
 * handlers.
 */
export function prismaForOrg(orgId: string) {
  if (!orgId) throw new Error("prismaForOrg: orgId is required");

  return basePrisma.$extends({
    name: "tenancy",
    query: {
      $allModels: {
        async findUnique({ model, args, query }: { model: string; args: any; query: (a: any) => Promise<any> }) {
          if (!TENANT_MODELS.has(model)) return query(args);
          return query(injectOrgId(args as WhereArg, orgId));
        },
        async findFirst({ model, args, query }: { model: string; args: any; query: (a: any) => Promise<any> }) {
          if (!TENANT_MODELS.has(model)) return query(args);
          return query(injectOrgId(args as WhereArg, orgId));
        },
        async findMany({ model, args, query }: { model: string; args: any; query: (a: any) => Promise<any> }) {
          if (!TENANT_MODELS.has(model)) return query(args);
          return query(injectOrgId(args as WhereArg, orgId));
        },
        async count({ model, args, query }: { model: string; args: any; query: (a: any) => Promise<any> }) {
          if (!TENANT_MODELS.has(model)) return query(args);
          return query(injectOrgId(args as WhereArg, orgId));
        },
        async aggregate({ model, args, query }: { model: string; args: any; query: (a: any) => Promise<any> }) {
          if (!TENANT_MODELS.has(model)) return query(args);
          return query(injectOrgId(args as WhereArg, orgId));
        },
        async update({ model, args, query }: { model: string; args: any; query: (a: any) => Promise<any> }) {
          if (!TENANT_MODELS.has(model)) return query(args);
          return query(injectOrgId(args as WhereArg, orgId));
        },
        async updateMany({ model, args, query }: { model: string; args: any; query: (a: any) => Promise<any> }) {
          if (!TENANT_MODELS.has(model)) return query(args);
          return query(injectOrgId(args as WhereArg, orgId));
        },
        async delete({ model, args, query }: { model: string; args: any; query: (a: any) => Promise<any> }) {
          if (!TENANT_MODELS.has(model)) return query(args);
          return query(injectOrgId(args as WhereArg, orgId));
        },
        async deleteMany({ model, args, query }: { model: string; args: any; query: (a: any) => Promise<any> }) {
          if (!TENANT_MODELS.has(model)) return query(args);
          return query(injectOrgId(args as WhereArg, orgId));
        },
        async create({ model, args, query }: { model: string; args: any; query: (a: any) => Promise<any> }) {
          if (!TENANT_MODELS.has(model)) return query(args);
          return query(injectOrgIdOnCreate(args as WhereArg, orgId));
        },
        async createMany({ model, args, query }: { model: string; args: any; query: (a: any) => Promise<any> }) {
          if (!TENANT_MODELS.has(model)) return query(args);
          return query(injectOrgIdOnCreate(args as WhereArg, orgId));
        },
        async upsert({ model, args, query }: { model: string; args: any; query: (a: any) => Promise<any> }) {
          if (!TENANT_MODELS.has(model)) return query(args);
          const a = args as WhereArg & {
            create?: Record<string, unknown>;
            update?: Record<string, unknown>;
          };
          const next: typeof a = {
            ...a,
            where: { ...(a.where ?? {}), orgId },
            create: { ...(a.create ?? {}), orgId },
          };
          return query(next as any);
        },
      },
    },
  });
}

export type TenantPrisma = ReturnType<typeof prismaForOrg>;

export interface OrgContext {
  orgId: string;
  userId: string;
  role: Role;
  db: TenantPrisma;
}

/**
 * Resolve the active org for the current request. Throws when the caller
 * isn't authenticated or has no membership — handlers should let that bubble
 * up to a 401/403 response rather than guessing.
 */
export async function getOrgContext(): Promise<OrgContext> {
  const { userId: clerkId, orgId: clerkOrgId } = await auth();
  if (!clerkId) throw new Error("UNAUTHENTICATED");

  const user = await basePrisma.user.findUnique({
    where: { clerkId },
    include: { memberships: true },
  });

  if (!user) {
    const clerk = await currentUser();
    if (!clerk) throw new Error("UNAUTHENTICATED");
    const email = clerk.emailAddresses[0]?.emailAddress;
    if (!email) throw new Error("USER_HAS_NO_EMAIL");
    const created = await basePrisma.user.create({
      data: {
        clerkId,
        email,
        name: [clerk.firstName, clerk.lastName].filter(Boolean).join(" ") || null,
      },
    });
    throw Object.assign(new Error("NO_MEMBERSHIP"), { userId: created.id });
  }

  const membership =
    user.memberships.find((m: any) => m.orgId === clerkOrgId) ?? user.memberships[0];

  if (!membership) throw new Error("NO_MEMBERSHIP");

  return {
    orgId: membership.orgId,
    userId: user.id,
    role: membership.role,
    db: prismaForOrg(membership.orgId),
  };
}

export { basePrisma };
