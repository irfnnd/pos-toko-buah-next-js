
// Service Worker for POS Toko Buah
// Background Push Notification

self.addEventListener("install", (event) => {
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(self.clients.claim());
});

// Menerima push notification
self.addEventListener("push", (event) => {
    let data = {};

    if (event.data) {
        try {
            data = event.data.json();
        } catch (error) {
            data = {
                title: "Notifikasi POS Toko Buah",
                message: event.data.text(),
            };
        }
    }

    const title = data.title || "Notifikasi Stok Buah";

    const options = {
        body:
            data.message ||
            data.body ||
            "Terdapat pembaruan data stok buah.",

        icon: data.icon || "/images/logo.png",
        badge: data.badge || "/images/logo.png",

        data: {
            url: data.url || data.link || "/stok",
        },

        vibrate: [200, 100, 200],

        requireInteraction: true,

        // Menggunakan tag dari backend jika tersedia
        tag: data.tag || "pos-stock-notification",

        renotify: true,
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// Ketika notifikasi diklik
self.addEventListener("notificationclick", (event) => {
    event.notification.close();

    const targetUrl = new URL(
        event.notification.data?.url || "/stok",
        self.location.origin
    );

    // Hindari membuka alamat dari domain lain
    if (targetUrl.origin !== self.location.origin) {
        return;
    }

    event.waitUntil(
        self.clients
            .matchAll({
                type: "window",
                includeUncontrolled: true,
            })
            .then(async (clientList) => {

                for (const client of clientList) {
                    if ("focus" in client) {
                        await client.focus();

                        if (client.url !== targetUrl.href) {
                            await client.navigate(targetUrl.href);
                        }

                        return;
                    }
                }

                return self.clients.openWindow(targetUrl.href);
            })
    );
});
