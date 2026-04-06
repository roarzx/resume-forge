export interface BasicInfo {
  name: string;
  title?: string;
  email: string;
  phone: string;
  location?: string;
  website?: string;
  summary?: string;
}

export interface Education {
  id: string;
  school: string;
  major: string;
  degree: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  honors?: string;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Project {
  id: string;
  name: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
  technologies?: string[];
}

export interface Certificate {
  id: string;
  name: string;
  date?: string;
}

export interface ResumeContent {
  basic: BasicInfo;
  education: Education[];
  experience: Experience[];
  projects: Project[];
  skills: string[];
  certificates: Certificate[];
}

export interface Resume {
  id: string;
  userId: string;
  title: string;
  template: string;
  content: ResumeContent;
  createdAt: string;
  updatedAt: string;
}

export type TemplateType = "classic" | "modern" | "minimal";

export const TEMPLATES: { id: TemplateType; name: string; description: string }[] = [
  {
    id: "classic",
    name: "经典",
    description: "传统单栏布局，稳重专业",
  },
  {
    id: "modern",
    name: "现代",
    description: "双栏设计，活力十足",
  },
  {
    id: "minimal",
    name: "简约",
    description: "极简风格，去除边框",
  },
];

export const DEFAULT_RESUME_CONTENT: ResumeContent = {
  basic: {
    name: "",
    title: "",
    email: "",
    phone: "",
    location: "",
    website: "",
    summary: "",
  },
  education: [],
  experience: [],
  projects: [],
  skills: [],
  certificates: [],
};
