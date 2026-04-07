/**
 * ATS 简历评分系统
 * 根据常见 ATS（简历筛选系统）规则评估简历质量
 */

import type { ResumeContent } from "@/types/resume";

interface ScoreCategory {
  name: string;
  score: number; // 0-100
  maxScore: number;
  items: ScoreItem[];
}

interface ScoreItem {
  label: string;
  passed: boolean;
  weight: number; // 权重
  suggestion?: string;
}

// ATS 关键词库（按行业分类）
const ATS_KEYWORDS = {
  技术: [
    "JavaScript", "TypeScript", "React", "Vue", "Angular", "Node.js",
    "Python", "Java", "Go", "Rust", "C++", "C#",
    "SQL", "PostgreSQL", "MySQL", "MongoDB", "Redis",
    "Docker", "Kubernetes", "AWS", "Azure", "GCP",
    "Git", "CI/CD", "Agile", "Scrum",
    "REST", "GraphQL", "API", "Microservices",
    "Machine Learning", "Deep Learning", "AI",
  ],
  产品: [
    "Product Manager", "产品经理", "需求分析", "PRD",
    "用户研究", "竞品分析", "数据分析", "A/B 测试",
    "Roadmap", "Sprint", "Jira", "Figma",
  ],
  设计: [
    "UI", "UX", "Figma", "Sketch", "Adobe XD",
    "交互设计", "用户研究", "原型设计", "设计系统",
  ],
  运营: [
    "用户增长", "数据分析", "活动策划", "内容运营",
    "社群运营", "新媒体运营", "SEO", "SEM",
  ],
};

// 计算内容完整度分数
function calculateCompleteness(content: ResumeContent): ScoreCategory {
  const items: ScoreItem[] = [];
  let totalWeight = 0;
  let earnedScore = 0;

  // 基本信息
  const basicChecks = [
    { key: "name", label: "姓名", weight: 8 },
    { key: "email", label: "邮箱", weight: 8 },
    { key: "phone", label: "手机号", weight: 6 },
    { key: "title", label: "职位目标", weight: 5 },
    { key: "summary", label: "个人简介", weight: 5 },
  ];

  basicChecks.forEach(({ key, label, weight }) => {
    const value = (content.basic as unknown as Record<string, string>)?.[key];
    const passed = !!value && value.trim().length > 0;
    totalWeight += weight;
    if (passed) earnedScore += weight;
    items.push({
      label: `${label} ${passed ? "✓" : "✗"}`,
      passed,
      weight,
      suggestion: passed ? undefined : `建议填写${label}`,
    });
  });

  // 教育经历
  const hasEducation = content.education && content.education.length > 0;
  totalWeight += 12;
  if (hasEducation) earnedScore += 12;
  items.push({
    label: `教育经历 ${hasEducation ? `(${content.education.length}条) ✓` : "✗"}`,
    passed: hasEducation,
    weight: 12,
    suggestion: hasEducation ? undefined : "建议添加教育经历",
  });

  // 工作经历
  const hasExperience = content.experience && content.experience.length > 0;
  totalWeight += 18;
  if (hasExperience) earnedScore += 18;
  items.push({
    label: `工作经历 ${hasExperience ? `(${content.experience.length}条) ✓` : "✗"}`,
    passed: hasExperience,
    weight: 18,
    suggestion: hasExperience ? undefined : "建议添加工作经历",
  });

  // 项目经历
  const hasProjects = content.projects && content.projects.length > 0;
  totalWeight += 12;
  if (hasProjects) earnedScore += 12;
  items.push({
    label: `项目经历 ${hasProjects ? `(${content.projects.length}条) ✓` : "✗"}`,
    passed: hasProjects,
    weight: 12,
    suggestion: hasProjects ? undefined : "建议添加项目经历",
  });

  // 技能
  const hasSkills = content.skills && content.skills.length >= 3;
  totalWeight += 10;
  if (hasSkills) earnedScore += 10;
  items.push({
    label: `技能特长 ${hasSkills ? `(${content.skills.length}项) ✓` : "✗"}`,
    passed: hasSkills,
    weight: 10,
    suggestion: hasSkills ? undefined : "建议添加至少3项技能",
  });

  // 证书
  const hasCerts = content.certificates && content.certificates.length > 0;
  totalWeight += 6;
  if (hasCerts) earnedScore += 6;
  items.push({
    label: `证书资质 ${hasCerts ? `(${content.certificates.length}个) ✓` : "✗"}`,
    passed: hasCerts,
    weight: 6,
    suggestion: hasCerts ? undefined : "如有相关证书建议添加",
  });

  const score = Math.round((earnedScore / totalWeight) * 100);
  return { name: "内容完整度", score, maxScore: 100, items };
}

// 计算关键词匹配度
function calculateKeywordMatch(content: ResumeContent): ScoreCategory {
  const allText = [
    content.basic?.summary || "",
    content.basic?.title || "",
    ...(content.experience || []).map((e) => `${e.position} ${e.description}`),
    ...(content.projects || []).map((p) => `${p.name} ${p.description} ${p.technologies?.join(" ")}`),
    ...(content.skills || []),
  ].join(" ").toLowerCase();

  const foundKeywords: string[] = [];
  const totalKeywords = Object.values(ATS_KEYWORDS).flat();

  totalKeywords.forEach((keyword) => {
    if (allText.includes(keyword.toLowerCase())) {
      foundKeywords.push(keyword);
    }
  });

  // 找出未匹配的重要关键词（至少有一个类别匹配度高）
  const unmatchedSuggestions: string[] = [];
  Object.entries(ATS_KEYWORDS).forEach(([category, keywords]) => {
    const categoryFound = keywords.filter((kw) => allText.includes(kw.toLowerCase()));
    if (categoryFound.length > 0 && categoryFound.length < 5) {
      const missing = keywords.filter((kw) => !allText.includes(kw.toLowerCase()));
      if (missing.length > 0) {
        unmatchedSuggestions.push(...missing.slice(0, 2));
      }
    }
  });

  const score = Math.min(100, Math.round((foundKeywords.length / Math.max(totalKeywords.length, 1)) * 100 * 5));
  const cappedScore = Math.min(100, score);

  const items: ScoreItem[] = [
    {
      label: `匹配关键词 ${foundKeywords.length} 个`,
      passed: foundKeywords.length >= 10,
      weight: 50,
      suggestion:
        foundKeywords.length < 10
          ? "建议在简历中融入更多行业关键词"
          : undefined,
    },
    {
      label: `缺少推荐词：${unmatchedSuggestions.slice(0, 3).join("、") || "无"}`,
      passed: unmatchedSuggestions.length === 0,
      weight: 50,
      suggestion:
        unmatchedSuggestions.length > 0
          ? "考虑添加上述关键词提升简历命中率"
          : undefined,
    },
  ];

  return {
    name: "关键词匹配",
    score: cappedScore,
    maxScore: 100,
    items,
  };
}

// 计算格式规范分数
function calculateFormatScore(content: ResumeContent): ScoreCategory {
  const items: ScoreItem[] = [];
  let totalWeight = 0;
  let earnedScore = 0;

  // 邮箱格式
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const hasValidEmail = emailRegex.test(content.basic?.email || "");
  totalWeight += 20;
  if (hasValidEmail) earnedScore += 20;
  items.push({
    label: `邮箱格式 ${hasValidEmail ? "✓" : "✗"}`,
    passed: hasValidEmail,
    weight: 20,
    suggestion: hasValidEmail ? undefined : "邮箱格式不正确",
  });

  // 手机号格式
  const phoneRegex = /^1[3-9]\d{9}$|^\d{3}-?\d{4}-?\d{4}$/;
  const hasValidPhone = phoneRegex.test((content.basic?.phone || "").replace(/\s/g, ""));
  totalWeight += 15;
  if (hasValidPhone) earnedScore += 15;
  items.push({
    label: `手机号格式 ${hasValidPhone ? "✓" : "✗"}`,
    passed: hasValidPhone,
    weight: 15,
    suggestion: hasValidPhone ? undefined : "手机号格式不正确",
  });

  // 工作描述长度
  const experienceDescriptions = (content.experience || []).map((e) => e.description || "");
  const avgDescLength =
    experienceDescriptions.length > 0
      ? experienceDescriptions.reduce((a, b) => a + b.length, 0) / experienceDescriptions.length
      : 0;
  const hasGoodDescriptions = avgDescLength >= 50;
  totalWeight += 20;
  if (hasGoodDescriptions) earnedScore += 20;
  items.push({
    label: `工作描述详尽程度 ${hasGoodDescriptions ? "✓" : "✗"}`,
    passed: hasGoodDescriptions,
    weight: 20,
    suggestion: hasGoodDescriptions
      ? undefined
      : "工作描述建议至少50字，描述职责和成果",
  });

  // 时间线连续性
  const hasTimeline = (content.experience || []).every((e) => e.startDate && e.endDate);
  totalWeight += 15;
  if (hasTimeline) earnedScore += 15;
  items.push({
    label: `时间线完整 ${hasTimeline ? "✓" : "✗"}`,
    passed: hasTimeline,
    weight: 15,
    suggestion: hasTimeline ? undefined : "建议填写完整的起止时间",
  });

  // 技能数量合理
  const skillCount = (content.skills || []).length;
  const hasReasonableSkills = skillCount >= 3 && skillCount <= 20;
  totalWeight += 15;
  if (hasReasonableSkills) earnedScore += 15;
  items.push({
    label: `技能数量合理 (${skillCount}项) ${hasReasonableSkills ? "✓" : "✗"}`,
    passed: hasReasonableSkills,
    weight: 15,
    suggestion:
      skillCount < 3 ? "技能数量偏少" : skillCount > 20 ? "技能过多，建议精选" : undefined,
  });

  // 简历长度合理（避免过短或过长）
  const totalLength = [
    content.basic?.summary || "",
    ...(content.experience || []).map((e) => e.description),
    ...(content.projects || []).map((p) => p.description),
  ].join("").length;
  const hasGoodLength = totalLength >= 200 && totalLength <= 5000;
  totalWeight += 15;
  if (hasGoodLength) earnedScore += 15;
  items.push({
    label: `简历长度 ${hasGoodLength ? "✓" : "✗"}`,
    passed: hasGoodLength,
    weight: 15,
    suggestion: hasGoodLength
      ? undefined
      : totalLength < 200 ? "简历内容过短，建议丰富描述" : "简历内容过长，建议精简",
  });

  const score = Math.round((earnedScore / totalWeight) * 100);
  return { name: "格式规范", score, maxScore: 100, items };
}

// 主评分函数
export function scoreResume(content: ResumeContent): {
  totalScore: number;
  grade: string;
  gradeColor: string;
  categories: ScoreCategory[];
  suggestions: string[];
} {
  const categories = [
    calculateCompleteness(content),
    calculateKeywordMatch(content),
    calculateFormatScore(content),
  ];

  // 加权总分（完整度最重要）
  const weights = [0.45, 0.30, 0.25];
  const totalScore = Math.round(
    categories.reduce((sum, cat, i) => sum + cat.score * weights[i], 0)
  );

  // 等级评定
  let grade: string;
  let gradeColor: string;
  if (totalScore >= 90) {
    grade = "A+";
    gradeColor = "#10B981"; // green
  } else if (totalScore >= 80) {
    grade = "A";
    gradeColor = "#22C55E"; // green
  } else if (totalScore >= 70) {
    grade = "B+";
    gradeColor = "#F59E0B"; // amber
  } else if (totalScore >= 60) {
    grade = "B";
    gradeColor = "#F97316"; // orange
  } else if (totalScore >= 50) {
    grade = "C";
    gradeColor = "#EF4444"; // red
  } else {
    grade = "D";
    gradeColor = "#DC2626"; // red
  }

  // 收集所有建议
  const suggestions: string[] = [];
  categories.forEach((cat) => {
    cat.items.forEach((item) => {
      if (!item.passed && item.suggestion) {
        suggestions.push(item.suggestion);
      }
    });
  });

  return { totalScore, grade, gradeColor, categories, suggestions };
}
