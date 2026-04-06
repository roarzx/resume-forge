import type { ResumeContent } from "@/types/resume";

interface ResumeTemplateProps {
  content: ResumeContent;
}

export function MinimalTemplate({ content }: ResumeTemplateProps) {
  const { basic, education, experience, projects, skills, certificates } = content;

  return (
    <div className="bg-white text-gray-800 p-8 font-sans">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-4xl font-light mb-2">{basic.name || "姓名"}</h1>
        {basic.title && (
          <p className="text-lg text-gray-500 font-light">{basic.title}</p>
        )}
        <div className="flex gap-4 mt-4 text-sm text-gray-500">
          {basic.email && <span>{basic.email}</span>}
          {basic.phone && <span>{basic.phone}</span>}
          {basic.location && <span>{basic.location}</span>}
          {basic.website && <span>{basic.website}</span>}
        </div>
      </header>

      {/* Summary */}
      {basic.summary && (
        <section className="mb-8">
          <p className="text-gray-600 leading-relaxed">{basic.summary}</p>
        </section>
      )}

      {/* Education */}
      {education.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
            Education
          </h2>
          {education.map((edu) => (
            <div key={edu.id} className="mb-3 flex justify-between">
              <div>
                <span className="font-medium">{edu.school}</span>
                <span className="text-gray-500"> — {edu.major}</span>
                <span className="text-gray-400">, {edu.degree}</span>
              </div>
              <span className="text-sm text-gray-400">
                {edu.startDate} — {edu.endDate}
              </span>
            </div>
          ))}
        </section>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
            Experience
          </h2>
          {experience.map((exp) => (
            <div key={exp.id} className="mb-4">
              <div className="flex justify-between">
                <div>
                  <span className="font-medium">{exp.company}</span>
                  <span className="text-gray-500"> — {exp.position}</span>
                </div>
                <span className="text-sm text-gray-400">
                  {exp.startDate} — {exp.endDate}
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-600 whitespace-pre-line leading-relaxed">
                {exp.description}
              </p>
            </div>
          ))}
        </section>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
            Projects
          </h2>
          {projects.map((proj) => (
            <div key={proj.id} className="mb-4">
              <div className="flex justify-between">
                <span className="font-medium">{proj.name}</span>
                <span className="text-sm text-gray-400">
                  {proj.startDate} — {proj.endDate}
                </span>
              </div>
              {proj.role && <p className="text-sm text-gray-500">{proj.role}</p>}
              {proj.technologies && proj.technologies.length > 0 && (
                <p className="text-xs text-gray-400 mt-1">
                  {proj.technologies.join(" · ")}
                </p>
              )}
              <p className="mt-2 text-sm text-gray-600 whitespace-pre-line leading-relaxed">
                {proj.description}
              </p>
            </div>
          ))}
        </section>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
            Skills
          </h2>
          <p className="text-sm text-gray-600">
            {skills.join(" · ")}
          </p>
        </section>
      )}

      {/* Certificates */}
      {certificates.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
            Certifications
          </h2>
          <div className="space-y-1">
            {certificates.map((cert) => (
              <p key={cert.id} className="text-sm text-gray-600">
                {cert.name}
                {cert.date && <span className="text-gray-400 ml-2">{cert.date}</span>}
              </p>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
