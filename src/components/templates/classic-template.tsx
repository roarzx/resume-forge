import type { ResumeContent } from "@/types/resume";

interface ResumeTemplateProps {
  content: ResumeContent;
}

export function ClassicTemplate({ content }: ResumeTemplateProps) {
  const { basic, education, experience, projects, skills, certificates } = content;

  return (
    <div className="bg-white text-gray-900 p-8 font-sans">
      {/* Header */}
      <header className="mb-6 pb-4 border-b-2 border-gray-900">
        <h1 className="text-3xl font-bold mb-1">{basic.name || "姓名"}</h1>
        {basic.title && <p className="text-lg text-gray-600 mb-3">{basic.title}</p>}
        <div className="text-sm text-gray-600 flex flex-wrap gap-x-4 gap-y-1">
          {basic.email && <span>{basic.email}</span>}
          {basic.phone && <span>{basic.phone}</span>}
          {basic.location && <span>{basic.location}</span>}
          {basic.website && <span>{basic.website}</span>}
        </div>
      </header>

      {/* Summary */}
      {basic.summary && (
        <section className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-2 uppercase tracking-wide">
            个人简介
          </h2>
          <p className="text-sm leading-relaxed">{basic.summary}</p>
        </section>
      )}

      {/* Education */}
      {education.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3 uppercase tracking-wide">
            教育背景
          </h2>
          {education.map((edu) => (
            <div key={edu.id} className="mb-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-semibold">{edu.school}</span>
                  <span className="text-gray-600"> | {edu.major}</span>
                  <span className="text-gray-600"> | {edu.degree}</span>
                </div>
                <span className="text-sm text-gray-500">
                  {edu.startDate} - {edu.endDate}
                </span>
              </div>
              {edu.gpa && <p className="text-sm text-gray-600 mt-1">GPA: {edu.gpa}</p>}
              {edu.honors && <p className="text-sm text-gray-600">{edu.honors}</p>}
            </div>
          ))}
        </section>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3 uppercase tracking-wide">
            工作经历
          </h2>
          {experience.map((exp) => (
            <div key={exp.id} className="mb-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-semibold">{exp.company}</span>
                  <span className="text-gray-600"> | {exp.position}</span>
                </div>
                <span className="text-sm text-gray-500">
                  {exp.startDate} - {exp.endDate}
                </span>
              </div>
              <p className="text-sm mt-2 whitespace-pre-line">{exp.description}</p>
            </div>
          ))}
        </section>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3 uppercase tracking-wide">
            项目经历
          </h2>
          {projects.map((proj) => (
            <div key={proj.id} className="mb-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-semibold">{proj.name}</span>
                  {proj.role && <span className="text-gray-600"> | {proj.role}</span>}
                </div>
                <span className="text-sm text-gray-500">
                  {proj.startDate} - {proj.endDate}
                </span>
              </div>
              {proj.technologies && proj.technologies.length > 0 && (
                <p className="text-sm text-gray-600 mt-1">
                  技术栈: {proj.technologies.join(", ")}
                </p>
              )}
              <p className="text-sm mt-2 whitespace-pre-line">{proj.description}</p>
            </div>
          ))}
        </section>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3 uppercase tracking-wide">
            技能特长
          </h2>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded"
              >
                {skill}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Certificates */}
      {certificates.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3 uppercase tracking-wide">
            证书资质
          </h2>
          <div className="space-y-1">
            {certificates.map((cert) => (
              <div key={cert.id} className="text-sm">
                {cert.name}
                {cert.date && <span className="text-gray-500 ml-2">({cert.date})</span>}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
