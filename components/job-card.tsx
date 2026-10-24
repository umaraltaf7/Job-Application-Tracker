
"use client";

import { useState } from "react";

import { Job } from "@/lib/jobs/types";

import JobMatchButton from "./job-match-button";
import AddToBoardButton from "./add-to-board-button";

import type { JobMatchResult } from "@/lib/jobs/match-job";


interface JobCardProps {
  job: Job;
}


export default function JobCard({
  job,
}: JobCardProps) {

  /*
   * Stores the AI match result for this job.
   *
   * JobMatchButton updates this value after
   * successfully analyzing the job.
   *
   * AddToBoardButton receives the same result
   * so it can be saved to MongoDB.
   */

  const [matchResult, setMatchResult] =
    useState<JobMatchResult | null>(null);


  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md sm:p-6">

      {/* ====================================================== */}
      {/* JOB HEADER */}
      {/* ====================================================== */}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">

        <div className="flex min-w-0 items-start gap-4">

          {/* Company Logo */}

          {job.logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={job.logoUrl}
              alt={job.company}
              className="h-12 w-12 shrink-0 rounded-lg object-contain"
            />
          )}


          <div className="min-w-0">

            {/* Job Title */}

            <h3 className="line-clamp-2 break-words text-lg font-semibold text-slate-900">
              {job.title}
            </h3>


            {/* Company + Location */}

            <p className="mt-1 break-words text-sm text-slate-600">

              {job.company}

              {job.location
                ? ` — ${job.location}`
                : ""}

            </p>


            {/* ================================================= */}
            {/* CATEGORIES + LEVELS */}
            {/* ================================================= */}

            <div className="mt-2 flex flex-wrap gap-2">

              {job.categories
                ?.slice(0, 3)
                .map((category) => (

                  <span
                    key={category}
                    className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600"
                  >
                    {category}
                  </span>

                ))}


              {job.levels
                ?.slice(0, 2)
                .map((level) => (

                  <span
                    key={level}
                    className="rounded-full bg-cyan-50 px-2 py-1 text-xs text-cyan-700"
                  >
                    {level}
                  </span>

                ))}

            </div>

          </div>

        </div>


        {/* ================================================= */}
        {/* POSTED DATE + SOURCE */}
        {/* ================================================= */}

        <div className="flex w-full items-center justify-between gap-3 text-left text-xs text-slate-400 sm:w-auto sm:shrink-0 sm:flex-col sm:items-end sm:text-right">

          {job.postedAt && (
            <p>
              {new Date(
                job.postedAt
              ).toLocaleDateString()}
            </p>
          )}

          <p className="mt-1">
            {job.source}
          </p>

        </div>

      </div>


      {/* ====================================================== */}
      {/* JOB DESCRIPTION */}
      {/* ====================================================== */}

      {job.description && (

        <div className="mt-4">

          <p className="line-clamp-3 text-sm leading-6 text-slate-600">
            {job.description}
          </p>

        </div>

      )}


      {/* ====================================================== */}
      {/* AI MATCH */}
      {/* ====================================================== */}

      <div className="mt-5">

        <JobMatchButton
          job={job}
          onMatchResult={
            setMatchResult
          }
        />

      </div>


      {/* ====================================================== */}
      {/* JOB ACTIONS */}
      {/* ====================================================== */}

      <div className="mt-5 flex flex-wrap items-center gap-3">

        {/* View Original Job */}

        <a
          href={job.jobUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          View Job
        </a>


        {/* ================================================= */}
        {/* ADD TO BOARD */}
        {/* ================================================= */}

        <AddToBoardButton
          job={job}
          matchResult={
            matchResult
          }
        />

      </div>

    </div>
  );
}
