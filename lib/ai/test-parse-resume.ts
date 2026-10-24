import dotenv from "dotenv";

dotenv.config({
  path: ".env.local",
});

import fs from "fs/promises";
import { extractResumeText } from "../resume/extract-text";

async function test() {
  try {
    // Import after loading .env.local
    const { parseResumeWithAI } = await import("./parse-resume");

    const filePath = process.argv[2];
    if (!filePath) {
      throw new Error("Pass a resume file path as the first argument.");
    }

    console.log("Reading resume...");

    const fileBuffer = await fs.readFile(filePath);

    const file = new File(
      [fileBuffer],
      "resume.pdf",
      {
        type: "application/pdf",
      }
    );

    console.log("Extracting resume text...");

    // Step 1: Extract text from PDF
    const resumeText = await extractResumeText(file);

    console.log("✅ Resume text extracted");
    console.log(
      `Characters extracted: ${resumeText.length}`
    );

    console.log("\nSending resume to Mistral...");

    // Step 2: Send extracted text to Mistral
    const parsedResume =
      await parseResumeWithAI(resumeText);

    console.log("\n========== PARSED RESUME ==========");

    console.dir(parsedResume, {
      depth: null,
    });

    console.log("===================================");
  } catch (error) {
    console.error("\n❌ Resume parsing failed:");
    console.error(error);
  }
}

test();