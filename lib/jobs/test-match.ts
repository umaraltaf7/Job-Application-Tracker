
import dotenv from "dotenv";

dotenv.config({
  path: ".env.local",
});

import { searchJobs } from "./search";
import { matchJobToResume } from "./match-job";
import { IResumeParsedData } from "../models/resume";

async function test() {
  console.log(
    "\n========== AI JOB MATCH TEST ==========\n"
  );

  /*
   * Verify that the Mistral API key
   * was loaded from .env.local.
   *
   * We only print true/false,
   * never the actual API key.
   */

  console.log(
    "Mistral API key loaded:",
    !!process.env.MISTRAL_API_KEY
  );

  /*
   * Get jobs from The Muse.
   */

  const searchResult =
    await searchJobs({
      keyword:
        "Software Engineer",

      location:
        "Pakistan",

      postedWithinDays:
        7,

      includeRemote:
        true,
    });

  const jobs = searchResult.jobs;

  if (jobs.length === 0) {
    console.log(
      "No jobs found."
    );

    return;
  }

  /*
   * Use the first job
   * for testing.
   */

  const job =
    jobs[0];

  console.log(
    "Testing job:"
  );

  console.log(
    job.title
  );

  console.log(
    job.company
  );

  console.log(
    "\nDescription length:",
    job.description?.length ?? 0
  );

  /*
   * Temporary resume.
   *
   * Later we will replace this
   * with the user's actual default
   * resume from MongoDB.
   */

  const resume: IResumeParsedData =
    {
      personalInfo: {
        name: "Test User",
        email: null,
        phone: null,
        location:
          "Pakistan",
        linkedin: null,
        github: null,
      },

      summary:
        "Software Engineering student with experience building web applications using JavaScript, React, Next.js, Node.js and MongoDB.",

      skills: [
        "JavaScript",
        "TypeScript",
        "React",
        "Next.js",
        "Node.js",
        "MongoDB",
        "Git",
        "Tailwind CSS",
      ],

      experience: [
        {
          company:
            "Test Company",

          role:
            "Software Engineering Intern",

          startDate:
            "2025-06",

          endDate:
            "2025-08",

          description: [
            "Built web applications using React and Node.js.",
            "Worked with MongoDB and REST APIs.",
          ],
        },
      ],

      education: [
        {
          institution:
            "COMSATS University Islamabad",

          degree:
            "BS",

          field:
            "Software Engineering",

          startDate:
            "2023",

          endDate:
            null,
        },
      ],

      projects: [
        {
          name:
            "Job Application Tracker",

          technologies: [
            "Next.js",
            "React",
            "MongoDB",
            "TypeScript",
          ],

          description: [
            "Built a job application tracking platform.",
            "Implemented job search and resume parsing.",
          ],
        },
      ],

      certifications: [],

      languages: [
        "English",
      ],
    };

  /*
   * Match resume against job.
   */

  const result =
    await matchJobToResume(
      job,
      resume
    );

  console.log(
    "\n========== MATCH RESULT ==========\n"
  );

  console.log(
    JSON.stringify(
      result,
      null,
      2
    )
  );

  console.log(
    "\n==================================\n"
  );
}

test().catch(
  (error) => {
    console.error(
      "Test failed:",
      error
    );

    process.exit(1);
  }
);
