export interface AdzunaJob {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  salaryMin: number | null;
  salaryMax: number | null;
  contractType: string | null;
  contractTime: string | null;
  created: string;
  redirectUrl: string;
}

interface AdzunaResponse {
  results: Array<{
    id: string | number;
    title: string;
    company?: {
      display_name?: string;
    };
    location?: {
      display_name?: string;
    };
    description?: string;
    salary_min?: number;
    salary_max?: number;
    contract_type?: string;
    contract_time?: string;
    created?: string;
    redirect_url: string;
  }>;
  count?: number;
}

export async function searchAdzunaJobs({
  query = "software engineer",
  location = "Islamabad",
  page = 1,
}: {
  query?: string;
  location?: string;
  page?: number;
} = {}): Promise<AdzunaJob[]> {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;

  if (!appId || !appKey) {
    throw new Error("Adzuna API credentials are not configured");
  }

  const params = new URLSearchParams({
    app_id: appId,
    app_key: appKey,
    results_per_page: "20",
    what: query,
    where: location,
    "content-type": "application/json",
  });

  const url =
    `https://api.adzuna.com/v1/api/jobs/pk/search/${page}?${params.toString()}`;

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();

    console.error("Adzuna API error:", errorText);

    throw new Error(
      `Adzuna API request failed: ${response.status}`
    );
  }

  const data: AdzunaResponse = await response.json();

  return data.results.map((job) => ({
    id: String(job.id),
    title: job.title,
    company: job.company?.display_name ?? "Unknown Company",
    location: job.location?.display_name ?? "Unknown Location",
    description: job.description ?? "",
    salaryMin: job.salary_min ?? null,
    salaryMax: job.salary_max ?? null,
    contractType: job.contract_type ?? null,
    contractTime: job.contract_time ?? null,
    created: job.created ?? "",
    redirectUrl: job.redirect_url,
  }));
}