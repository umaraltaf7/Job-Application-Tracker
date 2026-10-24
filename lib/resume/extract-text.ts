import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";
import path from "path";
import { pathToFileURL } from "url";

const pdfWorkerPath = pathToFileURL(
  path.join(
    process.cwd(),
    "node_modules",
    "pdfjs-dist",
    "legacy",
    "build",
    "pdf.worker.mjs"
  )
).href;

PDFParse.setWorker(pdfWorkerPath);

export async function extractResumeText(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());

  if (file.type === "application/pdf") {
    const parser = new PDFParse({
      data: buffer,
    });

    const result = await parser.getText();

    await parser.destroy();

    return result.text;
  }

  if (
    file.type ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const result = await mammoth.extractRawText({
      buffer,
    });

    return result.value;
  }

  throw new Error("Unsupported resume format");
}