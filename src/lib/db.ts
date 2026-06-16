import path from "node:path";
import { PrismaClient } from "@prisma/client";

// Resolve the SQLite file to an absolute path so the runtime client always
// opens the same database the CLI migrates (Prisma resolves relative SQLite
// URLs differently for the CLI vs. the client). The host runs with the project
// root as CWD, so data/orpg.db lands next to the repo.
const dbFile = path.join(process.cwd(), "data", "orpg.db");

// Reuse the client across hot reloads in dev to avoid exhausting connections.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: { db: { url: `file:${dbFile}` } },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
