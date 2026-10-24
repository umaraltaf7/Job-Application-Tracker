
"use client";

import { useState } from "react";

import { generateResumePDF } from "@/lib/pdf/generate-resume-pdf";

import {
    addJobToBoard,
    prepareApplicationAction,
    generateTailoredResumeAction,
} from "@/lib/actions/job-applications";

import { Job } from "@/lib/jobs/types";

import type {
    JobMatchResult,
} from "@/lib/jobs/match-job";

import type {
    TailoredResume,
} from "@/lib/ai/tailored-resume";


interface AddToBoardButtonProps {
    job: Job;

    matchResult?: JobMatchResult | null;
}


interface AddJobResultData {
    _id?: string;
}


interface PrepareApplicationResult {
    success?: boolean;
    error?: string;

    data?: {
        whyYouMatch: string;
        skillsToHighlight: string[];
        missingSkills: string[];
        coverLetter: string;
        recruiterMessage: string;
        resumeSuggestions: string[];
    };
}


export default function AddToBoardButton({
    job,
    matchResult,
}: AddToBoardButtonProps) {

    const [loading, setLoading] =
        useState(false);

    const [added, setAdded] =
        useState(false);

    const [error, setError] =
        useState<string | null>(null);

    const [jobApplicationId, setJobApplicationId] =
        useState<string | null>(null);

    const [preparing, setPreparing] =
        useState(false);

    const [preparation, setPreparation] =
        useState<
            PrepareApplicationResult["data"] | null
        >(null);

    const [tailoredResume, setTailoredResume] =
        useState<TailoredResume | null>(null);

    const [generatingResume, setGeneratingResume] =
        useState(false);


    async function handleAddToBoard() {

        if (loading || added) {
            return;
        }

        setLoading(true);

        setError(null);

        try {

            const result =
                await addJobToBoard({

                    title: job.title,

                    company: job.company,

                    location:
                        job.location,

                    jobUrl:
                        job.jobUrl,

                    description:
                        job.description,

                    categories:
                        job.categories,

                    /*
                     * If the user analyzed the job,
                     * preserve the AI match result.
                     */

                    matchResult:
                        matchResult ??
                        undefined,
                });


            if (result.error) {

                setError(
                    result.error
                );

                return;
            }


            /*
             * The server action returns either:
             *
             * 1. The newly-created JobApplication
             *
             * OR
             *
             * 2. The existing JobApplication
             *    when the job was already added.
             *
             * We need its MongoDB ID for
             * application preparation.
             */

            const data =
                result.data as
                    | AddJobResultData
                    | undefined;


            if (data?._id) {

                setJobApplicationId(
                    data._id
                );

            }


            /*
             * Job already existed.
             */

            if (
                result.alreadyExists
            ) {

                setAdded(true);

                return;
            }


            /*
             * New job successfully added.
             */

            if (result.success) {

                setAdded(true);
            }

        } catch (error) {

            console.error(
                "Failed to add job to board:",
                error
            );

            setError(
                "Failed to add job to board"
            );

        } finally {

            setLoading(false);
        }
    }

    async function handlePrepareApplication() {

        if (
            !jobApplicationId ||
            preparing
        ) {
            return;
        }

        setPreparing(true);

        setError(null);

        try {

            const result =
                await prepareApplicationAction(
                    jobApplicationId
                ) as PrepareApplicationResult;


            if (result.error) {

                setError(
                    result.error
                );

                return;
            }


            if (
                result.success &&
                result.data
            ) {

                setPreparation(
                    result.data
                );

            }

        } catch (error) {

            console.error(
                "Failed to prepare application:",
                error
            );

            setError(
                "Failed to prepare application"
            );

        } finally {

            setPreparing(false);
        }
    }



    async function handleGenerateTailoredResume() {
        if (
            !jobApplicationId ||
            generatingResume
        ) {
            return;
        }

        setGeneratingResume(true);
        setError(null);

        try {
            const result =
                await generateTailoredResumeAction(
                    jobApplicationId
                );

            if (result.error) {
                setError(result.error);
                return;
            }

            if (
                result.success &&
                result.data
            ) {
                setTailoredResume(
                    result.data as TailoredResume
                );
            }
        } catch (error) {
            console.error(
                "Failed to generate tailored resume:",
                error
            );

            setError(
                "Failed to generate tailored resume"
            );
        } finally {
            setGeneratingResume(false);
        }
    }

    return (
        <div className="flex flex-col gap-3">

            {/* ================================================= */}
            {/* ADD TO BOARD */}
            {/* ================================================= */}

            <button
                type="button"
                onClick={
                    handleAddToBoard
                }
                disabled={
                    loading ||
                    added
                }
                className="rounded-md border px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60"
            >

                {loading
                    ? "Adding..."
                    : added
                    ? "Added to Board"
                    : "Add to Board"}

            </button>


            {/* ================================================= */}
            {/* PREPARE APPLICATION */}
            {/* ================================================= */}

            {added &&
                jobApplicationId && (
                    <button
                        type="button"
                        onClick={
                            handlePrepareApplication
                        }
                        disabled={
                            preparing
                        }
                        className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >

                        {preparing
                            ? "Preparing..."
                            : preparation
                            ? "Application Prepared"
                            : "Prepare Application"}

                    </button>
                )}


            {/* ================================================= */}
            {/* ERROR */}
            {/* ================================================= */}

            {error && (
                <p className="text-xs text-red-500">
                    {error}
                </p>
            )}


            {/* ================================================= */}
            {/* APPLICATION PREPARATION RESULTS */}
            {/* ================================================= */}

            {preparation && (

                <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-4">

                    {/* ========================================= */}
                    {/* WHY YOU MATCH */}
                    {/* ========================================= */}

                    <div>

                        <h4 className="text-sm font-semibold text-slate-900">
                            Why You Match
                        </h4>

                        <p className="mt-1 text-sm leading-6 text-slate-600">
                            {preparation.whyYouMatch}
                        </p>

                    </div>


                    {/* ========================================= */}
                    {/* SKILLS TO HIGHLIGHT */}
                    {/* ========================================= */}

                    {preparation.skillsToHighlight.length >
                        0 && (

                        <div className="mt-4">

                            <h4 className="text-sm font-semibold text-slate-900">
                                Skills to Highlight
                            </h4>

                            <div className="mt-2 flex flex-wrap gap-2">

                                {preparation.skillsToHighlight.map(
                                    (skill) => (

                                        <span
                                            key={skill}
                                            className="rounded-full bg-emerald-100 px-2 py-1 text-xs text-emerald-700"
                                        >
                                            {skill}
                                        </span>

                                    )
                                )}

                            </div>

                        </div>

                    )}


                    {/* ========================================= */}
                    {/* MISSING SKILLS */}
                    {/* ========================================= */}

                    {preparation.missingSkills.length >
                        0 && (

                        <div className="mt-4">

                            <h4 className="text-sm font-semibold text-slate-900">
                                Missing Skills
                            </h4>

                            <div className="mt-2 flex flex-wrap gap-2">

                                {preparation.missingSkills.map(
                                    (skill) => (

                                        <span
                                            key={skill}
                                            className="rounded-full bg-red-100 px-2 py-1 text-xs text-red-700"
                                        >
                                            {skill}
                                        </span>

                                    )
                                )}

                            </div>

                        </div>

                    )}


                    {/* ========================================= */}
                    {/* COVER LETTER */}
                    {/* ========================================= */}

                    <div className="mt-4">

                        <div className="flex items-center justify-between gap-3">
                            <h4 className="text-sm font-semibold text-slate-900">
                                Cover Letter
                            </h4>

                            <button
                                type="button"
                                onClick={() => {
                                    navigator.clipboard.writeText(
                                        preparation.coverLetter
                                    );
                                }}
                                className="rounded-md border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                            >
                                Copy
                            </button>
                        </div>

                        <div className="mt-2 rounded-lg border border-slate-200 bg-white p-3">

                            <p className="whitespace-pre-line text-sm leading-6 text-slate-700">
                                {preparation.coverLetter}
                            </p>

                        </div>

                    </div>


                    {/* ========================================= */}
                    {/* RECRUITER MESSAGE */}
                    {/* ========================================= */}

                    <div className="mt-4">

                        <div className="flex items-center justify-between gap-3">
                            <h4 className="text-sm font-semibold text-slate-900">
                                Recruiter Message
                            </h4>

                            <button
                                type="button"
                                onClick={() => {
                                    navigator.clipboard.writeText(
                                        preparation.recruiterMessage
                                    );
                                }}
                                className="rounded-md border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                            >
                                Copy
                            </button>
                        </div>

                        <div className="mt-2 rounded-lg border border-slate-200 bg-white p-3">

                            <p className="whitespace-pre-line text-sm leading-6 text-slate-700">
                                {preparation.recruiterMessage}
                            </p>

                        </div>

                    </div>


                    {/* ========================================= */}
                    {/* RESUME SUGGESTIONS */}
                    {/* ========================================= */}

                    {preparation.resumeSuggestions.length >
                        0 && (

                        <div className="mt-4">

                            <h4 className="text-sm font-semibold text-slate-900">
                                Resume Suggestions
                            </h4>

                            <ul className="mt-2 space-y-2">

                                {preparation.resumeSuggestions.map(
                                    (
                                        suggestion,
                                        index
                                    ) => (

                                        <li
                                            key={`${suggestion}-${index}`}
                                            className="text-sm leading-6 text-slate-600"
                                        >
                                            • {suggestion}
                                        </li>

                                    )
                                )}

                            </ul>

                        </div>

                    )}

                    {/* ========================================= */}
                    {/* TAILORED RESUME */}
                    {/* ========================================= */}

                    <div className="mt-6 border-t border-slate-200 pt-5">

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                            <div>
                                <h4 className="text-sm font-semibold text-slate-900">
                                    Tailored Resume
                                </h4>

                                <p className="mt-1 text-xs leading-5 text-slate-500">
                                    Generate a job-specific version of your resume using
                                    your existing experience, skills, education, and projects.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={
                                    handleGenerateTailoredResume
                                }
                                disabled={
                                    generatingResume
                                }
                                className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {generatingResume
                                    ? "Generating..."
                                    : tailoredResume
                                    ? "Regenerate Resume"
                                    : "Generate Tailored Resume"}
                            </button>

                        </div>

                        {tailoredResume && (
                            <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">

                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                                    <div>
                                        <p className="font-semibold text-slate-900">
                                            {tailoredResume.personalInfo.name ||
                                                "Tailored Resume"}
                                        </p>

                                        <p className="text-xs text-slate-500">
                                            Ready to preview or download as PDF.
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            generateResumePDF(
                                                tailoredResume
                                            )
                                        }
                                        className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-100"
                                    >
                                        Download PDF
                                    </button>

                                </div>

                                {tailoredResume.summary && (
                                    <div className="mt-4">
                                        <h5 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Professional Summary
                                        </h5>

                                        <p className="mt-1 text-sm leading-6 text-slate-700">
                                            {tailoredResume.summary}
                                        </p>
                                    </div>
                                )}

                                {tailoredResume.skills.length > 0 && (
                                    <div className="mt-4">
                                        <h5 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Skills
                                        </h5>

                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {tailoredResume.skills.map(
                                                (skill) => (
                                                    <span
                                                        key={skill}
                                                        className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700"
                                                    >
                                                        {skill}
                                                    </span>
                                                )
                                            )}
                                        </div>
                                    </div>
                                )}

                                {tailoredResume.experience.length > 0 && (
                                    <div className="mt-4">
                                        <h5 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Experience
                                        </h5>

                                        <div className="mt-2 space-y-3">
                                            {tailoredResume.experience.map(
                                                (experience, index) => (
                                                    <div
                                                        key={`${experience.company}-${experience.role}-${index}`}
                                                    >
                                                        <p className="text-sm font-medium text-slate-900">
                                                            {experience.role} —{" "}
                                                            {experience.company}
                                                        </p>

                                                        {experience.description.length >
                                                            0 && (
                                                            <ul className="mt-1 space-y-1">
                                                                {experience.description.map(
                                                                    (
                                                                        bullet,
                                                                        bulletIndex
                                                                    ) => (
                                                                        <li
                                                                            key={
                                                                                bulletIndex
                                                                            }
                                                                            className="text-sm leading-5 text-slate-600"
                                                                        >
                                                                            • {bullet}
                                                                        </li>
                                                                    )
                                                                )}
                                                            </ul>
                                                        )}
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </div>
                                )}

                                {tailoredResume.projects.length > 0 && (
                                    <div className="mt-4">
                                        <h5 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Projects
                                        </h5>

                                        <div className="mt-2 space-y-3">
                                            {tailoredResume.projects.map(
                                                (project, index) => (
                                                    <div
                                                        key={`${project.name}-${index}`}
                                                    >
                                                        <p className="text-sm font-medium text-slate-900">
                                                            {project.name}
                                                        </p>

                                                        {project.technologies.length >
                                                            0 && (
                                                            <p className="mt-1 text-xs text-slate-500">
                                                                {project.technologies.join(
                                                                    ", "
                                                                )}
                                                            </p>
                                                        )}

                                                        {project.description.length >
                                                            0 && (
                                                            <ul className="mt-1 space-y-1">
                                                                {project.description.map(
                                                                    (
                                                                        description,
                                                                        descriptionIndex
                                                                    ) => (
                                                                        <li
                                                                            key={
                                                                                descriptionIndex
                                                                            }
                                                                            className="text-sm leading-5 text-slate-600"
                                                                        >
                                                                            •{" "}
                                                                            {
                                                                                description
                                                                            }
                                                                        </li>
                                                                    )
                                                                )}
                                                            </ul>
                                                        )}
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </div>
                                )}

                            </div>
                        )}

                    </div>

                </div>

            )}

        </div>
    );
}
