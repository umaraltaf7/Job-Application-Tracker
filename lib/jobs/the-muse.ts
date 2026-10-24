export interface MuseJob {
  id: number;
  name: string;
  publication_date: string;
  short_name: string;
  company: {
    id: number;
    short_name: string;
    name: string;
  };
  locations: {
    name: string;
  }[];
  categories: {
    name: string;
  }[];
  levels: {
    name: string;
  }[];
  refs: {
    landing_page: string;
    logo_image?: string;
  };
  contents?: string;
}

function cleanUrl(url: string): string {
  if (!url) return "";

  const markdownMatch = url.match(
    /^\[.*?\]\((https?:\/\/.*?)\)$/
  );

  if (markdownMatch) return markdownMatch[1];

  if (url.startsWith("[") && url.endsWith("]")) {
    return url.slice(1, -1);
  }

  return url.trim();
}

interface SearchMuseOptions {
  startPage?: number;
  maxPages?: number;
}

export async function searchMuseJobs(
  keyword: string = "Software Engineer",
  location: string = "Pakistan",
  categories: string[] = [
    "Software Engineering",
    "Software Engineer",
    "Computer and IT",
  ],
  options: SearchMuseOptions = {}
) {
  const {
    startPage = 0,
    maxPages = 1,
  } = options;

  const allJobs: MuseJob[] = [];

  const categoriesToSearch: (string | undefined)[] =
    categories.length > 0 ? categories : [undefined];

  let hasMore = false;

  for (const category of categoriesToSearch) {
    for (
      let page = startPage;
      page < startPage + maxPages;
      page++
    ) {
      const params = new URLSearchParams({
        page: String(page),
        location,
      });

      if (category) {
        params.set("category", category);
      }

      if (keyword) {
        params.set("q", keyword);
      }

      console.log(
        `The Muse: "${keyword}" → ${
          category ?? "no category"
        } → page ${page}`
      );

      const response = await fetch(
        `https://www.themuse.com/api/public/jobs?${params.toString()}`,
        {
          headers: {
            Accept: "application/json",
          },
          cache: "no-store",
        }
      );

      if (!response.ok) {
        const text = await response.text();

        console.error(
          "The Muse API error:",
          text
        );

        throw new Error(
          `The Muse API request failed: ${response.status}`
        );
      }

      const data = await response.json();

      if (!Array.isArray(data.results)) {
        break;
      }

      const cleanedJobs: MuseJob[] =
        data.results.map((job: MuseJob) => ({
          ...job,
          refs: {
            ...job.refs,
            landing_page: cleanUrl(
              job.refs?.landing_page ?? ""
            ),
            logo_image: job.refs?.logo_image
              ? cleanUrl(job.refs.logo_image)
              : undefined,
          },
        }));

      allJobs.push(...cleanedJobs);

      const pageCount =
        Number(data.page_count) || 0;

      if (
        pageCount > page + 1
      ) {
        hasMore = true;
      }

      if (
        !pageCount ||
        page + 1 >= pageCount
      ) {
        break;
      }
    }
  }

  const uniqueJobs = Array.from(
    new Map(
      allJobs.map((job) => [
        String(job.id),
        job,
      ])
    ).values()
  );

  return {
    results: uniqueJobs,
    hasMore,
    page: startPage,
  };
}