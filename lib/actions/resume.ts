
"use server";

import { revalidatePath } from "next/cache";

import { getSession } from "../auth/auth";
import connectDB from "../db";

import { Resume } from "../models";

import { uploadResume } from "../storage/upload";
import { deleteStoredFile } from "../storage/delete";

import { extractResumeText } from "../resume/extract-text";
import { parseResumeWithAI } from "../ai/parse-resume";

export type ResumeActionState = {
  error?: string;
  data?: unknown;
} | null;

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

/**
 * Upload, parse and save a resume.
 *
 * Important:
 *
 * A resume only becomes the default resume AFTER
 * AI parsing succeeds.
 *
 * This guarantees that Candidate Profile and Job Matching
 * always use a successfully parsed resume.
 */
export async function uploadResumeAction(
  _prevState: ResumeActionState,
  formData: FormData
) {
  const session = await getSession();

  if (!session?.user) {
    return {
      error: "Unauthorized",
    };
  }

  const file = formData.get("resume");

  if (!(file instanceof File)) {
    return {
      error: "Please upload a file",
    };
  }

  if (file.size === 0) {
    return {
      error: "The uploaded file is empty",
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      error: "File size must be less than 5 MB",
    };
  }

  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return {
      error: "Only PDF and DOCX files are allowed",
    };
  }

  await connectDB();

  try {
    // ============================================================
    // 1. EXTRACT TEXT
    // ============================================================

    console.log("Extracting resume text...");

    const extractedText =
      await extractResumeText(file);

    console.log("Resume text extracted");

    if (!extractedText?.trim()) {
      return {
        error:
          "Could not extract any text from the resume",
      };
    }

    // ============================================================
    // 2. UPLOAD ORIGINAL FILE
    // ============================================================

    console.log("Uploading resume file...");

    const storedFile =
      await uploadResume(
        file,
        session.user.id
      );

    // ============================================================
    // 3. CREATE RESUME RECORD
    //
    // Initially NOT default.
    //
    // We only make it default after AI parsing succeeds.
    // ============================================================

    const resume =
      await Resume.create({
        userId: session.user.id,

        fileName:
          storedFile.fileName,

        fileSize:
          storedFile.fileSize,

        mimeType:
          storedFile.mimeType,

        storagePath:
          storedFile.storagePath,

        isDefault: false,

        extractedText,

        parseStatus:
          "processing",
      });

    // ============================================================
    // 4. PARSE RESUME WITH AI
    // ============================================================

    console.log(
      "Sending resume to Mistral..."
    );

    let parsedData;

    try {
      parsedData =
        await parseResumeWithAI(
          extractedText
        );

      console.log(
        "Resume parsed successfully"
      );
    } catch (aiError) {
      console.error(
        "Resume AI parsing failed:",
        aiError
      );

      // Mark this resume as failed.
      resume.parseStatus = "failed";

      await resume.save();

      return {
        error:
          aiError instanceof Error
            ? `Resume parsing failed: ${aiError.message}`
            : "Resume parsing failed. Please try again.",
      };
    }

    // ============================================================
    // 5. SAVE PARSED CANDIDATE PROFILE
    // ============================================================

    resume.parsedData =
      parsedData;

    resume.parseStatus =
      "completed";

    await resume.save();

    console.log(
      "Candidate profile saved to MongoDB"
    );

    // ============================================================
    // 6. MAKE THIS RESUME THE DEFAULT
    //
    // Since parsing succeeded, this resume is now safe
    // to use as the Candidate Profile.
    // ============================================================

    await Resume.updateMany(
      {
        userId: session.user.id,

        _id: {
          $ne: resume._id,
        },
      },
      {
        $set: {
          isDefault: false,
        },
      }
    );

    await Resume.findOneAndUpdate(
      {
        _id: resume._id,

        userId: session.user.id,

        parseStatus:
          "completed",
      },
      {
        $set: {
          isDefault: true,
        },
      }
    );

    console.log(
      "New resume set as default"
    );

    // ============================================================
    // 7. REFRESH DASHBOARD
    // ============================================================

    revalidatePath(
      "/dashboard"
    );

    // Also invalidate jobs because
    // job matching uses the default resume.
    revalidatePath(
      "/jobs"
    );

    // ============================================================
    // 8. RETURN SUCCESS
    // ============================================================

    return {
      data: JSON.parse(
        JSON.stringify(resume)
      ),
    };
  } catch (error) {
    console.error(
      "Resume upload failed:",
      error
    );

    return {
      error:
        error instanceof Error
          ? error.message
          : "Failed to upload resume",
    };
  }
}

/**
 * Get the user's default parsed Candidate Profile.
 *
 * The Candidate Profile is stored inside the
 * parsedData field of the default resume.
 */
export async function getCandidateProfile() {
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
        "No default resume found",
    };
  }

  if (!resume.parsedData) {
    return {
      error:
        "Your default resume has not been parsed yet",
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
 * Get all resumes belonging to the current user.
 */
export async function getUserResumes() {
  const session = await getSession();

  if (!session?.user) {
    return {
      error: "Unauthorized",
    };
  }

  await connectDB();

  const resumes =
    await Resume.find({
      userId: session.user.id,
    })
      .sort({
        createdAt: -1,
      })
      .lean();

  return {
    data: JSON.parse(
      JSON.stringify(resumes)
    ),
  };
}

/**
 * Delete a resume belonging to the current user.
 */
export async function deleteResume(
  id: string
) {
  const session = await getSession();

  if (!session?.user) {
    return {
      error: "Unauthorized",
    };
  }

  await connectDB();

  const resume =
    await Resume.findOne({
      _id: id,
      userId: session.user.id,
    });

  if (!resume) {
    return {
      error: "Resume not found",
    };
  }

  try {
    // Delete stored file.
    await deleteStoredFile(
      resume.storagePath
    );

    // Delete database record.
    await Resume.deleteOne({
      _id: id,
      userId: session.user.id,
    });

    /*
     * If the deleted resume was the default,
     * automatically promote the newest successfully
     * parsed resume to default.
     */
    if (resume.isDefault) {
      const replacement =
        await Resume.findOne({
          userId: session.user.id,

          parseStatus:
            "completed",

          parsedData: {
            $exists: true,
          },

          _id: {
            $ne: id,
          },
        })
          .sort({
            createdAt: -1,
          });

      if (replacement) {
        await Resume.updateMany(
          {
            userId:
              session.user.id,
          },
          {
            $set: {
              isDefault: false,
            },
          }
        );

        replacement.isDefault =
          true;

        await replacement.save();
      }
    }

    revalidatePath(
      "/dashboard"
    );

    revalidatePath(
      "/jobs"
    );

    return {
      success: true,
    };
  } catch (error) {
    console.error(
      "Resume deletion failed:",
      error
    );

    return {
      error:
        "Failed to delete resume",
    };
  }
}

/**
 * Set a successfully parsed resume as default.
 *
 * A failed or still-processing resume cannot
 * become the Candidate Profile.
 */
export async function setDefaultResume(
  id: string
) {
  const session = await getSession();

  if (!session?.user) {
    return {
      error: "Unauthorized",
    };
  }

  await connectDB();

  const resume =
    await Resume.findOne({
      _id: id,

      userId:
        session.user.id,

      parseStatus:
        "completed",
    });

  if (!resume) {
    return {
      error:
        "Resume not found or it has not been successfully parsed yet",
    };
  }

  if (!resume.parsedData) {
    return {
      error:
        "This resume does not contain a Candidate Profile yet",
    };
  }

  try {
    // Remove default status from all resumes.
    await Resume.updateMany(
      {
        userId:
          session.user.id,
      },
      {
        $set: {
          isDefault: false,
        },
      }
    );

    // Make selected resume default.
    await Resume.findOneAndUpdate(
      {
        _id: id,

        userId:
          session.user.id,

        parseStatus:
          "completed",
      },
      {
        $set: {
          isDefault: true,
        },
      }
    );

    revalidatePath(
      "/dashboard"
    );

    revalidatePath(
      "/jobs"
    );

    return {
      success: true,
    };
  } catch (error) {
    console.error(
      "Failed to set default resume:",
      error
    );

    return {
      error:
        "Failed to set default resume",
    };
  }
}
