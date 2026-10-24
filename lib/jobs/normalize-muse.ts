import { MuseJob } from "./the-muse";
import { Job } from "./types";
import { stripHtml } from "./strip-html";

function cleanJobUrl(url: string): string {
  if (!url) {
    return "";
  }

  /*
   * Handle Markdown format:
   *
   * [https://example.com](https://example.com)
   */
  const markdownMatch = url.match(
    /^\[.*?\]\((https?:\/\/.*?)\)$/
  );

  if (markdownMatch) {
    return markdownMatch[1];
  }

  /*
   * Handle plain URL wrapped in brackets.
   */
  if (
    url.startsWith("[") &&
    url.endsWith("]")
  ) {
    return url.slice(1, -1);
  }

  return url.trim();
}

export function normalizeMuseJob(
  job: MuseJob
): Job {
  return {
    id: `muse-${job.id}`,

    title: job.name,

    company: job.company.name,

    location:
      job.locations.length > 0
        ? job.locations
            .map(
              (location) =>
                location.name
            )
            .join(", ")
        : "Not specified",

    /*
     * Full job description.
     *
     * The Muse provides this as HTML, so it's
     * stripped to plain text here — the single
     * source point for description — so every
     * downstream consumer (job cards, Wish List
     * cards, and the AI resume/job matcher sent
     * to Mistral) gets clean text automatically.
     */
    description:
      job.contents?.trim()
        ? stripHtml(job.contents)
        : undefined,

    jobUrl:
      cleanJobUrl(
        job.refs?.landing_page ?? ""
      ),

    source: "The Muse",

    sourceId:
      String(job.id),

    postedAt:
      job.publication_date,

    categories:
      job.categories.map(
        (category) =>
          category.name
      ),

    levels:
      job.levels.map(
        (level) =>
          level.name
      ),

    logoUrl:
      job.refs?.logo_image,
  };
}