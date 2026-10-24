import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.resolve(process.cwd(), ".env.local"),
});

export interface JoobleJob {
  id?: string;
  title: string;
  location: string;
  snippet: string;
  salary: string;
  source: string;
  type: string;
  link: string;
  company?: string;
  updated?: string;
}

interface JoobleResponse {
  totalCount: number;
  jobs: JoobleJob[];
}

interface SearchJoobleOptions {
  keywords: string;
  location: string;
  page?: number;
}

export async function searchJoobleJobs({
  keywords,
  location,
  page = 1,
}: SearchJoobleOptions): Promise<JoobleJob[]> {
  const apiKey = process.env.JOOBLE_API_KEY;

  if (!apiKey) {
    throw new Error("JOOBLE_API_KEY is not configured");
  }

  const response = await fetch(
    `https://jooble.org/api/${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        keywords,
        location,
        page,
      }),
      cache: "no-store",
    }
  );

  if (!response.ok) {
    const errorText = await response.text();

    console.error("Jooble API error:", errorText);

    throw new Error(
      `Jooble API request failed: ${response.status}`
    );
  }

  const data: JoobleResponse = await response.json();

  return data.jobs || [];
}