"use client";

import { useEffect, useState } from "react";
import {
  BellRing,
  BellOff,
  LoaderCircle,
} from "lucide-react";

type NotificationStatus =
  | "checking"
  | "unsupported"
  | "disabled"
  | "enabled"
  | "denied"
  | "error";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat(
    (4 - (base64String.length % 4)) % 4
  );

  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);

  return Uint8Array.from(
    [...rawData].map((character) =>
      character.charCodeAt(0)
    )
  );
}

export default function ReminderNotificationSettings() {
  const [status, setStatus] =
    useState<NotificationStatus>("checking");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function checkSubscription() {
      if (
        !("Notification" in window) ||
        !("serviceWorker" in navigator) ||
        !("PushManager" in window)
      ) {
        if (!cancelled) setStatus("unsupported");
        return;
      }

      if (Notification.permission === "denied") {
        if (!cancelled) setStatus("denied");
        return;
      }

      try {
        const registration =
          await navigator.serviceWorker.register("/sw.js");

        const subscription =
          await registration.pushManager.getSubscription();

        if (!cancelled) {
          setStatus(subscription ? "enabled" : "disabled");
        }
      } catch {
        if (!cancelled) {
          setStatus("error");
          setMessage("Could not initialize browser notifications.");
        }
      }
    }

    void checkSubscription();

    return () => {
      cancelled = true;
    };
  }, []);

  async function enableNotifications() {
    setLoading(true);
    setMessage("");

    try {
      if (
        !("Notification" in window) ||
        !("serviceWorker" in navigator) ||
        !("PushManager" in window)
      ) {
        setStatus("unsupported");
        setMessage(
          "This browser does not support push notifications."
        );
        return;
      }

      const publicKey =
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

      if (!publicKey) {
        throw new Error(
          "Missing NEXT_PUBLIC_VAPID_PUBLIC_KEY in .env.local."
        );
      }

      const permission =
        await Notification.requestPermission();

      if (permission !== "granted") {
        setStatus(
          permission === "denied" ? "denied" : "disabled"
        );

        setMessage(
          permission === "denied"
            ? "Notifications are blocked. Allow them in your browser settings."
            : "Notification permission was not granted."
        );

        return;
      }

      const registration =
        await navigator.serviceWorker.register("/sw.js");

      await navigator.serviceWorker.ready;

      let subscription =
        await registration.pushManager.getSubscription();

      if (!subscription) {
        subscription =
          await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey:
              urlBase64ToUint8Array(publicKey) as BufferSource,
          });
      }

      const response = await fetch(
        "/api/reminders/subscribe",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            subscription: subscription.toJSON(),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Could not save subscription."
        );
      }

      // Demonstrate that browser notifications are working.
      await registration.showNotification(
        "Job Tracker notifications enabled",
        {
          body: "You'll receive push alerts for scheduled job reminders.",
          icon: "/favicon.ico",
          tag: "job-tracker-notifications-enabled",
        }
      );

      setStatus("enabled");
      setMessage("Push notifications are enabled.");
    } catch (error) {
      console.error(
        "Failed to enable reminders:",
        error
      );

      setStatus("error");

      setMessage(
        error instanceof Error
          ? error.message
          : "Could not enable notifications."
      );
    } finally {
      setLoading(false);
    }
  }

  async function disableNotifications() {
    setLoading(true);
    setMessage("");

    try {
      const registration =
        await navigator.serviceWorker.getRegistration("/");

      const subscription =
        await registration?.pushManager.getSubscription();

      if (subscription) {
        const response = await fetch(
          "/api/reminders/subscribe",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              action: "unsubscribe",
              endpoint: subscription.endpoint,
            }),
          }
        );

        if (!response.ok) {
          const result = await response.json();

          throw new Error(
            result.error || "Could not disable notifications."
          );
        }

        await subscription.unsubscribe();
      }

      setStatus("disabled");
      setMessage("Push notifications have been disabled.");
    } catch (error) {
      console.error(
        "Failed to disable reminders:",
        error
      );

      setStatus("error");

      setMessage(
        error instanceof Error
          ? error.message
          : "Could not disable notifications."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <BellRing className="h-5 w-5" />
          </div>

          <div>
            <h3 className="font-semibold text-slate-900">
              Reminder notifications
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Receive alerts for interviews, follow-ups, and
              application deadlines—even when the dashboard is closed.
            </p>

            <p className="mt-2 text-xs text-slate-500">
              Status:{" "}
              {status === "checking"
                ? "Checking browser..."
                : status === "enabled"
                ? "Enabled"
                : status === "unsupported"
                ? "Not supported"
                : status === "denied"
                ? "Blocked by browser"
                : status === "error"
                ? "Needs attention"
                : "Disabled"}
            </p>
          </div>
        </div>

        {status === "enabled" ? (
          <button
            type="button"
            onClick={disableNotifications}
            disabled={loading}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
          >
            {loading ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <BellOff className="h-4 w-4" />
            )}
            Disable
          </button>
        ) : (
          <button
            type="button"
            onClick={enableNotifications}
            disabled={
              loading ||
              status === "checking" ||
              status === "unsupported" ||
              status === "denied"
            }
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading || status === "checking" ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <BellRing className="h-4 w-4" />
            )}
            Enable notifications
          </button>
        )}
      </div>

      {message && (
        <p
          role="status"
          className="mt-3 text-sm text-slate-600"
        >
          {message}
        </p>
      )}
    </section>
  );
}