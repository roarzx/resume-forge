import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  // 本地开发用 SQLite（文件），不需要 adapter
  if (process.env.NODE_ENV === "development" || !process.env.TURSO_DATABASE_AUTH_TOKEN) {
    return new PrismaClient();
  }

  // 生产环境用 Turso（v7 adapter 直接接收配置对象）
  const adapter = new PrismaLibSQL({
    url: process.env.DATABASE_URL!,
    authToken: process.env.TURSO_DATABASE_AUTH_TOKEN!,
  });

  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
