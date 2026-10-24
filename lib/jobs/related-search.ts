// export function getRelatedSearchTerms(
//   keyword: string
// ): string[] {
//   const value = keyword
//     .toLowerCase()
//     .trim();

//   /*
//    * Software / Web Development
//    */
//   if (
//     value.includes("software") ||
//     value.includes("developer") ||
//     value.includes("programmer") ||
//     value.includes("frontend") ||
//     value.includes("front end") ||
//     value.includes("backend") ||
//     value.includes("back end") ||
//     value.includes("full stack") ||
//     value.includes("fullstack") ||
//     value.includes("react") ||
//     value.includes("node") ||
//     value.includes("javascript") ||
//     value.includes("typescript") ||
//     value.includes("next.js") ||
//     value.includes("nextjs") ||
//     value.includes("php") ||
//     value.includes("laravel") ||
//     value.includes("flutter") ||
//     value.includes("mobile")
//   ) {
//     return [
//       "Software Engineering",
//       "Software Engineer",
//       "Computer and IT",
//       "IT",
//     ];
//   }

//   /*
//    * Data / AI / ML
//    */
//   if (
//     value.includes("data") ||
//     value.includes("machine learning") ||
//     value.includes("ml") ||
//     value.includes("artificial intelligence") ||
//     value.includes("ai") ||
//     value.includes("data scientist") ||
//     value.includes("data analyst")
//   ) {
//     return [
//       "Data Science",
//       "Data and Analytics",
//       "Software Engineering",
//       "Computer and IT",
//     ];
//   }

//   /*
//    * Product
//    */
//   if (
//     value.includes("product") ||
//     value.includes("product manager")
//   ) {
//     return [
//       "Product",
//       "Product Management",
//       "Project Management",
//       "Software Engineering",
//     ];
//   }

//   /*
//    * Design
//    */
//   if (
//     value.includes("designer") ||
//     value.includes("design") ||
//     value.includes("ui") ||
//     value.includes("ux")
//   ) {
//     return [
//       "Design",
//       "Design and UX",
//       "UX",
//       "Computer and IT",
//     ];
//   }

//   /*
//    * Marketing
//    */
//   if (
//     value.includes("marketing") ||
//     value.includes("seo") ||
//     value.includes("social media")
//   ) {
//     return [
//       "Marketing",
//       "Advertising and Marketing",
//       "Media, PR, and Communications",
//     ];
//   }

//   /*
//    * Finance
//    */
//   if (
//     value.includes("finance") ||
//     value.includes("accountant") ||
//     value.includes("accounting")
//   ) {
//     return [
//       "Accounting and Finance",
//       "Business Operations",
//     ];
//   }

//   /*
//    * Generic fallback.
//    */
//   return [
//     "Software Engineering",
//     "Computer and IT",
//     "Business Operations",
//   ];
// }

export function getRelatedSearchTerms(
  keyword: string
): string[] {
  const value = keyword
    .toLowerCase()
    .trim();

  /*
   * Software / Web Development
   */
  if (
    value.includes("software") ||
    value.includes("developer") ||
    value.includes("programmer") ||
    value.includes("frontend") ||
    value.includes("front end") ||
    value.includes("backend") ||
    value.includes("back end") ||
    value.includes("full stack") ||
    value.includes("fullstack") ||
    value.includes("react") ||
    value.includes("node") ||
    value.includes("javascript") ||
    value.includes("typescript") ||
    value.includes("next.js") ||
    value.includes("nextjs") ||
    value.includes("php") ||
    value.includes("laravel") ||
    value.includes("flutter") ||
    value.includes("mobile")
  ) {
    return [
      "Software Engineering",
      "Software Engineer",
      "Computer and IT",
      "IT",
    ];
  }

  /*
   * Data / AI / ML
   */
  if (
    value.includes("data") ||
    value.includes("machine learning") ||
    value.includes("ml") ||
    value.includes("artificial intelligence") ||
    value.includes("ai") ||
    value.includes("data scientist") ||
    value.includes("data analyst")
  ) {
    return [
      "Data Science",
      "Data and Analytics",
      "Software Engineering",
      "Computer and IT",
    ];
  }

  /*
   * Product
   */
  if (
    value.includes("product") ||
    value.includes("product manager")
  ) {
    return [
      "Product",
      "Product Management",
      "Project Management",
      "Software Engineering",
    ];
  }

  /*
   * Design
   */
  if (
    value.includes("designer") ||
    value.includes("design") ||
    value.includes("ui") ||
    value.includes("ux")
  ) {
    return [
      "Design",
      "Design and UX",
      "UX",
      "Computer and IT",
    ];
  }

  /*
   * Marketing
   */
  if (
    value.includes("marketing") ||
    value.includes("seo") ||
    value.includes("social media")
  ) {
    return [
      "Marketing",
      "Advertising and Marketing",
      "Media, PR, and Communications",
    ];
  }

  /*
   * Finance
   */
  if (
    value.includes("finance") ||
    value.includes("accountant") ||
    value.includes("accounting")
  ) {
    return [
      "Accounting and Finance",
      "Business Operations",
    ];
  }

  /*
   * Generic fallback — do NOT force IT/tech categories here.
   * Returning an empty array tells searchMuseJobs() to search
   * without any category filter, relying on the keyword itself
   * (and local relevance scoring in search.ts) to find matches.
   * This lets non-tech searches (e.g. "Nurse", "Accountant" without
   * the word "finance", "Chef") actually return non-IT results.
   */
  return [];
}