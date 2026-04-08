// 给 resumes 表添加缺少的 template 列
import { createClient } from "@libsql/client";

const url = "libsql://resume-zxzx.aws-ap-northeast-1.turso.io";
const authToken = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzU1NTc0ODksImlkIjoiMDE5ZDY3NTQtMmEwMS03YjgwLThmY2EtMDU4Mjc1YWM4NTZmIiwicmlkIjoiODk3YWMwOTYtOGZmNi00MmE5LWEzMTYtY2M2MzU3YjgzYWQ1In0.AKoyzpwXEJqLHhleu_IEszvlHbiVScbQA3KEfYB_e9MkYsxWK89WYgZLV-VvR6SK1Oo3-B6ST96DppAisuNTCA";

async function main() {
  const client = createClient({ url, authToken });

  // 先看当前表结构
  console.log("1. 当前 resumes 表结构:");
  const before = await client.execute("PRAGMA table_info(resumes)");
  const cols = before.rows.map(r => r.name);
  console.log("   列:", cols);

  if (cols.includes("template")) {
    console.log("   ✅ template 列已存在，跳过");
  } else {
    console.log("2. 添加 template 列...");
    await client.execute("ALTER TABLE resumes ADD COLUMN template TEXT DEFAULT 'classic'");
    console.log("   ✅ template 列添加成功");
  }

  // 验证
  console.log("\n3. 验证后的表结构:");
  const after = await client.execute("PRAGMA table_info(resumes)");
  console.log("   列:", after.rows.map(r => r.name));

  await client.close();
  console.log("\n✅ 完成！");
}

main().catch(e => { console.error(e); process.exit(1); });
