import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export async function uploadResume(
  file: File,
  userId: string
) {
  const uploadDir = path.join(
    process.cwd(),
    "uploads",
    "resumes",
    userId
  );

  await fs.mkdir(uploadDir, { recursive: true });

  const extension = path.extname(file.name);

  const uniqueFileName = `${randomUUID()}${extension}`;

  const filePath = path.join(
    uploadDir,
    uniqueFileName
  );

  const arrayBuffer = await file.arrayBuffer();

  const buffer = Buffer.from(arrayBuffer);

  await fs.writeFile(filePath, buffer);

  const storagePath = path.join(
    "uploads",
    "resumes",
    userId,
    uniqueFileName
  );

  return {
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type,
    storagePath,
  };
}