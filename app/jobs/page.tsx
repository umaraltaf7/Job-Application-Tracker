import { getSession } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import JobSearchForm from "@/components/job-search-form";
import JobDiscovery from "@/components/job-discovery";

interface JobsPageProps {
  searchParams: Promise<{
    keyword?: string;
    location?: string;
    remote?: string;
    days?: string;
  }>;
}

async function JobsPageContent({
  searchParams,
}: JobsPageProps) {
  const session = await getSession();

  if (!session?.user) {
    redirect("/sign-in");
  }

  const params =
    await searchParams;

  const keyword =
    params.keyword ||
    "Software Engineer";

  const location =
    params.location ||
    "Pakistan";

  const includeRemote =
    params.remote !== "false";

  const postedWithinDays =
    params.days
      ? Number(params.days)
      : undefined;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
            Job Discovery
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Find Jobs
          </h1>

          <p className="mt-2 text-slate-600">
            Discover real job opportunities
            from external job platforms.
          </p>
        </div>

        <JobSearchForm
          defaultKeyword={keyword}
          defaultLocation={location}
          defaultRemote={includeRemote}
          defaultDays={params.days}
        />

        <div className="mt-6">
          <JobDiscovery
            keyword={keyword}
            location={location}
            includeRemote={includeRemote}
            postedWithinDays={
              postedWithinDays
            }
          />
        </div>
      </div>
    </div>
  );
}

export default function JobsPage(
  props: JobsPageProps
) {
  return (
    <Suspense
      fallback={
        <p className="p-8 text-slate-500">
          Loading jobs...
        </p>
      }
    >
      <JobsPageContent {...props} />
    </Suspense>
  );
}