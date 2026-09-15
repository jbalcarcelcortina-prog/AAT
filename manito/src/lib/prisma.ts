import { PrismaClient } from "@prisma/client";

/**
 * A single PrismaClient for the whole process.
 *
 * Next.js hot-reloads modules in development, which would otherwise open a new
 * database connection on every save until SQLite runs out of handles. Stashing
 * the client on `globalThis` survives the reload.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
