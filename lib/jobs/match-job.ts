// lib/jobs/match-job.ts

import { Job } from "./types";
import { IResumeParsedData } from "../models/resume";
import { callOpenRouter } from "../ai/openrouter";

export interface JobMatchResult {
  matchScore: number;
  recommendation: "APPLY" | "MAYBE" | "SKIP";
  matchedSkills: string[];
  missingSkills: string[];
  experienceMatch: "Strong" | "Good" | "Weak";
  educationMatch: "Strong" | "Good" | "Weak";
  reason: string;
}

const MATCH_SYSTEM_PROMPT = `
You are a precise AI job matching system.

Compare a candidate's structured resume profile
against a job posting.

Return ONLY valid JSON.

The JSON must have exactly this structure:

{
  "matchScore": 0,
  "recommendation": "APPLY",
  "matchedSkills": [],
  "missingSkills": [],
  "experienceMatch": "Strong",
  "educationMatch": "Good",
  "reason": ""
}

Rules:

matchScore:
- Integer from 0 to 100.

recommendation:
- APPLY = strong match
- MAYBE = reasonable match but some gaps
- SKIP = poor match

experienceMatch:
- Strong
- Good
- Weak

educationMatch:
- Strong
- Good
- Weak

Matching rules:

1. Prioritize required skills.
2. Consider relevant professional experience.
3. Consider relevant projects.
4. Consider education requirements.
5. Consider seniority and experience level.
6. Consider certifications.
7. Consider overall suitability.
8. Do not require every technology mentioned in the job.
9. Distinguish required and optional skills.
10. Do not heavily penalize missing optional skills.
11. Consider equivalent or closely related technologies where appropriate.
12. Do not reject a candidate simply because they are missing one skill.
13. Give more importance to required skills than optional skills.
14. Keep the reason concise.
`;

function validateResult(
  result: unknown
): JobMatchResult {
  if (
    typeof result !== "object" ||
    result === null
  ) {
    throw new Error(
      "AI returned invalid job match data"
    );
  }

  const data =
    result as Record<string, unknown>;

  if (
    typeof data.matchScore !== "number" ||
    data.matchScore < 0 ||
    data.matchScore > 100
  ) {
    throw new Error(
      "Invalid match score returned by AI"
    );
  }

  if (
    data.recommendation !== "APPLY" &&
    data.recommendation !== "MAYBE" &&
    data.recommendation !== "SKIP"
  ) {
    throw new Error(
      "Invalid recommendation returned by AI"
    );
  }

  if (
    !Array.isArray(data.matchedSkills) ||
    !Array.isArray(data.missingSkills)
  ) {
    throw new Error(
      "Invalid skills returned by AI"
    );
  }

  if (
    data.experienceMatch !== "Strong" &&
    data.experienceMatch !== "Good" &&
    data.experienceMatch !== "Weak"
  ) {
    throw new Error(
      "Invalid experience match returned by AI"
    );
  }

  if (
    data.educationMatch !== "Strong" &&
    data.educationMatch !== "Good" &&
    data.educationMatch !== "Weak"
  ) {
    throw new Error(
      "Invalid education match returned by AI"
    );
  }

  if (typeof data.reason !== "string") {
    throw new Error(
      "Invalid reason returned by AI"
    );
  }

  return {
    matchScore: Math.round(data.matchScore),

    recommendation:
      data.recommendation as
        | "APPLY"
        | "MAYBE"
        | "SKIP",

    matchedSkills:
      data.matchedSkills.filter(
        (skill): skill is string =>
          typeof skill === "string"
      ),

    missingSkills:
      data.missingSkills.filter(
        (skill): skill is string =>
          typeof skill === "string"
      ),

    experienceMatch:
      data.experienceMatch as
        | "Strong"
        | "Good"
        | "Weak",

    educationMatch:
      data.educationMatch as
        | "Strong"
        | "Good"
        | "Weak",

    reason: data.reason,
  };
}

export async function matchJobToResume(
  job: Job,
  candidateProfile: IResumeParsedData
): Promise<JobMatchResult> {
  if (!job.description) {
    throw new Error(
      "Job description is missing"
    );
  }

  const prompt = `
JOB
---

Title:
${job.title}

Company:
${job.company}

Location:
${job.location}

Description:
${job.description}

Categories:
${job.categories?.join(", ") || "Not provided"}

Levels:
${job.levels?.join(", ") || "Not provided"}


CANDIDATE PROFILE
-----------------

Summary:
${candidateProfile.summary ?? "Not provided"}

Skills:
${candidateProfile.skills?.join(", ") || "None listed"}

Experience:
${JSON.stringify(
    candidateProfile.experience ?? [],
    null,
    2
)}

Education:
${JSON.stringify(
    candidateProfile.education ?? [],
    null,
    2
)}

Projects:
${JSON.stringify(
    candidateProfile.projects ?? [],
    null,
    2
)}

Certifications:
${
  candidateProfile.certifications?.join(", ") ||
  "None listed"
}

Languages:
${candidateProfile.languages?.join(", ") || "None listed"}


TASK
----

Evaluate how well the candidate matches this job.

Return only the requested JSON structure.
`;

  const messages = [
    {
      role: "system" as const,
      content: MATCH_SYSTEM_PROMPT,
    },
    {
      role: "user" as const,
      content: prompt,
    },
  ];

  /*
   * ---------------------------------------------------------
   * 1. TRY MISTRAL FIRST
   * ---------------------------------------------------------
   */

  try {
    console.log(
      "🤖 Trying Mistral for job matching..."
    );

    const response = await fetch(
      "https://api.mistral.ai/v1/chat/completions",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
        },

        body: JSON.stringify({
          model: "mistral-small-latest",

          messages,

          temperature: 0.1,

          response_format: {
            type: "json_object",
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText =
        await response.text();

      console.error(
        "Mistral job matching error:",
        response.status,
        errorText
      );

      throw new Error(
        `Mistral request failed: ${response.status}`
      );
    }

    const data =
      await response.json();

    const content =
      data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error(
        "Mistral returned empty response"
      );
    }

    let parsed: unknown;

    if (typeof content === "string") {
      parsed = JSON.parse(content);
    } else if (Array.isArray(content)) {
      const text = content
        .map((item) => {
          if (
            typeof item === "object" &&
            item !== null &&
            "text" in item &&
            typeof (item as { text?: unknown }).text === "string"
          ) {
            return (item as { text: string }).text;
          }

          return "";
        })
        .join("");

      parsed = JSON.parse(text);
    } else {
      throw new Error(
        "Mistral returned unsupported content"
      );
    }

    const result =
      validateResult(parsed);

    console.log(
      "✅ Job matched successfully with Mistral"
    );

    return result;
  } catch (mistralError) {
    console.error(
      "⚠️ Mistral job matching failed."
    );

    console.error(mistralError);

    console.log(
      "🔄 Falling back to OpenRouter..."
    );
  }

  /*
   * ---------------------------------------------------------
   * 2. FALLBACK TO OPENROUTER
   * ---------------------------------------------------------
   */

  try {
    const parsed =
      await callOpenRouter(messages);

    const result =
      validateResult(parsed);

    console.log(
      "✅ Job matched successfully with OpenRouter"
    );

    return result;
  } catch (openRouterError) {
    console.error(
      "❌ OpenRouter job matching failed:",
      openRouterError
    );

    throw new Error(
      "Job matching failed with both Mistral and OpenRouter"
    );
  }
}