"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, FileText, Edit, Trash2, Copy, Loader2, Calendar } from "lucide-react";
import { TEMPLATES, type TemplateType } from "@/types/resume";

interface Resume {
  id: string;
  title: string;
  template: string;
  createdAt: string;
  updatedAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>("classic");
  const [deleteResumeId, setDeleteResumeId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchResumes();
    }
  }, [status]);

  const fetchResumes = async () => {
    try {
      const response = await fetch("/api/resumes");
      if (response.ok) {
        const data = await response.json();
        setResumes(data);
      }
    } catch (error) {
      console.error("获取简历失败:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const createResume = async () => {
    setIsCreating(true);
    try {
      const response = await fetch("/api/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle || "我的简历",
          template: selectedTemplate,
        }),
      });

      if (response.ok) {
        const resume = await response.json();
        router.push(`/dashboard/${resume.id}/edit`);
      } else {
        toast({
          title: "创建失败",
          description: "请稍后重试",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "创建失败",
        description: "请稍后重试",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const deleteResume = async (id: string) => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/resumes/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setResumes(resumes.filter((r) => r.id !== id));
        toast({
          title: "删除成功",
          description: "简历已删除",
        });
      } else {
        toast({
          title: "删除失败",
          description: "请稍后重试",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "删除失败",
        description: "请稍后重试",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeleteResumeId(null);
    }
  };

  const duplicateResume = async (resume: Resume) => {
    try {
      const response = await fetch("/api/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `${resume.title} (副本)`,
          template: resume.template,
        }),
      });

      if (response.ok) {
        fetchResumes();
        toast({
          title: "复制成功",
          description: "简历副本已创建",
        });
      }
    } catch {
      toast({
        title: "复制失败",
        description: "请稍后重试",
        variant: "destructive",
      });
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/50">
      <div className="container px-4 py-8 mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">我的简历</h1>
            <p className="text-muted-foreground mt-1">
              欢迎回来，{session?.user?.name || session?.user?.email}
            </p>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                新建简历
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>创建新简历</DialogTitle>
                <DialogDescription>
                  选择模板并设置简历标题
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">简历标题</Label>
                  <Input
                    id="title"
                    placeholder="例如：前端工程师简历"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>选择模板</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {TEMPLATES.map((template) => (
                      <div
                        key={template.id}
                        onClick={() => setSelectedTemplate(template.id)}
                        className={`cursor-pointer rounded-lg border-2 p-3 text-center transition-all ${
                          selectedTemplate === template.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="text-3xl mb-1">
                          {template.id === "classic" && "📄"}
                          {template.id === "modern" && "✨"}
                          {template.id === "minimal" && "�简约"}
                        </div>
                        <div className="text-sm font-medium">{template.name}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button onClick={createResume} disabled={isCreating}>
                  {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  创建
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {resumes.length === 0 ? (
          <Card className="max-w-md mx-auto text-center py-12">
            <CardContent>
              <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">还没有简历</h3>
              <p className="text-muted-foreground mb-6">
                创建你的第一份简历，开启求职之旅
              </p>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    创建简历
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>创建新简历</DialogTitle>
                    <DialogDescription>选择模板并设置简历标题</DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="title-empty">简历标题</Label>
                      <Input
                        id="title-empty"
                        placeholder="例如：前端工程师简历"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>选择模板</Label>
                      <div className="grid grid-cols-3 gap-3">
                        {TEMPLATES.map((template) => (
                          <div
                            key={template.id}
                            onClick={() => setSelectedTemplate(template.id)}
                            className={`cursor-pointer rounded-lg border-2 p-3 text-center transition-all ${
                              selectedTemplate === template.id
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/50"
                            }`}
                          >
                            <div className="text-3xl mb-1">
                              {template.id === "classic" && "📄"}
                              {template.id === "modern" && "✨"}
                              {template.id === "minimal" && "🗿"}
                            </div>
                            <div className="text-sm font-medium">{template.name}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button onClick={createResume} disabled={isCreating}>
                      {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      创建
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {resumes.map((resume) => (
              <Card key={resume.id} className="group hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="truncate">{resume.title}</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(resume.updatedAt).toLocaleDateString("zh-CN")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Link href={`/dashboard/${resume.id}/edit`}>
                      <Button variant="outline" className="gap-2">
                        <Edit className="h-4 w-4" />
                        编辑
                      </Button>
                    </Link>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => duplicateResume(resume)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteResumeId(resume.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteResumeId} onOpenChange={() => setDeleteResumeId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              确定要删除这份简历吗？此操作无法撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteResumeId(null)}>
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteResumeId && deleteResume(deleteResumeId)}
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
