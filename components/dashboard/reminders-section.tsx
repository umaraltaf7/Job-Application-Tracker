"use client";

import { useMemo, useState } from "react";
import {
  BellRing,
  CalendarClock,
  CalendarDays,
  Clock,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import ReminderNotificationSettings from "./reminder-notification-setting";

export type ReminderApplication = {
  _id: string;
  company: string;
  position: string;
  interviewDate?: string | Date | null;
  followUpDate?: string | Date | null;
  deadline?: string | Date | null;
  reminderEnabled?: boolean;
};

type ReminderType = "Follow-up" | "Interview" | "Deadline";

type ReminderItem = {
  id: string;
  applicationId: string;
  company: string;
  position: string;
  type: ReminderType;
  date: Date;
  daysUntil: number;
};

interface RemindersSectionProps {
  applications: ReminderApplication[];
}

function startOfDay(date: Date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function RemindersSection({
  applications,
}: RemindersSectionProps) {
  const [filter, setFilter] = useState<
    "all" | "overdue" | "upcoming"
  >("all");

  const reminders = useMemo(() => {
    const today = startOfDay(new Date());
    const horizon = new Date(today);
    horizon.setDate(horizon.getDate() + 30);

    const items: ReminderItem[] = [];

    for (const application of applications) {
      if (application.reminderEnabled === false) continue;

      const events: {
        type: ReminderType;
        value?: string | Date | null;
      }[] = [
        { type: "Follow-up", value: application.followUpDate },
        { type: "Interview", value: application.interviewDate },
        { type: "Deadline", value: application.deadline },
      ];

      for (const event of events) {
        if (!event.value) continue;

        const date = new Date(event.value);
        if (Number.isNaN(date.getTime())) continue;

        const normalizedDate = startOfDay(date);

        // Keep overdue reminders and events scheduled within 30 days.
        if (normalizedDate > horizon) continue;

        const daysUntil = Math.round(
          (normalizedDate.getTime() - today.getTime()) /
            (24 * 60 * 60 * 1000)
        );

        items.push({
          id: `${application._id}-${event.type}`,
          applicationId: application._id,
          company: application.company || "Unknown company",
          position: application.position || "Untitled position",
          type: event.type,
          date,
          daysUntil,
        });
      }
    }

    const priority: Record<ReminderType, number> = {
      "Follow-up": 0,
      Deadline: 1,
      Interview: 2,
    };

    return items.sort((a, b) => {
      const aOverdue = a.daysUntil < 0;
      const bOverdue = b.daysUntil < 0;

      if (aOverdue !== bOverdue) {
        return aOverdue ? -1 : 1;
      }

      if (a.daysUntil !== b.daysUntil) {
        return a.daysUntil - b.daysUntil;
      }

      return priority[a.type] - priority[b.type];
    });
  }, [applications]);

  const overdueCount = reminders.filter(
    (item) => item.daysUntil < 0
  ).length;

  const upcomingCount = reminders.filter(
    (item) => item.daysUntil >= 0
  ).length;

  const visibleReminders = reminders.filter((item) => {
    if (filter === "overdue") return item.daysUntil < 0;
    if (filter === "upcoming") return item.daysUntil >= 0;
    return true;
  });

  function getStatus(item: ReminderItem) {
    if (item.daysUntil < 0) {
      return {
        label: `${Math.abs(item.daysUntil)} day(s) overdue`,
        className: "bg-red-50 text-red-700 ring-red-200",
      };
    }

    if (item.daysUntil === 0) {
      return {
        label: "Today",
        className: "bg-amber-50 text-amber-700 ring-amber-200",
      };
    }

    if (item.daysUntil === 1) {
      return {
        label: "Tomorrow",
        className: "bg-amber-50 text-amber-700 ring-amber-200",
      };
    }

    return {
      label: `In ${item.daysUntil} days`,
      className: "bg-cyan-50 text-cyan-700 ring-cyan-200",
    };
  }

  return (
    <section>
      <ReminderNotificationSettings />

      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
          Stay on track
        </p>

        <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
          Reminders
        </h2>

        <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
          Keep up with interviews, application deadlines, and
          recruiter follow-ups.
        </p>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">
              Total reminders
            </p>
            <BellRing className="h-5 w-5 text-cyan-600" />
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-950">
            {reminders.length}
          </p>
        </div>

        <div className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">
              Overdue
            </p>
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <p className="mt-3 text-3xl font-bold text-red-700">
            {overdueCount}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">
              Upcoming
            </p>
            <CalendarClock className="h-5 w-5 text-cyan-600" />
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-950">
            {upcomingCount}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="font-semibold text-slate-900">
            Your schedule
          </h3>

          <div className="flex flex-wrap gap-2">
            {(
              [
                ["all", "All"],
                ["overdue", "Overdue"],
                ["upcoming", "Upcoming"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                aria-pressed={filter === value}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  filter === value
                    ? "bg-cyan-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {visibleReminders.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-12 text-center">
            <CheckCircle2 className="mx-auto h-9 w-9 text-emerald-600" />

            <h4 className="mt-3 font-semibold text-slate-900">
              {reminders.length === 0
                ? "No reminders yet"
                : "No reminders in this filter"}
            </h4>

            <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-500">
              Add interview dates, follow-up dates, or deadlines
              to your application details to see them here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {visibleReminders.map((item) => {
              const status = getStatus(item);

              return (
                <div
                  key={item.id}
                  className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-cyan-200 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <div
                      className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                        item.daysUntil < 0
                          ? "bg-red-50 text-red-600"
                          : "bg-cyan-50 text-cyan-700"
                      }`}
                    >
                      {item.type === "Interview" ? (
                        <CalendarDays className="h-5 w-5" />
                      ) : item.type === "Deadline" ? (
                        <AlertTriangle className="h-5 w-5" />
                      ) : (
                        <Clock className="h-5 w-5" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900">
                        {item.type}: {item.company}
                      </p>

                      <p className="mt-0.5 text-sm text-slate-600">
                        {item.position}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {formatDate(item.date)}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`inline-flex w-fit shrink-0 items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${status.className}`}
                  >
                    {status.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}