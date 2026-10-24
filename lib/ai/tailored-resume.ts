// lib/ai/tailored-resume.ts

import { callOpenRouter } from "./openrouter";

export interface TailoredResume {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    github: string;
  };

  summary: string;

  skills: string[];

  experience: {
    company: string;
    role: string;
    startDate: string;
    endDate: string;
    description: string[];
  }[];

  education: {
    institution: string;
    degree: string;
    field: string;
    startDate: string;
    endDate: string;
  }[];

  projects: {
    name: string;
    technologies: string[];
    description: string[];
  }[];

  certifications: string[];

  languages: string[];
}

interface JobData {
  title: string;
  company: string;
  location?: string;
  description: string;
}

interface CandidateProfile {
  personalInfo?: {
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    location?: string | null;
    linkedin?: string | null;
    github?: string | null;
  };

  summary?: string | null;

  skills?: string[];

  experience?: {
    company: string;
    role: string;
    startDate: string | null;
    endDate: string | null;
    description: string[];
  }[];

  education?: {
    institution: string;
    degree: string;
    field: string | null;
    startDate: string | null;
    endDate: string | null;
  }[];

  projects?: {
    name: string;
    technologies: string[];
    description: string[];
  }[];

  certifications?: string[];

  languages?: string[];
}

const TAILORED_RESUME_SYSTEM_PROMPT = `
You are an AI resume optimization assistant.

Your task is to create a tailored version of a candidate's existing resume
for a SPECIFIC job.

The most important rule is:

NEVER invent information.

You may:
- Reorder existing skills.
- Rephrase existing experience.
- Rephrase existing project descriptions.
- Make the professional summary more relevant.
- Prioritize skills relevant to the job.
- Improve clarity and wording.
- Emphasize existing experience that is relevant to the job.

You MUST NOT:
- Invent companies.
- Invent job titles.
- Invent projects.
- Invent technologies.
- Invent certifications.
- Invent achievements.
- Invent metrics.
- Invent responsibilities.
- Invent years of experience.
- Add skills that are not present in the candidate profile.
- Claim the candidate used a technology if it is not present in the profile.

If a job requires a technology that the candidate does not have,
DO NOT add that technology to the resume.

Keep dates and factual information from the original resume.

The result should be a professional, ATS-friendly resume tailored to
the job.

Return ONLY valid JSON.

Required structure:

{
  "personalInfo": {
    "name": "",
    "email": "",
    "phone": "",
    "location": "",
    "linkedin": "",
    "github": ""
  },
  "summary": "",
  "skills": [],
  "experience": [
    {
      "company": "",
      "role": "",
      "startDate": "",
      "endDate": "",
      "description": []
    }
  ],
  "education": [
    {
      "institution": "",
      "degree": "",
      "field": "",
      "startDate": "",
      "endDate": ""
    }
  ],
  "projects": [
    {
      "name": "",
      "technologies": [],
      "description": []
    }
  ],
  "certifications": [],
  "languages": []
}
`;

function validateTailoredResume(
  data: unknown
): TailoredResume {
  if (!data || typeof data !== "object") {
    throw new Error("AI returned invalid tailored resume data");
  }

  const result = data as Record<string, unknown>;

  const personalInfo =
    result.personalInfo &&
    typeof result.personalInfo === "object"
      ? (result.personalInfo as Record<string, unknown>)
      : {};

  const stringValue = (
    value: unknown
  ): string => {
    return typeof value === "string" ? value : "";
  };

  const stringArray = (
    value: unknown
  ): string[] => {
    if (!Array.isArray(value)) {
      return [];
    }

    return value.filter(
      (item): item is string =>
        typeof item === "string"
    );
  };

  const experience = Array.isArray(result.experience)
    ? result.experience
        .filter(
          (item) =>
            item &&
            typeof item === "object"
        )
        .map((item) => {
          const experienceItem =
            item as Record<string, unknown>;

          return {
            company: stringValue(
              experienceItem.company
            ),
            role: stringValue(
              experienceItem.role
            ),
            startDate: stringValue(
              experienceItem.startDate
            ),
            endDate: stringValue(
              experienceItem.endDate
            ),
            description: stringArray(
              experienceItem.description
            ),
          };
        })
    : [];

  const education = Array.isArray(result.education)
    ? result.education
        .filter(
          (item) =>
            item &&
            typeof item === "object"
        )
        .map((item) => {
          const educationItem =
            item as Record<string, unknown>;

          return {
            institution: stringValue(
              educationItem.institution
            ),
            degree: stringValue(
              educationItem.degree
            ),
            field: stringValue(
              educationItem.field
            ),
            startDate: stringValue(
              educationItem.startDate
            ),
            endDate: stringValue(
              educationItem.endDate
            ),
          };
        })
    : [];

  const projects = Array.isArray(result.projects)
    ? result.projects
        .filter(
          (item) =>
            item &&
            typeof item === "object"
        )
        .map((item) => {
          const project =
            item as Record<string, unknown>;

          return {
            name: stringValue(project.name),
            technologies: stringArray(
              project.technologies
            ),
            description: stringArray(
              project.description
            ),
          };
        })
    : [];

  return {
    personalInfo: {
      name: stringValue(personalInfo.name),
      email: stringValue(personalInfo.email),
      phone: stringValue(personalInfo.phone),
      location: stringValue(personalInfo.location),
      linkedin: stringValue(personalInfo.linkedin),
      github: stringValue(personalInfo.github),
    },

    summary: stringValue(result.summary),

    skills: stringArray(result.skills),

    experience,

    education,

    projects,

    certifications: stringArray(
      result.certifications
    ),

    languages: stringArray(
      result.languages
    ),
  };
}

function buildPrompt(
  job: JobData,
  candidate: CandidateProfile
): string {
  return `
Create a tailored resume for this job.

====================
JOB
====================

Title:
${job.title}

Company:
${job.company}

Location:
${job.location || "Not specified"}

Job Description:
${job.description}

====================
ORIGINAL CANDIDATE RESUME
====================

Personal Information:
${JSON.stringify(
  candidate.personalInfo || {},
  null,
  2
)}

Professional Summary:
${candidate.summary || "Not provided"}

Skills:
${JSON.stringify(
  candidate.skills || [],
  null,
  2
)}

Experience:
${JSON.stringify(
  candidate.experience || [],
  null,
  2
)}

Education:
${JSON.stringify(
  candidate.education || [],
  null,
  2
)}

Projects:
${JSON.stringify(
  candidate.projects || [],
  null,
  2
)}

Certifications:
${JSON.stringify(
  candidate.certifications || [],
  null,
  2
)}

Languages:
${JSON.stringify(
  candidate.languages || [],
  null,
  2
)}

====================
INSTRUCTIONS
====================

Tailor the resume to this job.

Prioritize relevant existing skills.

Rewrite existing descriptions where useful.

Make the professional summary relevant to the job.

Do NOT add anything that does not exist in the original resume.

Do NOT invent achievements or metrics.

Do NOT add missing job requirements as candidate skills.

Return only JSON.
`;
}

export async function generateTailoredResume(
  job: JobData,
  candidate: CandidateProfile
): Promise<TailoredResume> {
  if (!job.title?.trim()) {
    throw new Error("Job title is required");
  }

  if (!job.company?.trim()) {
    throw new Error("Company name is required");
  }

  if (!job.description?.trim()) {
    throw new Error("Job description is required");
  }

  const messages = [
    {
      role: "system" as const,
      content: TAILORED_RESUME_SYSTEM_PROMPT,
    },
    {
      role: "user" as const,
      content: buildPrompt(
        job,
        candidate
      ),
    },
  ];

  const result = await callOpenRouter(
    messages
  );

  return validateTailoredResume(result);
}