
import { Job } from "./types";

export interface JobFilterOptions {
  keyword?: string;
  location?: string;

  /*
   * How old a job can be.
   *
   * Examples:
   * 1  = last 24 hours
   * 3  = last 3 days
   * 7  = last week
   * 30 = last month
   *
   * undefined = don't filter by age
   */
  postedWithinDays?: number;

  /*
   * If true, remote jobs are allowed even when
   * the requested location doesn't explicitly
   * appear in the job location.
   */
  includeRemote?: boolean;
}

/**
 * Normalize text so comparisons are easier.
 */
function normalizeText(
  value: string
): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

/**
 * Determine whether a job is remote.
 */
function isRemoteJob(
  job: Job
): boolean {
  const location =
    normalizeText(job.location);

  return (
    location.includes("remote") ||
    location.includes("work from home") ||
    location.includes("flexible")
  );
}
/**
 * Check whether a job matches the requested location.
 *
 * Example:
 *
 * location = Pakistan
 *
 * Matches:
 * - Pakistan
 * - Islamabad, Pakistan
 * - Lahore, Pakistan
 * - Remote
 *
 * if includeRemote = true.
 */
export function matchesLocation(
  job: Job,
  requestedLocation: string,
  includeRemote = true
): boolean {
  if (!requestedLocation) {
    return true;
  }

  const requested =
    normalizeText(
      requestedLocation
    );

  const jobLocation =
    normalizeText(
      job.location
    );

  /*
   * Exact location match.
   */
  if (
    jobLocation.includes(requested)
  ) {
    return true;
  }

  /*
   * Remote jobs can be shown to the user
   * if remote jobs are enabled.
   */
  if (
    includeRemote &&
    isRemoteJob(job)
  ) {
    return true;
  }

  return false;
}

/**
 * Check whether a job was posted within
 * the requested number of days.
 */
export function isFreshJob(
  job: Job,
  postedWithinDays?: number
): boolean {
  /*
   * No freshness filter.
   */
  if (
    postedWithinDays === undefined
  ) {
    return true;
  }

  /*
   * If the API doesn't provide a date,
   * don't remove the job.
   */
  if (!job.postedAt) {
    return true;
  }

  const postedAt =
    new Date(job.postedAt);

  /*
   * Invalid date.
   */
  if (
    Number.isNaN(
      postedAt.getTime()
    )
  ) {
    return true;
  }

  const now =
    Date.now();

  const age =
    now -
    postedAt.getTime();

  const maxAge =
    postedWithinDays *
    24 *
    60 *
    60 *
    1000;

  return age <= maxAge;
}

/**
 * Remove jobs that are too old or don't
 * match the requested location.
 */
export function filterJobs(
  jobs: Job[],
  options: JobFilterOptions = {}
): Job[] {
  const {
    location,
    postedWithinDays,
    includeRemote = true,
  } = options;

  return jobs.filter(
    (job) => {
      /*
       * Location filter.
       */
      if (
        location &&
        !matchesLocation(
          job,
          location,
          includeRemote
        )
      ) {
        return false;
      }

      /*
       * Freshness filter.
       */
      if (
        !isFreshJob(
          job,
          postedWithinDays
        )
      ) {
        return false;
      }

      return true;
    }
  );
}

/**
 * Sort jobs from newest → oldest.
 *
 * Jobs without a publication date
 * are placed at the bottom.
 */
export function sortByNewest(
  jobs: Job[]
): Job[] {
  return [...jobs].sort(
    (a, b) => {
      if (
        !a.postedAt &&
        !b.postedAt
      ) {
        return 0;
      }

      if (!a.postedAt) {
        return 1;
      }

      if (!b.postedAt) {
        return -1;
      }

      return (
        new Date(
          b.postedAt
        ).getTime() -
        new Date(
          a.postedAt
        ).getTime()
      );
    }
  );
}
