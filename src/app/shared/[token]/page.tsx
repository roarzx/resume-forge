"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ResumeTemplateRenderer } from "@/components/templates";
import type { ResumeContent } from "@/types/resume";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Lock, FileText } from "lucide-react";
import Link from "next/link";

interface ResumeData {
  id: string;
  title: string;
  template: string;
  content: string;
}

export default function SharedResumePage() {
  const params = useParams();
  const token = params.token as string;

  const [resume, setResume] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const fetchResume = async (pwd?: string) => {
    setLoading(true);
    setError(null);
    setPasswordError(false);

    try {
      const url = pwd ? `/api/shared/${token}?password=${encodeURIComponent(pwd)}` : `/api/shared/${token}`;
      const response = await fetch(url);

      if (response.status === 401) {
        setRequiresPassword(true);
        setLoading(false);
        return;
      }

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "加载失败");
        setLoading(false);
        return;
      }

      const data = await response.json();
      setResume(data);
      setRequiresPassword(false);
    } catch {
      setError("网络错误，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResume();
  }, [token]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;
    setIsVerifying(true);
    fetchResume(password).finally(() => setIsVerifying(false));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-3 text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/50">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">无法访问</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Link href="/">
              <Button variant="outline">返回首页</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (requiresPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/50">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6">
            <div className="text-center mb-6">
              <Lock className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <h2 className="text-xl font-semibold">此简历已加密</h2>
              <p className="text-muted-foreground text-sm mt-1">
                请输入密码查看
              </p>
            </div>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">访问密码</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="请输入密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                />
                {passwordError && (
                  <p className="text-sm text-destructive">密码错误，请重试</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={isVerifying || !password.trim()}>
                {isVerifying ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                查看简历
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!resume) return null;

  let content: ResumeContent;
  try {
    content =
      typeof resume.content === "string"
        ? JSON.parse(resume.content)
        : resume.content;
  } catch {
    content = {
      basic: { name: "未找到内容", email: "", phone: "" },
      education: [],
      experience: [],
      projects: [],
      skills: [],
      certificates: [],
    };
  }

  return (
    <div className="min-h-screen bg-muted/50 py-8">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold">{resume.title}</h1>
        <p className="text-muted-foreground text-sm mt-1">
          由 {content.basic?.name || "简历工坊"} 分享
        </p>
      </div>

      <div className="flex justify-center">
        <div
          className="bg-white shadow-2xl"
          style={{ width: "210mm", minHeight: "297mm" }}
        >
          <ResumeTemplateRenderer template={resume.template as "classic" | "modern" | "minimal"} content={content} />
        </div>
      </div>

      <div className="text-center mt-8">
        <p className="text-sm text-muted-foreground mb-3">使用简历工坊制作你的专属简历</p>
        <Link href="/register">
          <Button size="sm" variant="outline">免费创建简历 →</Button>
        </Link>
      </div>
    </div>
  );
}
