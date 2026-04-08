// 直接测试 Turso 数据库连接
import { createClient } from "@libsql/client";

const url = "libsql://resume-zxzx.aws-ap-northeast-1.turso.io";
const authToken = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzU1NTc0ODksImlkIjoiMDE5ZDY3NTQtMmEwMS03YjgwLThmY2EtMDU4Mjc1YWM4NTZmIiwicmlkIjoiODk3YWMwOTYtOGZmNi00MmE5LWEzMTYtY2M2MzU3YjgzYWQ1In0.AKoyzpwXEJqLHhleu_IEszvlHbiVScbQA3KEfYB_e9MkYsxWK89WYgZLV-VvR6SK1Oo3-B6ST96DppAisuNTCA";

async function main() {
  console.log("1. 连接 Turso...");
  const client = createClient({ url, authToken });

  console.log("2. 查询所有表...");
  const tables = await client.execute("SELECT name FROM sqlite_master WHERE type='table'");
  console.log("   表列表:", tables.rows.map(r => r.name));

  console.log("3. 查询 User 表结构...");
  try {
    const schema = await client.execute("PRAGMA table_info(users)");
    console.log("   users 表字段:", schema.rows.map(r => `${r.name}(${r.type})`));
  } catch (e) {
    console.log("   ❌ users 表不存在或查询失败:", e.message);
  }

  console.log("4. 查询 User 表记录数...");
  try {
    const count = await client.execute("SELECT COUNT(*) as cnt FROM users");
    console.log("   记录数:", count.rows[0].cnt);
  } catch (e) {
    console.log("   ❌ 查询失败:", e.message);
  }

  console.log("5. 尝试插入测试用户...");
  try {
    const id = "test_" + Date.now();
    await client.execute({
      sql: "INSERT INTO users (id, email, password, name, createdAt) VALUES (?, ?, ?, ?, ?)",
      args: [id, `dbtest_${Date.now()}@test.com`, "hashed_pw", "dbtest", new Date().toISOString()]
    });
    console.log("   ✅ 直接 SQL 插入成功，id:", id);

    // 删掉测试数据
    await client.execute({ sql: "DELETE FROM users WHERE id = ?", args: [id] });
    console.log("   ✅ 测试数据已清理");
  } catch (e) {
    console.log("   ❌ 插入失败:", e.message);
    console.log("   完整错误:", e);
  }

  await client.close();
}

main().catch(e => {
  console.error("致命错误:", e);
  process.exit(1);
});
