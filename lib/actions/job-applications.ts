"use server";

import { revalidatePath } from "next/cache";

import { getSession } from "../auth/auth";
import connectDB from "../db";

import { prepareApplication } from "../ai/application-prep";
import { generateTailoredResume } from "../ai/tailored-resume";

import {
    Board,
    Column,
    JobApplication,
} from "../models";

import { summarizeJobDescription } from "../jobs/summarize-job";

import type {
    JobMatchResult,
} from "../jobs/match-job";


interface JobApplicationData {
    company: string;

    position: string;

    location?: string;

    notes?: string;

    salary?: string;

    jobUrl?: string;

    columnId: string;

    boardId: string;

    tags?: string[];

    description?: string;

    /*
     * Optional AI match result.
     *
     * This allows manually creating a job application
     * while also preserving an AI match result if one
     * exists.
     */
    matchResult?: JobMatchResult;
}


/*
|--------------------------------------------------------------------------
| CREATE JOB APPLICATION
|--------------------------------------------------------------------------
*/

export async function createJobApplication(
    data: JobApplicationData
) {
    const session = await getSession();

    if (!session?.user) {
        return {
            error: "Unauthorized",
        };
    }

    await connectDB();

    const {
        company,
        position,
        location,
        notes,
        salary,
        jobUrl,
        columnId,
        boardId,
        tags,
        description,
        matchResult,
    } = data;

    if (
        !company ||
        !position ||
        !columnId ||
        !boardId
    ) {
        return {
            error: "Missing required fields",
        };
    }

    /*
     * Verify board ownership.
     */

    const board = await Board.findOne({
        _id: boardId,
        userId: session.user.id,
    });

    if (!board) {
        return {
            error: "Board not found",
        };
    }

    /*
     * Verify column belongs to board.
     */

    const column = await Column.findOne({
        _id: columnId,
        boardId: boardId,
    });

    if (!column) {
        return {
            error: "Column not found",
        };
    }

    /*
     * Find last job order.
     */

    const maxOrder =
        (await JobApplication.findOne({
            columnId,
        })
            .sort({ order: -1 })
            .select("order")
            .lean()) as {
                order: number;
            } | null;

    /*
     * Create JobApplication.
     */

    const jobApplication =
        await JobApplication.create({
            company,

            position,

            location,

            notes,

            salary,

            jobUrl,

            columnId,

            boardId,

            userId: session.user.id,

            tags: tags || [],

            description,

            /*
             * Preserve AI match result if supplied.
             */

            matchResult:
                matchResult ?? undefined,

            status: "applied",

            order:
                maxOrder &&
                maxOrder.order !== undefined
                    ? maxOrder.order + 1
                    : 0,
        });

    /*
     * Add application to column.
     */

    await Column.findByIdAndUpdate(
        columnId,
        {
            $push: {
                jobapplications:
                    jobApplication._id,
            },
        }
    );

    revalidatePath("/dashboard");

    return {
        data: JSON.parse(
            JSON.stringify(jobApplication)
        ),
    };
}


/*
|--------------------------------------------------------------------------
| UPDATE JOB APPLICATION
|--------------------------------------------------------------------------
*/

export async function updateJobApplication(
    id: string,

    updates: {
        company?: string;

        position?: string;

        location?: string;

        notes?: string;

        salary?: string;

        jobUrl?: string;

        columnId?: string;

        order?: number;

        tags?: string[];

        description?: string;

        matchResult?: JobMatchResult;

        // Application tracking
        applicationDate?: string | Date;

        followUpDate?: string | Date;

        lastFollowUpDate?: string | Date;

        interviewDate?: string | Date;

        deadline?: string | Date;

        // Application metadata
        reminderEnabled?: boolean;

        followUpCount?: number;

        priority?:
            | "Low"
            | "Medium"
            | "High";

        applicationSource?:
            | "The Muse"
            | "Manual"
            | "Other";

        applicationMethod?:
            | "Manual"
            | "External"
            | "Auto-Apply";
    }
) {
    const session = await getSession();

    if (!session?.user) {
        return {
            error: "Unauthorized",
        };
    }

    if (
        updates.order !== undefined &&
        (!Number.isSafeInteger(updates.order) || updates.order < 0)
    ) {
        return {
            error: "Invalid application order",
        };
    }

    await connectDB();

    const jobApplication =
        await JobApplication.findById(id);

    if (!jobApplication) {
        return {
            error: "Job application not found",
        };
    }

    /*
     * Verify ownership.
     */

    if (
        jobApplication.userId !==
        session.user.id
    ) {
        return {
            error: "Unauthorized",
        };
    }

    const columnId = updates.columnId;
    const order = updates.order;

    const updatesToApply: Partial<{
        company: string;

        position: string;

        location: string;

        notes: string;

        salary: string;

        jobUrl: string;

        columnId: string;

        order: number;

        tags: string[];

        description: string;

        matchResult: JobMatchResult;

        // Application tracking
        applicationDate: string | Date;

        followUpDate: string | Date;

        lastFollowUpDate: string | Date;

        interviewDate: string | Date;

        deadline: string | Date;

        // Application metadata
        reminderEnabled: boolean;

        followUpCount: number;

        priority:
            | "Low"
            | "Medium"
            | "High";

        applicationSource:
            | "The Muse"
            | "Manual"
            | "Other";

        applicationMethod:
            | "Manual"
            | "External"
            | "Auto-Apply";
    }> = {
        company: updates.company,
        position: updates.position,
        location: updates.location,
        notes: updates.notes,
        salary: updates.salary,
        jobUrl: updates.jobUrl,
        tags: updates.tags,
        description: updates.description,
        matchResult: updates.matchResult,
        applicationDate: updates.applicationDate,
        followUpDate: updates.followUpDate,
        lastFollowUpDate: updates.lastFollowUpDate,
        interviewDate: updates.interviewDate,
        deadline: updates.deadline,
        reminderEnabled: updates.reminderEnabled,
        followUpCount: updates.followUpCount,
        priority: updates.priority,
        applicationSource: updates.applicationSource,
        applicationMethod: updates.applicationMethod,
    };

    const currentColumnId =
        jobApplication.columnId.toString();

    const newColumnId =
        columnId?.toString();

    const isMovingColumns =
        newColumnId &&
        newColumnId !== currentColumnId;

    if (isMovingColumns) {
        const board = await Board.findOne({
            _id: jobApplication.boardId,
            userId: session.user.id,
        })
            .select("_id")
            .lean();

        if (!board) {
            return {
                error: "Board not found",
            };
        }

        const sourceColumn = await Column.findOne({
            _id: currentColumnId,
            boardId: jobApplication.boardId,
        })
            .select("_id")
            .lean();

        if (!sourceColumn) {
            return {
                error: "Column not found",
            };
        }

        const targetColumn = await Column.findOne({
            _id: newColumnId,
            boardId: jobApplication.boardId,
        })
            .select("_id")
            .lean();

        if (!targetColumn) {
            return {
                error: "Column not found",
            };
        }
    }

    /*
     * Moving job to another column.
     */

    if (isMovingColumns) {
        /*
         * Remove job from old column.
         */

        await Column.findByIdAndUpdate(
            currentColumnId,
            {
                $pull: {
                    jobapplications: id,
                },
            }
        );

        /*
         * Get jobs already inside target column.
         */

        const jobsInTargetColumn =
            await JobApplication.find({
                columnId: newColumnId,

                _id: {
                    $ne: id,
                },
            })
                .sort({ order: 1 })
                .lean();

        let newOrderValue: number;

        /*
         * If a specific position was provided,
         * insert the job there.
         */

        if (
            order !== undefined &&
            order !== null
        ) {
            newOrderValue =
                order * 100;

            const jobsThatNeedToShift =
                jobsInTargetColumn.slice(order);

            for (
                const job of
                jobsThatNeedToShift
            ) {
                await JobApplication.findByIdAndUpdate(
                    job._id,
                    {
                        $set: {
                            order:
                                (job.order || 0) +
                                100,
                        },
                    }
                );
            }
        } else {
            /*
             * Otherwise put the job at the end.
             */

            if (
                jobsInTargetColumn.length > 0
            ) {
                const lastJobOrder =
                    jobsInTargetColumn[
                        jobsInTargetColumn.length - 1
                    ].order || 0;

                newOrderValue =
                    lastJobOrder + 100;
            } else {
                newOrderValue = 0;
            }
        }

        updatesToApply.columnId =
            newColumnId;

        updatesToApply.order =
            newOrderValue;

        /*
         * Add job to new column.
         */

        await Column.findByIdAndUpdate(
            newColumnId,
            {
                $push: {
                    jobapplications: id,
                },
            }
        );
    }

    /*
     * Reordering within the same column.
     */

    else if (
        order !== undefined &&
        order !== null
    ) {
        const otherJobsInColumn =
            await JobApplication.find({
                columnId:
                    currentColumnId,

                _id: {
                    $ne: id,
                },
            })
                .sort({ order: 1 })
                .lean();

        const currentJobOrder =
            jobApplication.order || 0;

        const currentPositionIndex =
            otherJobsInColumn.findIndex(
                (job) =>
                    (job.order || 0) >=
                    currentJobOrder
            );

        const oldPositionIndex =
            currentPositionIndex === -1
                ? otherJobsInColumn.length
                : currentPositionIndex;

        const newOrderValue =
            order * 100;

        /*
         * Moving job upward.
         */

        if (
            order < oldPositionIndex
        ) {
            const jobsToShiftDown =
                otherJobsInColumn.slice(
                    order,
                    oldPositionIndex
                );

            for (
                const job of
                jobsToShiftDown
            ) {
                await JobApplication.findByIdAndUpdate(
                    job._id,
                    {
                        $set: {
                            order:
                                (job.order || 0) +
                                100,
                        },
                    }
                );
            }
        }

        /*
         * Moving job downward.
         */

        else if (
            order > oldPositionIndex
        ) {
            const jobsToShiftUp =
                otherJobsInColumn.slice(
                    oldPositionIndex,
                    order
                );

            for (
                const job of
                jobsToShiftUp
            ) {
                const newOrder = Math.max(
                    0,
                    (job.order || 0) -
                        100
                );

                await JobApplication.findByIdAndUpdate(
                    job._id,
                    {
                        $set: {
                            order:
                                newOrder,
                        },
                    }
                );
            }
        }

        updatesToApply.order =
            newOrderValue;
    }

    /*
     * Update the job.
     */

    const updated =
        await JobApplication.findByIdAndUpdate(
            id,
            updatesToApply,
            {
                new: true,
                runValidators: true,
            }
        );

    revalidatePath("/dashboard");

    return {
        data: JSON.parse(
            JSON.stringify(updated)
        ),
    };
}


/*
|--------------------------------------------------------------------------
| DELETE JOB APPLICATION
|--------------------------------------------------------------------------
*/

export async function deleteJobApplication(
    id: string
) {
    const session = await getSession();

    if (!session?.user) {
        return {
            error: "Unauthorized",
        };
    }

    await connectDB();

    const jobApplication =
        await JobApplication.findById(id);

    if (!jobApplication) {
        return {
            error: "Job application not found",
        };
    }

    /*
     * Verify ownership.
     */

    if (
        jobApplication.userId !==
        session.user.id
    ) {
        return {
            error: "Unauthorized",
        };
    }

    /*
     * Remove from column.
     */

    await Column.findByIdAndUpdate(
        jobApplication.columnId,
        {
            $pull: {
                jobapplications: id,
            },
        }
    );

    /*
     * Delete application.
     */

    await JobApplication.deleteOne({
        _id: id,
    });

    revalidatePath("/dashboard");

    return {
        success: true,
    };
}


/*
|--------------------------------------------------------------------------
| ADD JOB FROM /JOBS TO BOARD
|--------------------------------------------------------------------------
|
| New jobs are always added to:
|
| Job Hunt
|     └── Wish List
|
| They are NOT automatically marked as Applied.
|
| If the user analyzed the job before clicking
| "Add to Board", the AI match result is saved
| with the job application.
|--------------------------------------------------------------------------
*/

export async function addJobToBoard(
    job: {
        title: string;

        company: string;

        location?: string;

        jobUrl: string;

        description?: string;

        categories?: string[];

        /*
         * AI Match result generated on /jobs.
         */

        matchResult?: JobMatchResult;
    }
) {
    const session = await getSession();

    if (!session?.user) {
        return {
            error: "Unauthorized",
        };
    }

    await connectDB();

    /*
     * Find user's Job Hunt board.
     */

    const board =
        await Board.findOne({
            userId: session.user.id,

            name: "Job Hunt",
        });

    if (!board) {
        return {
            error: "Job Hunt board not found",
        };
    }

    /*
     * Find Wish List column.
     */

    const wishListColumn =
        await Column.findOne({
            boardId: board._id,

            name: "Wish List",
        });

    if (!wishListColumn) {
        return {
            error:
                "Wish List column not found",
        };
    }

    /*
     * Prevent duplicate jobs.
     */

    const existingApplication =
        await JobApplication.findOne({
            userId: session.user.id,

            jobUrl: job.jobUrl,
        });

    if (existingApplication) {
        return {
            alreadyExists: true,

            data: JSON.parse(
                JSON.stringify(
                    existingApplication
                )
            ),
        };
    }

    /*
     * Generate the short AI summary.
     *
     * This happens only once when the job
     * is actually saved.
     */

    const summary =
        await summarizeJobDescription(
            job.description
        );

    /*
     * Find last job in Wish List.
     */

    const maxOrder =
        (await JobApplication.findOne({
            columnId:
                wishListColumn._id,
        })
            .sort({ order: -1 })
            .select("order")
            .lean()) as {
                order: number;
            } | null;

    /*
     * Create JobApplication.
     */

    const jobApplication =
        await JobApplication.create({
            company: job.company,

            position: job.title,

            location: job.location,

            jobUrl: job.jobUrl,

            description:
                job.description,

            /*
             * Save generated summary.
             */

            summary,

            /*
             * Save AI Match result.
             *
             * If the user clicked Add to Board
             * without analyzing the job first,
             * this remains undefined.
             */

            matchResult:
                job.matchResult ??
                undefined,

            columnId:
                wishListColumn._id,

            boardId:
                board._id,

            userId:
                session.user.id,

            tags:
                job.categories ?? [],

            /*
             * Important:
             * Jobs discovered from /jobs begin
             * in Wish List.
             */

            status: "wishlist",

            order:
                maxOrder &&
                maxOrder.order !== undefined
                    ? maxOrder.order + 1
                    : 0,

            /*
             * Application tracking metadata.
             */

            applicationSource:
                "The Muse",

            applicationMethod:
                "External",

            reminderEnabled:
                true,

            followUpCount:
                0,

            priority:
                "Medium",
        });

    /*
     * Add application to column.
     */

    await Column.findByIdAndUpdate(
        wishListColumn._id,
        {
            $push: {
                jobapplications:
                    jobApplication._id,
            },
        }
    );

    /*
     * Refresh dashboard.
     */

    revalidatePath("/dashboard");

    return {
        success: true,

        data: JSON.parse(
            JSON.stringify(
                jobApplication
            )
        ),
    };
}


/*
|--------------------------------------------------------------------------
| PREPARE APPLICATION WITH AI
|--------------------------------------------------------------------------
|
| Uses:
| - Job application data
| - User's default parsed resume
|
| Generates:
| - Why you match
| - Skills to highlight
| - Missing skills
| - Cover letter
| - Recruiter message
| - Resume suggestions
|--------------------------------------------------------------------------
*/

export async function prepareApplicationAction(
    jobApplicationId: string
) {
    const session = await getSession();

    if (!session?.user) {
        return {
            error: "Unauthorized",
        };
    }

    await connectDB();

    /*
     * Find the job application.
     */

    const jobApplication =
        await JobApplication.findById(
            jobApplicationId
        );

    if (!jobApplication) {
        return {
            error: "Job application not found",
        };
    }

    /*
     * Make sure this job belongs to
     * the currently logged-in user.
     */

    if (
        jobApplication.userId !==
        session.user.id
    ) {
        return {
            error: "Unauthorized",
        };
    }

    /*
     * A job description is required by
     * the AI application preparation.
     */

    if (
        !jobApplication.description ||
        !jobApplication.description.trim()
    ) {
        return {
            error:
                "This job does not have a description, so AI application preparation cannot be generated.",
        };
    }

    /*
     * Find the user's default completed resume.
     */

    const Resume =
        (await import("../models/resume")).default;

    const resume =
        await Resume.findOne({
            userId: session.user.id,

            isDefault: true,

            parseStatus: "completed",
        }).lean();

    if (!resume) {
        return {
            error:
                "No completed default resume found. Please upload and parse a resume first.",
        };
    }

    if (!resume.parsedData) {
        return {
            error:
                "Your default resume has no parsed data.",
        };
    }

    /*
     * Prepare the job data.
     */

    const job = {
        title: jobApplication.position,

        company: jobApplication.company,

        location:
            jobApplication.location ||
            undefined,

        description:
            jobApplication.description,

        categories:
            jobApplication.tags || [],
    };

    /*
     * Generate the AI application package.
     */

    try {
        const applicationPreparation =
            await prepareApplication(
                job,
                resume.parsedData
            );

        /*
         * Save the generated result so we
         * don't need to call the AI again
         * every time the user opens the job.
         */

        jobApplication.applicationPreparation =
            applicationPreparation;

        await jobApplication.save();

        /*
         * Refresh dashboard data.
         */

        revalidatePath("/dashboard");

        return {
            success: true,

            data: JSON.parse(
                JSON.stringify(
                    applicationPreparation
                )
            ),
        };
    } catch (error) {
        console.error(
            "Application preparation failed:",
            error
        );

        return {
            error:
                "Failed to prepare application. Please try again.",
        };
    }
}


/*
|--------------------------------------------------------------------------
| GENERATE TAILORED RESUME WITH AI
|--------------------------------------------------------------------------
|
| Uses:
| - Job application data
| - User's default parsed resume
|
| Generates and saves a job-specific, truthful resume.
| The AI is instructed not to invent experience, skills,
| projects, education, achievements, or technologies.
|--------------------------------------------------------------------------
*/

export async function generateTailoredResumeAction(
    jobApplicationId: string
) {
    const session = await getSession();

    if (!session?.user) {
        return {
            error: "Unauthorized",
        };
    }

    await connectDB();

    /*
     * Find the job application.
     */

    const jobApplication =
        await JobApplication.findById(
            jobApplicationId
        );

    if (!jobApplication) {
        return {
            error: "Job application not found",
        };
    }

    /*
     * Verify ownership.
     */

    if (
        jobApplication.userId !==
        session.user.id
    ) {
        return {
            error: "Unauthorized",
        };
    }

    /*
     * A job description is required.
     */

    if (
        !jobApplication.description ||
        !jobApplication.description.trim()
    ) {
        return {
            error:
                "This job does not have a description, so a tailored resume cannot be generated.",
        };
    }

    /*
     * Find the user's default completed resume.
     */

    const Resume =
        (await import("../models/resume")).default;

    const resume =
        await Resume.findOne({
            userId: session.user.id,

            isDefault: true,

            parseStatus: "completed",
        }).lean();

    if (!resume) {
        return {
            error:
                "No completed default resume found. Please upload and parse a resume first.",
        };
    }

    if (!resume.parsedData) {
        return {
            error:
                "Your default resume has no parsed data.",
        };
    }

    /*
     * Prepare job data.
     */

    const job = {
        title: jobApplication.position,

        company: jobApplication.company,

        location:
            jobApplication.location ||
            undefined,

        description:
            jobApplication.description,
    };

    try {
        /*
         * Generate the tailored resume.
         */

        const tailoredResume =
            await generateTailoredResume(
                job,
                resume.parsedData
            );

        /*
         * Save the result so we do not need to
         * generate it again every time the job
         * is opened.
         */

        jobApplication.tailoredResume =
            tailoredResume;

        await jobApplication.save();

        revalidatePath("/dashboard");

        return {
            success: true,

            data: JSON.parse(
                JSON.stringify(
                    tailoredResume
                )
            ),
        };
    } catch (error) {
        console.error(
            "Tailored resume generation failed:",
            error
        );

        return {
            error:
                error instanceof Error
                    ? error.message
                    : "Failed to generate tailored resume. Please try again.",
        };
    }
}