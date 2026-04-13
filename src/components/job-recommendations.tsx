"use client";

import { useEffect, useState } from "react";
import { Briefcase, MapPin, ExternalLink, ChevronRight, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Job {
  id: string;
  title: string;
  company: string | null;
  city: string | null;
  source: string;
  salary: string | null;
  tags: string | null;
  description: string | null;
  sourceUrl: string;
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

export default function JobRecommendations({
  resumeId,
  userId,
}: {
  resumeId?: string;
  userId?: string;
}) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [resumeSkills, setResumeSkills] = useState<string[]>([]);

  useEffect(() => {
    if (!resumeId) {
      setIsLoading(false);
      return;
    }

    const fetchJobs = async () => {
      try {
        const res = await fetch(`/api/jobs?resumeId=${resumeId}&limit=6`);
        if (res.ok) {
          const data = await res.json();
          setJobs(data.jobs || []);
          setResumeSkills(data.resumeSkills || []);
        }
      } catch (error) {
        console.error("获取职位失败:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, [resumeId]);

  const handleJobClick = (job: Job) => {
    const url = `/api/redirect?jobId=${job.id}${userId ? `&userId=${userId}` : ""}`;
    window.open(url, "_blank");
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              为你推荐
            </CardTitle>
            <CardDescription>
              {resumeId
                ? resumeSkills.length > 0
                  ? `根据你的技能 ${resumeSkills.slice(0, 3).join("、")} 等推荐`
                  : "完善简历技能后可获得更精准推荐"
                : "创建简历后开启智能推荐"}
            </CardDescription>
          </div>
          {jobs.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-muted-foreground"
              asChild
            >
              <a href="/jobs" className="flex items-center gap-1">
                查看全部
                <ChevronRight className="h-4 w-4" />
              </a>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {jobs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">暂无推荐职位</p>
            <p className="text-sm mt-1">
              {resumeId
                ? "职位库正在更新中，请稍后再试"
                : "创建简历并填写技能后自动推荐"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="flex items-start justify-between gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  {/* 标题 + 公司 */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-medium truncate">{job.title}</h4>
                    {job.company && (
                      <span className="text-sm text-muted-foreground">
                        · {job.company}
                      </span>
                    )}
                  </div>

                  {/* 城市 + 薪资 */}
                  <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                    {job.city && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {job.city}
                      </span>
                    )}
                    {job.salary && (
                      <span className="text-foreground font-medium text-sm">
                        {job.salary}
                      </span>
                    )}
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${SOURCE_COLORS[job.source] || "bg-gray-100 text-gray-800"}`}
                    >
                      {SOURCE_LABELS[job.source] || job.source}
                    </span>
                  </div>

                  {/* 匹配标签 */}
                  {job.matchedTags && job.matchedTags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {job.matchedTags.slice(0, 4).map((tag) => (
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

                {/* 查看详情按钮 */}
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleJobClick(job)}
                >
                  查看详情
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
