// 测试 Prisma + libsql adapter 写入
import { createClient } from "@libsql/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { PrismaClient } from "@prisma/client";

const url = "libsql://resume-zxzx.aws-ap-northeast-1.turso.io";
const authToken = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzU1NTc0ODksImlkIjoiMDE5ZDY3NTQtMmEwMS03YjgwLThmY2EtMDU4Mjc1YWM4NTZmIiwicmlkIjoiODk3YWMwOTYtOGZmNi00MmE5LWEzMTYtY2M2MzU3YjgzYWQ1In0.AKoyzpwXEJqLHhleu_IEszvlHbiVScbQA3KEfYB_e9MkYsxWK89WYgZLV-VvR6SK1Oo3-B6ST96DppAisuNTCA";

async function main() {
  console.log("1. 创建 libsql client...");
  const libsql = createClient({ url, authToken });

  console.log("2. 创建 Prisma adapter...");
  const adapter = new PrismaLibSQL(libsql);

  console.log("3. 创建 PrismaClient...");
  const prisma = new PrismaClient({ adapter });

  console.log("4. 尝试 prisma.user.count()...");
  try {
    const count = await prisma.user.count();
    console.log("   ✅ count:", count);
  } catch (e) {
    console.log("   ❌ count 失败:", e.message);
    console.log("   错误详情:", e);
  }

  console.log("5. 尝试 prisma.user.create()...");
  try {
    const user = await prisma.user.create({
      data: {
        email: `prisma_test_${Date.now()}@test.com`,
        password: "hashed_password_test",
        name: "PrismaTest",
      }
    });
    console.log("   ✅ 创建成功:", user.id, user.email);

    // 清理
    await prisma.user.delete({ where: { id: user.id } });
    console.log("   ✅ 测试数据已清理");
  } catch (e) {
    console.log("   ❌ create 失败:", e.message);
    console.log("   错误详情:", JSON.stringify(e, null, 2));
  }

  await prisma.$disconnect();
}

main().catch(e => {
  console.error("致命错误:", e.message);
  console.error(e);
  process.exit(1);
});
