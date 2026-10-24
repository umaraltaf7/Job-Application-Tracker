import { searchMuseJobs } from "./the-muse";
import { normalizeMuseJob } from "./normalize-muse";
import { Job } from "./types";
import { getRelatedSearchTerms } from "./related-search";

import {
  filterJobs,
  sortByNewest,
} from "./filter-jobs";

export interface JobSearchOptions {
  keyword?: string;
  location?: string;
  postedWithinDays?: number;
  includeRemote?: boolean;
  page?: number;
}

export interface JobSearchResult {
  jobs: Job[];
  hasMore: boolean;
  page: number;
}

const MIN_RELEVANCE_SCORE = 20;

function calculateRelevance(
  job: Job,
  keyword: string
): number {
  const search = keyword.toLowerCase().trim();

  const title = job.title.toLowerCase();
  const company = job.company.toLowerCase();

  const categories = job.categories
    .join(" ")
    .toLowerCase();

  const levels = job.levels
    .join(" ")
    .toLowerCase();

  const description =
    (job.description ?? "").toLowerCase();

  let score = 0;

  if (title === search) {
    score += 100;
  }

  if (title.includes(search)) {
    score += 50;
  }

  const words = search
    .split(/\s+/)
    .filter(Boolean);

  for (const word of words) {
    if (word.length < 2) continue;

    if (title.includes(word)) {
      score += 20;
    }

    if (categories.includes(word)) {
      score += 5;
    }

    if (description.includes(word)) {
      score += 3;
    }

    if (company.includes(word)) {
      score += 2;
    }

    if (levels.includes(word)) {
      score += 2;
    }
  }

  return score;
}

function removeDuplicateJobs(
  jobs: Job[]
): Job[] {
  const seen = new Set<string>();

  return jobs.filter((job) => {
    const key = `${job.source}:${job.sourceId}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);

    return true;
  });
}

export async function searchJobs(
  options: JobSearchOptions = {}
): Promise<JobSearchResult> {
  const {
    keyword = "Software Engineer",
    location = "Pakistan",
    postedWithinDays,
    includeRemote = true,
    page = 0,
  } = options;

  try {
    console.log(
      "\n========== JOB SEARCH =========="
    );

    console.log("Keyword:", keyword);
    console.log("Location:", location);
    console.log(
      "Posted within:",
      postedWithinDays ?? "Any time"
    );
    console.log(
      "Include remote:",
      includeRemote
    );
    console.log("Page:", page);

    const categories =
      getRelatedSearchTerms(keyword);

    console.log(
      "Categories:",
      categories
    );

    const museResponse =
      await searchMuseJobs(
        keyword,
        location,
        categories,
        {
          startPage: page,
          maxPages: 1,
        }
      );

    const museJobs: Job[] =
      museResponse.results.map(
        normalizeMuseJob
      );

    console.log(
      "Raw jobs:",
      museJobs.length
    );

    const uniqueJobs =
      removeDuplicateJobs(museJobs);

    console.log(
      "Unique jobs:",
      uniqueJobs.length
    );

    const filteredJobs =
      filterJobs(uniqueJobs, {
        location,
        postedWithinDays,
        includeRemote,
      });

    console.log(
      "After filters:",
      filteredJobs.length
    );

    const scoredJobs =
      filteredJobs.map((job) => ({
        job,
        score: calculateRelevance(
          job,
          keyword
        ),
      }));

    console.log(
      "Relevance scores (top 5):",
      scoredJobs
        .slice(0, 5)
        .map(
          (s) =>
            `${s.job.title}: ${s.score}`
        )
    );

    const relevantJobs =
      scoredJobs
        .filter(
          (item) =>
            item.score >=
            MIN_RELEVANCE_SCORE
        )
        .sort(
          (a, b) =>
            b.score - a.score
        )
        .map(
          (item) => item.job
        );

    console.log(
      "After relevance filter:",
      relevantJobs.length
    );

    const finalJobs =
      sortByNewest(relevantJobs);

    console.log(
      "Final jobs:",
      finalJobs.length
    );

    console.log(
      "Has more:",
      museResponse.hasMore
    );

    console.log(
      "========== END SEARCH ==========\n"
    );

    return {
      jobs: finalJobs,
      hasMore: museResponse.hasMore,
      page,
    };
  } catch (error) {
    console.error(
      "Job search failed:",
      error
    );

    throw error;
  }
}