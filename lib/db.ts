import { PrismaClient } from "@prisma/client";

export const basePrisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
});
