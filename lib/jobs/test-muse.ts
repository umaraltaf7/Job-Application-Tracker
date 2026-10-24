// import { searchMuseJobs } from "./the-muse";

// async function test() {
//   try {
//     console.log("Testing The Muse API...\n");

//     const result = await searchMuseJobs(
//       "Software Engineer",
//       "Pakistan"
//     );

//     console.log("========== THE MUSE RESPONSE ==========");
//     console.log("Page count:", result.page_count);
//     console.log("Jobs found:", result.results?.length);

//     console.log(
//       JSON.stringify(result.results?.slice(0, 3), null, 2)
//     );

//     console.log("=======================================");
//   } catch (error) {
//     console.error("\n❌ The Muse test failed:");
//     console.error(error);
//   }
// }

// test();

import { searchMuseJobs } from "./the-muse";

async function test() {
  try {
    console.log("Testing The Muse API...\n");

    const result = await searchMuseJobs(
      "Nurse",
      "Pakistan",
      [],
      { startPage: 0, maxPages: 1 }
    );

    console.log("========== THE MUSE RESPONSE ==========");
    console.log("Has more:", result.hasMore);
    console.log("Jobs found:", result.results?.length);

    console.log(
      JSON.stringify(result.results?.slice(0, 3), null, 2)
    );

    console.log("=======================================");
  } catch (error) {
    console.error("\n❌ The Muse test failed:");
    console.error(error);
  }
}

test();