import { PrismaClient } from "@prisma/client";

import { ensureDemoWorkspace } from "../lib/demo-access";

const prisma = new PrismaClient();

async function main() {
  const result = await ensureDemoWorkspace(prisma);
  console.log("Seeded org:", result.org.slug);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
