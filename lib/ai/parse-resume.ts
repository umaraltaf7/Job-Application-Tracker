// lib/ai/parse-resume.ts

import { mistral } from "./mistral";
import { callOpenRouter } from "./openrouter";
import { ResumeParsedDataSchema } from "../resume/schema";

const RESUME_SYSTEM_PROMPT = `
You are a professional resume parsing assistant.

Your task is to extract structured information from the resume text.

IMPORTANT RULES:

- Extract ONLY information that actually appears in the resume.
- Never invent or assume information.
- If information is missing, use null or an empty array as appropriate.
- Keep the original meaning of the resume.
- Do not add skills, companies, projects, dates, qualifications,
  certifications, or languages that are not present.
- Preserve the information accurately.
- Return ONLY valid JSON.
- The JSON must follow the requested structure exactly.

Required structure:

{
  "personalInfo": {
    "name": string | null,
    "email": string | null,
    "phone": string | null,
    "location": string | null,
    "linkedin": string | null,
    "github": string | null
  },
  "summary": string | null,
  "skills": string[],
  "experience": [
    {
      "company": string,
      "role": string,
      "startDate": string | null,
      "endDate": string | null,
      "description": string[]
    }
  ],
  "education": [
    {
      "institution": string,
      "degree": string,
      "field": string | null,
      "startDate": string | null,
      "endDate": string | null
    }
  ],
  "projects": [
    {
      "name": string,
      "technologies": string[],
      "description": string[]
    }
  ],
  "certifications": string[],
  "languages": string[]
}

For dates:
- Extract dates exactly or approximately as written in the resume.
- If no date is available, use null.
- Do not guess missing dates.

For experience:
- Keep each job/internship as a separate experience.
- Put responsibilities and achievements into the description array.

For projects:
- Keep each project separate.
- Extract technologies only when they are actually mentioned.

For skills:
- Extract skills explicitly mentioned in the resume.
- Do not invent additional skills.

For personal information:
- Extract email, phone, LinkedIn, GitHub, location, and name only
  when present in the resume.
`;

function extractContent(
  content: unknown
): string {
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

function validateResumeData(
  parsed: unknown
) {
  const validated =
    ResumeParsedDataSchema.safeParse(parsed);

  if (!validated.success) {
    console.error(
      "Resume validation failed:",
      validated.error.flatten()
    );

    throw new Error(
      "AI returned invalid resume data"
    );
  }

  return validated.data;
}

export async function parseResumeWithAI(
  resumeText: string
) {
  if (!resumeText.trim()) {
    throw new Error("Resume text is empty");
  }

  const messages = [
    {
      role: "system" as const,
      content: RESUME_SYSTEM_PROMPT,
    },
    {
      role: "user" as const,
      content: resumeText,
    },
  ];

  /*
   * ---------------------------------------------------------
   * 1. TRY MISTRAL FIRST
   * ---------------------------------------------------------
   */

  try {
    console.log(
      "🤖 Trying Mistral for resume parsing..."
    );

    const response =
      await mistral.chat.complete({
        model: "mistral-small-latest",

        messages,

        responseFormat: {
          type: "json_object",
        },

        temperature: 0.1,
      });

    const content =
      response.choices[0]?.message?.content;

    const jsonText = extractContent(content);

    if (!jsonText.trim()) {
      throw new Error(
        "Mistral returned empty content"
      );
    }

    let parsed: unknown;

    try {
      parsed = JSON.parse(jsonText);
    } catch {
      throw new Error(
        "Mistral returned invalid JSON"
      );
    }

    const validated =
      validateResumeData(parsed);

    console.log(
      "✅ Resume parsed successfully with Mistral"
    );

    return validated;
  } catch (mistralError) {
    console.error(
      "⚠️ Mistral resume parsing failed."
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

    const validated =
      validateResumeData(parsed);

    console.log(
      "✅ Resume parsed successfully with OpenRouter"
    );

    return validated;
  } catch (openRouterError) {
    console.error(
      "❌ OpenRouter resume parsing failed:",
      openRouterError
    );

    throw new Error(
      "Resume parsing failed with both Mistral and OpenRouter"
    );
  }
}