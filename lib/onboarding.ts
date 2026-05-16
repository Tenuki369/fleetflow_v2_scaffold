import { Prisma, Role } from "@prisma/client";
import { auth, currentUser } from "@clerk/nextjs/server";

import { basePrisma } from "@/lib/auth/tenancy";

const MAX_SLUG_ATTEMPTS = 8;

function normalizeOrgName(name: string) {
  return name.trim().replace(/\s+/g, " ");
}

export function slugifyOrgName(name: string) {
  const slug = normalizeOrgName(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48)
    .replace(/-+$/g, "");

  return slug || "fleetflow-org";
}

function slugForAttempt(baseSlug: string, attempt: number) {
  if (attempt === 0) return baseSlug;
  const suffix = attempt + 1;
  return `${baseSlug.slice(0, Math.max(1, 58 - String(suffix).length))}-${suffix}`;
}

function isRetryableBootstrapError(error: unknown) {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) return false;
  return error.code === "P2002" || error.code === "P2034";
}

export async function createFirstOrgForCurrentUser(input: { name: string }) {
  const name = normalizeOrgName(input.name);
  if (name.length < 2) {
    throw new Error("ORG_NAME_REQUIRED");
  }

  const { userId: clerkId } = await auth();
  if (!clerkId) {
    throw new Error("UNAUTHENTICATED");
  }

  const clerk = await currentUser();
  if (!clerk) {
    throw new Error("UNAUTHENTICATED");
  }

  const email = clerk.emailAddresses[0]?.emailAddress;
  if (!email) {
    throw new Error("USER_HAS_NO_EMAIL");
  }

  const baseSlug = slugifyOrgName(name);

  for (let attempt = 0; attempt < MAX_SLUG_ATTEMPTS; attempt += 1) {
    const slug = slugForAttempt(baseSlug, attempt);

    try {
      return await basePrisma.$transaction(
        async (tx) => {
          const user = await tx.user.upsert({
            where: { clerkId },
            create: {
              clerkId,
              email,
              name: [clerk.firstName, clerk.lastName].filter(Boolean).join(" ") || null,
            },
            update: {
              email,
              name: [clerk.firstName, clerk.lastName].filter(Boolean).join(" ") || null,
            },
          });

          await tx.$queryRaw`SELECT id FROM "User" WHERE id = ${user.id} FOR UPDATE`;

          const existingMembership = await tx.membership.findFirst({
            where: { userId: user.id },
            include: { org: true },
            orderBy: { createdAt: "asc" },
          });

          if (existingMembership) {
            return {
              created: false,
              org: existingMembership.org,
              membership: existingMembership,
            };
          }

          const org = await tx.org.create({
            data: { name, slug },
          });

          const membership = await tx.membership.create({
            data: {
              orgId: org.id,
              userId: user.id,
              role: Role.OWNER,
            },
          });

          return { created: true, org, membership };
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    } catch (error) {
      if (attempt < MAX_SLUG_ATTEMPTS - 1 && isRetryableBootstrapError(error)) {
        continue;
      }
      throw error;
    }
  }

  throw new Error("ORG_SLUG_UNAVAILABLE");
}
