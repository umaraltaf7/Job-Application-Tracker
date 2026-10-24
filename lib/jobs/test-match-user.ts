import "dotenv/config";

import { getDefaultResume } from "./match-job-action";
import { searchJobs } from "./search";
import { matchJobAction } from "./match-job-action";

async function test() {
  console.log(
    "\n========== USER RESUME MATCH TEST ==========\n"
  );

  /*
   * First verify that we can find
   * the default resume.
   *
   * NOTE:
   * getSession() depends on the authenticated
   * Next.js request context, so this standalone
   * CLI test may not work outside a request.
   */

  const resume = await getDefaultResume();

  console.log(
    "Default resume result:"
  );

  console.log(
    JSON.stringify(
      resume,
      null,
      2
    )
  );

  /*
   * Search jobs.
   */

  const jobSearchResult = await searchJobs({
    keyword: "Software Engineer",
    location: "Pakistan",
    postedWithinDays: 7,
    includeRemote: true,
  });

  const jobs = jobSearchResult.jobs;

  if (jobs.length === 0) {
    console.log("No jobs found.");
    return;
  }

  console.log(
    "\nTesting job:"
  );

  console.log(
    jobs[0].title
  );

  console.log(
    jobs[0].company
  );

  /*
   * Match.
   */

  const result =
    await matchJobAction(
      jobs[0]
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