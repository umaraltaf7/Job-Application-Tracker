
"use client";

import { ReactNode, useState } from "react";
import {
  BarChart3,
  BellRing,
  BriefcaseBusiness,
  FileText,
  LayoutDashboard,
  UserRound,
} from "lucide-react";

type DashboardTab =
  | "overview"
  | "analytics"
  | "profile"
  | "resumes"
  | "jobs"
  | "reminders";

interface DashboardTabsProps {
  overview: ReactNode;
  analytics: ReactNode;
  profile: ReactNode;
  resumes: ReactNode;
  jobs: ReactNode;
  reminders: ReactNode;
}

const tabs: {
  id: DashboardTab;
  label: string;
  icon: ReactNode;
}[] = [
  {
    id: "overview",
    label: "Overview",
    icon: <LayoutDashboard className="h-4 w-4" />,
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: <BarChart3 className="h-4 w-4" />,
  },
  {
    id: "profile",
    label: "Candidate Profile",
    icon: <UserRound className="h-4 w-4" />,
  },
  {
    id: "resumes",
    label: "Resumes",
    icon: <FileText className="h-4 w-4" />,
  },
  {
    id: "jobs",
    label: "Job Hunt",
    icon: <BriefcaseBusiness className="h-4 w-4" />,
  },
  {
    id: "reminders",
    label: "Reminders",
    icon: <BellRing className="h-4 w-4" />,
  },
];

export default function DashboardTabs({
  overview,
  analytics,
  profile,
  resumes,
  jobs,
  reminders,
}: DashboardTabsProps) {
  const [activeTab, setActiveTab] =
    useState<DashboardTab>("overview");

  const content: Record<DashboardTab, ReactNode> = {
    overview,
    analytics,
    profile,
    resumes,
    jobs,
    reminders,
  };

  return (
    <div>
      <div className="mb-8 overflow-x-auto">
        <div className="flex min-w-max rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                aria-pressed={isActive}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all sm:px-5 ${
                  isActive
                    ? "bg-cyan-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div>{content[activeTab]}</div>
    </div>
  );
}
