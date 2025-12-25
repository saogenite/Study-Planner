import { PrismaClient } from "@prisma/client";

type PrismaGlobal = typeof globalThis & {
  prisma?: PrismaClient;
};

const globalWithPrisma = globalThis as PrismaGlobal;

export const prisma =
  globalWithPrisma.prisma ??
  new PrismaClient({
    log: ["error", "warn"]
  });

if (process.env.NODE_ENV !== "production") {
  globalWithPrisma.prisma = prisma;
}
