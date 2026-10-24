import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth/auth";
import connectDB from "@/lib/db";
import ReminderSubscription from "@/lib/models/reminder-subscription";

// export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    await connectDB();

    // Remove this browser's subscription.
    if (body.action === "unsubscribe") {
      if (typeof body.endpoint !== "string") {
        return NextResponse.json(
          { error: "Invalid subscription endpoint" },
          { status: 400 }
        );
      }

      await ReminderSubscription.deleteOne({
        userId: session.user.id,
        endpoint: body.endpoint,
      });

      return NextResponse.json({
        success: true,
        message: "Notifications disabled.",
      });
    }

    const subscription = body.subscription;

    if (
      !subscription ||
      typeof subscription.endpoint !== "string" ||
      typeof subscription.keys?.p256dh !== "string" ||
      typeof subscription.keys?.auth !== "string"
    ) {
      return NextResponse.json(
        { error: "Invalid push subscription" },
        { status: 400 }
      );
    }

    // Only accept HTTPS push endpoints.
    let endpointUrl: URL;

    try {
      endpointUrl = new URL(subscription.endpoint);
    } catch {
      return NextResponse.json(
        { error: "Invalid push endpoint" },
        { status: 400 }
      );
    }

    if (endpointUrl.protocol !== "https:") {
      return NextResponse.json(
        { error: "Invalid push endpoint protocol" },
        { status: 400 }
      );
    }

    await ReminderSubscription.findOneAndUpdate(
      {
        endpoint: subscription.endpoint,
      },
      {
        $set: {
          userId: session.user.id,
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.keys.p256dh,
            auth: subscription.keys.auth,
          },
          expirationTime:
            subscription.expirationTime ?? null,
        },
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
      }
    );

    return NextResponse.json({
      success: true,
      message: "Push notifications enabled.",
    });
  } catch (error) {
    console.error(
      "Reminder subscription error:",
      error
    );

    return NextResponse.json(
      { error: "Failed to update notification settings." },
      { status: 500 }
    );
  }
}
