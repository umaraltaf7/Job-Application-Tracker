import {
  BarChart3,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  FileCheck2,
  Percent,
  Sparkles,
  XCircle,
} from "lucide-react";

interface AnalyticsApplication {
  matchResult?: {
    matchScore?: number;
    recommendation?: "APPLY" | "MAYBE" | "SKIP";
  } | null;
}

interface AnalyticsColumn {
  name: string;
  jobapplications?: AnalyticsApplication[];
}

interface DashboardAnalyticsProps {
  columns: AnalyticsColumn[];
}

function normalizeColumnName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[_-]/g, " ");
}

function getColumnApplications(
  columns: AnalyticsColumn[],
  names: string[]
) {
  const normalizedNames = names.map((name) =>
    normalizeColumnName(name)
  );

  const matchingColumns = columns.filter((column) =>
    normalizedNames.includes(
      normalizeColumnName(column.name)
    )
  );

  return matchingColumns.flatMap(
    (column) => column.jobapplications ?? []
  );
}

function StatCard({
  icon,
  title,
  value,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {description}
          </p>
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700">
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function DashboardAnalytics({
  columns,
}: DashboardAnalyticsProps) {
  const allApplications = columns.flatMap(
    (column) => column.jobapplications ?? []
  );

  const totalApplications =
    allApplications.length;

  const wishlistApplications =
    getColumnApplications(columns, [
      "Wish List",
      "Wishlist",
    ]);

  const appliedApplications =
    getColumnApplications(columns, [
      "Applied",
    ]);

  const interviewApplications =
    getColumnApplications(columns, [
      "Interview",
      "Interviews",
    ]);

  const rejectedApplications =
    getColumnApplications(columns, [
      "Rejected",
    ]);

  const hiredApplications =
    getColumnApplications(columns, [
      "Hired",
    ]);

  const analyzedApplications =
    allApplications.filter(
      (application) =>
        application.matchResult &&
        typeof application.matchResult.matchScore ===
          "number"
    );

  const matchScores =
    analyzedApplications
      .map(
        (application) =>
          application.matchResult?.matchScore
      )
      .filter(
        (score): score is number =>
          typeof score === "number"
      );

  const averageMatchScore =
    matchScores.length > 0
      ? Math.round(
          matchScores.reduce(
            (sum, score) => sum + score,
            0
          ) / matchScores.length
        )
      : 0;

  const applyRecommendations =
    analyzedApplications.filter(
      (application) =>
        application.matchResult
          ?.recommendation === "APPLY"
    ).length;

  const maybeRecommendations =
    analyzedApplications.filter(
      (application) =>
        application.matchResult
          ?.recommendation === "MAYBE"
    ).length;

  const skipRecommendations =
    analyzedApplications.filter(
      (application) =>
        application.matchResult
          ?.recommendation === "SKIP"
    ).length;

  const responseRate =
    appliedApplications.length > 0
      ? Math.round(
          ((interviewApplications.length +
            hiredApplications.length) /
            appliedApplications.length) *
            100
        )
      : 0;

  const pipeline = [
    {
      name: "Wish List",
      count: wishlistApplications.length,
      icon: <Clock3 className="h-4 w-4" />,
      bar: "bg-slate-400",
    },
    {
      name: "Applied",
      count: appliedApplications.length,
      icon: <FileCheck2 className="h-4 w-4" />,
      bar: "bg-cyan-500",
    },
    {
      name: "Interview",
      count: interviewApplications.length,
      icon: <BriefcaseBusiness className="h-4 w-4" />,
      bar: "bg-violet-500",
    },
    {
      name: "Rejected",
      count: rejectedApplications.length,
      icon: <XCircle className="h-4 w-4" />,
      bar: "bg-red-500",
    },
    {
      name: "Hired",
      count: hiredApplications.length,
      icon: <CheckCircle2 className="h-4 w-4" />,
      bar: "bg-emerald-500",
    },
  ];

  const maxPipelineCount = Math.max(
    ...pipeline.map((item) => item.count),
    1
  );

  return (
    <section className="mb-10">
      {/* Section Header */}

      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
          Analytics
        </p>

        <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
          Job Hunt Overview
        </h2>

        <p className="mt-1 text-sm text-slate-600">
          Track your application pipeline and AI-powered
          matching activity.
        </p>
      </div>

      {/* Main Statistics */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={
            <BriefcaseBusiness className="h-5 w-5" />
          }
          title="Total Applications"
          value={totalApplications}
          description="Jobs currently on your board"
        />

        <StatCard
          icon={<FileCheck2 className="h-5 w-5" />}
          title="Applied"
          value={appliedApplications.length}
          description="Applications submitted"
        />

        <StatCard
          icon={<BriefcaseBusiness className="h-5 w-5" />}
          title="Interviews"
          value={interviewApplications.length}
          description="Applications reaching interviews"
        />

        <StatCard
          icon={<CheckCircle2 className="h-5 w-5" />}
          title="Hired"
          value={hiredApplications.length}
          description="Successful applications"
        />
      </div>

      {/* Secondary Statistics */}

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Clock3 className="h-5 w-5" />}
          title="Wish List"
          value={wishlistApplications.length}
          description="Jobs you're considering"
        />

        <StatCard
          icon={<XCircle className="h-5 w-5" />}
          title="Rejected"
          value={rejectedApplications.length}
          description="Applications rejected"
        />

        <StatCard
          icon={<Sparkles className="h-5 w-5" />}
          title="Average Match"
          value={
            analyzedApplications.length > 0
              ? `${averageMatchScore}%`
              : "—"
          }
          description={
            analyzedApplications.length > 0
              ? `${analyzedApplications.length} jobs analyzed by AI`
              : "No AI matches yet"
          }
        />

        <StatCard
          icon={<Percent className="h-5 w-5" />}
          title="Response Rate"
          value={
            appliedApplications.length > 0
              ? `${responseRate}%`
              : "—"
          }
          description="Interviews + hires from applications"
        />
      </div>

      {/* Pipeline + AI Analytics */}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Application Pipeline */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Application Pipeline
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Current distribution across your boards
              </p>
            </div>

            <BarChart3 className="h-5 w-5 text-slate-400" />
          </div>

          <div className="mt-6 space-y-5">
            {pipeline.map((item) => {
              const percentage =
                totalApplications > 0
                  ? Math.round(
                      (item.count /
                        totalApplications) *
                        100
                    )
                  : 0;

              const width =
                item.count === 0
                  ? 0
                  : Math.max(
                      6,
                      Math.round(
                        (item.count /
                          maxPipelineCount) *
                          100
                      )
                    );

              return (
                <div key={item.name}>
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">
                        {item.icon}
                      </span>

                      <span className="text-sm font-medium text-slate-700">
                        {item.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900">
                        {item.count}
                      </span>

                      <span className="text-xs text-slate-400">
                        {percentage}%
                      </span>
                    </div>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full transition-all ${item.bar}`}
                      style={{
                        width: `${width}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Matching Analytics */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                AI Matching Insights
              </p>

              <p className="mt-1 text-xs text-slate-500">
                How your saved applications compare with
                your resume
              </p>
            </div>

            <Sparkles className="h-5 w-5 text-cyan-600" />
          </div>

          {analyzedApplications.length === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
              <Sparkles className="mx-auto h-7 w-7 text-slate-400" />

              <p className="mt-3 text-sm font-medium text-slate-700">
                No AI match data yet
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Analyze jobs from the Find Jobs page to
                start building your AI analytics.
              </p>
            </div>
          ) : (
            <>
              <div className="mt-5 rounded-xl bg-slate-50 p-5">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Average Resume Match
                </p>

                <div className="mt-2 flex items-end gap-2">
                  <span className="text-4xl font-bold text-slate-950">
                    {averageMatchScore}%
                  </span>

                  <span className="pb-1 text-xs text-slate-500">
                    across {analyzedApplications.length}{" "}
                    analyzed{" "}
                    {analyzedApplications.length === 1
                      ? "job"
                      : "jobs"}
                  </span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <p className="text-xs font-medium text-emerald-700">
                    Apply
                  </p>

                  <p className="mt-1 text-2xl font-bold text-emerald-800">
                    {applyRecommendations}
                  </p>
                </div>

                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <p className="text-xs font-medium text-amber-700">
                    Maybe
                  </p>

                  <p className="mt-1 text-2xl font-bold text-amber-800">
                    {maybeRecommendations}
                  </p>
                </div>

                <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                  <p className="text-xs font-medium text-red-700">
                    Skip
                  </p>

                  <p className="mt-1 text-2xl font-bold text-red-800">
                    {skipRecommendations}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}