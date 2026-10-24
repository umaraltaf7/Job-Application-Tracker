import dotenv from "dotenv";
import path from "path";

const envPath = path.join(process.cwd(), ".env.local");

const result = dotenv.config({
  path: envPath,
});

console.log("ENV PATH:", envPath);
console.log("ENV LOAD ERROR:", result.error ?? "NONE");

const apiKey = process.env.JOOBLE_API_KEY;

console.log(
  "API KEY:",
  apiKey ? "FOUND" : "MISSING"
);

async function test() {
  if (!apiKey) {
    throw new Error(
      "JOOBLE_API_KEY is missing from .env.local"
    );
  }

  const response = await fetch(
    `https://jooble.org/api/${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        keywords: "Software Engineer",
        location: "Pakistan",
      }),
    }
  );

  console.log("STATUS:", response.status);
  console.log("STATUS TEXT:", response.statusText);

  const text = await response.text();

  console.log("\n========== RESPONSE ==========\n");
  console.log(text);
  console.log("\n==============================\n");
}

test().catch((error) => {
  console.error("\n❌ Jooble test failed:");
  console.error(error);
});