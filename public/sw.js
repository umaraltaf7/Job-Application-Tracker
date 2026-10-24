self.addEventListener("push", (event) => {
  let data = {
    title: "Job Application Reminder",
    body: "You have an upcoming job application reminder.",
    url: "/dashboard",
  };

  if (event.data) {
    try {
      data = {
        ...data,
        ...event.data.json(),
      };
    } catch {
      data.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      tag: data.tag || "job-application-reminder",
      data: {
        url: data.url || "/dashboard",
      },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const destination =
    event.notification.data?.url || "/dashboard";

  event.waitUntil(
    clients.matchAll({
      type: "window",
      includeUncontrolled: true,
    }).then((windowClients) => {
      for (const client of windowClients) {
        if ("focus" in client) {
          client.navigate(destination);
          return client.focus();
        }
      }

      return clients.openWindow(destination);
    })
  );
});
