import { mistral } from "../ai/mistral";

/**
 * Summarizes a job description into a few short bullet points
 * using Mistral. Called once, at "Add to Board" time — not on
 * every search result — to avoid unnecessary AI calls.
 */
export async function summarizeJobDescription(
  description?: string
): Promise<string[]> {
  if (!description || description.trim().length === 0) {
    return [];
  }

  try {
    const response = await mistral.chat.complete({
      model: "mistral-small-latest",
      temperature: 0.2,
      responseFormat: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            'You summarize job descriptions into 3-4 short, punchy bullet points covering the key responsibilities and requirements only. Skip boilerplate (equal opportunity statements, company boilerplate, benefits fluff). Respond ONLY with JSON in this exact shape: {"points": ["point one", "point two", "point three"]}. Each point should be under 15 words.',
        },
        {
          role: "user",
          content: description.slice(0, 6000), // guard against extremely long descriptions
        },
      ],
    });

    const content = response.choices?.[0]?.message?.content;

    if (!content || typeof content !== "string") {
      return [];
    }

    const parsed = JSON.parse(content);

    if (Array.isArray(parsed.points)) {
      return parsed.points.filter(
        (point: unknown) => typeof point === "string" && point.trim().length > 0
      );
    }

    return [];
  } catch (error) {
    console.error("Job summarization failed:", error);
    // Fail gracefully — the job still gets saved, just without a summary.
    return [];
  }
}