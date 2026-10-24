export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")   // remove all HTML tags
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")       // collapse extra whitespace
    .trim();
}