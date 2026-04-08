// 测试 resumes 表 Prisma 写入
import { createClient } from "@libsql/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { PrismaClient } from "@prisma/client";

const url = "libsql://resume-zxzx.aws-ap-northeast-1.turso.io";
const authToken = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzU1NTc0ODksImlkIjoiMDE5ZDY3NTQtMmEwMS03YjgwLThmY2EtMDU4Mjc1YWM4NTZmIiwicmlkIjoiODk3YWMwOTYtOGZmNi00MmE5LWEzMTYtY2M2MzU3YjgzYWQ1In0.AKoyzpwXEJqLHhleu_IEszvlHbiVScbQA3KEfYB_e9MkYsxWK89WYgZLV-VvR6SK1Oo3-B6ST96DppAisuNTCA";

async function main() {
  const libsql = createClient({ url, authToken });
  const adapter = new PrismaLibSQL(libsql);
  const prisma = new PrismaClient({ adapter });

  // 先查一下 resumes 表结构
  console.log("1. 查看 resumes 表实际结构...");
  const schema = await libsql.execute("PRAGMA table_info(resumes)");
  console.log("   字段:", schema.rows.map(r => `${r.name}(${r.type})`));

  // 查一下 users 表有没有用户
  console.log("\n2. 查看 users 表...");
  const users = await libsql.execute("SELECT id, email FROM users LIMIT 5");
  console.log("   用户数:", users.rows.length);
  if (users.rows.length > 0) {
    console.log("   示例:", users.rows[0]);
  }

  if (users.rows.length === 0) {
    console.log("\n⚠️ 没有用户数据，先创建一个测试用户...");
    await libsql.execute({
      sql: "INSERT INTO users (id, email, password, name, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)",
      args: ["test_uid_1", "test@resume.com", "pw", "TestUser", new Date().toISOString(), new Date().toISOString()]
    });
    console.log("   ✅ 测试用户创建成功");
  }

  const userId = users.rows[0]?.id || "test_uid_1";

  console.log("\n3. 测试 prisma.resume.create()...");
  try {
    const resume = await prisma.resume.create({
      data: {
        userId,
        title: "AI应用开发",
        template: "classic",
        content: JSON.stringify({ basic: { name: "Test" }, education: [], experience: [], projects: [], skills: [], certificates: [] }),
      }
    });
    console.log("   ✅ 创建成功:", resume.id, resume.title);

    // 清理
    await prisma.resume.delete({ where: { id: resume.id } });
    console.log("   ✅ 测试数据已清理");
  } catch (e) {
    console.log("   ❌ 创建失败:", e.message);
    if (e.code) console.log("   code:", e.code);
    if (e.meta) console.log("   meta:", JSON.stringify(e.meta));
  }

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
