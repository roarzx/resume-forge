import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SEED_JOBS } from "@/lib/jobs";

// POST /api/jobs/seed - 初始化职位数据（仅管理员使用，可由 cron 触发）
export async function POST() {
  try {
    let created = 0;
    let skipped = 0;

    for (const job of SEED_JOBS) {
      // 检查是否已存在（按 title + company + sourceUrl 去重）
      const exists = await prisma.job.findFirst({
        where: {
          title: job.title,
          company: job.company,
          source: job.source,
        },
      });

      if (exists) {
        // 更新时间戳
        await prisma.job.update({
          where: { id: exists.id },
          data: { fetchedAt: new Date(), expiresAt: null },
        });
        skipped++;
        continue;
      }

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

    return NextResponse.json({
      success: true,
      message: `职位数据同步完成：新增 ${created} 个，更新 ${skipped} 个`,
      created,
      skipped,
    });
  } catch (error) {
    console.error("POST /api/jobs/seed error:", error);
    return NextResponse.json({ error: "同步职位数据失败" }, { status: 500 });
  }
}
