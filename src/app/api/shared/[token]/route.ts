import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const { searchParams } = new URL(request.url);
    const password = searchParams.get("password");

    const resume = await prisma.resume.findUnique({
      where: { shareToken: token },
      select: {
        id: true,
        title: true,
        template: true,
        content: true,
        sharePassword: true,
      },
    });

    if (!resume) {
      return NextResponse.json({ error: "简历不存在或分享链接已失效" }, { status: 404 });
    }

    // 密码保护检查
    if (resume.sharePassword) {
      if (!password) {
        return NextResponse.json({ requiresPassword: true }, { status: 401 });
      }
      if (password !== resume.sharePassword) {
        return NextResponse.json({ error: "密码错误" }, { status: 403 });
      }
    }

    return NextResponse.json({
      id: resume.id,
      title: resume.title,
      template: resume.template,
      content: resume.content,
    });
  } catch (error) {
    console.error("获取分享简历错误:", error);
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}
