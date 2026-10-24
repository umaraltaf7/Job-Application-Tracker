"use server";

import {
  searchJobs,
  JobSearchOptions,
  JobSearchResult,
} from "@/lib/jobs/search";

type SearchJobsSuccess = {
  success: true;
  data: JobSearchResult;
};

type SearchJobsFailure = {
  success: false;
  error: string;
};

export type SearchJobsActionResult =
  | SearchJobsSuccess
  | SearchJobsFailure;

export async function searchJobsAction(
  options: JobSearchOptions
): Promise<SearchJobsActionResult> {
  try {
    const result =
      await searchJobs(options);

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error(
      "Job search action failed:",
      error
    );

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to search jobs.",
    };
  }
}