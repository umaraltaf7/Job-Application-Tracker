import { z } from "zod";

export const ResumeExperienceSchema = z.object({
  company: z.string(),
  role: z.string(),
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
  description: z.array(z.string()),
});

export const ResumeEducationSchema = z.object({
  institution: z.string(),
  degree: z.string(),
  field: z.string().nullable(),
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
});

export const ResumeProjectSchema = z.object({
  name: z.string(),
  technologies: z.array(z.string()),
  description: z.array(z.string()),
});

export const ResumeParsedDataSchema = z.object({
  personalInfo: z.object({
    name: z.string().nullable(),
    email: z.string().nullable(),
    phone: z.string().nullable(),
    location: z.string().nullable(),
    linkedin: z.string().nullable(),
    github: z.string().nullable(),
  }),

  summary: z.string().nullable(),

  skills: z.array(z.string()),

  experience: z.array(ResumeExperienceSchema),

  education: z.array(ResumeEducationSchema),

  projects: z.array(ResumeProjectSchema),

  certifications: z.array(z.string()),

  languages: z.array(z.string()),
});

export type ResumeParsedData = z.infer<
  typeof ResumeParsedDataSchema
>;