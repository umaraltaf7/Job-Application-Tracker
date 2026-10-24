import { mistral } from "./mistral";
import { callOpenRouter } from "./openrouter";

export interface ApplicationPreparation {
  whyYouMatch: string;
  skillsToHighlight: string[];
  missingSkills: string[];
  coverLetter: string;
  recruiterMessage: string;
  resumeSuggestions: string[];
}

interface JobData {
  title: string;
  company: string;
  location?: string;
  description: string;
  categories?: string[];
  levels?: string[];
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

const APPLICATION_PREP_SYSTEM_PROMPT = `
You are an AI job application assistant.

Your job is to help a candidate prepare an application for a SPECIFIC job.

You will receive:
1. A job description.
2. The candidate's parsed resume/profile.

Compare the candidate's actual experience and skills with the actual job requirements.

IMPORTANT RULES:

- NEVER invent experience, skills, projects, education, certifications,
  companies, achievements, or technologies.
- Only use information that exists in the candidate profile.
- If a skill is required by the job but is not present in the candidate
  profile, treat it as missing or not clearly demonstrated.
- Do not claim the candidate has experience that is not present.
- Keep all recommendations realistic and truthful.
- The cover letter must be personalized to the specific job.
- The recruiter message must be concise and professional.
- Resume suggestions should suggest improvements, not fabricate information.
- Do not rewrite the entire resume.
- Do not exaggerate the candidate's qualifications.

Return ONLY valid JSON.

Required JSON structure:

{
  "whyYouMatch": "string",
  "skillsToHighlight": ["string"],
  "missingSkills": ["string"],
  "coverLetter": "string",
  "recruiterMessage": "string",
  "resumeSuggestions": ["string"]
}

Field requirements:

whyYouMatch:
- Explain briefly why the candidate is relevant to this particular job.
- Mention actual matching skills, projects, education, or experience.

skillsToHighlight:
- Include only skills that actually appear in the candidate profile.
- Prioritize skills relevant to this job.

missingSkills:
- Include important job requirements that are not clearly present
  in the candidate profile.
- Do not automatically treat optional requirements as missing.

coverLetter:
- Write a personalized professional cover letter.
- Mention the company and job title.
- Connect the candidate's actual background to the job.
- Do not invent achievements.
- Keep it reasonably concise.

recruiterMessage:
- Write a short LinkedIn/email-style message.
- Mention the job title.
- Mention 1-2 genuinely relevant candidate strengths.
- Keep it concise.

resumeSuggestions:
- Give specific suggestions for improving the resume for this job.
- Suggestions must be based on the actual resume and job description.
- Do not suggest adding fake experience or skills.
`;

function extractContent(content: unknown): string {
  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((item) => {
        if (
          typeof item === "object" &&
          item !== null &&
          "text" in item &&
          typeof item.text === "string"
        ) {
          return item.text;
        }

        return "";
      })
      .join("");
  }

  return "";
}

function validateApplicationPreparation(
  data: unknown
): ApplicationPreparation {
  if (!data || typeof data !== "object") {
    throw new Error("AI returned invalid application preparation data");
  }

  const result = data as Record<string, unknown>;

  if (typeof result.whyYouMatch !== "string") {
    throw new Error("Invalid whyYouMatch field");
  }

  if (
    !Array.isArray(result.skillsToHighlight) ||
    !result.skillsToHighlight.every(
      (item) => typeof item === "string"
    )
  ) {
    throw new Error("Invalid skillsToHighlight field");
  }

  if (
    !Array.isArray(result.missingSkills) ||
    !result.missingSkills.every(
      (item) => typeof item === "string"
    )
  ) {
    throw new Error("Invalid missingSkills field");
  }

  if (typeof result.coverLetter !== "string") {
    throw new Error("Invalid coverLetter field");
  }

  if (typeof result.recruiterMessage !== "string") {
    throw new Error("Invalid recruiterMessage field");
  }

  if (
    !Array.isArray(result.resumeSuggestions) ||
    !result.resumeSuggestions.every(
      (item) => typeof item === "string"
    )
  ) {
    throw new Error("Invalid resumeSuggestions field");
  }

  return {
    whyYouMatch: result.whyYouMatch,
    skillsToHighlight: result.skillsToHighlight,
    missingSkills: result.missingSkills,
    coverLetter: result.coverLetter,
    recruiterMessage: result.recruiterMessage,
    resumeSuggestions: result.resumeSuggestions,
  };
}

function buildUserPrompt(
  job: JobData,
  candidate: CandidateProfile
): string {
  return `
Prepare an application package for the following job.

====================
JOB INFORMATION
====================

Job Title:
${job.title}

Company:
${job.company}

Location:
${job.location || "Not specified"}

Categories:
${job.categories?.join(", ") || "Not specified"}

Experience Levels:
${job.levels?.join(", ") || "Not specified"}

Job Description:
${job.description}

====================
CANDIDATE PROFILE
====================

Personal Information:
${JSON.stringify(candidate.personalInfo || {}, null, 2)}

Professional Summary:
${candidate.summary || "Not provided"}

Skills:
${JSON.stringify(candidate.skills || [], null, 2)}

Experience:
${JSON.stringify(candidate.experience || [], null, 2)}

Education:
${JSON.stringify(candidate.education || [], null, 2)}

Projects:
${JSON.stringify(candidate.projects || [], null, 2)}

Certifications:
${JSON.stringify(candidate.certifications || [], null, 2)}

Languages:
${JSON.stringify(candidate.languages || [], null, 2)}

====================
TASK
====================

Compare the job requirements with the candidate profile and generate
the complete application preparation package.

Remember:

- Use only real candidate information.
- Do not invent skills or experience.
- Make the cover letter specific to this job.
- Keep the recruiter message concise.
- Give useful, specific resume suggestions.
`;
}

export async function prepareApplication(
  job: JobData,
  candidate: CandidateProfile
): Promise<ApplicationPreparation> {
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
      content: APPLICATION_PREP_SYSTEM_PROMPT,
    },
    {
      role: "user" as const,
      content: buildUserPrompt(job, candidate),
    },
  ];

  // -----------------------------------------
  // Try Mistral first
  // -----------------------------------------

  try {
    console.log("🤖 Trying Mistral for application preparation...");

    const response = await mistral.chat.complete({
      model: "mistral-small-latest",
      messages,
      responseFormat: {
        type: "json_object",
      },
      temperature: 0.2,
    });

    const content = response.choices[0]?.message?.content;

    const jsonText = extractContent(content);

    if (!jsonText.trim()) {
      throw new Error("Mistral returned empty content");
    }

    let parsed: unknown;

    try {
      parsed = JSON.parse(jsonText);
    } catch {
      throw new Error("Mistral returned invalid JSON");
    }

    const validated = validateApplicationPreparation(parsed);

    console.log(
      "✅ Application preparation generated with Mistral"
    );

    return validated;
  } catch (mistralError) {
    console.error(
      "⚠️ Mistral application preparation failed."
    );
    console.error(mistralError);

    console.log(
      "🔄 Falling back to OpenRouter..."
    );
  }

  // -----------------------------------------
  // OpenRouter fallback
  // -----------------------------------------

  try {
    const parsed = await callOpenRouter(messages);

    const validated = validateApplicationPreparation(parsed);

    console.log(
      "✅ Application preparation generated with OpenRouter"
    );

    return validated;
  } catch (openRouterError) {
    console.error(
      "❌ OpenRouter application preparation failed:"
    );
    console.error(openRouterError);

    throw new Error(
      "Application preparation failed with both Mistral and OpenRouter"
    );
  }
}