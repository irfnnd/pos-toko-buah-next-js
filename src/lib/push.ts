import { sendNotification, setVapidDetails } from "web-push";
import { db } from "@/lib/db";
import { getExpiryStatus, getRemainingDays } from "@/lib/utils/expiry";
import { NotificationType } from "@prisma/client";

// Configure web-push with VAPID credentials
const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;
const subject = process.env.VAPID_SUBJECT || "mailto:admin@tokobuah.com";

if (publicKey && privateKey) {
  try {
    setVapidDetails(subject, publicKey, privateKey);
  } catch (err) {
    console.error("Failed to initialize VAPID details:", err);
  }
}

export interface PushPayload {
  title: string;
  message: string;
  link?: string;
  tag?: string;
  icon?: string;
}

/**
 * Sends a push notification to a single PushSubscription record.
 * Automatically removes obsolete/expired subscriptions (HTTP 410 / 404).
 */
export async function sendPushToSubscription(
  subscription: {
    id?: string;
    endpoint: string;
    p256dh: string;
    auth: string;
  },
  payload: PushPayload
): Promise<boolean> {
  const pushSubscription = {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: subscription.p256dh,
      auth: subscription.auth,
    },
  };

  try {
    await sendNotification(
      pushSubscription,
      JSON.stringify({
        title: payload.title,
        message: payload.message,
        url: payload.link || "/stok",
        tag: payload.tag || "pos-stock-alert",
        icon: payload.icon || "/images/logo.png",
      })
    );
    return true;
  } catch (error: any) {
    // Status 404 or 410 means the subscription is no longer active on the client
    if ((error?.statusCode === 410 || error?.statusCode === 404) && subscription.id) {
      console.log(`Push subscription ${subscription.id} expired, removing from DB.`);
      try {
        await db.pushSubscription.delete({
          where: { id: subscription.id },
        });
      } catch (delErr) {
        // Ignore delete error
      }
    } else {
      console.error("Failed to send push notification to subscription:", error);
    }
    return false;
  }
}

/**
 * Sends a push notification to all registered device subscriptions.
 */
export async function sendPushNotificationToAll(payload: PushPayload) {
  const subscriptions = await db.pushSubscription.findMany();

  if (subscriptions.length === 0) {
    return { success: true, count: 0, sent: 0 };
  }

  const results = await Promise.allSettled(
    subscriptions.map((sub) => sendPushToSubscription(sub, payload))
  );

  const sent = results.filter((r) => r.status === "fulfilled" && r.value).length;
  return {
    success: true,
    count: subscriptions.length,
    sent,
  };
}

/**
 * Checks all active stock batches and fruit inventories,
 * and sends device push notifications for expired batches, batches nearing expiry,
 * and low stock items.
 */
export async function checkAndDispatchStockAlertPush() {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  // 1. Get today's already recorded notifications to avoid duplicate spamming
  const todayNotifications = await db.notification.findMany({
    where: { createdAt: { gte: todayStart } },
    select: { message: true },
  });
  const sentMessages = new Set(todayNotifications.map((n) => n.message));

  // 2. Check stock batches (sorted newest first so recent batches are prioritized)
  const batches = await db.stockBatch.findMany({
    where: { currentQuantity: { gt: 0 } },
    include: { fruit: true },
    orderBy: { createdAt: "desc" },
  });

  const alerts: PushPayload[] = [];

  for (const batch of batches) {
    const status = getExpiryStatus(batch.expiryDate, batch.currentQuantity);
    const remainingDays = getRemainingDays(batch.expiryDate);

    // Update batch status in DB if calculated status changed
    if (batch.status !== status) {
      await db.stockBatch
        .update({
          where: { id: batch.id },
          data: { status },
        })
        .catch(console.error);
    }

    if (status === "MELEWATI_BATAS") {
      const title = "🚨 Buah Melewati Masa Simpan!";
      const message = `${batch.fruit.name} (Batch ${batch.batchNumber}) telah melewati batas masa simpan! Segera periksa dan lakukan tindakan stok keluar.`;

      if (!sentMessages.has(message)) {
        await db.notification
          .create({
            data: {
              type: NotificationType.EXPIRED,
              title,
              message,
              link: "/stok",
            },
          })
          .catch(console.error);
        sentMessages.add(message);

        alerts.push({
          title,
          message,
          link: "/stok",
          tag: `expired-${batch.id}`,
        });
      }
    } else if (status === "SEGERA_BATAS") {
      const title = "⚠️ Peringatan Masa Simpan!";
      const message = `${batch.fruit.name} (Batch ${batch.batchNumber}) mendekati batas masa simpan (${remainingDays} hari). Prioritaskan penjualan FEFO.`;

      if (!sentMessages.has(message)) {
        await db.notification
          .create({
            data: {
              type: NotificationType.EXPIRY_WARNING,
              title,
              message,
              link: "/stok",
            },
          })
          .catch(console.error);
        sentMessages.add(message);

        alerts.push({
          title,
          message,
          link: "/stok",
          tag: `warning-${batch.id}`,
        });
      }
    }
  }

  // 3. Check low stock fruits
  const fruits = await db.fruit.findMany({
    where: { status: "ACTIVE" },
  });

  for (const fruit of fruits) {
    if (fruit.currentStock <= fruit.minStock) {
      const title = "📦 Stok Buah Menipis!";
      const message = `Stok ${fruit.name} tersisa ${fruit.currentStock} ${fruit.unit} (di bawah batas minimum ${fruit.minStock} ${fruit.unit}).`;

      if (!sentMessages.has(message)) {
        await db.notification
          .create({
            data: {
              type: NotificationType.LOW_STOCK,
              title,
              message,
              link: "/stok",
            },
          })
          .catch(console.error);
        sentMessages.add(message);

        alerts.push({
          title,
          message,
          link: "/stok",
          tag: `low-stock-${fruit.id}`,
        });
      }
    }
  }

  if (alerts.length === 0) {
    return {
      success: true,
      alertsCount: 0,
      sentTotal: 0,
      message: "Tidak ada peringatan baru.",
    };
  }

  let totalSent = 0;
  for (const alert of alerts) {
    const res = await sendPushNotificationToAll(alert);
    totalSent += res.sent;
  }

  return {
    success: true,
    alertsCount: alerts.length,
    sentTotal: totalSent,
    message: `${alerts.length} peringatan stok berhasil diproses dan dikirim ke perangkat.`,
  };
}

