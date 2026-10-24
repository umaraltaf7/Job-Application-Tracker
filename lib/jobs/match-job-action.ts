
"use server";

import { getSession } from "../auth/auth";
import connectDB from "../db";

import { Resume } from "../models";

import { Job } from "./types";

import {
  matchJobToResume,
  JobMatchResult,
} from "./match-job";

/**
 * Get the user's default parsed Candidate Profile.
 *
 * This is the same Candidate Profile used by
 * the job matching system.
 */
export async function getDefaultResume() {
  const session = await getSession();

  if (!session?.user) {
    return {
      error: "Unauthorized",
    };
  }

  await connectDB();

  const resume =
    await Resume.findOne({
      userId: session.user.id,

      isDefault: true,

      parseStatus: "completed",
    })
      .select("parsedData")
      .lean();

  if (!resume) {
    return {
      error:
        "No default resume found. Please upload a resume first.",
    };
  }

  if (!resume.parsedData) {
    return {
      error:
        "Your default resume has not been successfully parsed yet.",
    };
  }

  return {
    data: JSON.parse(
      JSON.stringify(
        resume.parsedData
      )
    ),
  };
}

/**
 * Analyze how well the user's Candidate Profile
 * matches a job.
 */
export async function matchJobAction(
  job: Job
): Promise<{
  data?: JobMatchResult;
  error?: string;
}> {
  try {
    // ============================================================
    // 1. AUTHENTICATE USER
    // ============================================================

    const session =
      await getSession();

    if (!session?.user) {
      return {
        error: "Unauthorized",
      };
    }

    // ============================================================
    // 2. VALIDATE JOB
    // ============================================================

    if (!job) {
      return {
        error: "Job is required",
      };
    }

    if (!job.description?.trim()) {
      return {
        error:
          "This job does not have a description available for matching",
      };
    }

    // ============================================================
    // 3. CONNECT TO DATABASE
    // ============================================================

    await connectDB();

    // ============================================================
    // 4. GET DEFAULT PARSED RESUME
    // ============================================================

    const resume =
      await Resume.findOne({
        userId: session.user.id,

        isDefault: true,

        parseStatus: "completed",
      })
        .select("parsedData")
        .lean();

    // ------------------------------------------------------------
    // No default resume
    // ------------------------------------------------------------

    if (!resume) {
      /*
       * Check whether the user has any successfully parsed
       * resume at all.
       *
       * This gives us a much more useful error message.
       */

      const completedResume =
        await Resume.exists({
          userId:
            session.user.id,

          parseStatus:
            "completed",

          parsedData: {
            $exists: true,
          },
        });

      if (completedResume) {
        return {
          error:
            "You have a parsed resume, but no default resume is selected. Please set one as default.",
        };
      }

      return {
        error:
          "Please upload a resume and wait for it to be successfully parsed before analyzing jobs.",
      };
    }

    // ------------------------------------------------------------
    // Default resume exists but has no parsed data
    // ------------------------------------------------------------

    if (!resume.parsedData) {
      return {
        error:
          "Your default resume has not been successfully parsed yet. Please upload it again.",
      };
    }

    // ============================================================
    // 5. MATCH CANDIDATE PROFILE AGAINST JOB
    // ============================================================

    const result =
      await matchJobToResume(
        job,
        resume.parsedData
      );

    // ============================================================
    // 6. RETURN RESULT
    // ============================================================

    return {
      data: result,
    };
  } catch (error) {
    console.error(
      "Job matching action failed:",
      error
    );

    return {
      error:
        error instanceof Error
          ? error.message
          : "Failed to analyze this job. Please try again.",
    };
  }
}
