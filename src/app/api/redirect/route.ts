import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/redirect?jobId=xxx - 记录点击后 302 跳转到原平台
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get("jobId");
  const userId = searchParams.get("userId");

  if (!jobId) {
    return NextResponse.json({ error: "缺少 jobId" }, { status: 400 });
  }

  try {
    const job = await prisma.job.findUnique({ where: { id: jobId } });

    if (!job) {
      return NextResponse.json({ error: "职位不存在" }, { status: 404 });
    }

    // 异步记录点击（不阻塞跳转）
    prisma.jobClick
      .create({
        data: {
          jobId,
          userId: userId || null,
        },
      })
      .catch((err) => console.error("记录点击失败:", err));

    // 302 跳转到原始招聘平台
    return NextResponse.redirect(job.sourceUrl, 302);
  } catch (error) {
    console.error("GET /api/redirect error:", error);
    // 即使记录失败也跳转
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (job) {
      return NextResponse.redirect(job.sourceUrl, 302);
    }
    return NextResponse.json({ error: "跳转失败" }, { status: 500 });
  }
}
