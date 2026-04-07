"use client";

import { useState } from "react";
import type { ResumeContent } from "@/types/resume";
import { scoreResume } from "@/lib/atsScoring";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  CheckCircle2,
  XCircle,
  Lightbulb,
  TrendingUp,
  FileText,
  Tag,
  LayoutGrid,
} from "lucide-react";

interface AtsScoreDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content: ResumeContent;
}

export function AtsScoreDialog({ open, onOpenChange, content }: AtsScoreDialogProps) {
  const result = scoreResume(content);

  // 准备雷达图数据
  const radarData = result.categories.map((cat) => ({
    category: cat.name,
    score: cat.score,
    fullMark: 100,
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            ATS 简历评分
          </DialogTitle>
          <DialogDescription>
            基于主流 ATS（简历筛选系统）的评分标准，为你的简历打分
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 总分展示 */}
          <div className="flex items-center gap-6">
            <div
              className="relative w-28 h-28 flex items-center justify-center rounded-full"
              style={{
                background: `conic-gradient(${result.gradeColor} ${result.totalScore}%, #e4e4e7 0%)`,
              }}
            >
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
                <div className="text-center">
                  <span
                    className="text-3xl font-bold"
                    style={{ color: result.gradeColor }}
                  >
                    {result.totalScore}
                  </span>
                  <p className="text-sm text-muted-foreground">分</p>
                </div>
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Badge
                  variant="outline"
                  className="text-2xl px-3 py-1 font-bold"
                  style={{ borderColor: result.gradeColor, color: result.gradeColor }}
                >
                  {result.grade}
                </Badge>
                <span className="text-muted-foreground">
                  {result.totalScore >= 80
                    ? "优秀，超过大多数简历"
                    : result.totalScore >= 60
                    ? "良好，有一定提升空间"
                    : "需改进，建议完善简历内容"}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                分数基于内容完整度（45%）、关键词匹配（30%）、格式规范（25%）综合计算
              </p>
            </div>
          </div>

          {/* 雷达图 */}
          <div className="h-48">
            <p className="text-sm font-medium mb-2 flex items-center gap-1">
              <LayoutGrid className="h-4 w-4" /> 各维度得分
            </p>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                <PolarGrid stroke="#e4e4e7" />
                <PolarAngleAxis
                  dataKey="category"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                />
                <Radar
                  name="得分"
                  dataKey="score"
                  stroke="#6366F1"
                  fill="#6366F1"
                  fillOpacity={0.25}
                />
                <Tooltip
                  formatter={(value) => [`${value}分`, "得分"]}
                  labelStyle={{ color: "#18181b" }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* 各项得分明细 */}
          <div className="space-y-4">
            {result.categories.map((cat) => (
              <div key={cat.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {cat.name === "内容完整度" && (
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    )}
                    {cat.name === "关键词匹配" && (
                      <Tag className="h-4 w-4 text-muted-foreground" />
                    )}
                    {cat.name === "格式规范" && (
                      <LayoutGrid className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="font-medium text-sm">{cat.name}</span>
                    <Badge
                      variant={cat.score >= 80 ? "default" : cat.score >= 60 ? "secondary" : "destructive"}
                      className="text-xs ml-1"
                    >
                      {cat.score}分
                    </Badge>
                  </div>
                </div>
                <Progress value={cat.score} className="h-2" />
                <div className="space-y-1">
                  {cat.items.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs">
                      {item.passed ? (
                        <CheckCircle2 className="h-3 w-3 text-green-500 mt-0.5 shrink-0" />
                      ) : (
                        <XCircle className="h-3 w-3 text-red-500 mt-0.5 shrink-0" />
                      )}
                      <span className={item.passed ? "text-green-700" : "text-red-600"}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* 改进建议 */}
          {result.suggestions.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-amber-800 font-medium text-sm">
                <Lightbulb className="h-4 w-4" />
                改进建议
              </div>
              <ul className="space-y-1">
                {result.suggestions.slice(0, 5).map((s, i) => (
                  <li key={i} className="text-sm text-amber-700 flex items-start gap-2">
                    <span className="text-amber-400 mt-0.5">•</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button onClick={() => onOpenChange(false)}>知道了</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
