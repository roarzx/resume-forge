import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user?.id) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const resume = await prisma.resume.findUnique({
      where: { id },
    });

    if (!resume) {
      return NextResponse.json({ error: "简历不存在" }, { status: 404 });
    }

    if (resume.userId !== session.user.id) {
      return NextResponse.json({ error: "无权限访问" }, { status: 403 });
    }

    // 返回给编辑者的信息（不含分享密码）
    const { sharePassword, ...safeResume } = resume;
    return NextResponse.json(safeResume);
  } catch (error) {
    console.error("获取简历错误:", error);
    return NextResponse.json(
      { error: "获取简历失败" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user?.id) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const existingResume = await prisma.resume.findUnique({
      where: { id },
    });

    if (!existingResume) {
      return NextResponse.json({ error: "简历不存在" }, { status: 404 });
    }

    if (existingResume.userId !== session.user.id) {
      return NextResponse.json({ error: "无权限修改" }, { status: 403 });
    }

    const { title, template, content } = await request.json();

    const resume = await prisma.resume.update({
      where: { id },
      data: {
        title: title ?? existingResume.title,
        template: template ?? existingResume.template,
        content: content ?? existingResume.content,
      },
    });

    return NextResponse.json(resume);
  } catch (error) {
    console.error("更新简历错误:", error);
    return NextResponse.json(
      { error: "更新简历失败" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user?.id) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const existingResume = await prisma.resume.findUnique({
      where: { id },
    });

    if (!existingResume) {
      return NextResponse.json({ error: "简历不存在" }, { status: 404 });
    }

    if (existingResume.userId !== session.user.id) {
      return NextResponse.json({ error: "无权限删除" }, { status: 403 });
    }

    await prisma.resume.delete({
      where: { id },
    });

    return NextResponse.json({ message: "删除成功" });
  } catch (error) {
    console.error("删除简历错误:", error);
    return NextResponse.json(
      { error: "删除简历失败" },
      { status: 500 }
    );
  }
}
