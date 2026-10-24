
import { getCandidateProfile } from "@/lib/actions/resume";
import type {
  IResumeEducation,
  IResumeExperience,
  IResumeParsedData,
  IResumeProject,
} from "@/lib/models/resume";
import {
  Award,
  BriefcaseBusiness,
  GraduationCap,
  Languages,
  Lightbulb,
  Sparkles,
  UserRound,
} from "lucide-react";

export default async function CandidateProfile() {
  const result = await getCandidateProfile();

  if (result.error || !result.data) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700">
            <Sparkles className="h-5 w-5" />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">
              Candidate Profile
            </p>

            <h2 className="mt-1 text-xl font-semibold text-slate-900">
              Build your profile from your resume
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Upload and successfully parse your default resume to
              automatically generate your skills, experience, education,
              projects, and other profile information.
            </p>
          </div>
        </div>
      </section>
    );
  }

  /*
   * getCandidateProfile() returns the parsedData from the
   * user's default resume.
   *
   * We explicitly type it here so TypeScript knows the
   * exact structure of the candidate profile.
   */
  const profile = result.data as IResumeParsedData;

  const name =
    profile.personalInfo?.name || "Candidate";

  const summary =
    profile.summary || "No professional summary available.";

  const skills: string[] = profile.skills || [];
  const experience: IResumeExperience[] =
    profile.experience || [];
  const education: IResumeEducation[] =
    profile.education || [];
  const projects: IResumeProject[] =
    profile.projects || [];
  const certifications: string[] =
    profile.certifications || [];
  const languages: string[] =
    profile.languages || [];

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="border-b border-slate-200 bg-gradient-to-br from-slate-50 via-white to-cyan-50/40 p-4 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-cyan-600 text-white shadow-sm">
              <UserRound className="h-7 w-7" />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
                  Candidate Profile
                </p>

                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  AI Parsed
                </span>
              </div>

              <h2 className="mt-2 truncate text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                {name}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Profile generated from your default resume
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:min-w-[420px]">
            <ProfileStat
              value={skills.length}
              label="Skills"
            />

            <ProfileStat
              value={experience.length}
              label="Experience"
            />

            <ProfileStat
              value={education.length}
              label="Education"
            />

            <ProfileStat
              value={projects.length}
              label="Projects"
            />
          </div>
        </div>

        {/* Summary */}
        <div className="mt-6 rounded-xl border border-slate-200 bg-white/80 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Professional Summary
          </p>

          <p className="text-sm leading-6 text-slate-700">
            {summary}
          </p>
        </div>
      </div>

      {/* Profile Content */}
      <div className="p-4 sm:p-8">
        {/* Skills */}
        <ProfileSection
          icon={<Lightbulb className="h-5 w-5" />}
          title="Skills"
          count={skills.length}
        >
          {skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {skills.map(
                (skill: string, index: number) => (
                  <span
                    key={`${skill}-${index}`}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700"
                  >
                    {skill}
                  </span>
                )
              )}
            </div>
          ) : (
            <EmptyText text="No skills were detected." />
          )}
        </ProfileSection>

        <div className="my-8 border-t border-slate-100" />

        {/* Experience */}
        <ProfileSection
          icon={<BriefcaseBusiness className="h-5 w-5" />}
          title="Experience"
          count={experience.length}
        >
          {experience.length > 0 ? (
            <div className="space-y-5">
              {experience.map(
                (
                  item: IResumeExperience,
                  index: number
                ) => (
                  <div
                    key={`${item.company}-${item.role}-${index}`}
                    className="relative border-l-2 border-cyan-100 pl-5"
                  >
                    <div className="absolute -left-[5px] top-1.5 h-2 w-2 rounded-full bg-cyan-600" />

                    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-slate-900">
                          {item.role}
                        </h3>

                        <p className="text-sm font-medium text-cyan-700">
                          {item.company}
                        </p>
                      </div>

                      {(item.startDate ||
                        item.endDate) && (
                        <span className="shrink-0 text-xs text-slate-500">
                          {item.startDate || "—"}{" "}
                          –{" "}
                          {item.endDate || "Present"}
                        </span>
                      )}
                    </div>

                    {item.description?.length > 0 && (
                      <ul className="mt-3 space-y-1.5">
                        {item.description.map(
                          (
                            description: string,
                            descriptionIndex: number
                          ) => (
                            <li
                              key={descriptionIndex}
                              className="flex gap-2 text-sm leading-6 text-slate-600"
                            >
                              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-slate-400" />
                              <span>{description}</span>
                            </li>
                          )
                        )}
                      </ul>
                    )}
                  </div>
                )
              )}
            </div>
          ) : (
            <EmptyText text="No experience was detected." />
          )}
        </ProfileSection>

        <div className="my-8 border-t border-slate-100" />

        {/* Education */}
        <ProfileSection
          icon={<GraduationCap className="h-5 w-5" />}
          title="Education"
          count={education.length}
        >
          {education.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {education.map(
                (
                  item: IResumeEducation,
                  index: number
                ) => (
                  <div
                    key={`${item.institution}-${item.degree}-${index}`}
                    className="rounded-xl border border-slate-200 bg-slate-50/70 p-4"
                  >
                    <h3 className="font-semibold text-slate-900">
                      {item.degree}
                    </h3>

                    {item.field && (
                      <p className="mt-1 text-sm text-slate-600">
                        {item.field}
                      </p>
                    )}

                    <p className="mt-2 text-sm font-medium text-cyan-700">
                      {item.institution}
                    </p>

                    {(item.startDate ||
                      item.endDate) && (
                      <p className="mt-2 text-xs text-slate-500">
                        {item.startDate || "—"}{" "}
                        –{" "}
                        {item.endDate || "Present"}
                      </p>
                    )}
                  </div>
                )
              )}
            </div>
          ) : (
            <EmptyText text="No education information was detected." />
          )}
        </ProfileSection>

        <div className="my-8 border-t border-slate-100" />

        {/* Projects */}
        <ProfileSection
          icon={<Sparkles className="h-5 w-5" />}
          title="Projects"
          count={projects.length}
        >
          {projects.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {projects.map(
                (
                  project: IResumeProject,
                  index: number
                ) => (
                  <div
                    key={`${project.name}-${index}`}
                    className="rounded-xl border border-slate-200 p-4 transition hover:border-cyan-200 hover:shadow-sm"
                  >
                    <h3 className="font-semibold text-slate-900">
                      {project.name}
                    </h3>

                    {project.technologies?.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {project.technologies.map(
                          (
                            technology: string,
                            technologyIndex: number
                          ) => (
                            <span
                              key={`${technology}-${technologyIndex}`}
                              className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600"
                            >
                              {technology}
                            </span>
                          )
                        )}
                      </div>
                    )}

                    {project.description?.length > 0 && (
                      <ul className="mt-3 space-y-1.5">
                        {project.description.map(
                          (
                            description: string,
                            descriptionIndex: number
                          ) => (
                            <li
                              key={descriptionIndex}
                              className="text-sm leading-6 text-slate-600"
                            >
                              {description}
                            </li>
                          )
                        )}
                      </ul>
                    )}
                  </div>
                )
              )}
            </div>
          ) : (
            <EmptyText text="No projects were detected." />
          )}
        </ProfileSection>

        {/* Certifications & Languages */}
        {(certifications.length > 0 ||
          languages.length > 0) && (
          <>
            <div className="my-8 border-t border-slate-100" />

            <div className="grid gap-6 md:grid-cols-2">
              {certifications.length > 0 && (
                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <Award className="h-5 w-5 text-cyan-600" />

                    <h3 className="font-semibold text-slate-900">
                      Certifications
                    </h3>
                  </div>

                  <div className="space-y-2">
                    {certifications.map(
                      (
                        certification: string,
                        index: number
                      ) => (
                        <div
                          key={`${certification}-${index}`}
                          className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                        >
                          {certification}
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {languages.length > 0 && (
                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <Languages className="h-5 w-5 text-cyan-600" />

                    <h3 className="font-semibold text-slate-900">
                      Languages
                    </h3>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {languages.map(
                      (
                        language: string,
                        index: number
                      ) => (
                        <span
                          key={`${language}-${index}`}
                          className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700"
                        >
                          {language}
                        </span>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function ProfileStat({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 text-center">
      <p className="text-xl font-bold text-slate-900">
        {value}
      </p>

      <p className="mt-0.5 text-xs text-slate-500">
        {label}
      </p>
    </div>
  );
}

function ProfileSection({
  icon,
  title,
  count,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-50 text-cyan-700">
            {icon}
          </div>

          <h2 className="text-lg font-semibold text-slate-900">
            {title}
          </h2>
        </div>

        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
          {count}
        </span>
      </div>

      {children}
    </div>
  );
}

function EmptyText({
  text,
}: {
  text: string;
}) {
  return (
    <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
      {text}
    </p>
  );
}
