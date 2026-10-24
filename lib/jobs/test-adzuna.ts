import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.resolve(process.cwd(), ".env.local"),
});

import { searchAdzunaJobs } from "./adzuna";

async function test() {
  console.log(
    "APP ID:",
    process.env.ADZUNA_APP_ID ? "FOUND" : "MISSING"
  );

  console.log(
    "APP KEY:",
    process.env.ADZUNA_APP_KEY ? "FOUND" : "MISSING"
  );

  try {
    const jobs = await searchAdzunaJobs({
      query: "software engineer",
      location: "Islamabad",
    });

    console.log("\n========== ADZUNA JOBS ==========");

    console.log(`Found ${jobs.length} jobs`);

    for (const job of jobs) {
      console.log("\n------------------------------");

      console.log("Title:", job.title);
      console.log("Company:", job.company);
      console.log("Location:", job.location);
      console.log("Salary:", job.salaryMin, "-", job.salaryMax);
      console.log("URL:", job.redirectUrl);
    }

    console.log("\n=================================");
  } catch (error) {
    console.error("\n❌ Adzuna test failed:");
    console.error(error);
  }
}

test();