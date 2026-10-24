import fs from "fs/promises";
import { extractResumeText } from "./extract-text";

async function test() {
  const filePath = process.argv[2];
  if (!filePath) {
    throw new Error("Pass a resume file path as the first argument.");
  }

  const fileBuffer = await fs.readFile(filePath);

  const file = new File(
    [fileBuffer],
    "6d6b2111-44f9-4722-afe4-a23def03fc00.docx",
    {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    }
  );

  const text = await extractResumeText(file);

  console.log("========== RESUME TEXT ==========");
  console.log(text);
  console.log("=================================");
}

test();