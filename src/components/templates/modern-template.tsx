import type { ResumeContent } from "@/types/resume";

interface ResumeTemplateProps {
  content: ResumeContent;
}

export function ModernTemplate({ content }: ResumeTemplateProps) {
  const { basic, education, experience, projects, skills, certificates } = content;

  return (
    <div className="bg-white text-gray-800 font-sans flex">
      {/* Left Sidebar */}
      <aside className="w-1/3 bg-slate-900 text-white p-6">
        {/* Profile */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">{basic.name || "姓名"}</h1>
          {basic.title && <p className="text-slate-400">{basic.title}</p>}
        </div>

        {/* Contact */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
            联系方式
          </h3>
          <div className="space-y-2 text-sm">
            {basic.email && <p>{basic.email}</p>}
            {basic.phone && <p>{basic.phone}</p>}
            {basic.location && <p>{basic.location}</p>}
            {basic.website && <p>{basic.website}</p>}
          </div>
        </div>

        {/* Skills */}
        {skills.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
              技能
            </h3>
            <div className="space-y-2">
              {skills.map((skill, index) => (
                <div key={index} className="text-sm">
                  {skill}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certificates */}
        {certificates.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
              证书
            </h3>
            <div className="space-y-2 text-sm">
              {certificates.map((cert) => (
                <div key={cert.id}>
                  {cert.name}
                  {cert.date && (
                    <span className="text-slate-400 ml-1">({cert.date})</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="w-2/3 p-6">
        {/* Summary */}
        {basic.summary && (
          <section className="mb-6">
            <h2 className="text-lg font-bold text-slate-900 mb-2 border-b-2 border-slate-900 pb-1">
              个人简介
            </h2>
            <p className="text-sm leading-relaxed text-gray-600">{basic.summary}</p>
          </section>
        )}

        {/* Education */}
        {education.length > 0 && (
          <section className="mb-6">
            <h2 className="text-lg font-bold text-slate-900 mb-2 border-b-2 border-slate-900 pb-1">
              教育背景
            </h2>
            {education.map((edu) => (
              <div key={edu.id} className="mb-3">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">{edu.school}</span>
                  <span className="text-sm text-gray-500">
                    {edu.startDate} - {edu.endDate}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {edu.major} | {edu.degree}
                </p>
                {edu.gpa && <p className="text-sm text-gray-500">GPA: {edu.gpa}</p>}
                {edu.honors && <p className="text-sm text-gray-500">{edu.honors}</p>}
              </div>
            ))}
          </section>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <section className="mb-6">
            <h2 className="text-lg font-bold text-slate-900 mb-2 border-b-2 border-slate-900 pb-1">
              工作经历
            </h2>
            {experience.map((exp) => (
              <div key={exp.id} className="mb-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">{exp.company}</span>
                  <span className="text-sm text-gray-500">
                    {exp.startDate} - {exp.endDate}
                  </span>
                </div>
                <p className="text-sm text-slate-600">{exp.position}</p>
                <p className="text-sm mt-2 leading-relaxed text-gray-600 whitespace-pre-line">
                  {exp.description}
                </p>
              </div>
            ))}
          </section>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2 border-b-2 border-slate-900 pb-1">
              项目经历
            </h2>
            {projects.map((proj) => (
              <div key={proj.id} className="mb-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">{proj.name}</span>
                  <span className="text-sm text-gray-500">
                    {proj.startDate} - {proj.endDate}
                  </span>
                </div>
                {proj.role && <p className="text-sm text-slate-600">{proj.role}</p>}
                {proj.technologies && proj.technologies.length > 0 && (
                  <p className="text-sm text-gray-500">
                    技术栈: {proj.technologies.join(", ")}
                  </p>
                )}
                <p className="text-sm mt-2 leading-relaxed text-gray-600 whitespace-pre-line">
                  {proj.description}
                </p>
              </div>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}
