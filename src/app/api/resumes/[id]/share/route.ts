import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

function generateShareToken(): string {
  return crypto.randomBytes(16).toString("hex");
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user?.id) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const resume = await prisma.resume.findUnique({ where: { id } });

    if (!resume) {
      return NextResponse.json({ error: "简历不存在" }, { status: 404 });
    }

    if (resume.userId !== session.user.id) {
      return NextResponse.json({ error: "无权限" }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const { enable, password } = body as { enable?: boolean; password?: string };

    if (enable === false) {
      // 取消分享
      await prisma.resume.update({
        where: { id },
        data: { shareToken: null, sharePassword: null },
      });
      return NextResponse.json({ shareToken: null });
    }

    // 生成或复用分享链接
    const shareToken = resume.shareToken || generateShareToken();
    const sharePassword = password || null;

    await prisma.resume.update({
      where: { id },
      data: { shareToken, sharePassword },
    });

    return NextResponse.json({
      shareToken,
      hasPassword: !!sharePassword,
    });
  } catch (error) {
    console.error("分享设置错误:", error);
    return NextResponse.json({ error: "操作失败" }, { status: 500 });
  }
}
