import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const resumes = await prisma.resume.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(resumes);
  } catch (error) {
    console.error("获取简历列表错误:", error);
    return NextResponse.json(
      { error: "获取简历列表失败" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const { title, template, content } = await request.json();

    const resume = await prisma.resume.create({
      data: {
        userId: session.user.id,
        title: title || "我的简历",
        template: template || "classic",
        content: content || JSON.stringify({
          basic: {
            name: "",
            title: "",
            email: "",
            phone: "",
            location: "",
            website: "",
            summary: "",
          },
          education: [],
          experience: [],
          projects: [],
          skills: [],
          certificates: [],
        }),
      },
    });

    return NextResponse.json(resume);
  } catch (error) {
    console.error("创建简历错误:", error);
    return NextResponse.json(
      { error: "创建简历失败" },
      { status: 500 }
    );
  }
}
