// Service Worker for POS Toko Buah Background Push Notifications
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = {
        title: "Notifikasi POS Toko Buah",
        message: event.data.text(),
      };
    }
  }

  const title = data.title || "Notifikasi Stok Buah";
  const options = {
    body: data.message || data.body || "Terdapat pembaruan data stok buah.",
    icon: data.icon || "/images/logo.png",
    badge: data.badge || "/images/logo.png",
    data: {
      url: data.url || data.link || "/stok",
      dateOfArrival: Date.now(),
    },
    vibrate: [200, 100, 200],
    requireInteraction: true, // Remains on screen until user interacts/dismisses
    tag: data.tag || `stock-alert-${Date.now()}`,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || "/stok";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(targetUrl) && "focus" in client) {
            return client.focus();
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      })
  );
});

