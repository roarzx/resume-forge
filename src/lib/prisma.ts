import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  // 本地开发用 SQLite，不需要 adapter
  if (process.env.NODE_ENV === "development" || !process.env.TURSO_DATABASE_AUTH_TOKEN) {
    return new PrismaClient();
  }

  // 生产环境用 Turso（v5 adapter：先创建 libsql client，再传给 PrismaLibSQL）
  const libsql = createClient({
    url: process.env.DATABASE_URL!,
    authToken: process.env.TURSO_DATABASE_AUTH_TOKEN!,
  });

  const adapter = new PrismaLibSQL(libsql);
  // @ts-expect-error - adapter is available with driverAdapters preview feature
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
