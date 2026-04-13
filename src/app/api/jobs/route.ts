import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { extractSkillsFromResume, matchJobsToSkills } from "@/lib/jobs";

// GET /api/jobs - 获取推荐职位
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);
    const resumeId = searchParams.get("resumeId");
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 50);
    const page = parseInt(searchParams.get("page") || "1");

    // 获取所有未过期的职位
    const jobs = await prisma.job.findMany({
      where: {
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
      orderBy: { fetchedAt: "desc" },
      take: 100, // 先拉足够多用于匹配
    });

    // 如果提供了 resumeId，根据简历技能过滤并排序
    if (resumeId) {
      const resume = await prisma.resume.findUnique({
        where: { id: resumeId, ...(session?.user?.email ? { user: { email: session.user.email } } : {}) },
        select: { content: true },
      });

      if (resume) {
        const resumeSkills = extractSkillsFromResume(resume.content);
        const matched = matchJobsToSkills(jobs, resumeSkills);

        const total = matched.length;
        const paginated = matched.slice((page - 1) * limit, page * limit);

        return NextResponse.json({
          jobs: paginated.map(({ job, score, matchedTags }) => ({
            ...job,
            score,
            matchedTags,
          })),
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
          resumeSkills,
        });
      }
    }

    // 无 resumeId 时返回全部（按 fetchAt 排序）
    const total = jobs.length;
    const paginated = jobs.slice((page - 1) * limit, page * limit);

    return NextResponse.json({
      jobs: paginated,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/jobs error:", error);
    return NextResponse.json({ error: "获取职位失败" }, { status: 500 });
  }
}
