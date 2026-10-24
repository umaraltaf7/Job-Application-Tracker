
import { getSession } from "@/lib/auth/auth";
import connectDB from "@/lib/db";
import { Board } from "@/lib/models";
import { redirect } from "next/navigation";
import Link from "next/link";
import KanbanBoard from "@/components/kanban-board";
import ResumeList from "@/components/resume/resume-list";
import CandidateProfile from "@/components/candidate-profile";
import DashboardAnalytics from "@/components/dashboard-analytics";
import DashboardTabs from "@/components/dashboard/dashboard-tabs";
import ResumeUploadModal from "@/components/dashboard/resume-upload-modal";
import RemindersSection, {
  type ReminderApplication,
} from "@/components/dashboard/reminders-section";
import { Suspense } from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  FileText,
  Search,
  Sparkles,
} from "lucide-react";

async function getBoard(userId: string) {
  "use cache";

  await connectDB();

  const boardDoc = await Board.findOne({
    userId,
    name: "Job Hunt",
  }).populate({
    path: "columns",
    populate: {
      path: "jobapplications",
    },
  });

  if (!boardDoc) return null;

  return JSON.parse(JSON.stringify(boardDoc));
}

async function DashboardPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/sign-in");
  }

  const board = await getBoard(session.user.id);

  if (!board) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <p className="font-medium text-red-700">
              Job Hunt board not found.
            </p>

            <p className="mt-1 text-sm text-red-600">
              Your job board could not be loaded. Please try again.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const columns = board.columns ?? [];

  const allApplications = columns.flatMap(
    (column: {
      jobapplications?: unknown[];
    }) => column.jobapplications ?? []
  );

  const getColumnCount = (names: string[]) => {
    const normalizedNames = names.map((name) =>
      name.trim().toLowerCase().replace(/[_-]/g, " ")
    );

    return columns
      .filter((column: { name: string }) =>
        normalizedNames.includes(
          column.name.trim().toLowerCase().replace(/[_-]/g, " ")
        )
      )
      .reduce(
        (
          total: number,
          column: { jobapplications?: unknown[] }
        ) => total + (column.jobapplications?.length ?? 0),
        0
      );
  };

  const appliedCount = getColumnCount(["Applied"]);

  const interviewCount = getColumnCount([
    "Interview",
    "Interviews",
  ]);

  const hiredCount = getColumnCount(["Hired"]);

  const wishlistCount = getColumnCount([
    "Wish List",
    "Wishlist",
  ]);

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Dashboard Header */}
        <header className="mb-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-100 text-cyan-700">
                  <BriefcaseBusiness className="h-4 w-4" />
                </div>

                <span className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-700">
                  Job Hunt
                </span>
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                Dashboard
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                Manage your profile, resumes, applications, and
                AI-powered job search from one place.
              </p>
            </div>

            <Link
              href="/jobs"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-cyan-700 hover:shadow-md"
            >
              <Search className="h-4 w-4" />
              Find Jobs
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </header>

        {/* Dashboard Tabs */}
        <DashboardTabs
          overview={
            <OverviewSection
              totalApplications={allApplications.length}
              appliedCount={appliedCount}
              interviewCount={interviewCount}
              hiredCount={hiredCount}
              wishlistCount={wishlistCount}
            />
          }
          analytics={
            <DashboardAnalytics columns={columns} />
          }
          profile={
            <section>
              <SectionHeader
                eyebrow="Candidate"
                title="Candidate Profile"
                description="Your structured candidate information used by the AI job matching system."
              />

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <CandidateProfile />
              </div>
            </section>
          }
          resumes={<ResumeSection />}
          jobs={
            <section>
              <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
                    Applications
                  </p>

                  <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                    {board.name}
                  </h2>

                  <p className="mt-1 text-sm text-slate-600">
                    Track your applications and move opportunities
                    through your hiring pipeline.
                  </p>
                </div>

                <Link
                  href="/jobs"
                  className="hidden items-center gap-1.5 text-sm font-semibold text-cyan-700 transition hover:text-cyan-800 sm:inline-flex"
                >
                  Browse more jobs
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-5">
                <KanbanBoard
                  board={board}
                />
              </div>
            </section>
          }
          reminders={
            <RemindersSection
              applications={
                allApplications as ReminderApplication[]
              }
            />
          }
        />
      </main>
    </div>
  );
}

/* =============================================================
   OVERVIEW
============================================================= */

function OverviewSection({
  totalApplications,
  appliedCount,
  interviewCount,
  hiredCount,
  wishlistCount,
}: {
  totalApplications: number;
  appliedCount: number;
  interviewCount: number;
  hiredCount: number;
  wishlistCount: number;
}) {
  return (
    <section>
      <SectionHeader
        eyebrow="Overview"
        title="Job Hunt Overview"
        description="A quick snapshot of your current job search."
      />

      {/* Main Statistics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <OverviewStat
          icon={<BriefcaseBusiness className="h-5 w-5" />}
          title="Total Applications"
          value={totalApplications}
          description="Jobs on your board"
        />

        <OverviewStat
          icon={<FileText className="h-5 w-5" />}
          title="Applied"
          value={appliedCount}
          description="Applications submitted"
        />

        <OverviewStat
          icon={<Sparkles className="h-5 w-5" />}
          title="Interviews"
          value={interviewCount}
          description="Interview opportunities"
        />

        <OverviewStat
          icon={<CheckCircle2 className="h-5 w-5" />}
          title="Hired"
          value={hiredCount}
          description="Successful applications"
        />
      </div>

      {/* Secondary Information */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700">
              <Sparkles className="h-5 w-5" />
            </div>

            <div>
              <h3 className="font-semibold text-slate-900">
                AI Candidate Profile
              </h3>

              <p className="mt-1 text-sm leading-6 text-slate-600">
                Your resume information is structured and used by
                the AI matching system to compare your profile with
                job requirements.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <FileText className="h-5 w-5" />
            </div>

            <div className="flex-1">
              <h3 className="font-semibold text-slate-900">
                Resume Manager
              </h3>

              <p className="mt-1 text-sm leading-6 text-slate-600">
                Keep your application-ready resumes organized and
                available for AI-powered job matching.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-semibold text-slate-900">
              Continue your job hunt
            </h3>

            <p className="mt-1 text-sm text-slate-600">
              Discover new opportunities and analyze them against
              your resume.
            </p>
          </div>

          <Link
            href="/jobs"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-700"
          >
            <Search className="h-4 w-4" />
            Find Jobs
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Wishlist */}
      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-800">
              Wishlist
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Jobs you&apos;re considering for future applications.
            </p>
          </div>

          <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200">
            {wishlistCount}
          </span>
        </div>
      </div>
    </section>
  );
}

/* =============================================================
   RESUMES
============================================================= */

function ResumeSection() {
  return (
    <section>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeader
          eyebrow="Resume Manager"
          title="My Resumes"
          description="Manage the resumes you use for applications and AI job matching."
        />

        <div className="shrink-0">
          <ResumeUploadModal />
        </div>
      </div>

      <ResumeList />
    </section>
  );
}

/* =============================================================
   SHARED UI
============================================================= */

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
        {eyebrow}
      </p>

      <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
        {title}
      </h2>

      <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
        {description}
      </p>
    </div>
  );
}

function OverviewStat({
  icon,
  title,
  value,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  value: number;
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

/* =============================================================
   PAGE
============================================================= */

export default async function Dashboard() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200" />

            <div className="mt-6 h-12 rounded-2xl bg-white shadow-sm" />

            <div className="mt-6 h-64 rounded-2xl bg-white shadow-sm" />
          </div>
        </div>
      }
    >
      <DashboardPage />
    </Suspense>
  );
}
