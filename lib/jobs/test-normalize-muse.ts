import { searchMuseJobs } from "./the-muse";
import { normalizeMuseJob } from "./normalize-muse";

async function test() {
  try {
    console.log("Testing The Muse normalization...\n");

    const result = await searchMuseJobs(
      "Software Engineer",
      "Pakistan"
    );

    const jobs = result.results.map(normalizeMuseJob);

    console.log("========== NORMALIZED JOBS ==========");

    console.log("Total jobs:", jobs.length);

    console.log(
      JSON.stringify(jobs.slice(0, 3), null, 2)
    );

    console.log("=====================================");
  } catch (error) {
    console.error("\n❌ Test failed:");
    console.error(error);
  }
}

test();