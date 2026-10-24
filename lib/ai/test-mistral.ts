import dotenv from "dotenv";

dotenv.config({
  path: ".env.local",
});

async function test() {
  const { mistral } = await import("./mistral");

  const response = await mistral.chat.complete({
    model: "mistral-large-latest",

    messages: [
      {
        role: "user",
        content: "Say hello and tell me that you are working.",
      },
    ],
  });

  console.log("========== MISTRAL RESPONSE ==========");

  console.log(response.choices[0]?.message?.content);

  console.log("======================================");
}

test();