import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

async function createPrismaClient(): Promise<PrismaClient> {
  // 生产环境：使用 Turso libsql adapter
  if (process.env.NODE_ENV === "production" || process.env.TURSO_DATABASE_AUTH_TOKEN) {
    const { createClient } = await import("@libsql/client");
    const { PrismaLibSQL } = await import("@prisma/adapter-libsql");

    const libsql = createClient({
      url: process.env.DATABASE_URL!,
      authToken: process.env.TURSO_DATABASE_AUTH_TOKEN,
    });

    const adapter = new PrismaLibSQL(libsql);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new PrismaClient({ adapter } as any);
  }

  // 本地开发：直接连接 SQLite 文件
  return new PrismaClient();
}

// 同步初始化：为了与 Next.js 模块缓存兼容，使用懒加载单例
let _prisma: PrismaClient | undefined;
let _prismaPromise: Promise<PrismaClient> | undefined;

function getPrisma(): PrismaClient {
  if (_prisma) return _prisma;

  // 如果没有 Turso token，直接同步创建（本地）
  if (!process.env.TURSO_DATABASE_AUTH_TOKEN) {
    _prisma = new PrismaClient();
    return _prisma;
  }

  // 有 Turso token 时，需要异步创建，但先返回一个占位
  // 实际上在 Next.js 环境中，模块初始化时 env vars 已经可用
  // 所以我们用同步的方式通过 require 加载
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createClient } = require("@libsql/client");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaLibSQL } = require("@prisma/adapter-libsql");

    const libsql = createClient({
      url: process.env.DATABASE_URL!,
      authToken: process.env.TURSO_DATABASE_AUTH_TOKEN,
    });

    const adapter = new PrismaLibSQL(libsql);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _prisma = new PrismaClient({ adapter } as any);
    return _prisma;
  } catch (e) {
    console.error("Failed to create libsql adapter, falling back to default:", e);
    _prisma = new PrismaClient();
    return _prisma;
  }
}

export const prisma = globalForPrisma.prisma ?? getPrisma();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
