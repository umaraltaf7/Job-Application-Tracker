export interface Job {
  id: string;

  title: string;

  company: string;

  location: string;

  description?: string;

  jobUrl: string;

  source: string;

  sourceId: string;

  postedAt?: string;

  categories: string[];

  levels: string[];

  logoUrl?: string;
}