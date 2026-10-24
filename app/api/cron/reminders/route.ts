import { NextResponse } from "next/server";
import webpush from "web-push";

import connectDB from "@/lib/db";
import { JobApplication } from "@/lib/models";
import ReminderSubscription from "@/lib/models/reminder-subscription";
import ReminderDelivery from "@/lib/models/reminder-delivery";

type ReminderType = "followUp" | "interview" | "deadline";

type ReminderEvent = {
  userId: string;
  applicationId: string;
  company: string;
  position: string;
  type: ReminderType;
  dueDate: Date;
};

function getReminderLabel(type: ReminderType) {
  switch (type) {
    case "followUp":
      return "Follow-up";
    case "interview":
      return "Interview";
    case "deadline":
      return "Application deadline";
  }
}

function getDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error("CRON_SECRET is not configured.");

    return NextResponse.json(
      { error: "Cron endpoint is not configured." },
      { status: 500 }
    );
  }

  if (
    request.headers.get("authorization") !==
    `Bearer ${cronSecret}`
  ) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const publicKey =
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;

  if (!publicKey || !privateKey || !subject) {
    return NextResponse.json(
      { error: "VAPID environment variables are missing." },
      { status: 500 }
    );
  }

  try {
    webpush.setVapidDetails(
      subject,
      publicKey,
      privateKey
    );

    await connectDB();

    // Run once daily. Include today's and tomorrow's reminders.
    const startToday = new Date();
    startToday.setUTCHours(0, 0, 0, 0);

    const endWindow = new Date(startToday);
    endWindow.setUTCDate(endWindow.getUTCDate() + 2);

    const applications = await JobApplication.find({
      reminderEnabled: { $ne: false },
      $or: [
        {
          followUpDate: {
            $gte: startToday,
            $lt: endWindow,
          },
        },
        {
          interviewDate: {
            $gte: startToday,
            $lt: endWindow,
          },
        },
        {
          deadline: {
            $gte: startToday,
            $lt: endWindow,
          },
        },
      ],
    })
      .select(
        "_id userId company position followUpDate interviewDate deadline reminderEnabled"
      )
      .lean();

    const events: ReminderEvent[] = [];

    for (const application of applications) {
      const dates: {
        type: ReminderType;
        value?: Date | string | null;
      }[] = [
        {
          type: "followUp",
          value: application.followUpDate,
        },
        {
          type: "interview",
          value: application.interviewDate,
        },
        {
          type: "deadline",
          value: application.deadline,
        },
      ];

      for (const item of dates) {
        if (!item.value) continue;

        const dueDate = new Date(item.value);

        if (
          Number.isNaN(dueDate.getTime()) ||
          dueDate < startToday ||
          dueDate >= endWindow
        ) {
          continue;
        }

        events.push({
          userId: String(application.userId),
          applicationId: String(application._id),
          company: application.company,
          position: application.position,
          type: item.type,
          dueDate,
        });
      }
    }

    let sent = 0;
    let skipped = 0;
    let failed = 0;

    for (const event of events) {
      const subscriptions =
        await ReminderSubscription.find({
          userId: event.userId,
        });

      if (subscriptions.length === 0) {
        skipped++;
        continue;
      }

      const dateKey = getDateKey(event.dueDate);

      const dedupeKey = [
        event.userId,
        event.applicationId,
        event.type,
        dateKey,
      ].join(":");

      // The unique key prevents duplicate alerts for this event/date.
      try {
        await ReminderDelivery.create({
          dedupeKey,
          userId: event.userId,
          jobApplicationId: event.applicationId,
          reminderType: event.type,
          dueDate: event.dueDate,
          sentAt: new Date(),
        });
      } catch (error: unknown) {
        if (
          typeof error === "object" &&
          error !== null &&
          "code" in error &&
          error.code === 11000
        ) {
          skipped++;
          continue;
        }

        throw error;
      }

      const label = getReminderLabel(event.type);
      const dateText =
        dateKey === getDateKey(new Date())
          ? "today"
          : "tomorrow";

      const payload = JSON.stringify({
        title: `${label}: ${event.company}`,
        body: `${event.position} — scheduled for ${dateText}.`,
        url: "/dashboard",
        tag: `job-reminder-${event.applicationId}-${event.type}-${dateKey}`,
      });

      let successfulSubscriptions = 0;

      for (const subscription of subscriptions) {
        try {
          await webpush.sendNotification(
            {
              endpoint: subscription.endpoint,
              keys: subscription.keys,
              expirationTime:
                subscription.expirationTime ?? null,
            },
            payload
          );

          successfulSubscriptions++;
        } catch (error: unknown) {
          const statusCode =
            typeof error === "object" &&
            error !== null &&
            "statusCode" in error
              ? error.statusCode
              : undefined;

          // 404/410 means the browser subscription has expired.
          if (statusCode === 404 || statusCode === 410) {
            await ReminderSubscription.deleteOne({
              _id: subscription._id,
            });
          } else {
            console.error(
              "Push delivery failed:",
              event.applicationId,
              error
            );
          }
        }
      }

      if (successfulSubscriptions > 0) {
        sent++;
      } else {
        failed++;

        // Allow a later cron run to retry this reminder.
        await ReminderDelivery.deleteOne({ dedupeKey });
      }
    }

    return NextResponse.json({
      success: true,
      applicationsChecked: applications.length,
      remindersProcessed: events.length,
      sent,
      skipped,
      failed,
    });
  } catch (error) {
    console.error(
      "Scheduled reminder job failed:",
      error
    );

    return NextResponse.json(
      { error: "Scheduled reminder processing failed." },
      { status: 500 }
    );
  }
}
