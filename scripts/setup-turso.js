/**
 * 初始化 Turso 数据库 schema
 * 运行一次即可：node scripts/setup-turso.js
 */
import { createClient } from "@libsql/client";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const sql = `
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");

CREATE TABLE IF NOT EXISTS "Resume" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT '我的简历',
    "template" TEXT NOT NULL DEFAULT 'classic',
    "content" TEXT NOT NULL DEFAULT '{}',
    "shareToken" TEXT,
    "sharePassword" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Resume_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "Resume_shareToken_key" ON "Resume"("shareToken");
`;

try {
  await client.executeMultiple(sql);
  console.log("✅ Turso 数据库 schema 初始化成功！");
} catch (err) {
  console.error("❌ 初始化失败:", err.message);
  process.exit(1);
} finally {
  await client.close();
}
