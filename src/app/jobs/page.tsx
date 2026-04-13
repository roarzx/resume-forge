"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Briefcase, MapPin, ExternalLink, Loader2, Search, Filter } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Job {
  id: string;
  title: string;
  company: string | null;
  city: string | null;
  source: string;
  salary: string | null;
  tags: string | null;
  description: string | null;
  score?: number;
  matchedTags?: string[];
}

const SOURCE_LABELS: Record<string, string> = {
  boss: "BOSS直聘",
  linkedin: "LinkedIn",
  indeed: "Indeed",
};

const SOURCE_COLORS: Record<string, string> = {
  boss: "bg-green-100 text-green-800",
  linkedin: "bg-blue-100 text-blue-800",
  indeed: "bg-purple-100 text-purple-800",
};

const POPULAR_SKILLS = [
  "Go", "Python", "React", "Vue", "Node.js", "Java",
  "Rust", "K8s", "Docker", "AI", "Flutter",
];

export default function JobsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({ page: String(page), limit: "20" });
        if (selectedSkill) params.set("skill", selectedSkill);
        if (search) params.set("q", search);

        const res = await fetch(`/api/jobs?${params}`);
        if (res.ok) {
          const data = await res.json();
          setJobs(data.jobs || []);
          setTotal(data.pagination?.total || 0);
        }
      } catch (error) {
        console.error("获取职位失败:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchJobs();
  }, [page, selectedSkill, search]);

  const handleJobClick = (job: Job) => {
    const url = `/api/redirect?jobId=${job.id}${session?.user?.email ? `&userId=${session.user.email}` : ""}`;
    window.open(url, "_blank");
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/50">
      <div className="container px-4 py-8 mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-1">职位推荐</h1>
          <p className="text-muted-foreground">
            根据你的简历技能匹配 · 点击跳转到原平台投递
          </p>
        </div>

        {/* 搜索与过滤 */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索职位或公司..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-9"
            />
          </div>
        </div>

        {/* 技能标签过滤 */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            variant={selectedSkill === "" ? "default" : "outline"}
            size="sm"
            onClick={() => { setSelectedSkill(""); setPage(1); }}
          >
            全部
          </Button>
          {POPULAR_SKILLS.map((skill) => (
            <Button
              key={skill}
              variant={selectedSkill === skill ? "default" : "outline"}
              size="sm"
              onClick={() => { setSelectedSkill(skill); setPage(1); }}
            >
              {skill}
            </Button>
          ))}
        </div>

        {/* 职位列表 */}
        {isLoading ? (
          <div className="py-12 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : jobs.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">暂无匹配职位</p>
              <p className="text-sm mt-1">试试调整筛选条件</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="space-y-3">
              {jobs.map((job) => (
                <Card
                  key={job.id}
                  className="hover:shadow-md transition-shadow cursor-pointer group"
                  onClick={() => handleJobClick(job)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-lg">{job.title}</h3>
                          {job.company && (
                            <span className="text-muted-foreground">
                              {job.company}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                          {job.city && (
                            <span className="flex items-center gap-1 text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              {job.city}
                            </span>
                          )}
                          {job.salary && (
                            <span className="text-sm font-semibold text-green-700 dark:text-green-400">
                              {job.salary}
                            </span>
                          )}
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${SOURCE_COLORS[job.source] || "bg-gray-100 text-gray-800"}`}
                          >
                            {SOURCE_LABELS[job.source] || job.source}
                          </span>
                          {job.score !== undefined && job.score > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              匹配度 {job.score} 个技能
                            </Badge>
                          )}
                        </div>

                        {job.description && (
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                            {job.description}
                          </p>
                        )}

                        {job.matchedTags && job.matchedTags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {job.matchedTags.map((tag) => (
                              <Badge
                                key={tag}
                                variant="secondary"
                                className="text-xs bg-primary/10 text-primary border-0"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1 flex-shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                      >
                        去投递
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* 分页 */}
            {total > 20 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  上一页
                </Button>
                <span className="text-sm text-muted-foreground">
                  第 {page} 页 · 共 {Math.ceil(total / 20)} 页
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= Math.ceil(total / 20)}
                  onClick={() => setPage((p) => p + 1)}
                >
                  下一页
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
