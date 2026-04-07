"use client";

import { useEffect, useState, useCallback, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useForm, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ResumeTemplateRenderer } from "@/components/templates";
import { ShareDialog } from "@/components/share-dialog";
import { AtsScoreDialog } from "@/components/ats-score-dialog";
import {
  DEFAULT_RESUME_CONTENT,
  TEMPLATES,
  type ResumeContent,
  type TemplateType,
} from "@/types/resume";
import {
  Save,
  Download,
  ArrowLeft,
  Plus,
  Trash2,
  Loader2,
  CheckCircle,
  FileText,
  User,
  GraduationCap,
  Briefcase,
  FolderKanban,
  Award,
  Sparkles,
  Share2,
  TrendingUp,
  Maximize2,
  Minimize2,
} from "lucide-react";
import Link from "next/link";

interface ResumeData {
  id: string;
  title: string;
  template: string;
  content: ResumeContent;
  shareToken?: string | null;
  sharePassword?: string | null;
}

interface FormData {
  basic: {
    name: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    website: string;
    summary: string;
  };
  education: Array<{
    id: string;
    school: string;
    major: string;
    degree: string;
    startDate: string;
    endDate: string;
    gpa: string;
    honors: string;
  }>;
  experience: Array<{
    id: string;
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  projects: Array<{
    id: string;
    name: string;
    role: string;
    startDate: string;
    endDate: string;
    description: string;
    technologies: string;
  }>;
  skills: string;
  certificates: Array<{
    id: string;
    name: string;
    date: string;
  }>;
}

const generateId = () => Math.random().toString(36).substring(2, 11);

export default function EditResumePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: session, status } = useSession();
  const { toast } = useToast();

  const [resume, setResume] = useState<ResumeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [previewScale, setPreviewScale] = useState(0.8);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>("classic");
  const [isExporting, setIsExporting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [atsOpen, setAtsOpen] = useState(false);
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasChangesRef = useRef(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const { register, control, watch, setValue, reset } = useForm<FormData>({
    defaultValues: {
      basic: DEFAULT_RESUME_CONTENT.basic,
      education: [],
      experience: [],
      projects: [],
      skills: "",
      certificates: [],
    },
  });

  const {
    fields: eduFields,
    append: appendEdu,
    remove: removeEdu,
  } = useFieldArray({ control, name: "education" });

  const {
    fields: expFields,
    append: appendExp,
    remove: removeExp,
  } = useFieldArray({ control, name: "experience" });

  const {
    fields: projFields,
    append: appendProj,
    remove: removeProj,
  } = useFieldArray({ control, name: "projects" });

  const {
    fields: certFields,
    append: appendCert,
    remove: removeCert,
  } = useFieldArray({ control, name: "certificates" });

  const formValues = watch();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchResume();
    }
  }, [status, id]);

  const fetchResume = async () => {
    try {
      const response = await fetch(`/api/resumes/${id}`);
      if (response.ok) {
        const data = await response.json();
        setResume(data);
        setSelectedTemplate(data.template as TemplateType);

        const content = typeof data.content === "string"
          ? JSON.parse(data.content)
          : data.content;

        reset({
          basic: content.basic || DEFAULT_RESUME_CONTENT.basic,
          education: content.education || [],
          experience: content.experience || [],
          projects: (content.projects || []).map((p: { technologies?: string[] }) => ({
            ...p,
            technologies: p.technologies?.join(", ") || "",
          })),
          skills: (content.skills || []).join(", "),
          certificates: content.certificates || [],
        });
      } else {
        toast({
          title: "加载失败",
          description: "简历不存在",
          variant: "destructive",
        });
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("获取简历失败:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 监听表单变化，触发自动保存
  useEffect(() => {
    if (isLoading) return;
    hasChangesRef.current = true;

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    setSaveStatus("idle");

    autoSaveTimerRef.current = setTimeout(() => {
      if (hasChangesRef.current && resume) {
        hasChangesRef.current = false;
        setSaveStatus("saving");
        saveResume(true).then(() => {
          setSaveStatus("saved");
          setTimeout(() => setSaveStatus("idle"), 3000);
        }).catch(() => {
          setSaveStatus("error");
        });
      }
    }, 30000); // 30秒自动保存

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [formValues]);

  const saveResume = useCallback(async (isAutoSave = false) => {
    if (!resume) return;

    setIsSaving(true);

    try {
      const content: ResumeContent = {
        basic: formValues.basic,
        education: formValues.education,
        experience: formValues.experience,
        projects: formValues.projects.map((p) => ({
          ...p,
          technologies: p.technologies
            ? p.technologies.split(",").map((t) => t.trim()).filter(Boolean)
            : [],
        })),
        skills: formValues.skills
          ? formValues.skills.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
        certificates: formValues.certificates,
      };

      const response = await fetch(`/api/resumes/${resume.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: JSON.stringify(content),
          template: selectedTemplate,
        }),
      });

      if (response.ok) {
        if (!isAutoSave) {
          toast({ title: "保存成功 ✓" });
        }
      } else {
        if (!isAutoSave) {
          toast({ title: "保存失败", variant: "destructive" });
        }
      }
    } catch {
      if (!isAutoSave) {
        toast({ title: "保存失败", variant: "destructive" });
      }
    } finally {
      setIsSaving(false);
    }
  }, [resume, formValues, selectedTemplate, toast]);

  const exportPDF = async () => {
    if (!previewRef.current || !resume) return;

    setIsExporting(true);

    try {
      // 保存当前的缩放比例，临时切换到 100% 获得最佳输出质量
      const currentScale = previewScale;
      setPreviewScale(1);

      // 等待 DOM 更新
      await new Promise((resolve) => setTimeout(resolve, 150));

      const element = previewRef.current;

      // 配置 PDF 选项
      const options = {
        margin: 0,
        filename: `${resume.title || "简历"}_${new Date().toLocaleDateString("zh-CN").replace(/\//g, "-")}.pdf`,
        image: { type: "jpeg" as const, quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          letterRendering: true,
          logging: false,
        },
        jsPDF: {
          unit: "mm" as const,
          format: "a4" as const,
          orientation: "portrait" as const,
        },
      };

      // 动态导入 html2pdf（仅客户端，避免 SSR "self is not defined"）
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { default: html2pdf } = await import("html2pdf.js" as any);

      // 生成 PDF
      await html2pdf().set(options).from(element).save();

      toast({
        title: "导出成功 🎉",
        description: "PDF 文件已保存到下载文件夹",
      });

      // 恢复缩放比例
      setPreviewScale(currentScale);
    } catch (error) {
      console.error("PDF 导出失败:", error);
      toast({
        title: "导出失败",
        description: "请稍后重试",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const getPreviewContent = (): ResumeContent => {
    return {
      basic: formValues.basic,
      education: formValues.education,
      experience: formValues.experience,
      projects: formValues.projects.map((p) => ({
        ...p,
        technologies: p.technologies
          ? p.technologies.split(",").map((t) => t.trim()).filter(Boolean)
          : [],
      })),
      skills: formValues.skills
        ? formValues.skills.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
      certificates: formValues.certificates,
    };
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted/50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="container px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="font-semibold">{resume?.title || "编辑简历"}</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {saveStatus === "saving" && (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    自动保存中...
                  </>
                )}
                {saveStatus === "saved" && (
                  <>
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    已保存
                  </>
                )}
                {saveStatus === "error" && (
                  <>
                    <span className="h-3 w-3 rounded-full bg-red-500 inline-block" />
                    保存失败
                  </>
                )}
                {saveStatus === "idle" && !isSaving && (
                  <span className="text-xs">编辑中...</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* ATS 评分 */}
            <Button variant="outline" onClick={() => setAtsOpen(true)} title="ATS 简历评分">
              <TrendingUp className="h-4 w-4" />
              评分
            </Button>

            {/* 分享 */}
            <Button variant="outline" onClick={() => setShareOpen(true)} title="分享简历">
              <Share2 className="h-4 w-4" />
              分享
            </Button>

            {/* 手动保存 */}
            <Button variant="outline" onClick={() => saveResume(false)} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              保存
            </Button>

            {/* 全屏预览 */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? "退出全屏" : "全屏预览"}
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>

            {/* 导出 PDF */}
            <Button variant="default" onClick={exportPDF} disabled={isExporting}>
              {isExporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {isExporting ? "导出中..." : "导出 PDF"}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className={`flex-1 flex ${isFullscreen ? "fixed inset-0 z-50 bg-background" : ""}`}>
        {isFullscreen && (
          <div className="absolute top-4 right-4 z-10">
            <Button variant="secondary" size="icon" onClick={() => setIsFullscreen(false)}>
              <Minimize2 className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Editor Panel */}
        <div className={`${isFullscreen ? "hidden" : "w-[480px] border-r bg-background overflow-y-auto"}`}>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="w-full grid grid-cols-6 rounded-none border-b">
              <TabsTrigger value="basic" className="text-xs">
                <User className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="education" className="text-xs">
                <GraduationCap className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="experience" className="text-xs">
                <Briefcase className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="projects" className="text-xs">
                <FolderKanban className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="skills" className="text-xs">
                <Sparkles className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="certificates" className="text-xs">
                <Award className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>

            {/* Basic Info */}
            <TabsContent value="basic" className="p-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">基本信息</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">姓名</Label>
                    <Input id="name" placeholder="你的姓名" {...register("basic.name")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title">职位/头衔</Label>
                    <Input id="title" placeholder="例如：前端工程师" {...register("basic.title")} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">邮箱</Label>
                      <Input id="email" type="email" placeholder="email@example.com" {...register("basic.email")} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">手机</Label>
                      <Input id="phone" placeholder="138-0000-0000" {...register("basic.phone")} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">地址</Label>
                    <Input id="location" placeholder="北京市朝阳区" {...register("basic.location")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">个人网站</Label>
                    <Input id="website" placeholder="https://example.com" {...register("basic.website")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="summary">个人简介</Label>
                    <Textarea
                      id="summary"
                      placeholder="简短介绍你的背景和优势..."
                      {...register("basic.summary")}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Education */}
            <TabsContent value="education" className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">教育经历</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    appendEdu({
                      id: generateId(),
                      school: "",
                      major: "",
                      degree: "",
                      startDate: "",
                      endDate: "",
                      gpa: "",
                      honors: "",
                    })
                  }
                >
                  <Plus className="h-4 w-4 mr-1" />
                  添加
                </Button>
              </div>
              {eduFields.map((field, index) => (
                <Card key={field.id}>
                  <CardContent className="pt-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">教育经历 {index + 1}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeEdu(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <Label>学校</Label>
                      <Input placeholder="学校名称" {...register(`education.${index}.school`)} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>专业</Label>
                        <Input placeholder="专业" {...register(`education.${index}.major`)} />
                      </div>
                      <div className="space-y-2">
                        <Label>学位</Label>
                        <Input placeholder="学士/硕士" {...register(`education.${index}.degree`)} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>开始时间</Label>
                        <Input placeholder="2020.09" {...register(`education.${index}.startDate`)} />
                      </div>
                      <div className="space-y-2">
                        <Label>结束时间</Label>
                        <Input placeholder="2024.06" {...register(`education.${index}.endDate`)} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>GPA</Label>
                      <Input placeholder="3.8/4.0" {...register(`education.${index}.gpa`)} />
                    </div>
                    <div className="space-y-2">
                      <Label>荣誉奖励</Label>
                      <Input placeholder="优秀学生、奖学金等" {...register(`education.${index}.honors`)} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* Experience */}
            <TabsContent value="experience" className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">工作经历</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    appendExp({
                      id: generateId(),
                      company: "",
                      position: "",
                      startDate: "",
                      endDate: "",
                      description: "",
                    })
                  }
                >
                  <Plus className="h-4 w-4 mr-1" />
                  添加
                </Button>
              </div>
              {expFields.map((field, index) => (
                <Card key={field.id}>
                  <CardContent className="pt-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">工作经历 {index + 1}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeExp(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>公司</Label>
                        <Input placeholder="公司名称" {...register(`experience.${index}.company`)} />
                      </div>
                      <div className="space-y-2">
                        <Label>职位</Label>
                        <Input placeholder="岗位名称" {...register(`experience.${index}.position`)} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>开始时间</Label>
                        <Input placeholder="2022.01" {...register(`experience.${index}.startDate`)} />
                      </div>
                      <div className="space-y-2">
                        <Label>结束时间</Label>
                        <Input placeholder="至今" {...register(`experience.${index}.endDate`)} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>工作描述</Label>
                      <Textarea
                        placeholder="描述你的工作职责和成就..."
                        {...register(`experience.${index}.description`)}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* Projects */}
            <TabsContent value="projects" className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">项目经历</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    appendProj({
                      id: generateId(),
                      name: "",
                      role: "",
                      startDate: "",
                      endDate: "",
                      description: "",
                      technologies: "",
                    })
                  }
                >
                  <Plus className="h-4 w-4 mr-1" />
                  添加
                </Button>
              </div>
              {projFields.map((field, index) => (
                <Card key={field.id}>
                  <CardContent className="pt-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">项目 {index + 1}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeProj(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>项目名称</Label>
                        <Input placeholder="项目名称" {...register(`projects.${index}.name`)} />
                      </div>
                      <div className="space-y-2">
                        <Label>角色</Label>
                        <Input placeholder="你的角色" {...register(`projects.${index}.role`)} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>开始时间</Label>
                        <Input placeholder="2023.01" {...register(`projects.${index}.startDate`)} />
                      </div>
                      <div className="space-y-2">
                        <Label>结束时间</Label>
                        <Input placeholder="2023.06" {...register(`projects.${index}.endDate`)} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>技术栈</Label>
                      <Input placeholder="React, Node.js, PostgreSQL" {...register(`projects.${index}.technologies`)} />
                    </div>
                    <div className="space-y-2">
                      <Label>项目描述</Label>
                      <Textarea
                        placeholder="描述项目背景、你的贡献和成果..."
                        {...register(`projects.${index}.description`)}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* Skills */}
            <TabsContent value="skills" className="p-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">技能特长</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>技能（用逗号分隔）</Label>
                    <Textarea
                      placeholder="React, TypeScript, Node.js, Python, Git..."
                      {...register("skills")}
                    />
                    <p className="text-sm text-muted-foreground">
                      输入技能名称，用逗号分隔
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Certificates */}
            <TabsContent value="certificates" className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">证书资质</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    appendCert({
                      id: generateId(),
                      name: "",
                      date: "",
                    })
                  }
                >
                  <Plus className="h-4 w-4 mr-1" />
                  添加
                </Button>
              </div>
              {certFields.map((field, index) => (
                <Card key={field.id}>
                  <CardContent className="pt-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">证书 {index + 1}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCert(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <Label>证书名称</Label>
                      <Input placeholder="证书名称" {...register(`certificates.${index}.name`)} />
                    </div>
                    <div className="space-y-2">
                      <Label>获得时间</Label>
                      <Input placeholder="2024.01" {...register(`certificates.${index}.date`)} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>

          {/* Template Selection */}
          <div className="p-4 border-t">
            <Label className="mb-3 block">简历模板</Label>
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
                  <div className="text-2xl mb-1">
                    {template.id === "classic" && "📄"}
                    {template.id === "modern" && "✨"}
                    {template.id === "minimal" && "🗿"}
                  </div>
                  <div className="text-xs font-medium">{template.name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className={`flex-1 bg-muted overflow-auto ${isFullscreen ? "p-8 flex items-start justify-center" : "p-8"}`}>
          {!isFullscreen && (
            <div className="flex justify-center mb-4">
              <div className="flex items-center gap-2 bg-background rounded-lg p-1 shadow-sm">
                <Button
                  variant={previewScale === 0.6 ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setPreviewScale(0.6)}
                >
                  60%
                </Button>
                <Button
                  variant={previewScale === 0.8 ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setPreviewScale(0.8)}
                >
                  80%
                </Button>
                <Button
                  variant={previewScale === 1 ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setPreviewScale(1)}
                >
                  100%
                </Button>
              </div>
            </div>
          )}

          <div className={`flex justify-center ${isFullscreen ? "w-full" : ""}`}>
            <div
              ref={previewRef}
              className="bg-white shadow-2xl"
              style={{
                width: "210mm",
                minHeight: "297mm",
                transform: `scale(${isFullscreen ? 0.95 : previewScale})`,
                transformOrigin: "top center",
              }}
            >
              <ResumeTemplateRenderer
                template={selectedTemplate}
                content={getPreviewContent()}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 分享弹窗 */}
      <ShareDialog
        open={shareOpen}
        onOpenChange={setShareOpen}
        resumeId={resume?.id || ""}
        initialShareToken={resume?.shareToken}
        initialHasPassword={!!resume?.sharePassword}
      />

      {/* ATS 评分弹窗 */}
      <AtsScoreDialog
        open={atsOpen}
        onOpenChange={setAtsOpen}
        content={getPreviewContent()}
      />
    </div>
  );
}
