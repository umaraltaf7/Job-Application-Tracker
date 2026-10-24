"use client";

import { useEffect, useState } from "react";
import JobCard from "@/components/job-card";
import { searchJobsAction } from "@/lib/actions/job-search";
import type { Job } from "@/lib/jobs/types";

interface JobDiscoveryProps {
  keyword: string;
  location: string;
  includeRemote: boolean;
  postedWithinDays?: number;
}

interface JobCache {
  jobs: Job[];
  nextPage: number;
  hasMore: boolean;
}

const CACHE_PREFIX =
  "job-tracker-jobs:";

function buildCacheKey(
  keyword: string,
  location: string,
  includeRemote: boolean,
  postedWithinDays?: number
) {
  return `${CACHE_PREFIX}${JSON.stringify({
    keyword: keyword.trim().toLowerCase(),
    location: location.trim().toLowerCase(),
    includeRemote,
    postedWithinDays:
      postedWithinDays ?? null,
  })}`;
}

function readCache(
  key: string
): JobCache | null {
  try {
    const raw =
      sessionStorage.getItem(key);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);

    if (
      !parsed ||
      !Array.isArray(parsed.jobs)
    ) {
      return null;
    }

    return {
      jobs: parsed.jobs,
      nextPage:
        typeof parsed.nextPage ===
        "number"
          ? parsed.nextPage
          : 1,
      hasMore:
        typeof parsed.hasMore ===
        "boolean"
          ? parsed.hasMore
          : true,
    };
  } catch (error) {
    console.error(
      "Failed to read job cache:",
      error
    );

    return null;
  }
}

function writeCache(
  key: string,
  cache: JobCache
) {
  try {
    sessionStorage.setItem(
      key,
      JSON.stringify(cache)
    );
  } catch (error) {
    console.error(
      "Failed to write job cache:",
      error
    );
  }
}

function mergeJobs(
  existingJobs: Job[],
  newJobs: Job[]
): Job[] {
  const seen = new Set<string>();

  const merged: Job[] = [];

  for (const job of [
    ...existingJobs,
    ...newJobs,
  ]) {
    const key = `${job.source}:${job.sourceId}`;

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    merged.push(job);
  }

  return merged;
}

export default function JobDiscovery({
  keyword,
  location,
  includeRemote,
  postedWithinDays,
}: JobDiscoveryProps) {
  const [jobs, setJobs] =
    useState<Job[]>([]);

  const [hasMore, setHasMore] =
    useState(true);

  const [loading, setLoading] =
    useState(true);

  const [loadingMore, setLoadingMore] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [fromCache, setFromCache] =
    useState(false);

  const cacheKey = buildCacheKey(
    keyword,
    location,
    includeRemote,
    postedWithinDays
  );

  useEffect(() => {
    let cancelled = false;

    async function loadInitialJobs() {
      setLoading(true);
      setError(null);
      setFromCache(false);

      const cached =
        readCache(cacheKey);

      if (cached) {
        if (!cancelled) {
          setJobs(cached.jobs);
          setHasMore(cached.hasMore);
          setFromCache(true);
          setLoading(false);
        }

        return;
      }

      const result =
        await searchJobsAction({
          keyword,
          location,
          includeRemote,
          postedWithinDays,
          page: 0,
        });

      if (cancelled) {
        return;
      }

      if (!result.success) {
        setError(result.error);
        setLoading(false);
        return;
      }

      const initialCache: JobCache = {
        jobs: result.data.jobs,
        nextPage: 1,
        hasMore: result.data.hasMore,
      };

      writeCache(
        cacheKey,
        initialCache
      );

      setJobs(result.data.jobs);
      setHasMore(result.data.hasMore);
      setLoading(false);
    }

    loadInitialJobs();

    return () => {
      cancelled = true;
    };
  }, [
    cacheKey,
    keyword,
    location,
    includeRemote,
    postedWithinDays,
  ]);

  async function handleLoadMore() {
    if (
      loadingMore ||
      !hasMore
    ) {
      return;
    }

    setLoadingMore(true);
    setError(null);

    try {
      const cached =
        readCache(cacheKey);

      const nextPage =
        cached?.nextPage ?? 1;

      const result =
        await searchJobsAction({
          keyword,
          location,
          includeRemote,
          postedWithinDays,
          page: nextPage,
        });

      if (!result.success) {
        setError(result.error);
        return;
      }

      const existingJobs =
        cached?.jobs ?? jobs;

      const mergedJobs =
        mergeJobs(
          existingJobs,
          result.data.jobs
        );

      const newCache: JobCache = {
        jobs: mergedJobs,
        nextPage: nextPage + 1,
        hasMore: result.data.hasMore,
      };

      writeCache(
        cacheKey,
        newCache
      );

      setJobs(mergedJobs);
      setHasMore(result.data.hasMore);
      setFromCache(false);
    } catch (error) {
      console.error(
        "Load more jobs failed:",
        error
      );

      setError(
        "Failed to load more jobs."
      );
    } finally {
      setLoadingMore(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-5 w-40 rounded bg-slate-200" />
          <div className="h-24 rounded-xl bg-slate-100" />
          <div className="h-24 rounded-xl bg-slate-100" />
          <div className="h-24 rounded-xl bg-slate-100" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {fromCache && jobs.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Jobs restored from this session
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
          {error}
        </div>
      )}

      {!error && jobs.length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-slate-500">
            No jobs found. Try changing
            your keyword, location, or
            filters.
          </p>
        </div>
      )}

      {jobs.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              {jobs.length} job
              {jobs.length === 1
                ? ""
                : "s"} found
            </p>
          </div>

          <div className="space-y-4">
            {jobs.map((job) => (
              <JobCard
                key={`${job.source}-${job.sourceId}`}
                job={job}
              />
            ))}
          </div>

          <div className="flex justify-center pt-4">
            {hasMore ? (
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="rounded-lg bg-cyan-700 px-6 py-3 text-sm font-medium text-white transition hover:bg-cyan-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loadingMore
                  ? "Loading more jobs..."
                  : "Load More Jobs"}
              </button>
            ) : (
              <p className="text-sm text-slate-500">
                No more jobs available.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}