"use server";

import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getExpiryStatus, getRemainingDays } from "@/lib/utils/expiry";
import { NotificationType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import {
  checkAndDispatchStockAlertPush,
  sendPushNotificationToAll,
  sendPushToSubscription,
} from "@/lib/push";

/**
 * Sync active batch expiry & low stock alerts idempotently into database notifications table
 */
async function syncSystemNotifications() {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  // 1. Fetch active stock batches with remaining quantity
  const batches = await db.stockBatch.findMany({
    where: { currentQuantity: { gt: 0 } },
    include: { fruit: true },
  });

  for (const batch of batches) {
    const status = getExpiryStatus(batch.expiryDate, batch.currentQuantity);
    const remainingDays = getRemainingDays(batch.expiryDate);

    if (status === "MELEWATI_BATAS") {
      const title = "Buah Melewati Masa Simpan";
      const message = `${batch.fruit.name} (Batch ${batch.batchNumber}) telah melewati batas masa simpan!`;

      const existing = await db.notification.findFirst({
        where: {
          title,
          message,
          createdAt: { gte: todayStart },
        },
      });

      if (!existing) {
        await db.notification.create({
          data: {
            type: NotificationType.EXPIRED,
            title,
            message,
            link: "/stok",
          },
        });
      }
    } else if (status === "SEGERA_BATAS") {
      const title = "Peringatan Masa Simpan";
      const message = `${batch.fruit.name} (Batch ${batch.batchNumber}) akan melewati masa simpan dalam ${remainingDays} hari.`;

      const existing = await db.notification.findFirst({
        where: {
          title,
          message,
          createdAt: { gte: todayStart },
        },
      });

      if (!existing) {
        await db.notification.create({
          data: {
            type: NotificationType.EXPIRY_WARNING,
            title,
            message,
            link: "/stok",
          },
        });
      }
    }
  }

  // 2. Fetch active fruits with stock <= minStock
  const lowStockFruits = await db.fruit.findMany({
    where: {
      status: "ACTIVE",
    },
  });

  for (const fruit of lowStockFruits) {
    if (fruit.currentStock <= fruit.minStock) {
      const title = "Stok Buah Menipis";
      const message = `Stok ${fruit.name} tersisa ${fruit.currentStock} ${fruit.unit} (di bawah minimum stok ${fruit.minStock} ${fruit.unit}).`;

      const existing = await db.notification.findFirst({
        where: {
          title,
          message,
          createdAt: { gte: todayStart },
        },
      });

      if (!existing) {
        await db.notification.create({
          data: {
            type: NotificationType.LOW_STOCK,
            title,
            message,
            link: "/stok",
          },
        });
      }
    }
  }
}

export async function getNotificationsAction() {
  await requireAuth();

  try {
    // Run sync before returning notifications
    await syncSystemNotifications();

    const notifications = await db.notification.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    const unreadCount = await db.notification.count({
      where: { isRead: false },
    });

    return {
      success: true,
      data: notifications,
      unreadCount,
      error: undefined as string | undefined,
    };
  } catch (error) {
    console.error("Get notifications error:", error);
    return {
      success: false,
      data: [],
      unreadCount: 0,
      error: "Gagal mengambil data notifikasi",
    };
  }
}

export async function markNotificationAsReadAction(id: string) {
  await requireAuth();

  try {
    await db.notification.update({
      where: { id },
      data: { isRead: true },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Mark notification as read error:", error);
    return { success: false, error: "Gagal memperbarui status notifikasi" };
  }
}

export async function markAllNotificationsAsReadAction() {
  await requireAuth();

  try {
    await db.notification.updateMany({
      where: { isRead: false },
      data: { isRead: true },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Mark all notifications as read error:", error);
    return { success: false, error: "Gagal memperbarui semua notifikasi" };
  }
}

/**
 * Saves or updates a device Web Push subscription in the database.
 */
export async function savePushSubscriptionAction(data: {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}) {
  const user = await requireAuth();

  try {
    const subscription = await db.pushSubscription.upsert({
      where: { endpoint: data.endpoint },
      update: {
        p256dh: data.keys.p256dh,
        auth: data.keys.auth,
        userId: user.id,
      },
      create: {
        endpoint: data.endpoint,
        p256dh: data.keys.p256dh,
        auth: data.keys.auth,
        userId: user.id,
      },
    });

    return { success: true, data: subscription };
  } catch (error) {
    console.error("Save push subscription error:", error);
    return { success: false, error: "Gagal menyimpan langganan notifikasi perangkat" };
  }
}

/**
 * Removes a device Web Push subscription from the database.
 */
export async function deletePushSubscriptionAction(endpoint: string) {
  await requireAuth();

  try {
    await db.pushSubscription.deleteMany({
      where: { endpoint },
    });
    return { success: true };
  } catch (error) {
    console.error("Delete push subscription error:", error);
    return { success: false, error: "Gagal menghapus langganan notifikasi perangkat" };
  }
}

/**
 * Sends a test push notification to verify that device notifications are working.
 */
export async function sendTestPushNotificationAction(data?: {
  endpoint?: string;
  keys?: {
    p256dh: string;
    auth: string;
  };
}) {
  const user = await requireAuth();

  try {
    const payload = {
      title: "✅ Notifikasi Perangkat Aktif!",
      message:
        "Perangkat ini sekarang terhubung ke sistem POS Toko Buah. Notifikasi stok akan tetap muncul walaupun sistem sedang ditutup.",
      link: "/stok",
      tag: "test-push",
    };

    // If device provided endpoint and keys, auto-sync and send to this device
    if (data?.endpoint) {
      if (data.keys) {
        await db.pushSubscription.upsert({
          where: { endpoint: data.endpoint },
          update: {
            p256dh: data.keys.p256dh,
            auth: data.keys.auth,
            userId: user.id,
          },
          create: {
            endpoint: data.endpoint,
            p256dh: data.keys.p256dh,
            auth: data.keys.auth,
            userId: user.id,
          },
        });
      }

      const sub = await db.pushSubscription.findUnique({
        where: { endpoint: data.endpoint },
      });

      if (sub) {
        const sent = await sendPushToSubscription(sub, payload);
        if (sent) {
          return {
            success: true,
            message: "Notifikasi tes berhasil dikirim ke perangkat ini!",
          };
        }
        return {
          success: false,
          error: "Gagal mengirim notifikasi ke browser perangkat. Pastikan izin notifikasi aktif di browser.",
        };
      } else if (data.keys) {
        const sent = await sendPushToSubscription(
          { endpoint: data.endpoint, p256dh: data.keys.p256dh, auth: data.keys.auth },
          payload
        );
        if (sent) {
          return {
            success: true,
            message: "Notifikasi tes berhasil dikirim ke perangkat ini!",
          };
        }
        return {
          success: false,
          error: "Gagal mengirim notifikasi ke browser perangkat.",
        };
      }
    }

    const res = await sendPushNotificationToAll(payload);
    if (res.count === 0) {
      return {
        success: false,
        error:
          "Belum ada perangkat yang terdaftar di database. Silakan klik 'Aktifkan di Perangkat Ini' terlebih dahulu.",
      };
    }

    return {
      success: true,
      message: `Notifikasi tes berhasil dikirim ke ${res.sent} perangkat terdaftar!`,
    };
  } catch (error) {
    console.error("Send test push error:", error);
    return { success: false, error: "Gagal mengirim notifikasi tes" };
  }
}

/**
 * Manually triggers the stock alerts push check to all registered devices.
 */
export async function checkAndSendStockPushAction() {
  await requireAuth();

  try {
    const result = await checkAndDispatchStockAlertPush();
    return result;
  } catch (error) {
    console.error("Stock push check error:", error);
    return { success: false, error: "Gagal menjalankan pemeriksaan stok otomatis" };
  }
}
