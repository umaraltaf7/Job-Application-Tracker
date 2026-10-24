import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

if (!process.env.MISTRAL_API_KEY) {
  console.error("❌ MISTRAL_API_KEY not found in .env.local");
  process.exit(1);
}

const response = await fetch("https://api.mistral.ai/v1/models", {
  headers: {
    Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
  },
});

console.log("Status:", response.status);

const data = await response.json();

if (!response.ok) {
  console.error(data);
  process.exit(1);
}

console.log("\nModels available to your API key:\n");

for (const model of data.data ?? []) {
  console.log(model.id);
}