"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Notification, NotificationType } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { toast } from "sonner";
import {
  Bell1 as BellIcon,
  CheckCircle1,
  InfoTriangle,
  XmarkCircle,
  BoxArchive1,
  Check,
} from "@tailgrids/icons";
import {
  getNotificationsAction,
  markAllNotificationsAsReadAction,
  markNotificationAsReadAction,
} from "@/server/actions/notification";

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const res = await getNotificationsAction();
      if (res.success && res.data) {
        setNotifications(res.data);
        setUnreadCount(res.unreadCount);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Polling every 1 minute
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = async (notif: Notification) => {
    if (!notif.isRead) {
      const res = await markNotificationAsReadAction(notif.id);
      if (res.success) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    }

    if (notif.link) {
      setIsOpen(false);
      router.push(notif.link);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const res = await markAllNotificationsAsReadAction();
      if (res.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
        toast.success("Semua notifikasi ditandai sudah dibaca");
      }
    } catch (error) {
      toast.error("Gagal memperbarui notifikasi");
    }
  };

  const renderIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.EXPIRY_WARNING:
        return <InfoTriangle className="size-4 text-amber-500" />;
      case NotificationType.EXPIRED:
        return <XmarkCircle className="size-4 text-red-500" />;
      case NotificationType.LOW_STOCK:
        return <BoxArchive1 className="size-4 text-purple-500" />;
      default:
        return <CheckCircle1 className="size-4 text-blue-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative flex size-10 items-center justify-center rounded-lg border border-card-border bg-card-background text-icon-primary shadow-xs transition-colors outline-none hover:bg-background-gray-primary focus-visible:border-input-primary-focus-border focus-visible:ring-4 focus-visible:ring-input-primary-focus-border/20"
        aria-label="Notification Center"
      >
        <BellIcon className="size-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-sm animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-80 sm:w-96 rounded-2xl border border-card-border bg-card-surface-area p-0 text-text-primary shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-card-border px-4 py-3 bg-gray-50/50 dark:bg-gray-900/50">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-text-primary">Notifikasi</h4>
              {unreadCount > 0 && (
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-600 dark:bg-red-950/60 dark:text-red-400">
                  {unreadCount} belum dibaca
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
              >
                <Check className="size-3.5" />
                Tandai Dibaca
              </button>
            )}
          </div>

          {/* List Content */}
          <div className="max-h-80 overflow-y-auto divide-y divide-card-border scrollbar-thin">
            {isLoading && notifications.length === 0 ? (
              <div className="p-4 text-center text-xs text-text-tertiary">Memuat notifikasi...</div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                <CheckCircle1 className="mb-2 size-8 text-emerald-500" />
                <p className="text-sm font-semibold text-text-primary">Tidak Ada Notifikasi</p>
                <p className="text-xs text-text-tertiary">Semua stok dan masa simpan dalam kondisi aman.</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleMarkAsRead(notif)}
                  className={`flex cursor-pointer items-start gap-3 p-3.5 transition-colors hover:bg-gray-50/80 dark:hover:bg-gray-800/60 ${
                    !notif.isRead ? "bg-primary-50/30 dark:bg-primary-950/20" : ""
                  }`}
                >
                  <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-card-border/40">
                    {renderIcon(notif.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-xs font-semibold ${!notif.isRead ? "text-text-primary" : "text-text-secondary"}`}>
                        {notif.title}
                      </p>
                      <span className="text-[10px] text-text-tertiary whitespace-nowrap">
                        {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: id })}
                      </span>
                    </div>
                    <p className="text-xs text-text-tertiary line-clamp-2">{notif.message}</p>
                  </div>
                  {!notif.isRead && (
                    <span className="mt-1 size-2 shrink-0 rounded-full bg-primary-600" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
