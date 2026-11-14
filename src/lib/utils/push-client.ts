"use client";

import {
  savePushSubscriptionAction,
  deletePushSubscriptionAction,
} from "@/server/actions/notification";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const buffer = new ArrayBuffer(rawData.length);
  const outputArray = new Uint8Array(buffer);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function isPushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!isPushSupported()) return null;

  try {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
    });
    await navigator.serviceWorker.ready;
    return registration;
  } catch (err) {
    console.error("Service worker registration failed:", err);
    return null;
  }
}

export async function getCurrentPushSubscription(): Promise<PushSubscription | null> {
  if (!isPushSupported()) return null;

  try {
    const registration = await navigator.serviceWorker.ready;
    return await registration.pushManager.getSubscription();
  } catch (err) {
    console.error("Failed to get current push subscription:", err);
    return null;
  }
}

export async function subscribeDeviceToPush(): Promise<{
  success: boolean;
  subscription?: PushSubscription;
  error?: string;
}> {
  if (!isPushSupported()) {
    return {
      success: false,
      error: "Browser atau perangkat ini tidak mendukung Web Push Notification.",
    };
  }

  try {
    // 1. Request Notification permission
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      return {
        success: false,
        error:
          permission === "denied"
            ? "Izin notifikasi ditolak oleh perangkat. Harap izinkan notifikasi di pengaturan browser Anda."
            : "Izin notifikasi belum diberikan.",
      };
    }

    // 2. Ensure Service Worker is registered
    const registration = await registerServiceWorker();
    if (!registration) {
      return { success: false, error: "Gagal mendaftarkan Service Worker." };
    }

    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidPublicKey) {
      return { success: false, error: "Kunci VAPID belum dikonfigurasi di server." };
    }

    // 3. Subscribe with PushManager
    const convertedKey = urlBase64ToUint8Array(vapidPublicKey);
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedKey as unknown as BufferSource,
      });
    }

    const subJson = subscription.toJSON();
    if (!subJson.endpoint || !subJson.keys?.p256dh || !subJson.keys?.auth) {
      return { success: false, error: "Data subscription perangkat tidak lengkap." };
    }

    // 4. Save to backend database
    const saveRes = await savePushSubscriptionAction({
      endpoint: subJson.endpoint,
      keys: {
        p256dh: subJson.keys.p256dh,
        auth: subJson.keys.auth,
      },
    });

    if (!saveRes.success) {
      return { success: false, error: saveRes.error };
    }

    return { success: true, subscription };
  } catch (err: any) {
    console.error("Error subscribing device to push:", err);
    return {
      success: false,
      error: err?.message || "Terjadi kesalahan saat mengaktifkan notifikasi perangkat.",
    };
  }
}

export async function unsubscribeDeviceFromPush(): Promise<{
  success: boolean;
  error?: string;
}> {
  if (!isPushSupported()) {
    return { success: true };
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      const endpoint = subscription.endpoint;
      await subscription.unsubscribe();
      await deletePushSubscriptionAction(endpoint);
    }

    return { success: true };
  } catch (err: any) {
    console.error("Error unsubscribing device from push:", err);
    return {
      success: false,
      error: err?.message || "Gagal menonaktifkan notifikasi perangkat.",
    };
  }
}
