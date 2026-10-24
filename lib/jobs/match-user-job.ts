
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
 * Match a job against the user's default resume.
 *
 * This function is intended to be called from the
 * jobs page / server-side application flow.
 */
export async function matchUserJobToResume(
  job: Job
): Promise<JobMatchResult> {
  /*
   * --------------------------------
   * 1. Get current logged-in user
   * --------------------------------
   */

  const session = await getSession();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  /*
   * --------------------------------
   * 2. Connect to MongoDB
   * --------------------------------
   */

  await connectDB();

  /*
   * --------------------------------
   * 3. Find user's default resume
   * --------------------------------
   */

  const resume = await Resume.findOne({
    userId: session.user.id,
    isDefault: true,
  });

  if (!resume) {
    throw new Error(
      "No default resume found. Please upload and select a default resume."
    );
  }

  /*
   * --------------------------------
   * 4. Check resume parsing status
   * --------------------------------
   */

  if (resume.parseStatus !== "completed") {
    if (resume.parseStatus === "processing") {
      throw new Error(
        "Your resume is still being processed. Please try again shortly."
      );
    }

    if (resume.parseStatus === "failed") {
      throw new Error(
        "Resume parsing failed. Please upload your resume again."
      );
    }

    throw new Error(
      "Resume has not been parsed yet."
    );
  }

  /*
   * --------------------------------
   * 5. Make sure parsed data exists
   * --------------------------------
   */

  if (!resume.parsedData) {
    throw new Error(
      "Parsed resume data is missing."
    );
  }

  /*
   * --------------------------------
   * 6. Match job against resume
   * --------------------------------
   */

  return await matchJobToResume(
    job,
    resume.parsedData
  );
}
