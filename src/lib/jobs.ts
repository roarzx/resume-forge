/**
 * 职位数据服务
 *
 * 合规方式 B：轻量缓存
 * - 只存职位摘要（标题/公司/原始链接）
 * - 不爬详情、不模拟投递
 * - 点击仍跳转回原平台
 */

export type JobSource = "boss" | "linkedin" | "indeed";

// 预置职位数据集（按技能标签分类，可扩展）
const SEED_JOBS: Array<{
  title: string;
  company: string;
  city: string;
  source: JobSource;
  salary: string;
  tags: string[];
  description: string;
  // 真实原始链接（示例格式）
  sourceUrl: string;
}> = [
  // Go 职位
  {
    title: "Go 开发工程师",
    company: "字节跳动",
    city: "北京",
    source: "boss",
    salary: "35-60K·16薪",
    tags: ["Go", "Golang", "微服务", "K8s", "gRPC"],
    description: "负责抖音后端核心服务开发，主导微服务架构设计与实现",
    sourceUrl: "https://www.zhipin.com/web/geek/job?query=Go%E5%BC%80%E5%8F%91&city=101010100",
  },
  {
    title: "Golang 高级工程师",
    company: "美团",
    city: "北京",
    source: "boss",
    salary: "40-70K",
    tags: ["Go", "分布式", "中间件", "Redis", "Kafka"],
    description: "参与美团外卖交易系统建设，负责高并发场景下的性能优化",
    sourceUrl: "https://www.zhipin.com/web/geek/job?query=Golang&city=101010100",
  },
  {
    title: "后端开发工程师（Go）",
    company: "Shopee",
    city: "深圳",
    source: "boss",
    salary: "30-50K",
    tags: ["Go", "微服务", "Docker", "MySQL", "MongoDB"],
    description: "负责电商平台订单系统设计与实现，保障系统高可用",
    sourceUrl: "https://www.zhipin.com/web/geek/job?query=Go%E5%90%8E%E7%AB%AF&city=101280600",
  },
  {
    title: "Go 微服务工程师",
    company: "蚂蚁集团",
    city: "杭州",
    source: "boss",
    salary: "35-65K·15薪",
    tags: ["Go", "微服务", "云原生", "Service Mesh"],
    description: "参与金融级分布式系统建设，负责核心链路开发",
    sourceUrl: "https://www.zhipin.com/web/geek/job?query=Go%E5%BE%AE%E6%9C%8D%E5%8A%A1&city=101210100",
  },
  {
    title: "Backend Engineer - Go",
    company: "ByteDance",
    city: "上海",
    source: "linkedin",
    salary: "$50-80K",
    tags: ["Go", "gRPC", "K8s", "AWS", "English"],
    description: "Work on TikTok backend infrastructure at scale",
    sourceUrl: "https://www.linkedin.com/jobs/search/?keywords=golang+engineer&location=Shanghai",
  },
  {
    title: "Senior Go Engineer",
    company: "Tencent",
    city: "深圳",
    source: "linkedin",
    salary: "45-75K",
    tags: ["Go", "Linux", "C++", "分布式系统"],
    description: "微信支付后端核心引擎开发，处理海量并发交易",
    sourceUrl: "https://www.linkedin.com/jobs/search/?keywords=golang&location=Shenzhen",
  },

  // 前端职位
  {
    title: "React 前端工程师",
    company: "阿里巴巴",
    city: "杭州",
    source: "boss",
    salary: "30-55K",
    tags: ["React", "TypeScript", "Next.js", "Tailwind"],
    description: "负责淘宝商家后台前端开发，建设中台组件库",
    sourceUrl: "https://www.zhipin.com/web/geek/job?query=React%E5%89%8D%E7%AB%AF&city=101210100",
  },
  {
    title: "前端开发工程师",
    company: "腾讯",
    city: "深圳",
    source: "boss",
    salary: "28-50K",
    tags: ["React", "Vue", "JavaScript", "CSS", "Webpack"],
    description: "参与微信小程序和 Web 应用开发，关注性能与体验",
    sourceUrl: "https://www.zhipin.com/web/geek/job?query=%E5%89%8D%E7%AB%AF%E5%BC%80%E5%8F%91&city=101280600",
  },
  {
    title: "Frontend Engineer",
    company: "字节跳动",
    city: "北京",
    source: "indeed",
    salary: "35-60K",
    tags: ["React", "TypeScript", "Node.js", "GraphQL"],
    description: "Build modern web applications for TikTok content tools",
    sourceUrl: "https://www.indeed.com/jobs?q=frontend+engineer&l=Beijing",
  },
  {
    title: "Vue.js 开发工程师",
    company: "小红书",
    city: "上海",
    source: "boss",
    salary: "25-45K",
    tags: ["Vue", "Vue3", "TypeScript", "Pinia", "Vite"],
    description: "内容平台核心产品研发，关注开发体验与迭代效率",
    sourceUrl: "https://www.zhipin.com/web/geek/job?query=Vue%E5%89%8D%E7%AB%AF&city=101020100",
  },

  // Node.js 职位
  {
    title: "Node.js 后端工程师",
    company: "网易",
    city: "杭州",
    source: "boss",
    salary: "25-45K",
    tags: ["Node.js", "Express", "NestJS", "MongoDB", "Redis"],
    description: "游戏平台服务端开发，负责 API 设计与数据服务",
    sourceUrl: "https://www.zhipin.com/web/geek/job?query=Node.js%E5%90%8E%E7%AB%AF&city=101210100",
  },
  {
    title: "全栈工程师（Node）",
    company: "得物",
    city: "上海",
    source: "boss",
    salary: "28-50K",
    tags: ["Node.js", "React", "TypeScript", "PostgreSQL"],
    description: "潮流电商全栈开发，从需求到上线独立负责模块",
    sourceUrl: "https://www.zhipin.com/web/geek/job?query=Node.js%E5%85%A8%E6%A0%88&city=101020100",
  },

  // Python 职位
  {
    title: "Python 后端工程师",
    company: "百度",
    city: "北京",
    source: "boss",
    salary: "30-55K",
    tags: ["Python", "Django", "Flask", "MySQL", "Redis"],
    description: "AI 平台后端服务开发，对接大模型 API",
    sourceUrl: "https://www.zhipin.com/web/geek/job?query=Python%E5%90%8E%E7%AB%AF&city=101010100",
  },
  {
    title: "Python 开发工程师",
    company: "商汤科技",
    city: "深圳",
    source: "boss",
    salary: "28-48K",
    tags: ["Python", "FastAPI", "TensorFlow", "Docker", "K8s"],
    description: "计算机视觉平台后端开发，支持 AI 模型服务化",
    sourceUrl: "https://www.zhipin.com/web/geek/job?query=Python%E5%BC%80%E5%8F%91&city=101280600",
  },
  {
    title: "Backend Engineer - Python",
    company: "ByteDance",
    city: "上海",
    source: "linkedin",
    salary: "35-60K",
    tags: ["Python", "FastAPI", "AWS", "Machine Learning"],
    description: "Work on AI-powered backend services at scale",
    sourceUrl: "https://www.linkedin.com/jobs/search/?keywords=python+backend&location=Shanghai",
  },

  // Java 职位
  {
    title: "Java 开发工程师",
    company: "京东",
    city: "北京",
    source: "boss",
    salary: "25-45K",
    tags: ["Java", "Spring Boot", "MySQL", "Dubbo", "Kafka"],
    description: "京东物流核心系统开发，保障双十一高并发",
    sourceUrl: "https://www.zhipin.com/web/geek/job?query=Java%E5%90%8E%E7%AB%AF&city=101010100",
  },
  {
    title: "Java 高级工程师",
    company: "平安科技",
    city: "深圳",
    source: "boss",
    salary: "30-55K",
    tags: ["Java", "Spring Cloud", "微服务", "Oracle"],
    description: "金融业务系统开发，负责核心交易模块设计",
    sourceUrl: "https://www.zhipin.com/web/geek/job?query=Java%E9%AB%98%E7%BA%A7&city=101280600",
  },

  // DevOps / 基础架构
  {
    title: "DevOps 工程师",
    company: "携程",
    city: "上海",
    source: "boss",
    salary: "28-50K",
    tags: ["Kubernetes", "Docker", "CI/CD", "Terraform", "AWS"],
    description: "建设研发效能平台，推进自动化与标准化",
    sourceUrl: "https://www.zhipin.com/web/geek/job?query=DevOps&city=101020100",
  },
  {
    title: "SRE 工程师",
    company: "快手",
    city: "北京",
    source: "boss",
    salary: "35-60K",
    tags: ["Linux", "Python", "Prometheus", "K8s", "Grafana"],
    description: "保障直播平台 SLA，设计自动化故障恢复系统",
    sourceUrl: "https://www.zhipin.com/web/geek/job?query=SRE&city=101010100",
  },
  {
    title: "Platform Engineer",
    company: "Shein",
    city: "广州",
    source: "indeed",
    salary: "30-50K",
    tags: ["Kubernetes", "Go", "Linux", "Terraform"],
    description: "Build and maintain internal developer platform",
    sourceUrl: "https://www.indeed.com/jobs?q=platform+engineer&l=Guangzhou",
  },

  // 数据 / AI
  {
    title: "AI 应用工程师",
    company: "MiniMax",
    city: "北京",
    source: "boss",
    salary: "40-80K",
    tags: ["Python", "LLM", "LangChain", "FastAPI", "AI"],
    description: "基于大模型开发 AI 应用，对接 GPT/Claude/Gemini",
    sourceUrl: "https://www.zhipin.com/web/geek/job?query=AI%E5%BA%94%E7%94%A8&city=101010100",
  },
  {
    title: "NLP 算法工程师",
    company: "字节跳动",
    city: "北京",
    source: "boss",
    salary: "45-80K",
    tags: ["Python", "PyTorch", "NLP", "LLM", "Transformers"],
    description: "抖音推荐算法优化，参与大模型预训练与微调",
    sourceUrl: "https://www.zhipin.com/web/geek/job?query=NLP%E7%AE%97%E6%B3%95&city=101010100",
  },
  {
    title: "数据工程师",
    company: "拼多多",
    city: "上海",
    source: "boss",
    salary: "30-55K",
    tags: ["Python", "Spark", "Flink", "Hive", "Kafka"],
    description: "电商数据平台建设，支持实时与离线数据分析",
    sourceUrl: "https://www.zhipin.com/web/geek/job?query=%E6%95%B0%E6%8D%AE%E5%B7%A5%E7%A8%8B%E5%B8%88&city=101020100",
  },

  // Rust
  {
    title: "Rust 开发工程师",
    company: "字节跳动",
    city: "北京",
    source: "boss",
    salary: "40-70K",
    tags: ["Rust", "WebAssembly", "Linux", "性能优化"],
    description: "高性能网络库开发，参与抖音基础架构建设",
    sourceUrl: "https://www.zhipin.com/web/geek/job?query=Rust%E5%BC%80%E5%8F%91&city=101010100",
  },

  // 移动端
  {
    title: "Flutter 开发工程师",
    company: "腾讯",
    city: "深圳",
    source: "boss",
    salary: "28-50K",
    tags: ["Flutter", "Dart", "iOS", "Android", "跨平台"],
    description: "微信小程序跨平台开发，一套代码多端运行",
    sourceUrl: "https://www.zhipin.com/web/geek/job?query=Flutter&city=101280600",
  },
  {
    title: "React Native 工程师",
    company: "得物",
    city: "上海",
    source: "boss",
    salary: "25-45K",
    tags: ["React Native", "JavaScript", "TypeScript", "iOS", "Android"],
    description: "潮流社区移动端开发，关注性能与交互体验",
    sourceUrl: "https://www.zhipin.com/web/geek/job?query=React+Native&city=101020100",
  },
  {
    title: "iOS 开发工程师",
    company: "阿里巴巴",
    city: "杭州",
    source: "boss",
    salary: "30-55K",
    tags: ["iOS", "Swift", "Objective-C", "UIKit", "SwiftUI"],
    description: "手淘 iOS 端开发，参与 Apple 平台创新功能",
    sourceUrl: "https://www.zhipin.com/web/geek/job?query=iOS%E5%BC%80%E5%8F%91&city=101210100",
  },
  {
    title: "Android 开发工程师",
    company: "美团",
    city: "北京",
    source: "boss",
    salary: "28-50K",
    tags: ["Android", "Kotlin", "Java", "Jetpack", "Compose"],
    description: "美团 Android 端开发，关注启动速度与内存优化",
    sourceUrl: "https://www.zhipin.com/web/geek/job?query=Android%E5%BC%80%E5%8F%91&city=101010100",
  },
];

// 技能别名映射（统一大小写）
const SKILL_ALIASES: Record<string, string[]> = {
  go: ["go", "golang", "go语言"],
  javascript: ["javascript", "js"],
  typescript: ["typescript", "ts"],
  python: ["python", "python3"],
  react: ["react", "react.js", "reactjs"],
  vue: ["vue", "vue.js", "vuejs", "vue3"],
  nodejs: ["node.js", "nodejs", "node"],
  java: ["java"],
  rust: ["rust"],
  swift: ["swift", "ios"],
  kotlin: ["kotlin", "android"],
  docker: ["docker", "container"],
  kubernetes: ["kubernetes", "k8s", "k8s"],
  aws: ["aws", "amazon web services", "ec2", "s3"],
  mysql: ["mysql", "mariadb"],
  postgresql: ["postgresql", "postgres"],
  mongodb: ["mongodb", "mongo"],
  redis: ["redis"],
  kafka: ["kafka", "kafkamq"],
  machinelearning: ["machine learning", "ml", "机器学习", "机器学习算法"],
  ai: ["ai", "人工智能", "大模型", "llm", "chatgpt", "gpt", "aigc"],
  nlp: ["nlp", "自然语言处理", "文本处理"],
  linux: ["linux", "unix"],
  flutter: ["flutter", "跨平台"],
  reactnative: ["react native", "rn"],
  devops: ["devops", "sre", "运维"],
};

/**
 * 标准化技能关键词
 */
export function normalizeSkill(skill: string): string {
  const lower = skill.toLowerCase().trim();
  for (const [canonical, aliases] of Object.entries(SKILL_ALIASES)) {
    if (aliases.includes(lower) || lower === canonical) {
      return canonical;
    }
  }
  return lower;
}

/**
 * 从简历内容中提取技能标签
 */
export function extractSkillsFromResume(
  resumeContent: string
): string[] {
  // 从简历 JSON content 中提取技能关键词
  // 简历内容是 JSON 格式，从中提取 skills 字段
  try {
    const parsed = JSON.parse(resumeContent);
    const skills: string[] = [];

    // 尝试多个可能的技能字段
    const possibleFields = [
      parsed.skills,
      parsed.basics?.skills,
      parsed.skill,
      parsed.skillSet,
      parsed.techStack,
      parsed.technologies,
    ];

    for (const field of possibleFields) {
      if (Array.isArray(field)) {
        const arr = field as Array<Record<string, unknown> | string>;
        skills.push(
          ...arr
            .map((item) => {
              if (typeof item === "string") return normalizeSkill(item);
              return normalizeSkill(String(item?.name || item?.skill || ""));
            })
            .filter(Boolean)
        );
      } else if (typeof field === "string") {
        // 可能是逗号或空格分隔的技能字符串
        field.split(/[,，、\s]+/).forEach((s: string) => {
          const n = normalizeSkill(s.trim());
          if (n) skills.push(n);
        });
      }
    }

    // 去重
    return [...new Set(skills)];
  } catch {
    return [];
  }
}

/**
 * 计算简历技能与职位的匹配度
 */
export function matchJobsToSkills(
  jobs: Array<{
    id: string;
    title: string;
    company: string | null;
    city: string | null;
    source: string;
    salary: string | null;
    tags: string | null;
    description: string | null;
    sourceUrl: string;
  }>,
  resumeSkills: string[]
): Array<{
  job: (typeof jobs)[0];
  score: number;
  matchedTags: string[];
}> {
  if (resumeSkills.length === 0) {
    // 无技能时返回全部，按 fetchAt 排序
    return jobs.map((job) => ({ job, score: 0, matchedTags: [] }));
  }

  const normalizedResumeSkills = resumeSkills.map(normalizeSkill);

  return jobs
    .map((job) => {
      const jobTags: string[] = [];
      if (job.tags) {
        try {
          jobTags.push(...JSON.parse(job.tags));
        } catch {
          // 解析失败，忽略
        }
      }

      const matchedTags = jobTags.filter((tag) => {
        const normalized = normalizeSkill(tag);
        return normalizedResumeSkills.includes(normalized);
      });

      const score = matchedTags.length;

      return { job, score, matchedTags };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);
}

/**
 * 获取平台的直接搜索链接（不存储，直接跳转）
 */
export function buildSearchUrl(
  source: JobSource,
  keyword: string,
  city: string = ""
): string {
  const q = encodeURIComponent(keyword);
  const c = encodeURIComponent(city);

  switch (source) {
    case "boss":
      // BOSS直聘搜索 URL
      return `https://www.zhipin.com/web/geek/job?query=${q}${c ? `&city=${c}` : ""}`;
    case "linkedin":
      return `https://www.linkedin.com/jobs/search/?keywords=${q}${c ? `&location=${c}` : ""}`;
    case "indeed":
      return `https://www.indeed.com/jobs?q=${q}${c ? `&l=${c}` : ""}`;
    default:
      return "";
  }
}

export { SEED_JOBS };
