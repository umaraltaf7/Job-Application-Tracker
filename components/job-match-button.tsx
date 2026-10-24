"use client";

import { useState } from "react";

import { Job } from "@/lib/jobs/types";

import { matchJobAction } from "@/lib/jobs/match-job-action";

import type { JobMatchResult } from "@/lib/jobs/match-job";

interface JobMatchButtonProps {
  job: Job;

  onMatchResult?: (
    result: JobMatchResult
  ) => void;
}

function getScoreLabel(score: number) {
  if (score >= 80) {
    return {
      label: "Strong Match",
      className:
        "bg-emerald-100 text-emerald-700",
    };
  }

  if (score >= 60) {
    return {
      label: "Good Match",
      className:
        "bg-amber-100 text-amber-700",
    };
  }

  return {
    label: "Low Match",
    className:
      "bg-red-100 text-red-700",
  };
}

function getRecommendationStyle(
  recommendation: JobMatchResult["recommendation"]
) {
  switch (recommendation) {
    case "APPLY":
      return "bg-emerald-100 text-emerald-700";

    case "MAYBE":
      return "bg-amber-100 text-amber-700";

    case "SKIP":
      return "bg-red-100 text-red-700";
  }
}

function getMatchLevelStyle(
  level: JobMatchResult["experienceMatch"]
) {
  switch (level) {
    case "Strong":
      return "text-emerald-700";

    case "Good":
      return "text-amber-700";

    case "Weak":
      return "text-red-700";
  }
}

export default function JobMatchButton({
  job,
  onMatchResult,
}: JobMatchButtonProps) {
  const [loading, setLoading] =
    useState(false);

  const [result, setResult] =
    useState<JobMatchResult | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  async function handleMatch() {
    if (loading) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response =
        await matchJobAction(job);

      if (response.error) {
        setError(response.error);
        return;
      }

      if (response.data) {
        setResult(response.data);

        /*
         * Send the same result to JobCard.
         *
         * JobCard passes this result to
         * AddToBoardButton so it can be
         * saved together with the application.
         */
        onMatchResult?.(response.data);
      }
    } catch (error) {
      console.error(
        "Match request failed:",
        error
      );

      setError(
        "Failed to analyze this job."
      );
    } finally {
      setLoading(false);
    }
  }

  const scoreInfo = result
    ? getScoreLabel(result.matchScore)
    : null;

  return (
    <div className="space-y-3">
      {!result && (
        <div>
          <button
            type="button"
            onClick={handleMatch}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Analyzing...
              </>
            ) : (
              <>
                <span>✦</span>
                Analyze Match
              </>
            )}
          </button>

          <p className="mt-2 text-xs text-slate-500">
            Compare this job with your uploaded resume.
          </p>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm font-medium text-red-700">
            {error}
          </p>

          <button
            type="button"
            onClick={handleMatch}
            disabled={loading}
            className="mt-2 text-xs font-medium text-red-700 underline hover:no-underline"
          >
            Try again
          </button>
        </div>
      )}

      {result && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
          {/* Match Header */}

          <div className="border-b border-slate-200 bg-white px-5 py-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-cyan-700">
                  AI Resume Match
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Analysis for {job.title}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {scoreInfo && (
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${scoreInfo.className}`}
                  >
                    {scoreInfo.label}
                  </span>
                )}

                <div className="text-right">
                  <p className="text-2xl font-bold text-slate-900">
                    {result.matchScore}%
                  </p>

                  <p className="text-xs text-slate-500">
                    match score
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendation */}

          <div className="px-5 pt-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Recommendation
                </p>

                <p className="mt-1 text-sm text-slate-600">
                  Based on your resume and this job posting.
                </p>
              </div>

              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${getRecommendationStyle(
                  result.recommendation
                )}`}
              >
                {result.recommendation}
              </span>
            </div>
          </div>

          {/* Experience + Education */}

          <div className="grid grid-cols-1 gap-3 px-5 pt-4 sm:grid-cols-2">
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Experience
              </p>

              <p
                className={`mt-1 text-sm font-semibold ${getMatchLevelStyle(
                  result.experienceMatch
                )}`}
              >
                {result.experienceMatch}
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Education
              </p>

              <p
                className={`mt-1 text-sm font-semibold ${getMatchLevelStyle(
                  result.educationMatch
                )}`}
              >
                {result.educationMatch}
              </p>
            </div>
          </div>

          {/* Matched Skills */}

          {result.matchedSkills.length > 0 && (
            <div className="px-5 pt-4">
              <p className="text-sm font-semibold text-slate-900">
                Matched Skills
              </p>

              <div className="mt-2 flex flex-wrap gap-2">
                {result.matchedSkills.map(
                  (skill, index) => (
                    <span
                      key={`${skill}-${index}`}
                      className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700"
                    >
                      ✓ {skill}
                    </span>
                  )
                )}
              </div>
            </div>
          )}

          {/* Missing Skills */}

          {result.missingSkills.length > 0 && (
            <div className="px-5 pt-4">
              <p className="text-sm font-semibold text-slate-900">
                Missing Skills
              </p>

              <div className="mt-2 flex flex-wrap gap-2">
                {result.missingSkills.map(
                  (skill, index) => (
                    <span
                      key={`${skill}-${index}`}
                      className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700"
                    >
                      {skill}
                    </span>
                  )
                )}
              </div>
            </div>
          )}

          {/* Reason */}

          <div className="px-5 py-4">
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Why this score?
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                {result.reason}
              </p>
            </div>
          </div>

          {/* Re-analyze */}

          <div className="border-t border-slate-200 bg-white px-5 py-3">
            <button
              type="button"
              onClick={() => {
                setResult(null);
                setError(null);
              }}
              className="text-xs font-medium text-slate-500 transition hover:text-slate-900"
            >
              Analyze again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}