import fs from "fs/promises";
import path from "path";

export async function deleteStoredFile(storagePath: string) {
  const filePath = path.join(
    process.cwd(),
    storagePath
  );

  await fs.unlink(filePath);
}