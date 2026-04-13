import { NextRequest, NextResponse } from "next/server";
import { SEED_JOBS } from "@/lib/jobs";
import { prisma } from "@/lib/prisma";

// Vercel Cron: 每天 6 点自动刷新职位数据
// 触发方式: GET /api/cron/jobs?secret=<CRON_SECRET>
// 或 Vercel 自动触发（需在 vercel.json 配置）
export async function GET(request: NextRequest) {
  // 安全验证：检查 CRON_SECRET（可选）
  const secret = request.nextUrl.searchParams.get("secret");
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let created = 0;
    let updated = 0;

    for (const job of SEED_JOBS) {
      const exists = await prisma.job.findFirst({
        where: {
          title: job.title,
          company: job.company,
          source: job.source,
        },
      });

      if (exists) {
        await prisma.job.update({
          where: { id: exists.id },
          data: {
            fetchedAt: new Date(),
            salary: job.salary,
            tags: JSON.stringify(job.tags),
            description: job.description,
            expiresAt: null,
          },
        });
        updated++;
      } else {
        await prisma.job.create({
          data: {
            title: job.title,
            company: job.company,
            city: job.city,
            source: job.source,
            sourceUrl: job.sourceUrl,
            salary: job.salary,
            tags: JSON.stringify(job.tags),
            description: job.description,
          },
        });
        created++;
      }
    }

    console.log(`[Cron] 职位数据同步完成: 新增 ${created}, 更新 ${updated}`);

    return NextResponse.json({
      success: true,
      created,
      updated,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Cron] 职位数据同步失败:", error);
    return NextResponse.json({ error: "同步失败" }, { status: 500 });
  }
}
