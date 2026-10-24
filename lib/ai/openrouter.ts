
// lib/ai/openrouter.ts

type ChatMessage = {
  role: "system" | "user" | "assistant";
};

type OpenRouterResponse = {
  model?: string;

  choices?: Array<{
    message?: {
      content?:
        | string
        | Array<{
            type?: string;
            text?: string;
          }>;
    };
  }>;
};

function extractJsonText(content: string): string {
  let text = content.trim();

  // Remove markdown JSON fences if a model returns them.
  text = text.replace(/^```json\s*/i, "");
  text = text.replace(/^```\s*/i, "");
  text = text.replace(/\s*```$/i, "");

  return text.trim();
}

export async function callOpenRouter(
  messages: ChatMessage[]
): Promise<unknown> {
  const apiKey = process.env.OPEN_ROUTER_API_KEY;

  if (!apiKey) {
    throw new Error("OPEN_ROUTER_API_KEY is not configured");
  }

  /*
   * OpenRouter model fallback chain.
   *
   * If the first model/provider is unavailable or rate-limited,
   * OpenRouter automatically tries the next model.
   *
   * Keep these models free so the project does not unexpectedly
   * start consuming paid credits.
   */
  const models = [
    "google/gemma-4-31b-it:free",
    "google/gemma-4-26b-a4b-it:free",
    "openrouter/free",
  ];

  console.log(
    "🔄 OpenRouter fallback models:",
    models
  );

  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "Job Application Tracker",
      },

      body: JSON.stringify({
        /*
         * Primary model.
         *
         * OpenRouter will use the `models` array for fallback
         * routing if this model fails.
         */
        model: models[0],

        /*
         * OpenRouter-specific model fallback list.
         *
         * If the primary model is rate-limited, unavailable,
         * or fails, OpenRouter tries the next model.
         */
        models,

        messages,

        temperature: 0.1,

        response_format: {
          type: "json_object",
        },
      }),
    }
  );

  const responseText = await response.text();

  if (!response.ok) {
    console.error(
      "OpenRouter API error:",
      response.status,
      responseText
    );

    throw new Error(
      `OpenRouter request failed: ${response.status}`
    );
  }
  let data: OpenRouterResponse;

  try {
    data = JSON.parse(responseText);
  } catch {
    console.error(
      "OpenRouter returned non-JSON API response:",
      responseText
    );

    throw new Error(
      "OpenRouter returned invalid response"
    );
  }

  console.log(
    "🤖 OpenRouter model used:",
    data.model ?? "unknown"
  );

  const content =
    data.choices?.[0]?.message?.content;

  if (!content) {
    console.error(
      "OpenRouter response did not contain message content:",
      responseText
    );

    throw new Error(
      "OpenRouter returned empty response"
    );
  }

  let jsonText: string;

  if (typeof content === "string") {
    jsonText = content;
  } else if (Array.isArray(content)) {
    jsonText = content
      .map((item) => item.text ?? "")
      .join("");
  } else {
    throw new Error(
      "OpenRouter returned unsupported content format"
    );
  }

  if (!jsonText.trim()) {
    throw new Error(
      "OpenRouter returned empty content"
    );
  }

  const cleanedJson =
    extractJsonText(jsonText);

  try {
    return JSON.parse(cleanedJson);
  } catch {
    console.error(
      "Invalid JSON returned by OpenRouter:",
      cleanedJson
    );

    throw new Error(
      "OpenRouter returned invalid JSON"
    );
  }
}
