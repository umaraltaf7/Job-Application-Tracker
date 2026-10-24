import { searchJobs } from "./search";

async function test() {
  /*
   * TEST 1
   *
   * All matching jobs.
   */
  console.log(
    "\n\n========== TEST 1 =========="
  );

  const allJobsResult =
    await searchJobs({
      keyword:
        "Software Engineer",

      location:
        "Pakistan",

      includeRemote:
        true,
    });

  const allJobs = allJobsResult.jobs;

  console.log(
    "Total jobs:",
    allJobs.length
  );

  console.log(
    JSON.stringify(
      allJobs.slice(0, 5),
      null,
      2
    )
  );

  /*
   * TEST 1A
   *
   * Check job description.
   */
  console.log(
    "\n\n========== DESCRIPTION TEST =========="
  );

  const firstJob =
    allJobs[0];

  if (!firstJob) {
    console.log(
      "No jobs found."
    );
  } else {
    console.log(
      "Title:",
      firstJob.title
    );

    console.log(
      "Company:",
      firstJob.company
    );

    console.log(
      "URL:",
      firstJob.jobUrl
    );

    console.log(
      "Description exists:",
      Boolean(
        firstJob.description
      )
    );

    console.log(
      "Description length:",
      firstJob.description
        ?.length ?? 0
    );

    console.log(
      "\nDESCRIPTION:"
    );

    console.log(
      firstJob.description ??
        "NO DESCRIPTION FOUND"
    );
  }

  console.log(
    "========================================"
  );

  /*
   * TEST 2
   *
   * Only jobs from the
   * last 7 days.
   */
  console.log(
    "\n\n========== TEST 2 =========="
  );

  const recentJobsResult =
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

  const recentJobs = recentJobsResult.jobs;

  console.log(
    "Jobs from last 7 days:",
    recentJobs.length
  );

  console.log(
    JSON.stringify(
      recentJobs.slice(0, 5),
      null,
      2
    )
  );

  /*
   * TEST 3
   *
   * Pakistan only.
   *
   * Remote jobs are excluded.
   */
  console.log(
    "\n\n========== TEST 3 =========="
  );

  const pakistanOnlyResult =
    await searchJobs({
      keyword:
        "Software Engineer",

      location:
        "Pakistan",

      includeRemote:
        false,
    });

  const pakistanOnly = pakistanOnlyResult.jobs;

  console.log(
    "Pakistan-only jobs:",
    pakistanOnly.length
  );

  console.log(
    JSON.stringify(
      pakistanOnly.slice(0, 5),
      null,
      2
    )
  );
}

test();