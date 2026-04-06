import { ClassicTemplate } from "./classic-template";
import { ModernTemplate } from "./modern-template";
import { MinimalTemplate } from "./minimal-template";
import type { ResumeContent, TemplateType } from "@/types/resume";

interface ResumeTemplateRendererProps {
  template: TemplateType;
  content: ResumeContent;
}

export function ResumeTemplateRenderer({
  template,
  content,
}: ResumeTemplateRendererProps) {
  switch (template) {
    case "modern":
      return <ModernTemplate content={content} />;
    case "minimal":
      return <MinimalTemplate content={content} />;
    case "classic":
    default:
      return <ClassicTemplate content={content} />;
  }
}

export { ClassicTemplate, ModernTemplate, MinimalTemplate };
